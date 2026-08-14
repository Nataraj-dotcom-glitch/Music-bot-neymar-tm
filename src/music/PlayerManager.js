/**
 * Neymar Music™ — Multi-Server Player Manager
 * Developer/Brand: Dark_Alise Development
 * Ensures independent audio players, queues, and filter chains per Guild.
 */

export class Player {
  constructor(guildId) {
    this.guildId = String(guildId);
    this.currentTrack = null;
    this.queue = [];
    this.history = [];
    this.volume = 100;
    this.previousVolume = 100;
    this.muted = false;
    this.paused = false;
    this.loopMode = 'off'; // 'off' | 'track' | 'queue'
    this.activeFilters = new Set();
    this.speed = 1.0;
    this.pitch = 1.0;
    this.rate = 1.0;
    this.twentyFourSeven = false;
    this.autoplay = false;
    this.textChannelId = null;
    this.voiceChannelId = null;
    this.position = 0;
    this.maxQueue = 500;
    this.radioMode = false;
    this.djRoleId = null;
  }

  play(track) {
    if (!this.currentTrack) {
      this.currentTrack = track;
      this.position = 0;
      this.paused = false;
    } else {
      if (this.queue.length >= this.maxQueue) {
        throw new Error(`Queue has reached the maximum capacity of ${this.maxQueue} tracks.`);
      }
      this.queue.push(track);
    }
    return this.currentTrack;
  }

  playNext(track) {
    if (!this.currentTrack) {
      return this.play(track);
    }
    this.queue.unshift(track);
    return track;
  }

  playTop(track) {
    return this.playNext(track);
  }

  pause() {
    this.paused = true;
    return true;
  }

  resume() {
    this.paused = false;
    return true;
  }

  skip() {
    if (this.currentTrack) {
      this.history.unshift({ ...this.currentTrack, finishedAt: Date.now() });
      if (this.history.length > 50) this.history.pop();
    }

    if (this.loopMode === 'track' && this.currentTrack) {
      this.position = 0;
      this.paused = false;
      return this.currentTrack;
    }

    if (this.loopMode === 'queue' && this.currentTrack) {
      this.queue.push(this.currentTrack);
    }

    if (this.queue.length > 0) {
      this.currentTrack = this.queue.shift();
      this.position = 0;
      this.paused = false;
    } else {
      this.currentTrack = null;
      this.position = 0;
    }
    return this.currentTrack;
  }

  skipTo(position) {
    const idx = position - 1;
    if (idx < 0 || idx >= this.queue.length) return null;
    if (this.currentTrack) {
      this.history.unshift(this.currentTrack);
    }
    const skipped = this.queue.splice(0, idx);
    this.currentTrack = this.queue.shift();
    this.position = 0;
    this.paused = false;
    return this.currentTrack;
  }

  previous() {
    if (this.history.length === 0) return null;
    const prevTrack = this.history.shift();
    if (this.currentTrack) {
      this.queue.unshift(this.currentTrack);
    }
    this.currentTrack = prevTrack;
    this.position = 0;
    this.paused = false;
    return this.currentTrack;
  }

  stop() {
    this.currentTrack = null;
    this.queue = [];
    this.paused = false;
    this.position = 0;
    this.loopMode = 'off';
    this.activeFilters.clear();
  }

  replay() {
    this.position = 0;
    this.paused = false;
    return this.currentTrack;
  }

  seek(seconds) {
    this.position = Math.max(0, Math.min(seconds * 1000, this.currentTrack?.duration || 0));
    return this.position;
  }

  forward(seconds = 10) {
    return this.seek((this.position / 1000) + seconds);
  }

  rewind(seconds = 10) {
    return this.seek((this.position / 1000) - seconds);
  }

  setVolume(vol) {
    this.volume = Math.max(1, Math.min(200, vol));
    if (this.volume > 0) this.muted = false;
    return this.volume;
  }

  mute() {
    if (!this.muted) {
      this.previousVolume = this.volume || 100;
      this.volume = 0;
      this.muted = true;
    }
    return this.muted;
  }

  unmute() {
    if (this.muted) {
      this.volume = this.previousVolume || 100;
      this.muted = false;
    }
    return this.volume;
  }

  shuffle() {
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    return this.queue;
  }

  toggleLoop(explicitMode) {
    if (explicitMode && ['off', 'track', 'queue'].includes(explicitMode)) {
      this.loopMode = explicitMode;
      return this.loopMode;
    }
    const modes = ['off', 'track', 'queue'];
    const nextIdx = (modes.indexOf(this.loopMode) + 1) % modes.length;
    this.loopMode = modes[nextIdx];
    return this.loopMode;
  }

  clearQueue() {
    const count = this.queue.length;
    this.queue = [];
    return count;
  }

  removeQueue(position) {
    const idx = position - 1;
    if (idx < 0 || idx >= this.queue.length) return null;
    return this.queue.splice(idx, 1)[0];
  }

  moveQueue(fromPos, toPos) {
    const fromIdx = fromPos - 1;
    const toIdx = toPos - 1;
    if (fromIdx < 0 || fromIdx >= this.queue.length || toIdx < 0 || toIdx >= this.queue.length) {
      return false;
    }
    const [movedItem] = this.queue.splice(fromIdx, 1);
    this.queue.splice(toIdx, 0, movedItem);
    return true;
  }

  reverseQueue() {
    this.queue.reverse();
    return this.queue;
  }

  jumpQueue(position) {
    return this.skipTo(position);
  }

  randomNext() {
    if (this.queue.length <= 1) return null;
    const randomIdx = Math.floor(Math.random() * this.queue.length);
    const [track] = this.queue.splice(randomIdx, 1);
    this.queue.unshift(track);
    return track;
  }

  setFilter(filterName, enabled = true) {
    if (enabled) {
      this.activeFilters.add(filterName.toLowerCase());
    } else {
      this.activeFilters.delete(filterName.toLowerCase());
    }
    return Array.from(this.activeFilters);
  }

  clearFilters() {
    this.activeFilters.clear();
    this.speed = 1.0;
    this.pitch = 1.0;
    this.rate = 1.0;
    return true;
  }
}

export class PlayerManager {
  constructor() {
    this.players = new Map();
  }

  getOrCreatePlayer(guildId) {
    const gId = String(guildId);
    if (!this.players.has(gId)) {
      this.players.set(gId, new Player(gId));
    }
    return this.players.get(gId);
  }

  getPlayer(guildId) {
    return this.players.get(String(guildId)) || null;
  }

  hasPlayer(guildId) {
    return this.players.has(String(guildId));
  }

  deletePlayer(guildId) {
    const player = this.players.get(String(guildId));
    if (player) {
      player.stop();
      this.players.delete(String(guildId));
    }
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  executeAction(guildId, action, value) {
    const player = this.getOrCreatePlayer(guildId);
    switch (action) {
      case 'pauseToggle':
        player.paused = !player.paused;
        break;
      case 'skip':
        player.skip();
        break;
      case 'stop':
        player.stop();
        break;
      case 'volume':
        if (typeof value === 'number') player.setVolume(value);
        break;
      case 'loopToggle':
        player.toggleLoop(value);
        break;
      case 'shuffle':
        player.shuffle();
        break;
      default:
        break;
    }
    return player;
  }
}

export const playerManager = new PlayerManager();

export function getPlayer(guildId) {
  return playerManager.getOrCreatePlayer(guildId);
}

export default {
  Player,
  PlayerManager,
  playerManager,
  getPlayer,
  getOrCreatePlayer: (gId) => playerManager.getOrCreatePlayer(gId)
};
