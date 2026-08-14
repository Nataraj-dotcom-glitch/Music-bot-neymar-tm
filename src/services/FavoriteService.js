/**
 * Neymar Music™ — Favorites & Music Discovery Service
 * Developer/Brand: Dark_Alise Development
 */

import { Favorite } from '../database/models/Favorite.js';
import { History } from '../database/models/History.js';

const favoritesCache = new Map(); // userId -> Map(trackIdentifier -> Track)
const historyCache = new Map(); // userId -> Array(Track)

export class FavoriteService {
  static addFavorite(userId, track) {
    const uId = String(userId);
    if (!favoritesCache.has(uId)) {
      favoritesCache.set(uId, new Map());
    }
    const userFavs = favoritesCache.get(uId);
    const identifier = track.url || track.title;
    userFavs.set(identifier, track);

    try {
      Favorite.findOneAndUpdate(
        { userId: uId, trackIdentifier: identifier },
        {
          userId: uId,
          trackIdentifier: identifier,
          title: track.title,
          artist: track.artist || 'Unknown Artist',
          source: track.source || 'youtube',
          duration: track.duration || 0,
          artwork: track.artwork || null
        },
        { upsert: true }
      ).catch(() => {});
    } catch (e) {}

    return userFavs.size;
  }

  static removeFavorite(userId, identifierOrTitle) {
    const uId = String(userId);
    const userFavs = favoritesCache.get(uId);
    if (!userFavs) return false;

    let targetKey = null;
    for (const [key, tr] of userFavs.entries()) {
      if (key === identifierOrTitle || tr.title.toLowerCase() === identifierOrTitle.toLowerCase()) {
        targetKey = key;
        break;
      }
    }

    if (targetKey) {
      userFavs.delete(targetKey);
      try {
        Favorite.findOneAndDelete({ userId: uId, trackIdentifier: targetKey }).catch(() => {});
      } catch (e) {}
      return true;
    }
    return false;
  }

  static getFavorites(userId) {
    const uId = String(userId);
    const userFavs = favoritesCache.get(uId);
    if (!userFavs) return [];
    return Array.from(userFavs.values());
  }

  static recordHistory(userId, guildId, track) {
    const uId = String(userId);
    if (!historyCache.has(uId)) {
      historyCache.set(uId, []);
    }
    const uHistory = historyCache.get(uId);
    uHistory.unshift({ ...track, guildId, playedAt: new Date() });
    if (uHistory.length > 50) uHistory.pop();

    try {
      History.create({
        guildId: String(guildId),
        userId: uId,
        title: track.title,
        artist: track.artist || 'Unknown Artist',
        url: track.url || 'https://youtube.com',
        duration: track.duration || 0,
        source: track.source || 'youtube'
      }).catch(() => {});
    } catch (e) {}
  }

  static getHistory(userId, limit = 10) {
    const uId = String(userId);
    const list = historyCache.get(uId) || [];
    return list.slice(0, limit);
  }

  static getRecommendations(currentTrack) {
    const title = currentTrack?.title || 'Pop Music';
    return [
      { title: `${title} (Club Remix)`, artist: 'DJ Neymar Live', duration: 210000, url: 'https://youtube.com', source: 'youtube' },
      { title: `${title} (Acoustic Version)`, artist: 'Acoustic Sessions', duration: 195000, url: 'https://youtube.com', source: 'youtube' },
      { title: `${title} (Slowed + Reverb)`, artist: 'Vapor Lofi Beats', duration: 240000, url: 'https://youtube.com', source: 'youtube' },
      { title: `Trending Brazilian Bass Anthem`, artist: 'Alok & Neymar Sound', duration: 180000, url: 'https://youtube.com', source: 'youtube' }
    ];
  }
}

export default FavoriteService;
