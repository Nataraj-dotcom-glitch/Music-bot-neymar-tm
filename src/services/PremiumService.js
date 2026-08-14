/**
 * Neymar Music™ — Premium Service
 * Developer/Brand: Dark_Alise Development
 */

import { Premium } from '../database/models/Premium.js';
import { User } from '../database/models/User.js';
import { isOwner } from '../config/owners.js';
import { FREE_REQUEST_LIMIT } from '../config/index.js';

// In-memory premium cache for fast lookups and fallback mode
const premiumMemoryCache = new Map();
const userRequestCounts = new Map();

// Initialize Primary Owner
premiumMemoryCache.set('1353995912006860871', {
  targetId: '1353995912006860871',
  targetType: 'user',
  duration: 'permanent',
  isPermanent: true,
  expirationDate: null,
  active: true,
  grantedBy: 'SYSTEM_PRIMARY_OWNER'
});

export class PremiumService {
  static parseDurationToMs(durationStr) {
    if (!durationStr || durationStr === 'permanent' || durationStr === 'lifetime') {
      return null;
    }
    const match = durationStr.match(/^(\d+)([dhmyw])$/i);
    if (!match) return 30 * 24 * 60 * 60 * 1000; // default 30d

    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'd': return amount * 24 * 60 * 60 * 1000;
      case 'w': return amount * 7 * 24 * 60 * 60 * 1000;
      case 'm': return amount * 30 * 24 * 60 * 60 * 1000;
      case 'y': return amount * 365 * 24 * 60 * 60 * 1000;
      case 'h': return amount * 60 * 60 * 1000;
      default: return 30 * 24 * 60 * 60 * 1000;
    }
  }

  static isUserPremium(userId) {
    if (!userId) return false;
    if (isOwner(userId)) return true;

    const mem = premiumMemoryCache.get(String(userId));
    if (mem && mem.active) {
      if (mem.isPermanent) return true;
      if (mem.expirationDate && new Date(mem.expirationDate) > new Date()) return true;
    }
    return false;
  }

  static isGuildPremium(guildId) {
    if (!guildId) return false;
    const mem = premiumMemoryCache.get(String(guildId));
    if (mem && mem.active) {
      if (mem.isPermanent) return true;
      if (mem.expirationDate && new Date(mem.expirationDate) > new Date()) return true;
    }
    return false;
  }

  static async grantPremium(targetId, duration = '30d', grantedBy = '1353995912006860871', targetType = 'user') {
    const isPermanent = duration === 'permanent' || duration === 'lifetime';
    const ms = this.parseDurationToMs(duration);
    const expirationDate = isPermanent ? null : new Date(Date.now() + ms);

    const record = {
      targetId: String(targetId),
      targetType,
      duration,
      startDate: new Date(),
      expirationDate,
      isPermanent,
      grantedBy: String(grantedBy),
      active: true
    };

    premiumMemoryCache.set(String(targetId), record);

    try {
      await Premium.findOneAndUpdate(
        { targetId: String(targetId) },
        record,
        { upsert: true, new: true }
      );
    } catch (e) {
      // Memory fallback active
    }

    return record;
  }

  static async removePremium(targetId) {
    premiumMemoryCache.delete(String(targetId));
    try {
      await Premium.findOneAndDelete({ targetId: String(targetId) });
    } catch (e) {}
    return true;
  }

  static async extendPremium(targetId, additionalDuration = '30d') {
    const existing = premiumMemoryCache.get(String(targetId));
    if (!existing) {
      return this.grantPremium(targetId, additionalDuration);
    }
    if (existing.isPermanent) return existing;

    const addMs = this.parseDurationToMs(additionalDuration) || (30 * 24 * 60 * 60 * 1000);
    const currentExpiry = existing.expirationDate ? new Date(existing.expirationDate).getTime() : Date.now();
    const newExpiry = new Date(Math.max(Date.now(), currentExpiry) + addMs);

    existing.expirationDate = newExpiry;
    existing.active = true;
    premiumMemoryCache.set(String(targetId), existing);

    try {
      await Premium.findOneAndUpdate(
        { targetId: String(targetId) },
        { expirationDate: newExpiry, active: true }
      );
    } catch (e) {}

    return existing;
  }

  static getPremiumInfo(targetId) {
    if (isOwner(targetId)) {
      return {
        targetId,
        isPermanent: true,
        duration: 'permanent (Owner Privilege)',
        active: true,
        grantedBy: 'SYSTEM_PRIMARY_OWNER'
      };
    }
    return premiumMemoryCache.get(String(targetId)) || null;
  }

  static listAllPremium() {
    return Array.from(premiumMemoryCache.values());
  }

  static checkRequestLimit(userId) {
    if (this.isUserPremium(userId)) {
      return { allowed: true, remaining: Infinity, isPremium: true };
    }
    const current = userRequestCounts.get(String(userId)) || 0;
    const remaining = Math.max(0, FREE_REQUEST_LIMIT - current);
    return {
      allowed: current < FREE_REQUEST_LIMIT,
      remaining,
      used: current,
      limit: FREE_REQUEST_LIMIT,
      isPremium: false
    };
  }

  static incrementRequest(userId) {
    if (this.isUserPremium(userId)) return;
    const current = userRequestCounts.get(String(userId)) || 0;
    userRequestCounts.set(String(userId), current + 1);
  }
}

export default PremiumService;
