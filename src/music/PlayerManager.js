/**
 * Neymar Music™ — Multi-Server Player Manager
 * Developer/Brand: Dark_Alise Development
 * Real Audio Player Pipeline per Guild with Lavalink & Voice Synchronization
 */

import { lavalinkManager } from './LavalinkManager.js';
import { voiceManager } from './VoiceManager.js';
import { FILTERS } from './Filters.js';
import { formatDuration } from '../utils/formatters.js';

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
    this.mode247 = false;
    this.autoplay = false;
    this.textChannelId = null;
    this.voiceChannelId = null;
    this.position = 0;
    this.ping = 15;
    this.maxQueue = 500;
    this.radioMode = false;
    this.djRoleId = null;
  }

  get connected() {
    return voiceManager.isConnected(this.guildId);
  }

  /**
   * Enqueues or starts playing a real resolved Lavalink track.
   * @param {object} track
   * @returns {Promise<object>}
   */
  async play(track) {
    if (!track) return null;

    if (!this.currentTrack) {
      this.currentTrack = track;
      this.position = 0;
      this.paused = false;
      await this.startPlayback(track);
    } else {
      if (this.queue.length >= this.maxQueue) {
        throw new Error(`Queue has reached the maximum capacity of ${this.maxQueue} tracks.`);
      }
      this.queue.push(track);
    }
    return this.currentTrack;
  }

  /**
   * Starts playing a track on Lavalink node.
   * @param {object} track
   */
  async startPlayback(track) {
    if (!track) return;

    console.log(`[PLAYER] Guild: ${this.guildId}`);
    console.log(`[PLAYER] Track: ${track.title}`);
    console.log(`[PLAYER] Source: ${track.source || 'youtube'}`);
    console.log(`[PLAYER] Duration: ${formatDuration(track.duration || 0)}`);
    console.log(`[PLAYER] Playback: STARTED`);

    if (lavalinkManager.connected && track.encoded) {
      try {
        await lavalinkManager.playTrack(this.guildId, track.encoded, {
          volume: this.volume,
          filters: this.buildFiltersPayload()
        });
      } catch (err) {
        console.error(`[PLAYER ERROR] Lavalink failed to start track in guild ${this.guildId}:`, err.message);
      }
    }
  }

  /**
   * Inserts track next in queue or plays immediately.
   * @param {object} track
   */
  async playNext(track) {
    if (!this.currentTrack) {
      return this.play(track);
    }
    this.queue.unshift(track);
    return track;
  }

  async playTop(track) {
    return this.playNext(track);
  }

  /**
   * Pauses the guild player.
   */
  async pause() {
    this.paused = true;
    if (lavalinkManager.connected) {
      try {
        await lavalinkManager.pauseTrack(this.guildId, true);
      } catch (err) {
        console.error(`[PLAYER ERROR] Pause failed in guild ${this.guildId}:`, err.message);
      }
    }
    return true;
  }

  /**
   * Resumes the guild player.
   */
  async resume() {
    this.paused = false;
    if (lavalinkManager.connected) {
      try {
        await lavalinkManager.pauseTrack(this.guildId, false);
      } catch (err) {
        console.error(`[PLAYER ERROR] Resume failed in guild ${this.guildId}:`, err.message);
      }
    }
    return true;
  }

  /**
   * Skips to the next track in queue.
   */
  async skip() {
    if (this.currentTrack) {
      this.history.unshift({ ...this.currentTrack, finishedAt: Date.now() });
      if (this.history.length > 50) this.history.pop();
    }

    if (this.loopMode === 'track' && this.currentTrack) {
      this.position = 0;
      this.paused = false;
      await this.startPlayback(this.currentTrack);
      return this.currentTrack;
    }

    if (this.loopMode === 'queue' && this.currentTrack) {
      this.queue.push(this.currentTrack);
    }

    if (this.queue.length > 0) {
      this.currentTrack = this.queue.shift();
      this.position = 0;
      this.paused = false;
      await this.startPlayback(this.currentTrack);
    } else {
      this.currentTrack = null;
      this.position = 0;
      if (lavalinkManager.connected) {
        await lavalinkManager.stopTrack(this.guildId).catch(() => {});
      }
    }
    return this.currentTrack;
  }

  /**
   * Skips to specific position in queue.
   * @param {number} position
   */
  async skipTo(position) {
    const idx = position - 1;
    if (idx < 0 || idx >= this.queue.length) return null;
    if (this.currentTrack) {
      this.history.unshift(this.currentTrack);
    }
    this.queue.splice(0, idx);
    this.currentTrack = this.queue.shift();
    this.position = 0;
    this.paused = false;
    await this.startPlayback(this.currentTrack);
    return this.currentTrack;
  }

  /**
   * Plays the previous track from history.
   */
  async previous() {
    if (this.history.length === 0) return null;
    const prevTrack = this.history.shift();
    if (this.currentTrack) {
      this.queue.unshift(this.currentTrack);
    }
    this.currentTrack = prevTrack;
    this.position = 0;
    this.paused = false;
    await this.startPlayback(this.currentTrack);
    return this.currentTrack;
  }

  /**
   * Stops playback and clears server queue.
   */
  async stop() {
    this.currentTrack = null;
    this.queue = [];
    this.paused = false;
    this.position = 0;
    this.loopMode = 'off';
    this.activeFilters.clear();

    if (lavalinkManager.connected) {
      try {
        await lavalinkManager.stopTrack(this.guildId);
      } catch (err) {
        // ignore
      }
    }
  }

  /**
   * Replays current track from start.
   */
  async replay() {
    this.position = 0;
    this.paused = false;
    if (this.currentTrack) {
      await this.startPlayback(this.currentTrack);
    }
    return this.currentTrack;
  }

  /**
   * Seeks to a seconds position in track.
   * @param {number} seconds
   */
  async seek(seconds) {
    this.position = Math.max(0, Math.min(seconds * 1000, this.currentTrack?.duration || 0));
    if (lavalinkManager.connected) {
      try {
        await lavalinkManager.seekTrack(this.guildId, this.position);
      } catch (err) {
        console.error(`[PLAYER ERROR] Seek failed in guild ${this.guildId}:`, err.message);
      }
    }
    return this.position;
  }

  async forward(seconds = 10) {
    return this.seek((this.position / 1000) + seconds);
  }

  async rewind(seconds = 10) {
    return this.seek((this.position / 1000) - seconds);
  }

  /**
   * Sets volume level (1-200%).
   * @param {number} vol
   */
  async setVolume(vol) {
    this.volume = Math.max(1, Math.min(200, vol));
    if (this.volume > 0) this.muted = false;
    if (lavalinkManager.connected) {
      try {
        await lavalinkManager.setVolume(this.guildId, this.volume);
      } catch (err) {
        console.error(`[PLAYER ERROR] Volume change failed in guild ${this.guildId}:`, err.message);
      }
    }
    return this.volume;
  }

  async mute() {
    if (!this.muted) {
      this.previousVolume = this.volume || 100;
      this.volume = 0;
      this.muted = true;
      if (lavalinkManager.connected) {
        await lavalinkManager.setVolume(this.guildId, 0).catch(() => {});
      }
    }
    return this.muted;
  }

  async unmute() {
    if (this.muted) {
      this.volume = this.previousVolume || 100;
      this.muted = false;
      if (lavalinkManager.connected) {
        await lavalinkManager.setVolume(this.guildId, this.volume).catch(() => {});
      }
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

  async setFilter(filterName, enabled = true) {
    const name = filterName.toLowerCase();
    if (enabled) {
      this.activeFilters.add(name);
    } else {
      this.activeFilters.delete(name);
    }

    if (lavalinkManager.connected) {
      try {
        await lavalinkManager.applyFilters(this.guildId, this.buildFiltersPayload());
      } catch (err) {
        console.error(`[PLAYER ERROR] Filter update failed in guild ${this.guildId}:`, err.message);
      }
    }
    return Array.from(this.activeFilters);
  }

  async clearFilters() {
    this.activeFilters.clear();
    this.speed = 1.0;
    this.pitch = 1.0;
    this.rate = 1.0;

    if (lavalinkManager.connected) {
      try {
        await lavalinkManager.applyFilters(this.guildId, {});
      } catch (err) {
        // ignore
      }
    }
    return true;
  }

  /**
   * Compiles active filters into Lavalink DSP JSON payload.
   */
  buildFiltersPayload() {
    const payload = {};

    for (const f of this.activeFilters) {
      const config = FILTERS[f];
      if (config) {
        Object.assign(payload, config);
      }
    }

    if (this.speed !== 1.0 || this.pitch !== 1.0 || this.rate !== 1.0) {
      payload.timescale = {
        speed: this.speed,
        pitch: this.pitch,
        rate: this.rate
      };
    }

    return payload;
  }
}

export class PlayerManager {
  constructor() {
    /** @type {Map<string, Player>} */
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

  async deletePlayer(guildId) {
    const player = this.players.get(String(guildId));
    if (player) {
      await player.stop();
      this.players.delete(String(guildId));
    }
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  /**
   * Automatically handles track finish/end event from Lavalink.
   * @param {string} guildId
   * @param {string} reason
   */
  async handleTrackEnd(guildId, reason) {
    const player = this.getPlayer(guildId);
    if (!player) return;

    if (player.loopMode === 'track' && player.currentTrack) {
      player.position = 0;
      await player.startPlayback(player.currentTrack);
      return;
    }

    if (player.loopMode === 'queue' && player.currentTrack) {
      player.queue.push(player.currentTrack);
    }

    if (player.queue.length > 0) {
      player.currentTrack = player.queue.shift();
      player.position = 0;
      player.paused = false;
      await player.startPlayback(player.currentTrack);
    } else {
      player.currentTrack = null;
      player.position = 0;

      // Handle Autoplay if enabled
      if (player.autoplay && lavalinkManager.connected) {
        try {
          const autoQuery = 'ytsearch:Top Trending Songs 2026';
          const autoRes = await lavalinkManager.resolve(autoQuery, { id: '0', username: 'Autoplay' });
          if (autoRes.tracks.length > 0) {
            const nextAuto = autoRes.tracks[0];
            player.currentTrack = nextAuto;
            await player.startPlayback(nextAuto);
          }
        } catch (err) {
          console.warn(`[PLAYER ERROR] Autoplay lookup failed in guild ${guildId}:`, err.message);
        }
      }
    }
  }

  async executeAction(guildId, action, value) {
    const player = this.getOrCreatePlayer(guildId);
    switch (action) {
      case 'pauseToggle':
        if (player.paused) {
          await player.resume();
        } else {
          await player.pause();
        }
        break;
      case 'skip':
        await player.skip();
        break;
      case 'previous':
        await player.previous();
        break;
      case 'stop':
        await player.stop();
        break;
      case 'volume':
        if (typeof value === 'number') await player.setVolume(value);
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
