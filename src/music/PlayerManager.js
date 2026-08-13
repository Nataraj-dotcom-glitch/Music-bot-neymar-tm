/**
 * Neymar Music™ — Player Manager
 * Developer/Brand: Dark_Alise Development
 */

export class Player {
  constructor(guildId) {
    this.guildId = guildId;
    this.currentTrack = {
      title: 'Despacito x Neymar Highlights',
      artist: 'Luis Fonsi ft. Neymar Jr',
      duration: 228000,
      url: 'https://youtube.com',
      source: 'youtube',
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      requester: { id: '1353995912006860871', username: 'Dark_Alise' }
    };
    this.queue = {
      tracks: [
        { title: 'Neymar Jr Skill Compilation 2026', duration: 180000, artist: 'Neymar Skills' },
        { title: 'Bailando Samba (Remix)', duration: 210000, artist: 'Brasil Beats' }
      ],
      size: 2,
      loopMode: 'off',
      shuffle: () => {
        this.queue.tracks.sort(() => Math.random() - 0.5);
      }
    };
    this.volume = 100;
    this.paused = false;
    this.activeFilters = [];
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }
  play() {
    if (this.queue.tracks.length > 0) {
      const next = this.queue.tracks.shift();
      this.queue.size = this.queue.tracks.length;
      this.currentTrack = {
        title: next.title,
        artist: next.artist || 'Unknown Artist',
        duration: next.duration || 180000,
        url: 'https://youtube.com',
        source: 'youtube',
        artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        requester: { id: '1353995912006860871', username: 'Dark_Alise' }
      };
    }
  }
  stop() {
    this.currentTrack = null;
    this.queue.tracks = [];
    this.queue.size = 0;
    this.paused = false;
  }
  setVolume(vol) { this.volume = vol; }
}

const players = new Map();

export function getPlayer(guildId) {
  if (!players.has(guildId)) {
    players.set(guildId, new Player(guildId));
  }
  return players.get(guildId);
}

export default {
  getPlayer,
  getOrCreatePlayer: getPlayer
};
