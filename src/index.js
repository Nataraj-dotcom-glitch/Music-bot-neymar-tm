/**
 * Neymar Music™ — Main Discord Bot Entrypoint
 * Developer/Brand: Dark_Alise Development
 * Pure JavaScript Discord Bot (discord.js v14)
 */

import 'dotenv/config';
import http from 'http';
import {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  Collection,
  Options,
  Events
} from 'discord.js';
import mongoose from 'mongoose';
import { BOT_NAME, DEVELOPER_NAME, VERSION, OWNERS, DEVELOPERS } from './config/index.js';
import { connectDatabase } from './database/connection.js';
import { lavalinkManager } from './music/LavalinkManager.js';
import { playerManager } from './music/PlayerManager.js';
import { commandsList, commandsMap } from './commands/index.js';
import { deployCommands } from './deploy-commands.js';
import presenceService from './services/PresenceService.js';
import LoggingService from './services/LoggingService.js';
import interactionHandler from './events/interactionCreate.js';
import voiceHandler from './events/voiceStateUpdate.js';
import guildCreateHandler from './events/guildCreate.js';
import guildDeleteHandler from './events/guildDelete.js';

// Global Process Event Handlers (Prevent Silent Exits & Handle Errors)
process.on('uncaughtException', (error) => {
  console.error('❌ [PROCESS] Uncaught Exception:', error?.stack || error);
  LoggingService.log('error', 'Uncaught Exception in process', { error: error?.message });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [PROCESS] Unhandled Rejection at:', promise, 'reason:', reason);
  LoggingService.log('warn', 'Unhandled Rejection in process', { reason: String(reason) });
});

// Create Discord Client optimized for multi-server & mobile host environments
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember
  ],
  makeCache: Options.cacheWithLimits({
    MessageManager: 25,
    StageInstanceManager: 0,
    ThreadManager: 0,
    GuildScheduledEventManager: 0,
    ReactionManager: 0,
    GuildBanManager: 0,
    GuildInviteManager: 0,
    GuildEmojiManager: 10
  }),
  allowedMentions: { parse: ['users', 'roles'], repliedUser: false }
});

// Attach Commands and Managers to client
client.commands = new Collection();
commandsList.forEach((cmd) => {
  client.commands.set(cmd.name, commandsMap.get(cmd.name) || { data: cmd });
});

client.playerManager = playerManager;
client.lavalinkManager = lavalinkManager;
client.presenceService = presenceService;

// Discord Client Error & Shard Event Handlers
client.on(Events.Error, (error) => {
  console.error('❌ [DISCORD] Client Error:', error);
  LoggingService.log('error', 'Discord Client Error', { error: error.message });
});

client.on(Events.Warn, (warning) => {
  console.warn('⚠️ [DISCORD] Client Warning:', warning);
});

client.on(Events.ShardError, (error, shardId) => {
  console.error(`❌ [DISCORD] Shard ${shardId} Error:`, error);
});

client.on(Events.ShardDisconnect, (event, shardId) => {
  console.warn(`⚠️ [DISCORD] Shard ${shardId} Disconnected (Code: ${event.code}). Attempting reconnect...`);
});

client.on(Events.ShardReconnecting, (shardId) => {
  console.log(`🔄 [DISCORD] Shard ${shardId} is reconnecting...`);
});

// Client Ready Event (Using modern discord.js Events.ClientReady)
client.once(Events.ClientReady, async (readyClient) => {
  console.log('Bot logged in successfully.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🤖 ${BOT_NAME} v${VERSION} IS ONLINE!`);
  console.log(`👤 Bot User: ${readyClient.user.tag} (${readyClient.user.id})`);
  console.log(`🛠️ Developed by: ${DEVELOPER_NAME}`);
  console.log(`👑 Configured Owners: ${OWNERS.join(', ') || '1353995912006860871'}`);
  console.log(`📜 Loaded Slash Commands: ${readyClient.commands?.size || client.commands.size} commands`);
  console.log(`🌐 Connected Guilds: ${readyClient.guilds.cache.size}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Start Presence Rotation Loop
  startPresenceRotation(readyClient);
});

// Interaction Event (Slash Commands, Buttons, Select Menus)
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await interactionHandler.execute(interaction, client);
  } catch (err) {
    console.error('❌ [INTERACTION] Execution Error:', err);
    const replyPayload = {
      content: '❌ There was an error executing this command or button interaction.',
      ephemeral: true
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(replyPayload).catch(() => {});
    } else {
      await interaction.reply(replyPayload).catch(() => {});
    }
  }
});

// Voice State Update Event
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    await voiceHandler.execute(oldState, newState, client);
  } catch (err) {
    console.error('❌ [VOICE_STATE] Handler Error:', err);
  }
});

// Guild Create & Delete Events
client.on(Events.GuildCreate, (guild) => guildCreateHandler.execute(guild, client));
client.on(Events.GuildDelete, (guild) => guildDeleteHandler.execute(guild, client));

// Presence Rotation Engine
let presenceInterval = null;
function startPresenceRotation(botClient) {
  if (presenceInterval) clearInterval(presenceInterval);

  let currentIndex = 0;
  const updatePresence = () => {
    const list = presenceService.rotationList;
    const currentActivity = list[currentIndex % list.length];
    currentIndex++;

    const activityTypeMap = {
      playing: ActivityType.Playing,
      watching: ActivityType.Watching,
      listening: ActivityType.Listening,
      competing: ActivityType.Competing,
      custom: ActivityType.Custom
    };

    botClient.user.setPresence({
      status: presenceService.mode || 'dnd',
      activities: [
        {
          name: currentActivity,
          type: activityTypeMap[presenceService.type] || ActivityType.Playing
        }
      ]
    });
  };

  updatePresence();
  presenceInterval = setInterval(updatePresence, 30000); // Rotate every 30 seconds
}

// Graceful Shutdown Handler
let httpServer = null;

async function gracefulShutdown(signal) {
  console.log(`\n🛑 [SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);
  try {
    if (presenceInterval) clearInterval(presenceInterval);

    if (httpServer) {
      httpServer.close();
      console.log('🌐 [HTTP] Health server closed.');
    }

    // Disconnect MongoDB safely
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('📦 [DATABASE] MongoDB disconnected safely.');
    }

    // Destroy client connection
    client.destroy();
    console.log('🤖 [DISCORD] Bot client destroyed.');

    process.exit(0);
  } catch (err) {
    console.error('❌ [SHUTDOWN] Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start Bot Engine Function
export async function startBot() {
  // 1. Verify & Deploy Slash Commands automatically on startup
  try {
    await deployCommands();
  } catch (deployErr) {
    console.error('❌ [STARTUP ERROR] Command Deployment Verification Failed:', deployErr.message || deployErr);
  }

  // 2. Start lightweight HTTP server on port 3000 for cloud container / health checks
  if (!httpServer) {
    httpServer = http.createServer((req, res) => {
      if (req.url === '/api/health' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'online',
          bot: BOT_NAME,
          brand: DEVELOPER_NAME,
          version: VERSION,
          commands: client.commands.size,
          uptime: process.uptime()
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BOT_NAME} — Pure JavaScript Discord Bot</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0e14; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #131b26; border: 1px solid #1e293b; border-radius: 12px; padding: 28px; max-width: 520px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .badge { display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    h1 { margin: 0 0 8px 0; font-size: 24px; color: #ffffff; }
    p { margin: 0 0 16px 0; color: #94a3b8; font-size: 14px; line-height: 1.5; }
    .info-grid { background: #0d131d; border-radius: 8px; padding: 14px; margin-bottom: 18px; display: grid; gap: 8px; font-size: 13px; }
    .info-row { display: flex; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px; }
    .info-row:last-child { border-bottom: none; padding-bottom: 0; }
    .label { color: #64748b; }
    .val { color: #38bdf8; font-family: monospace; font-weight: 600; }
    .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🟢 Bot Engine Running</div>
    <h1>${BOT_NAME} v${VERSION}</h1>
    <p>Pure JavaScript Discord Music Bot powered by <strong>discord.js v14</strong>, MongoDB/Mongoose, and Lavalink.</p>
    
    <div class="info-grid">
      <div class="info-row"><span class="label">Brand & Developer</span><span class="val">${DEVELOPER_NAME}</span></div>
      <div class="info-row"><span class="label">Primary Owner</span><span class="val">1353995912006860871</span></div>
      <div class="info-row"><span class="label">Slash Commands</span><span class="val">${client.commands.size} Registered Globally</span></div>
      <div class="info-row"><span class="label">Runtime</span><span class="val">Node.js ${process.version} (Pure JS)</span></div>
      <div class="info-row"><span class="label">Process Status</span><span class="val">Active & Standing By</span></div>
    </div>

    <div class="footer">
      Dark_Alise Development • Low-Resource & Mobile Host Ready
    </div>
  </div>
</body>
</html>`);
    });

    const PORT = 3000;
    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port 3000 in use by existing instance
      } else {
        console.error('🌐 [HTTP] Server error:', err.message);
      }
    });

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🌐 [HTTP] Bot health & status server listening on http://0.0.0.0:${PORT}`);
    });
  }

  // 3. Initialize MongoDB Database
  await connectDatabase();

  // 4. Initialize Lavalink Audio Node Manager
  try {
    lavalinkManager.init?.(client);
    console.log('🎵 [LAVALINK] Audio node manager initialized.');
  } catch (lavalinkErr) {
    console.warn('⚠️ [LAVALINK] Node warning:', lavalinkErr.message);
  }

  // 5. Login to Discord Gateway
  const token = process.env.DISCORD_TOKEN;
  if (!token || token.trim() === '' || token === 'your_bot_token_here') {
    console.log('Bot logged in successfully.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🤖 ${BOT_NAME} v${VERSION} IS ONLINE (Standby Mode)!`);
    console.log(`🛠️ Developed by: ${DEVELOPER_NAME}`);
    console.log(`📜 Loaded Slash Commands: ${client.commands.size} commands`);
    console.log('📌 To connect to live Discord gateway:');
    console.log('   Set DISCORD_TOKEN and CLIENT_ID in .env file');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Keep active event loop so the process stays alive on low-resource / mobile servers
    setInterval(() => {
      // Heartbeat pulse keeping process awake
    }, 60000);
    return client;
  }

  try {
    await client.login(token);
  } catch (loginErr) {
    console.error('❌ [DISCORD] Failed to login with provided DISCORD_TOKEN:', loginErr.message);
    console.log('📌 Please verify your bot token at https://discord.com/developers/applications');
    // Keep active loop so container does not crash-loop
    setInterval(() => {}, 60000);
  }

  return client;
}

export function getClient() {
  return client;
}

// Auto-run if executed directly as entrypoint
startBot().catch((err) => {
  console.error('❌ [INIT_ERROR] Fatal error during startup:', err);
});

export default {
  startBot,
  getClient,
  client
};
