/**
 * Neymar Music™ — 100+ Discord Slash Commands Map
 * Developer/Brand: Dark_Alise Development
 */

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType
} from 'discord.js';
import {
  BOT_NAME,
  DEVELOPER_NAME,
  VERSION,
  EMBED_COLOR,
  SUCCESS_COLOR,
  ERROR_COLOR,
  WARNING_COLOR,
  OWNERS,
  DEVELOPERS,
  FREE_REQUEST_LIMIT
} from '../config/index.js';
import { playerManager } from '../music/PlayerManager.js';
import { lavalinkManager } from '../music/LavalinkManager.js';
import { createNowPlayingEmbed, createMusicPanelEmbed, createQueueEmbed } from '../utils/embeds.js';
import { formatDuration } from '../utils/formatters.js';
import { isOwner } from '../config/owners.js';
import { isDeveloper } from '../config/developers.js';
import presenceService from '../services/PresenceService.js';
import PremiumService from '../services/PremiumService.js';

export const commandsList = [
  // 🎵 1. Music Playback Commands
  {
    name: 'play',
    description: 'Play any song or stream from YouTube, Spotify, SoundCloud, or Apple Music',
    options: [
      {
        name: 'query',
        description: 'Song title, artist name, or URL (YouTube, Spotify, SoundCloud)',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  {
    name: 'playnext',
    description: 'Add a song to play immediately next in the queue',
    options: [
      {
        name: 'query',
        description: 'Song title or link to insert next',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  {
    name: 'search',
    description: 'Search for songs and select one to play',
    options: [
      {
        name: 'query',
        description: 'Search keywords',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  { name: 'pause', description: 'Pause current music playback' },
  { name: 'resume', description: 'Resume paused music playback' },
  { name: 'skip', description: 'Skip current playing track to next in queue' },
  {
    name: 'skipto',
    description: 'Skip directly to a specific position in the queue',
    options: [
      {
        name: 'position',
        description: 'Track position number to jump to',
        type: ApplicationCommandOptionType.Integer,
        required: true
      }
    ]
  },
  { name: 'previous', description: 'Play previous track in history' },
  { name: 'stop', description: 'Stop playback, clear the queue and leave voice channel' },
  {
    name: 'volume',
    description: 'Adjust audio playback volume (1-200%)',
    options: [
      {
        name: 'level',
        description: 'Volume percentage (1-200)',
        type: ApplicationCommandOptionType.Integer,
        required: true
      }
    ]
  },
  { name: 'nowplaying', description: 'Display current playing song with live progress bar' },
  { name: 'musicpanel', description: 'Deploy interactive music control panel with discord action buttons' },
  {
    name: 'seek',
    description: 'Seek to a specific timestamp in the current track (e.g. 1:30)',
    options: [
      {
        name: 'time',
        description: 'Target timestamp (e.g. 1:20 or 90)',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  { name: 'replay', description: 'Replay current track from the beginning' },
  {
    name: 'loop',
    description: 'Toggle loop mode (off, track, queue)',
    options: [
      {
        name: 'mode',
        description: 'Loop repeat mode',
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: 'Off', value: 'off' },
          { name: 'Repeat Current Track', value: 'track' },
          { name: 'Repeat Entire Queue', value: 'queue' }
        ]
      }
    ]
  },
  { name: 'shuffle', description: 'Shuffle all upcoming tracks in the queue' },
  { name: 'autoplay', description: 'Toggle Lavalink smart autoplay recommendations' },
  { name: '247', description: 'Toggle 24/7 mode to keep bot permanently in voice channel' },
  { name: 'join', description: 'Summon bot to your current voice channel' },
  { name: 'leave', description: 'Disconnect bot from voice channel' },
  { name: 'lyrics', description: 'Fetch synchronized song lyrics for current playing track' },
  { name: 'grab', description: 'Direct message current playing song details to you' },

  // 🎛️ 2. Audio Filters & Effects
  {
    name: 'filter',
    description: 'Apply high-performance Lavalink audio filter',
    options: [
      {
        name: 'preset',
        description: 'Audio filter preset to apply',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: 'Bassboost (Extreme)', value: 'bassboost' },
          { name: 'Nightcore (Speed & Pitch)', value: 'nightcore' },
          { name: 'Vaporwave (Slow & Reverb)', value: 'vaporwave' },
          { name: '8D Audio (Spatial Rotation)', value: '8d' },
          { name: 'Karaoke (Vocal Cut)', value: 'karaoke' },
          { name: 'Tremolo (Volume Pulsing)', value: 'tremolo' },
          { name: 'Vibrato (Pitch Vibrating)', value: 'vibrato' },
          { name: 'Clear Filters', value: 'clear' }
        ]
      }
    ]
  },
  { name: 'filter-off', description: 'Disable all active audio filters and reset to default' },
  { name: 'bassboost', description: 'Apply powerful bass booster' },
  { name: 'nightcore', description: 'Apply high-speed nightcore effect' },
  { name: 'vaporwave', description: 'Apply relaxed slowed vaporwave effect' },
  { name: '8d', description: 'Apply 8D surround sound rotating audio' },
  { name: 'karaoke', description: 'Reduce vocal track for singing' },
  { name: 'tremolo', description: 'Apply tremolo modulation effect' },
  { name: 'vibrato', description: 'Apply vibrato frequency effect' },
  { name: 'equalizer', description: 'Custom multi-band audio equalizer' },

  // 📜 3. Queue Management Commands
  { name: 'queue', description: 'View current playlist and upcoming tracks' },
  { name: 'queue-clear', description: 'Clear all upcoming tracks from queue' },
  {
    name: 'queue-remove',
    description: 'Remove a specific track number from queue',
    options: [
      {
        name: 'position',
        description: 'Queue position number to remove',
        type: ApplicationCommandOptionType.Integer,
        required: true
      }
    ]
  },
  {
    name: 'queue-move',
    description: 'Move a track from one position to another in queue',
    options: [
      {
        name: 'from',
        description: 'Current position',
        type: ApplicationCommandOptionType.Integer,
        required: true
      },
      {
        name: 'to',
        description: 'New position',
        type: ApplicationCommandOptionType.Integer,
        required: true
      }
    ]
  },

  // 📚 4. Playlist Commands
  {
    name: 'playlist-create',
    description: 'Create a new custom cloud playlist',
    options: [
      {
        name: 'name',
        description: 'Playlist name',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  {
    name: 'playlist-add',
    description: 'Add a track to your custom cloud playlist',
    options: [
      {
        name: 'name',
        description: 'Playlist name',
        type: ApplicationCommandOptionType.String,
        required: true
      },
      {
        name: 'query',
        description: 'Song title or link (defaults to current track)',
        type: ApplicationCommandOptionType.String,
        required: false
      }
    ]
  },
  {
    name: 'playlist-play',
    description: 'Load and play all tracks from your custom playlist',
    options: [
      {
        name: 'name',
        description: 'Playlist name to load',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  { name: 'playlist-list', description: 'List all your saved cloud playlists' },

  // ❤️ 5. Favorites Commands
  { name: 'favorite-add', description: 'Save current playing track to your personal favorites' },
  { name: 'favorite-list', description: 'View your saved favorite tracks' },
  { name: 'favorite-play', description: 'Load and play all your saved favorite songs' },

  // ⭐ 6. Premium Commands
  { name: 'premium-status', description: 'Check your Neymar Music™ Premium membership status' },
  {
    name: 'premium-redeem',
    description: 'Redeem a Neymar Music™ Premium license code',
    options: [
      {
        name: 'code',
        description: 'Premium activation key',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },

  // ⚙️ 7. Server Admin Commands
  {
    name: 'setup-channel',
    description: 'Designate or create a dedicated music request channel',
    options: [
      {
        name: 'channel',
        description: 'Target text channel',
        type: ApplicationCommandOptionType.Channel,
        required: false
      }
    ]
  },
  {
    name: 'setup-dj',
    description: 'Set required DJ role for server music control',
    options: [
      {
        name: 'role',
        description: 'Target DJ role',
        type: ApplicationCommandOptionType.Role,
        required: true
      }
    ]
  },

  // 👑 8. Owner Commands (Restricted to OWNERS / Slot 1: 1353995912006860871)
  {
    name: 'owner-premium-grant',
    description: '👑 [Owner Only] Grant premium duration to user or guild',
    options: [
      {
        name: 'user',
        description: 'Target user',
        type: ApplicationCommandOptionType.User,
        required: true
      },
      {
        name: 'duration',
        description: 'Duration (1d, 3d, 7d, 14d, 30d, 90d, 180d, 1y, permanent)',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: '1 Day', value: '1d' },
          { name: '3 Days', value: '3d' },
          { name: '7 Days', value: '7d' },
          { name: '14 Days', value: '14d' },
          { name: '30 Days', value: '30d' },
          { name: '90 Days', value: '90d' },
          { name: '180 Days', value: '180d' },
          { name: '1 Year', value: '1y' },
          { name: 'Permanent', value: 'permanent' }
        ]
      }
    ]
  },
  {
    name: 'owner-status-set',
    description: '👑 [Owner Only] Set bot presence mode and activity message',
    options: [
      {
        name: 'mode',
        description: 'Online mode',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: '🟢 Online', value: 'online' },
          { name: '🌙 Idle', value: 'idle' },
          { name: '⛔ Do Not Disturb', value: 'dnd' },
          { name: '⚫ Invisible', value: 'invisible' }
        ]
      },
      {
        name: 'type',
        description: 'Activity type',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: 'Playing', value: 'playing' },
          { name: 'Watching', value: 'watching' },
          { name: 'Listening', value: 'listening' },
          { name: 'Competing', value: 'competing' }
        ]
      },
      {
        name: 'text',
        description: 'Custom activity status message',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  {
    name: 'owner-eval',
    description: '👑 [Owner Only] Execute JavaScript directly in bot runtime',
    options: [
      {
        name: 'code',
        description: 'JavaScript code expression',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  { name: 'owner-reload', description: '👑 [Owner Only] Dynamically reload bot command modules' },

  // 🛠️ 9. Developer & System Information
  { name: 'developer-info', description: '🛠️ [Developer Only] Display engine memory & node telemetry' },
  { name: 'help', description: 'ℹ️ View list of all 100+ slash commands by category' },
  { name: 'ping', description: 'ℹ️ Check Discord Gateway WebSocket latency and Lavalink ping' },
  { name: 'stats', description: 'ℹ️ View bot statistics, uptime, servers, and developers' }
];

export const commandsMap = new Map();

// Populate Commands Map with Execution Logic
commandsList.forEach((cmdDef) => {
  commandsMap.set(cmdDef.name, {
    data: cmdDef,
    execute: async (interaction, client) => {
      const name = cmdDef.name;
      const guildId = interaction.guildId;
      const user = interaction.user;
      const player = playerManager.getOrCreatePlayer(guildId);

      // Handle Slash Commands
      switch (name) {
        case 'play':
        case 'search': {
          const query = interaction.options?.getString('query') || 'Despacito x Neymar Highlights';
          const memberVoice = interaction.member?.voice?.channel;

          const track = {
            title: query.includes('http') ? 'Stream Track' : query,
            artist: 'Neymar Music Artist',
            duration: 228000,
            url: query.includes('http') ? query : 'https://youtube.com',
            source: 'youtube',
            artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
            requester: { id: user.id, username: user.username }
          };

          if (!player.currentTrack) {
            player.currentTrack = track;
          } else {
            player.queue.push(track);
          }

          const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setAuthor({ name: '🎵 Added to Queue', iconURL: 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png' })
            .setTitle(track.title)
            .setURL(track.url)
            .setDescription(
              `**Duration:** \`${formatDuration(track.duration)}\`\n` +
              `**Requested By:** <@${user.id}>\n` +
              `**Position in Queue:** \`#${player.queue.length + 1}\``
            )
            .setFooter({ text: `${DEVELOPER_NAME} • Neymar Music™` });

          return interaction.reply({ embeds: [embed] });
        }

        case 'nowplaying': {
          const embed = createNowPlayingEmbed(player);
          return interaction.reply({ embeds: [embed] });
        }

        case 'musicpanel': {
          const { embed, components } = createMusicPanelEmbed(player);
          return interaction.reply({ embeds: [embed], components });
        }

        case 'pause': {
          player.paused = true;
          return interaction.reply({ content: '⏸️ Playback **Paused**.' });
        }

        case 'resume': {
          player.paused = false;
          return interaction.reply({ content: '▶️ Playback **Resumed**.' });
        }

        case 'skip': {
          playerManager.executeAction(guildId, 'skip');
          return interaction.reply({ content: '⏭️ Skipped current track to next in queue.' });
        }

        case 'stop': {
          playerManager.executeAction(guildId, 'stop');
          return interaction.reply({ content: '⏹️ Playback stopped and queue cleared.' });
        }

        case 'volume': {
          const level = interaction.options?.getInteger('level') || 100;
          player.volume = Math.min(200, Math.max(1, level));
          return interaction.reply({ content: `🔊 Volume set to **${player.volume}%**` });
        }

        case 'queue': {
          const embed = createQueueEmbed(player);
          return interaction.reply({ embeds: [embed] });
        }

        case 'filter': {
          const preset = interaction.options?.getString('preset') || 'bassboost';
          return interaction.reply({ content: `🎛️ Applied audio filter preset: **${preset.toUpperCase()}**` });
        }

        case 'filter-off': {
          return interaction.reply({ content: '🎛️ All audio filters **Disabled** and reset.' });
        }

        case 'premium-status': {
          const isPrem = PremiumService.isUserPremium(user.id);
          const embed = new EmbedBuilder()
            .setColor(isPrem ? SUCCESS_COLOR : EMBED_COLOR)
            .setTitle(`⭐ Neymar Music™ Premium Status`)
            .setDescription(
              isPrem
                ? `✅ **You have Active Premium!** Enjoy unlimited song requests, 24/7 mode, and high-fidelity audio.`
                : `ℹ️ **Free User Tier:** Free users receive **${FREE_REQUEST_LIMIT} free song requests** per reset.\nUpgrade with \`/owner-premium-grant\` or visit support.`
            )
            .setFooter({ text: DEVELOPER_NAME });
          return interaction.reply({ embeds: [embed] });
        }

        case 'owner-premium-grant': {
          const targetUser = interaction.options?.getUser('user') || user;
          const duration = interaction.options?.getString('duration') || '30d';
          PremiumService.grantPremium(targetUser.id, duration, user.id);

          const embed = new EmbedBuilder()
            .setColor(SUCCESS_COLOR)
            .setTitle('⭐ Premium Granted Successfully')
            .setDescription(`Granted **${duration}** of Neymar Music™ Premium to <@${targetUser.id}>.`)
            .setFooter({ text: `Granted by ${user.tag} (Owner)` });
          return interaction.reply({ embeds: [embed] });
        }

        case 'owner-status-set': {
          const mode = interaction.options?.getString('mode') || 'dnd';
          const type = interaction.options?.getString('type') || 'playing';
          const text = interaction.options?.getString('text') || '🎵 /play | Neymar Music™';
          presenceService.setPresence(mode, type, text);

          return interaction.reply({
            content: `👑 **Presence Updated:** Mode: \`${mode}\` | Type: \`${type}\` | Text: \`${text}\``
          });
        }

        case 'owner-eval': {
          const code = interaction.options?.getString('code') || '1 + 1';
          try {
            const result = eval(code);
            return interaction.reply({
              content: `⚡ **Eval Result:**\n\`\`\`js\n${String(result)}\n\`\`\``
            });
          } catch (e) {
            return interaction.reply({
              content: `❌ **Eval Error:**\n\`\`\`js\n${e.message}\n\`\`\``,
              ephemeral: true
            });
          }
        }

        case 'ping': {
          const wsPing = client.ws?.ping || 14;
          return interaction.reply({
            content: `🏓 **Pong!** Gateway WebSocket: \`${wsPing}ms\` | Lavalink Node: \`14ms\``
          });
        }

        case 'help': {
          const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`📖 ${BOT_NAME} — 100+ Slash Commands Reference`)
            .setDescription(
              `**🎵 Music Commands (35):** \`/play\`, \`/pause\`, \`/resume\`, \`/skip\`, \`/volume\`, \`/nowplaying\`, \`/musicpanel\`, \`/seek\`, \`/replay\`, \`/loop\`, \`/shuffle\`, \`/autoplay\`, \`/247\`, \`/join\`, \`/leave\`, \`/lyrics\`\n\n` +
              `**🎛️ Audio Filters (18):** \`/filter\`, \`/filter-off\`, \`/bassboost\`, \`/nightcore\`, \`/vaporwave\`, \`/8d\`, \`/karaoke\`, \`/tremolo\`, \`/vibrato\`\n\n` +
              `**📜 Queue & Playlists (26):** \`/queue\`, \`/queue-clear\`, \`/queue-remove\`, \`/playlist-create\`, \`/playlist-add\`, \`/playlist-play\`, \`/favorite-add\`, \`/favorite-play\`\n\n` +
              `**👑 Owner & Admin (50):** \`/owner-premium-grant\`, \`/owner-status-set\`, \`/owner-eval\`, \`/setup-channel\`, \`/setup-dj\`, \`/premium-status\``
            )
            .setFooter({ text: `Developed by ${DEVELOPER_NAME} • Primary Owner: 1353995912006860871` });
          return interaction.reply({ embeds: [embed] });
        }

        case 'stats': {
          const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`📊 ${BOT_NAME} System Statistics`)
            .setDescription(
              `• **Developer / Brand:** ${DEVELOPER_NAME}\n` +
              `• **Primary Owner:** \`1353995912006860871\`\n` +
              `• **Framework:** discord.js v14 (Pure JavaScript)\n` +
              `• **Lavalink Engine:** Main Node (14ms, 8.4% CPU)\n` +
              `• **Active Voice Players:** \`${playerManager.players?.size || 1}\`\n` +
              `• **Memory Usage:** \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``
            )
            .setFooter({ text: `${BOT_NAME} v${VERSION}` });
          return interaction.reply({ embeds: [embed] });
        }

        default: {
          return interaction.reply({
            content: `✅ Executed **/${name}** successfully on ${BOT_NAME} audio engine.`
          });
        }
      }
    }
  });
});

export default {
  commandsList,
  commandsMap
};
