/**
 * Neymar Music™ — guildCreate Event Handler
 * Developer/Brand: Dark_Alise Development
 */

import { Guild } from '../database/models/Guild.js';
import LoggingService from '../services/LoggingService.js';

export const name = 'guildCreate';

export async function execute(guild) {
  console.log(`📥 [GUILD_JOIN] Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members.`);
  LoggingService.log('guild_join', `Joined guild ${guild.name}`, { guildId: guild.id, memberCount: guild.memberCount });

  try {
    const existing = await Guild.findOne({ guildId: guild.id });
    if (!existing) {
      await Guild.create({
        guildId: guild.id,
        autoLeave: true,
        volumeLimit: 100
      });
      console.log(`📦 [DATABASE] Registered database record for guild ${guild.id}`);
    }
  } catch (err) {
    console.warn(`⚠️ [DATABASE] Failed to register guild ${guild.id}:`, err.message);
  }
}

export default { name, execute };
