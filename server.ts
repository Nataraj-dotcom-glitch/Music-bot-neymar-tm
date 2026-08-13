import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Import backend modules via require
import config from './src/config/index.js';
import { getConnectionStatus, connectDatabase } from './src/database/connection.js';
import LavalinkManager from './src/music/LavalinkManager.js';
import PlayerManager from './src/music/PlayerManager.js';
import PresenceService from './src/services/PresenceService.js';
import PremiumService from './src/services/PremiumService.js';
import MusicService from './src/services/MusicService.js';
import { commandsMap } from './src/commands/index.js';
import { startBot, getClient } from './src/index.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Attempt database connection on server start
connectDatabase().catch(() => {});

// Attempt bot login if token exists
startBot();

// API ROUTES
app.get('/api/status', async (req, res) => {
  const client = getClient();
  const dbConnected = getConnectionStatus();
  const lavalinkStats = LavalinkManager.getStats();

  res.json({
    botName: config.BOT_NAME,
    developerName: config.DEVELOPER_NAME,
    version: config.VERSION,
    discordConnected: Boolean(client && client.user),
    botUser: client?.user ? { tag: client.user.tag, id: client.user.id } : null,
    dbConnected,
    owners: config.OWNERS,
    developers: config.DEVELOPERS,
    totalCommands: commandsMap.size,
    freeLimit: config.FREE_REQUEST_LIMIT,
    lavalink: lavalinkStats,
    presence: {
      mode: PresenceService.mode,
      type: PresenceService.type,
      message: PresenceService.message,
      rotationEnabled: PresenceService.rotationEnabled,
      rotationList: PresenceService.rotationList
    }
  });
});

app.get('/api/commands', (req, res) => {
  const list = Array.from(commandsMap.values()).map(c => ({
    name: c.data.name,
    description: c.data.description,
    options: c.data.options || []
  }));
  res.json({ count: list.length, commands: list });
});

app.post('/api/commands/execute', async (req, res) => {
  const { commandName, options = {}, userId = config.OWNERS[0], guildId = '123456789012345678' } = req.body;

  const command = commandsMap.get(commandName);
  if (!command) {
    return res.status(404).json({ error: `Command /${commandName} not found` });
  }

  // Create mock Discord interaction
  let replyData: any = { content: null, embeds: [], components: [], ephemeral: false };

  const mockInteraction = {
    commandName,
    guildId,
    user: { id: userId, username: 'SimulatorUser', tag: 'SimulatorUser#0001' },
    member: { permissions: { has: () => true }, roles: { cache: new Map() } },
    options: {
      getString: (key: string) => options[key] || 'Neymar Hits',
      getInteger: (key: string) => parseInt(options[key] || '100', 10),
      getUser: (key: string) => ({ id: options[key] || '999888777666555444', username: 'TargetUser' }),
      getBoolean: (key: string) => options[key] === 'true'
    },
    reply: async (payload: any) => {
      replyData = typeof payload === 'string' ? { content: payload } : payload;
      return payload;
    },
    followUp: async (payload: any) => {
      replyData = typeof payload === 'string' ? { content: payload } : payload;
      return payload;
    },
    replied: false,
    deferred: false
  };

  try {
    await command.execute(mockInteraction);
    const player = PlayerManager.getPlayer(guildId);

    res.json({
      success: true,
      commandExecuted: commandName,
      reply: replyData,
      playerState: {
        guildId,
        currentTrack: player.currentTrack,
        queueSize: player.queue.size,
        volume: player.volume,
        paused: player.paused,
        loopMode: player.queue.loopMode,
        activeFilters: player.activeFilters
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Execution error' });
  }
});

app.post('/api/player/action', async (req, res) => {
  const { guildId = '123456789012345678', action, value } = req.body;
  const player = PlayerManager.getPlayer(guildId);

  switch (action) {
    case 'pause':
      player.pause();
      break;
    case 'resume':
      player.resume();
      break;
    case 'skip':
      player.play();
      break;
    case 'stop':
      player.stop();
      break;
    case 'shuffle':
      player.queue.shuffle();
      break;
    case 'loop':
      player.queue.loopMode = player.queue.loopMode === 'off' ? 'track' : player.queue.loopMode === 'track' ? 'queue' : 'off';
      break;
    case 'volume':
      player.setVolume(value || 100);
      break;
  }

  res.json({
    guildId,
    currentTrack: player.currentTrack,
    queueSize: player.queue.size,
    volume: player.volume,
    paused: player.paused,
    loopMode: player.queue.loopMode
  });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Neymar Music™ Console Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
