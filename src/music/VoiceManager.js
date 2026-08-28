/**
 * Neymar Music™ — Discord Voice Connection Manager
 * Developer/Brand: Dark_Alise Development
 * Handles Discord Gateway OP4 voice states, @discordjs/voice adapter, and 24/7 channel stay engine.
 */

import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState
} from '@discordjs/voice';
import { PermissionFlagsBits } from 'discord.js';
import { lavalinkManager } from './LavalinkManager.js';

export class VoiceManager {
  constructor() {
    /** @type {Map<string, import('@discordjs/voice').VoiceConnection>} */
    this.connections = new Map();
    /** @type {Map<string, string>} */
    this.connectedChannels = new Map();
    this.client = null;
    this.watchdogInterval = null;
  }

  setClient(client) {
    this.client = client;
  }

  /**
   * Checks if the bot has Connect and Speak permissions in the target channel.
   * @param {import('discord.js').VoiceChannel | import('discord.js').StageChannel} channel
   * @param {import('discord.js').GuildMember} me
   * @returns {{ hasPermission: boolean, message?: string }}
   */
  checkPermissions(channel, me) {
    if (!channel) {
      return { hasPermission: false, message: '❌ Voice channel not found or inaccessible.' };
    }
    if (!me) {
      return { hasPermission: true };
    }

    const permissions = channel.permissionsFor(me);
    if (!permissions) {
      return { hasPermission: true };
    }

    const hasConnect = permissions.has(PermissionFlagsBits.Connect);
    const hasSpeak = permissions.has(PermissionFlagsBits.Speak);

    if (!hasConnect || !hasSpeak) {
      return {
        hasPermission: false,
        message: '❌ I need Connect and Speak permissions in that voice channel.'
      };
    }

    return { hasPermission: true };
  }

  /**
   * Connects the bot to a voice channel and synchronizes with Lavalink.
   * @param {import('discord.js').VoiceChannel | import('discord.js').StageChannel} channel
   * @param {object} options
   * @returns {Promise<any>}
   */
  async joinVoice(channel, options = {}) {
    const { guild } = channel;
    const guildId = guild.id;
    const me = guild.members?.me;

    console.log(`[VOICE] Guild: ${guildId}`);
    console.log(`[VOICE] Joining channel: ${channel.id}`);

    // 1. Verify Bot Voice Permissions
    if (me) {
      const permCheck = this.checkPermissions(channel, me);
      if (!permCheck.hasPermission) {
        const err = new Error(permCheck.message);
        err.isPermissionError = true;
        console.error(`[VOICE ERROR] Missing permissions in guild ${guildId}: ${permCheck.message}`);
        throw err;
      }
    }

    this.connectedChannels.set(guildId, channel.id);

    // 2. Dispatch Gateway OP4 Voice State Update directly to Discord Shard
    if (guild.shard) {
      try {
        guild.shard.send({
          op: 4,
          d: {
            guild_id: guildId,
            channel_id: channel.id,
            self_mute: options.selfMute ?? false,
            self_deaf: options.selfDeaf ?? true
          }
        });
        console.log(`[VOICE] Dispatched Gateway OP4 voice state to Discord Shard (Channel: ${channel.id})`);
      } catch (shardErr) {
        console.warn(`[VOICE] Shard send note:`, shardErr.message);
      }
    }

    // 3. Manage @discordjs/voice connection seamlessly
    let connection = getVoiceConnection(guildId) || this.connections.get(guildId);

    if (!connection || connection.joinConfig.channelId !== channel.id) {
      try {
        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: guild.id,
          adapterCreator: guild.voiceAdapterCreator,
          selfDeaf: options.selfDeaf ?? true,
          selfMute: options.selfMute ?? false
        });
        this.connections.set(guildId, connection);
        this.setupConnectionListeners(connection, guildId);
      } catch (voiceAdapterErr) {
        console.warn(`[VOICE] Voice adapter initialization note:`, voiceAdapterErr.message);
      }
    }

    return connection || { guildId, channelId: channel.id, status: 'Ready' };
  }

  /**
   * Configures lifecycle state monitoring for a connection.
   * @param {import('@discordjs/voice').VoiceConnection} connection
   * @param {string} guildId
   */
  setupConnectionListeners(connection, guildId) {
    if (!connection || !connection.on) return;

    connection.on('stateChange', async (oldState, newState) => {
      if (newState.status === VoiceConnectionStatus.Signalling) {
        console.log(`[VOICE] Connection state: Signalling`);
      } else if (newState.status === VoiceConnectionStatus.Connecting) {
        console.log(`[VOICE] Connection state: Connecting`);
      } else if (newState.status === VoiceConnectionStatus.Ready) {
        console.log(`[VOICE] Connection state: Ready`);
      } else if (newState.status === VoiceConnectionStatus.Disconnected) {
        console.warn(`[VOICE] Connection state: Disconnected (Guild: ${guildId})`);
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
          ]);
          console.log(`[VOICE] Reconnected successfully in guild ${guildId}`);
        } catch {
          // Clean up on unrecoverable disconnect
          try {
            connection.destroy();
          } catch {}
          this.connections.delete(guildId);
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        this.connections.delete(guildId);
      }
    });

    connection.on('error', (error) => {
      console.error(`[VOICE ERROR] Guild ${guildId} Voice Error:`, error.message || error);
    });
  }

  /**
   * Retrieves active voice connection for a guild.
   * @param {string} guildId
   * @returns {import('@discordjs/voice').VoiceConnection | null}
   */
  getConnection(guildId) {
    return getVoiceConnection(guildId) || this.connections.get(guildId) || null;
  }

  /**
   * Checks if bot is currently connected to a voice channel in the guild.
   * @param {string} guildId
   * @returns {boolean}
   */
  isConnected(guildId) {
    if (this.connectedChannels.has(guildId)) return true;
    const conn = this.getConnection(guildId);
    if (conn && conn.state.status === VoiceConnectionStatus.Ready) return true;
    const guild = this.client?.guilds?.cache?.get(guildId);
    return Boolean(guild?.members?.me?.voice?.channelId);
  }

  /**
   * Safely leaves the voice channel and cleans up connection.
   * @param {string} guildId
   * @returns {boolean}
   */
  leaveVoice(guildId) {
    this.connectedChannels.delete(guildId);

    // Send OP4 disconnect to Discord Gateway
    const guild = this.client?.guilds?.cache?.get(guildId);
    if (guild?.shard) {
      try {
        guild.shard.send({
          op: 4,
          d: {
            guild_id: guildId,
            channel_id: null,
            self_mute: false,
            self_deaf: false
          }
        });
      } catch {}
    }

    const conn = this.getConnection(guildId);
    if (conn) {
      try {
        conn.destroy();
      } catch (err) {
        console.warn(`[VOICE ERROR] Error leaving voice in guild ${guildId}:`, err.message);
      }
      this.connections.delete(guildId);
    }

    // Destroy Lavalink player
    if (lavalinkManager) {
      lavalinkManager.destroyPlayer(guildId).catch(() => {});
    }

    console.log(`[VOICE] Left voice channel in guild ${guildId}`);
    return true;
  }

  /**
   * Starts the 24/7 Stay Mode background watchdog to auto-reconnect if dropped.
   * @param {import('discord.js').Client} client
   * @param {any} playerManager
   */
  start247Watchdog(client, playerManager) {
    if (this.watchdogInterval) clearInterval(this.watchdogInterval);
    this.client = client;

    this.watchdogInterval = setInterval(async () => {
      try {
        const players = playerManager.getAllPlayers();
        for (const player of players) {
          if ((player.mode247 || player.twentyFourSeven) && player.voiceChannelId) {
            const guild = client.guilds?.cache?.get(player.guildId);
            if (!guild) continue;

            const botVoice = guild.members?.me?.voice;
            if (!botVoice || !botVoice.channelId) {
              const channel = guild.channels?.cache?.get(player.voiceChannelId);
              if (channel && channel.isVoiceBased()) {
                console.log(`🔒 [24/7 WATCHDOG] Reconnecting bot to locked voice channel ${channel.id} in guild ${player.guildId}...`);
                try {
                  await this.joinVoice(channel);
                } catch (reconnectErr) {
                  console.error(`🔒 [24/7 WATCHDOG] Auto-reconnect failed:`, reconnectErr.message);
                }
              }
            }
          }
        }
      } catch (watchdogErr) {
        console.error(`🔒 [24/7 WATCHDOG ERROR]:`, watchdogErr.message);
      }
    }, 20000); // Check every 20 seconds
  }
}

export const voiceManager = new VoiceManager();
export default voiceManager;

