/**
 * Neymar Music™ — guildDelete Event Handler
 * Developer/Brand: Dark_Alise Development
 */

import LoggingService from '../services/LoggingService.js';
import { playerManager } from '../music/PlayerManager.js';

export const name = 'guildDelete';

export async function execute(guild) {
  console.log(`📤 [GUILD_LEAVE] Left guild: ${guild.name} (${guild.id})`);
  LoggingService.log('guild_leave', `Left guild ${guild.name}`, { guildId: guild.id });
  playerManager.executeAction(guild.id, 'stop');
}

export default { name, execute };
