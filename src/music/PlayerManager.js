/**
 * Neymar Music™ — Player Manager
 * Developer/Brand: Dark_Alise Development
 */

export class Player {
  constructor(guildId) {
    this.guildId = guildId;
    this.currentTrack = null;
    this.queue = [];
    this.volume = 100;
    this.paused = false;
    this.loopMode = 'off'; // 'off' | 'track' | 'queue'
    this.activeFilters = [];
    this.twentyFourSeven = false;
    this.autoplay = false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  skip() {
    if (this.queue.length > 0) {
      this.currentTrack = this.queue.shift();
      this.paused = false;
    } else {
      this.currentTrack = null;
    }
  }

  stop() {
    this.currentTrack = null;
    this.queue = [];
    this.paused = false;
    this.loopMode = 'off';
  }

  setVolume(vol) {
    this.volume = Math.max(1, Math.min(200, vol));
  }

  shuffle() {
    this.queue.sort(() => Math.random() - 0.5);
  }

  toggleLoop() {
    const modes = ['off', 'track', 'queue'];
    const nextIdx = (modes.indexOf(this.loopMode) + 1) % modes.length;
    this.loopMode = modes[nextIdx];
    return this.loopMode;
  }
}

export class PlayerManager {
  constructor() {
    this.players = new Map();
  }

  getOrCreatePlayer(guildId) {
    if (!this.players.has(guildId)) {
      this.players.set(guildId, new Player(guildId));
    }
    return this.players.get(guildId);
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
        player.toggleLoop();
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
  playerManager,
  getPlayer,
  getOrCreatePlayer: (gId) => playerManager.getOrCreatePlayer(gId)
};
