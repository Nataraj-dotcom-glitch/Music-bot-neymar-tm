/**
 * Neymar Music™ — Discord Voice Connection Manager
 * Developer/Brand: Dark_Alise Development
 * Uses @discordjs/voice to handle voice states, permissions, and connections
 */

import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState
} from '@discordjs/voice';
import { PermissionFlagsBits } from 'discord.js';

export class VoiceManager {
  constructor() {
    /** @type {Map<string, import('@discordjs/voice').VoiceConnection>} */
    this.connections = new Map();
  }

  /**
   * Checks if the bot has Connect and Speak permissions in the target channel.
   * @param {import('discord.js').VoiceChannel | import('discord.js').StageChannel} channel
   * @param {import('discord.js').GuildMember} me
   * @returns {{ hasPermission: boolean, message?: string }}
   */
  checkPermissions(channel, me) {
    if (!channel || !me) {
      return { hasPermission: false, message: '❌ Invalid voice channel or guild member.' };
    }

    const permissions = channel.permissionsFor(me);
    if (!permissions) {
      return { hasPermission: false, message: '❌ Could not determine voice channel permissions.' };
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
   * Connects the bot to a voice channel and waits for Ready state.
   * @param {import('discord.js').VoiceChannel | import('discord.js').StageChannel} channel
   * @param {object} options
   * @returns {Promise<import('@discordjs/voice').VoiceConnection>}
   */
  async joinVoice(channel, options = {}) {
    const { guild } = channel;
    const guildId = guild.id;
    const me = guild.members.me;

    console.log(`[VOICE] Guild: ${guildId}`);
    console.log(`[VOICE] Joining channel: ${channel.id}`);

    // 1. Verify Bot Voice Permissions
    const permCheck = this.checkPermissions(channel, me);
    if (!permCheck.hasPermission) {
      const err = new Error(permCheck.message);
      err.isPermissionError = true;
      console.error(`[VOICE ERROR] Missing permissions in guild ${guildId}: ${permCheck.message}`);
      throw err;
    }

    // 2. Check existing connection
    let connection = getVoiceConnection(guildId) || this.connections.get(guildId);

    if (connection && connection.joinConfig.channelId === channel.id && connection.state.status === VoiceConnectionStatus.Ready) {
      this.connections.set(guildId, connection);
      return connection;
    }

    // 3. Create real VoiceConnection using joinVoiceChannel
    console.log(`[VOICE] Connection state: Connecting`);
    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: options.selfDeaf ?? true,
      selfMute: options.selfMute ?? false
    });

    this.connections.set(guildId, connection);

    // 4. Attach state listeners
    this.setupConnectionListeners(connection, guildId);

    // 5. Wait for Ready state
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
      console.log(`[VOICE] Connection state: Ready`);
      return connection;
    } catch (error) {
      console.error(`[VOICE ERROR] Failed to connect to channel ${channel.id} in guild ${guildId}:`, error.message || error);
      try {
        connection.destroy();
      } catch {
        // ignore destroy error
      }
      this.connections.delete(guildId);
      throw new Error(`Failed to establish voice connection: ${error.message || 'Connection timeout'}`);
    }
  }

  /**
   * Configures lifecycle state monitoring for a connection.
   * @param {import('@discordjs/voice').VoiceConnection} connection
   * @param {string} guildId
   */
  setupConnectionListeners(connection, guildId) {
    connection.on('stateChange', async (oldState, newState) => {
      if (newState.status === VoiceConnectionStatus.Signalling) {
        console.log(`[VOICE] Connection state: Signalling`);
      } else if (newState.status === VoiceConnectionStatus.Connecting) {
        console.log(`[VOICE] Connection state: Connecting`);
      } else if (newState.status === VoiceConnectionStatus.Ready) {
        console.log(`[VOICE] Connection state: Ready`);
      } else if (newState.status === VoiceConnectionStatus.Disconnected) {
        console.warn(`[VOICE] Connection state: Disconnected (Guild: ${guildId})`);
        // Attempt safe reconnection if possible
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
          ]);
          console.log(`[VOICE] Reconnected successfully in guild ${guildId}`);
        } catch {
          // Unrecoverable disconnection (e.g. kicked or channel deleted)
          try {
            connection.destroy();
          } catch {
            // ignore
          }
          this.connections.delete(guildId);
          console.log(`[VOICE] Destroyed dead voice connection for guild ${guildId}`);
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        console.log(`[VOICE] Connection state: Destroyed (Guild: ${guildId})`);
        this.connections.delete(guildId);
      }
    });

    connection.on('error', (error) => {
      console.error(`[VOICE ERROR] Guild ${guildId} Voice Connection Error:`, error.message || error);
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
    const conn = this.getConnection(guildId);
    return Boolean(conn && conn.state.status === VoiceConnectionStatus.Ready);
  }

  /**
   * Safely leaves the voice channel and cleans up connection.
   * @param {string} guildId
   * @returns {boolean}
   */
  leaveVoice(guildId) {
    const conn = this.getConnection(guildId);
    if (conn) {
      try {
        conn.destroy();
      } catch (err) {
        console.warn(`[VOICE ERROR] Error leaving voice in guild ${guildId}:`, err.message);
      }
      this.connections.delete(guildId);
      console.log(`[VOICE] Left voice channel in guild ${guildId}`);
      return true;
    }
    return false;
  }
}

export const voiceManager = new VoiceManager();
export default voiceManager;
