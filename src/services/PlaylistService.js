/**
 * Neymar Music™ — Cloud & Custom Playlist Service
 * Developer/Brand: Dark_Alise Development
 */

import { Playlist } from '../database/models/Playlist.js';

// In-memory fallback map for fast operations: key: `${ownerId}_${name}`
const playlistMemoryStore = new Map();

export class PlaylistService {
  static getKey(ownerId, name) {
    return `${ownerId}_${name.toLowerCase().trim()}`;
  }

  static async createPlaylist(ownerId, name, description = '', isPublic = false) {
    const cleanName = name.trim();
    const key = this.getKey(ownerId, cleanName);

    const doc = {
      ownerId: String(ownerId),
      name: cleanName,
      description,
      isPublic,
      tracks: []
    };

    playlistMemoryStore.set(key, doc);

    try {
      await Playlist.findOneAndUpdate(
        { ownerId: String(ownerId), name: cleanName },
        doc,
        { upsert: true, new: true }
      );
    } catch (e) {}

    return doc;
  }

  static async deletePlaylist(ownerId, name) {
    const key = this.getKey(ownerId, name);
    const existed = playlistMemoryStore.delete(key);

    try {
      await Playlist.findOneAndDelete({ ownerId: String(ownerId), name: name.trim() });
    } catch (e) {}

    return existed;
  }

  static async addTrack(ownerId, name, track) {
    const key = this.getKey(ownerId, name);
    let playlist = playlistMemoryStore.get(key);

    if (!playlist) {
      playlist = await this.createPlaylist(ownerId, name);
    }

    playlist.tracks.push(track);
    playlistMemoryStore.set(key, playlist);

    try {
      await Playlist.findOneAndUpdate(
        { ownerId: String(ownerId), name: playlist.name },
        { tracks: playlist.tracks }
      );
    } catch (e) {}

    return playlist;
  }

  static async removeTrack(ownerId, name, index) {
    const key = this.getKey(ownerId, name);
    const playlist = playlistMemoryStore.get(key);
    if (!playlist || index < 1 || index > playlist.tracks.length) return null;

    const [removed] = playlist.tracks.splice(index - 1, 1);
    playlistMemoryStore.set(key, playlist);

    try {
      await Playlist.findOneAndUpdate(
        { ownerId: String(ownerId), name: playlist.name },
        { tracks: playlist.tracks }
      );
    } catch (e) {}

    return removed;
  }

  static getPlaylist(ownerId, name) {
    const key = this.getKey(ownerId, name);
    return playlistMemoryStore.get(key) || null;
  }

  static listPlaylists(ownerId) {
    const results = [];
    for (const [key, pl] of playlistMemoryStore.entries()) {
      if (pl.ownerId === String(ownerId) || pl.isPublic) {
        results.push(pl);
      }
    }
    return results;
  }

  static async renamePlaylist(ownerId, oldName, newName) {
    const oldKey = this.getKey(ownerId, oldName);
    const playlist = playlistMemoryStore.get(oldKey);
    if (!playlist) return null;

    playlistMemoryStore.delete(oldKey);
    playlist.name = newName.trim();
    const newKey = this.getKey(ownerId, newName);
    playlistMemoryStore.set(newKey, playlist);

    try {
      await Playlist.findOneAndUpdate(
        { ownerId: String(ownerId), name: oldName.trim() },
        { name: newName.trim() }
      );
    } catch (e) {}

    return playlist;
  }

  static async copyPlaylist(sourceOwnerId, sourceName, targetOwnerId, newName) {
    const sourceKey = this.getKey(sourceOwnerId, sourceName);
    const source = playlistMemoryStore.get(sourceKey);
    if (!source) return null;

    return this.createPlaylist(
      targetOwnerId,
      newName || `${source.name}_copy`,
      `Copy of ${source.name}`,
      false
    ).then(newPl => {
      newPl.tracks = [...source.tracks];
      playlistMemoryStore.set(this.getKey(targetOwnerId, newPl.name), newPl);
      return newPl;
    });
  }

  static exportPlaylist(ownerId, name) {
    const playlist = this.getPlaylist(ownerId, name);
    if (!playlist) return null;
    return JSON.stringify(playlist, null, 2);
  }

  static async importPlaylist(ownerId, name, jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const playlist = await this.createPlaylist(ownerId, name, data.description || 'Imported playlist');
      playlist.tracks = Array.isArray(data.tracks) ? data.tracks : [];
      playlistMemoryStore.set(this.getKey(ownerId, name), playlist);
      return playlist;
    } catch (e) {
      throw new Error('Invalid JSON format for playlist import.');
    }
  }
}

export default PlaylistService;
