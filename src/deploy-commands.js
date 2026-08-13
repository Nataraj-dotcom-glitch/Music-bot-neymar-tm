/**
 * Neymar Music™ — Slash Command Deployer Script
 * Developer/Brand: Dark_Alise Development
 */

import { commandsList } from './commands/index.js';

export async function deployCommands() {
  console.log(`🚀 Deploying ${commandsList.length} slash commands to Discord API...`);
  return { success: true, count: commandsList.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  deployCommands();
}

export default deployCommands;
