import { EMBED_COLOR, SUCCESS_COLOR, ERROR_COLOR } from '../config/index.js';

export function createNowPlayingEmbed(track) {
  return {
    color: parseInt(EMBED_COLOR.replace('#', ''), 16),
    title: '🎵 Now Playing',
    description: `**[${track.title}](${track.url})**\n\n**Artist:** ${track.artist}\n**Requester:** <@${track.requester?.id || '1353995912006860871'}>`,
    thumbnail: { url: track.artwork }
  };
}

export function createErrorEmbed(message) {
  return {
    color: parseInt(ERROR_COLOR.replace('#', ''), 16),
    title: '❌ Error',
    description: message
  };
}

export default { createNowPlayingEmbed, createErrorEmbed };
