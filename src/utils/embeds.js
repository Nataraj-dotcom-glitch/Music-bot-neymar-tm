/**
 * Neymar Music™ — Standardized Discord Embeds & Action Rows
 * Developer/Brand: Dark_Alise Development
 */

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import {
  EMBED_COLOR,
  SUCCESS_COLOR,
  ERROR_COLOR,
  WARNING_COLOR,
  BOT_NAME,
  DEVELOPER_NAME,
  VERSION
} from '../config/index.js';
import { formatDuration, createProgressBar } from './formatters.js';

export function createNowPlayingEmbed(player) {
  const track = player?.currentTrack || {
    title: 'No Track Playing',
    artist: 'Neymar Music™',
    duration: 0,
    url: 'https://youtube.com',
    source: 'youtube',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
    requester: { id: '1353995912006860871', username: 'Dark_Alise' }
  };

  const progress = createProgressBar(65000, track.duration || 228000, 14);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setAuthor({
      name: `${BOT_NAME} — Now Playing`,
      iconURL: 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png'
    })
    .setTitle(track.title)
    .setURL(track.url || 'https://youtube.com')
    .setDescription(
      `**Artist:** ${track.artist || 'Unknown Artist'}\n` +
      `**Requested By:** <@${track.requester?.id || '1353995912006860871'}>\n\n` +
      `\`01:05\` ${progress} \`${formatDuration(track.duration || 228000)}\`\n\n` +
      `🔊 **Volume:** \`${player.volume || 100}%\` | 🔁 **Loop:** \`${(player.loopMode || 'off').toUpperCase()}\` | 🎛️ **Status:** \`${player.paused ? 'Paused' : 'Playing'}\``
    )
    .setFooter({
      text: `${DEVELOPER_NAME} • Neymar Music™ v${VERSION}`,
      iconURL: 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png'
    })
    .setTimestamp();

  if (track.artwork) {
    embed.setThumbnail(track.artwork);
  }

  return embed;
}

export function createMusicPanelEmbed(player) {
  const embed = createNowPlayingEmbed(player);
  embed.setTitle(`🎛️ ${BOT_NAME} Interactive Music Controller`);

  // Action Row 1: Primary Controls
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_previous')
      .setEmoji('⏮️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_play_pause')
      .setEmoji(player.paused ? '▶️' : '⏸️')
      .setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_skip')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_stop')
      .setEmoji('⏹️')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('btn_shuffle')
      .setEmoji('🔀')
      .setStyle(ButtonStyle.Secondary)
  );

  // Action Row 2: Secondary Controls
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_loop')
      .setEmoji('🔁')
      .setStyle(player.loopMode !== 'off' ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_vol_down')
      .setEmoji('🔉')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_vol_up')
      .setEmoji('🔊')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_queue')
      .setEmoji('📜')
      .setLabel('Queue')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embed, components: [row1, row2] };
}

export function createQueueEmbed(player) {
  const tracks = player.queue?.tracks || player.queue || [];
  const trackList = tracks.slice(0, 10).map((t, idx) => {
    return `\`${idx + 1}.\` **[${t.title}](${t.url || 'https://youtube.com'})** — \`${formatDuration(t.duration)}\``;
  }).join('\n') || '*Queue is currently empty.*';

  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(`📜 Upcoming Queue (${tracks.length} tracks)`)
    .setDescription(
      `**Now Playing:**\n` +
      `🎵 **${player.currentTrack?.title || 'None'}**\n\n` +
      `**Up Next:**\n${trackList}`
    )
    .setFooter({ text: `${DEVELOPER_NAME} • Neymar Music™` })
    .setTimestamp();
}

export function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(SUCCESS_COLOR)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setFooter({ text: DEVELOPER_NAME });
}

export function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(ERROR_COLOR)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setFooter({ text: DEVELOPER_NAME });
}

export default {
  createNowPlayingEmbed,
  createMusicPanelEmbed,
  createQueueEmbed,
  createSuccessEmbed,
  createErrorEmbed
};
