/**
 * Neymar Music™ — Guild Settings Service
 * Developer/Brand: Dark_Alise Development
 * Ensures isolated, persistent server settings per guildId.
 */

import { Guild } from '../database/models/Guild.js';

// In-memory cache for fast, synchronous configuration lookups
const guildSettingsCache = new Map();

export class GuildSettingsService {
  static getSettings(guildId) {
    const gId = String(guildId);
    if (!guildSettingsCache.has(gId)) {
      guildSettingsCache.set(gId, {
        guildId: gId,
        musicChannelId: null,
        requestChannelId: null,
        djRoleId: null,
        announceChannelId: null,
        volumeLimit: 100,
        maxQueue: 500,
        autoLeave: true,
        autoResume: false,
        twentyFourSeven: false,
        announce: true,
        language: 'en',
        voiceRegion: 'auto'
      });
    }
    return guildSettingsCache.get(gId);
  }

  static async updateSettings(guildId, updates) {
    const current = this.getSettings(guildId);
    const updated = { ...current, ...updates };
    guildSettingsCache.set(String(guildId), updated);

    try {
      await Guild.findOneAndUpdate(
        { guildId: String(guildId) },
        updated,
        { upsert: true, new: true }
      );
    } catch (e) {}

    return updated;
  }

  static isDJ(member, guildId) {
    const settings = this.getSettings(guildId);
    if (!settings.djRoleId) return true; // If no DJ role configured, allow members
    if (member.permissions?.has?.('ManageGuild') || member.permissions?.has?.('Administrator')) return true;
    return member.roles?.cache?.has?.(settings.djRoleId) || false;
  }
}

export default GuildSettingsService;
