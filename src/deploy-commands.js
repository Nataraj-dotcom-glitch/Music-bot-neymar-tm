/**
 * Neymar Music™ — Slash Command Deployment Script
 * Developer/Brand: Dark_Alise Development
 * Registers commands globally across all Discord servers (or in a test guild if specified).
 */

import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandsList, commandsMap } from './commands/index.js';
import { BOT_NAME, DEVELOPER_NAME } from './config/index.js';

export async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const developmentGuildId = process.env.DEVELOPMENT_GUILD_ID || process.env.GUILD_ID || '';

  const uniqueCommandCount = commandsMap.size;

  console.log(`\n⚡ [DEPLOY] ========================================`);
  console.log(`⚡ [DEPLOY] Initializing Slash Command Deployment...`);
  console.log(`⚡ [DEPLOY] Brand: ${DEVELOPER_NAME} | Bot: ${BOT_NAME}`);
  console.log(`Loaded Slash Commands: ${uniqueCommandCount}`);

  if (!token || token === 'your_bot_token_here') {
    console.warn('⚠️ [DEPLOY] DISCORD_TOKEN is missing or placeholder. Skipping remote Discord REST registration.');
    return { success: false, reason: 'Missing DISCORD_TOKEN', count: uniqueCommandCount };
  }

  if (!clientId || clientId === 'your_client_id_here') {
    console.warn('⚠️ [DEPLOY] CLIENT_ID is missing in .env. Skipping remote Discord REST registration.');
    return { success: false, reason: 'Missing CLIENT_ID', count: uniqueCommandCount };
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    if (developmentGuildId && developmentGuildId.trim() !== '') {
      // Guild specific registration for development/testing
      console.log(`📡 [DEPLOY] Registering ${uniqueCommandCount} commands to Test Guild (${developmentGuildId})...`);
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, developmentGuildId.trim()),
        { body: commandsList }
      );
      console.log(`Registered Guild Slash Commands: ${data.length}`);
      console.log(`✅ [DEPLOY] Successfully deployed ${data.length} slash commands to development guild ${developmentGuildId}!`);
      return { success: true, count: data.length, mode: 'guild' };
    } else {
      // Global application command registration (Default & Production)
      console.log(`📡 [DEPLOY] Registering ${uniqueCommandCount} global commands across all Discord guilds...`);
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandsList }
      );
      console.log(`Registered Global Slash Commands: ${data.length}`);
      console.log(`✅ [DEPLOY] Successfully deployed ${data.length} global slash commands across all Discord guilds!`);
      return { success: true, count: data.length, mode: 'global' };
    }
  } catch (error) {
    console.error('❌ [DEPLOY] Error deploying slash commands:', error);
    return { success: false, error: error.message, count: uniqueCommandCount };
  }
}

// Auto-run if executed directly via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  deployCommands();
}

export default deployCommands;
