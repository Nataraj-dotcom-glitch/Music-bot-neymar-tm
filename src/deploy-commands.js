/**
 * Neymar Music™ — Slash Command Deployment Script
 * Developer/Brand: Dark_Alise Development
 */

import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandsList } from './commands/index.js';
import { BOT_NAME, DEVELOPER_NAME } from './config/index.js';

export async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID; // Optional guild-specific deployment for instant testing

  console.log(`🚀 [DEPLOY] Preparing deployment for ${BOT_NAME} (${DEVELOPER_NAME})...`);
  console.log(`📜 Loaded ${commandsList.length} slash commands.`);

  if (!token || token === 'your_bot_token_here') {
    console.warn('⚠️ [DEPLOY] DISCORD_TOKEN is missing or set to placeholder in .env. Skipping remote API push.');
    return { success: false, reason: 'Missing DISCORD_TOKEN' };
  }

  if (!clientId || clientId === 'your_client_id_here') {
    console.warn('⚠️ [DEPLOY] CLIENT_ID is missing in .env. Skipping remote API push.');
    return { success: false, reason: 'Missing CLIENT_ID' };
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`📡 [DEPLOY] Registering ${commandsList.length} slash commands to Discord API...`);

    let data;
    if (guildId) {
      // Guild specific (instant update)
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandsList }
      );
      console.log(`✅ [DEPLOY] Successfully deployed ${data.length} slash commands to test guild ${guildId}!`);
    } else {
      // Global application commands
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandsList }
      );
      console.log(`✅ [DEPLOY] Successfully deployed ${data.length} global slash commands across all Discord guilds!`);
    }

    return { success: true, count: data.length };
  } catch (error) {
    console.error('❌ [DEPLOY] Error deploying slash commands:', error);
    return { success: false, error: error.message };
  }
}

// Auto-run if executed directly via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  deployCommands();
}

export default deployCommands;
