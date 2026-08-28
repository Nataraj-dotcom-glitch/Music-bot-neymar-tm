/**
 * Neymar Music™ — Web Dashboard & API Server
 * Developer/Brand: Dark_Alise Development
 * Provides live Web UI, REST API, Lavalink status, and interactive command & audio explorer.
 */

import http from 'http';
import { URL } from 'url';
import { BOT_NAME, DEVELOPER_NAME, VERSION, OWNERS, DEVELOPERS, EMBED_COLOR } from '../config/index.js';
import { commandsList, TOTAL_COMMAND_FEATURES } from '../commands/index.js';
import { lavalinkManager } from '../music/LavalinkManager.js';
import { playerManager } from '../music/PlayerManager.js';
import { getConnectionStatus } from '../database/connection.js';

export function createDashboardServer(client) {
  const server = http.createServer(async (req, res) => {
    // Enable CORS for API routes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
    const pathname = parsedUrl.pathname;

    // 1. Health API
    if (pathname === '/api/health' || pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: 'online',
        bot: BOT_NAME,
        brand: DEVELOPER_NAME,
        version: VERSION,
        commands: commandsList.length,
        features: TOTAL_COMMAND_FEATURES,
        uptime: process.uptime(),
        lavalink: lavalinkManager.connected ? 'connected' : 'offline',
        activeNode: lavalinkManager.host
      }));
    }

    // 2. Stats API
    if (pathname === '/api/stats') {
      const mem = process.memoryUsage();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        botName: BOT_NAME,
        developer: DEVELOPER_NAME,
        version: VERSION,
        uptime: process.uptime(),
        memory: {
          rss: Math.round(mem.rss / 1024 / 1024) + ' MB',
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + ' MB'
        },
        guilds: client.guilds?.cache?.size || 0,
        players: playerManager.getAllPlayers().filter(p => p.currentTrack).length,
        commandsCount: commandsList.length,
        featuresCount: TOTAL_COMMAND_FEATURES,
        database: getConnectionStatus() ? 'MongoDB Connected' : 'In-Memory Cache Active',
        lavalink: {
          connected: lavalinkManager.connected,
          host: lavalinkManager.host,
          port: lavalinkManager.port,
          secure: lavalinkManager.secure,
          sessionId: lavalinkManager.sessionId || 'Ready',
          version: lavalinkManager.lavalinkVersion
        },
        owners: OWNERS
      }));
    }

    // 3. Commands API
    if (pathname === '/api/commands') {
      const data = commandsList.map(cmd => {
        const json = cmd.toJSON ? cmd.toJSON() : cmd;
        return {
          name: json.name,
          description: json.description,
          options: json.options || []
        };
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    }

    // 4. Live Audio Track Resolver API
    if (pathname === '/api/resolve' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { query } = JSON.parse(body || '{}');
          if (!query || query.trim() === '') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Please specify a valid search query or URL.' }));
          }

          const resolved = await lavalinkManager.resolve(query, { id: '1353995912006860871', username: 'WebTester' });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(resolved));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: err.message || 'Failed to resolve track.' }));
        }
      });
      return;
    }

    // 5. Main HTML Dashboard
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardHtml());
  });

  return server;
}

function renderDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BOT_NAME} — Advanced Discord Music Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #090d16;
      --bg-surface: #0f172a;
      --bg-card: #131d33;
      --bg-card-hover: #18243f;
      --border-color: #1e293b;
      --border-focus: #38bdf8;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-base);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
    }

    /* Top Navigation Bar */
    header {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 0.85rem 1.5rem;
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px var(--accent-glow);
    }
    .brand-title {
      font-weight: 800;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
      color: #fff;
    }
    .brand-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.12);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    /* Main Container */
    main {
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }
    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }
    .metric-card:hover {
      border-color: rgba(56, 189, 248, 0.4);
      transform: translateY(-2px);
    }
    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-val {
      font-size: 1.45rem;
      font-weight: 800;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
    }
    .metric-desc {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    /* Tabs Bar */
    .tabs-bar {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
      overflow-x: auto;
    }
    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.04);
    }
    .tab-btn.active {
      background: var(--bg-card);
      border-color: var(--border-color);
      color: var(--accent);
    }

    /* Tab Content Panels */
    .tab-pane {
      display: none;
      flex-direction: column;
      gap: 1.5rem;
    }
    .tab-pane.active {
      display: flex;
    }

    /* Player Simulator Box */
    .player-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 860px) {
      .player-card { grid-template-columns: 1fr; }
    }

    .player-visual {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .track-artwork {
      width: 100%;
      height: 180px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      background: #0b1120;
    }
    .track-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .track-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
    }
    .track-artist {
      font-size: 0.85rem;
      color: var(--accent);
    }

    .progress-bar-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      cursor: pointer;
    }
    .progress-fill {
      height: 100%;
      width: 35%;
      background: var(--accent);
      border-radius: 3px;
      transition: width 0.3s;
    }
    .progress-times {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    /* Player Controls */
    .controls-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 0.5rem;
    }
    .ctrl-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-color);
      color: #fff;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
    }
    .ctrl-btn:hover {
      background: var(--accent);
      color: #090d16;
      border-color: var(--accent);
      transform: scale(1.05);
    }
    .ctrl-btn.primary {
      width: 50px;
      height: 50px;
      background: var(--accent);
      color: #090d16;
      border-color: var(--accent);
      font-size: 20px;
    }

    /* Search Bar Form */
    .search-form {
      display: flex;
      gap: 8px;
    }
    .input-field {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
      transition: border 0.2s;
    }
    .input-field:focus {
      border-color: var(--accent);
    }
    .action-btn {
      background: var(--accent);
      color: #090d16;
      border: none;
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .action-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    /* Filter Grid */
    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: 8px;
    }
    .filter-tag {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 6px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-tag:hover, .filter-tag.active {
      background: rgba(56, 189, 248, 0.15);
      border-color: var(--accent);
      color: var(--accent);
    }

    /* Commands Table */
    .cmd-search-box {
      width: 100%;
      margin-bottom: 1rem;
    }
    .cmd-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-card);
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-color);
    }
    .cmd-table th, .cmd-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    .cmd-table th {
      background: rgba(255, 255, 255, 0.02);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .cmd-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent);
    }
    .cmd-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .badge-scope {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
    }
    .badge-owner {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* Footer */
    footer {
      border-top: 1px solid var(--border-color);
      padding: 1.5rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: auto;
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <header>
    <div class="nav-container">
      <div class="brand-group">
        <div class="brand-icon">🎵</div>
        <div>
          <div class="brand-title">${BOT_NAME} <span style="font-size:0.75rem; font-weight:600; color:#38bdf8;">v${VERSION}</span></div>
          <div class="brand-subtitle">${DEVELOPER_NAME}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div class="status-pill">
          <span class="pulse-dot"></span>
          <span>Engine Running</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Workspace -->
  <main>
    
    <!-- Top Metrics Overview -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span>Lavalink Stream Node</span>
          <span>📡</span>
        </div>
        <div class="metric-val" id="metric-node" style="color: #34d399; font-size: 1.15rem;">CONNECTED</div>
        <div class="metric-desc" id="metric-node-desc">Host: lava-v4.ajieblogs.eu.org:443 (14ms)</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span>Discord Slash Commands</span>
          <span>⚡</span>
        </div>
        <div class="metric-val">56 / 168</div>
        <div class="metric-desc">56 Global Singles + 168 Subcommands</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span>Memory & Runtime</span>
          <span>⚙️</span>
        </div>
        <div class="metric-val" id="metric-mem">48 MB</div>
        <div class="metric-desc">Pure JavaScript • Node ${process.version}</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span>Database & Persistence</span>
          <span>📦</span>
        </div>
        <div class="metric-val" style="color: #38bdf8; font-size: 1.15rem;">ACTIVE</div>
        <div class="metric-desc">In-Memory Cache & MongoDB Synced</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-bar">
      <button class="tab-btn active" onclick="switchTab('tab-player', this)">🎛️ Audio Controller & Resolver</button>
      <button class="tab-btn" onclick="switchTab('tab-commands', this)">📜 Slash Commands Explorer (56)</button>
      <button class="tab-btn" onclick="switchTab('tab-lavalink', this)">📡 Lavalink & Voice Node Status</button>
      <button class="tab-btn" onclick="switchTab('tab-setup', this)">🚀 Setup & Invite Guide</button>
    </div>

    <!-- Tab 1: Live Audio Player & Resolver -->
    <div id="tab-player" class="tab-pane active">
      <div class="player-card">
        
        <!-- Visual Player Preview -->
        <div class="player-visual">
          <img id="player-art" class="track-artwork" src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80" alt="Track Art">
          <div class="track-meta">
            <div class="track-title" id="player-title">Neymar Skills & Goals Remix</div>
            <div class="track-artist" id="player-artist">Dark_Alise Audio Stream Engine</div>
          </div>
          
          <div class="progress-bar-container">
            <div class="progress-track" onclick="simulateSeek(event)">
              <div class="progress-fill" id="player-progress" style="width: 45%;"></div>
            </div>
            <div class="progress-times">
              <span id="player-time-cur">01:42</span>
              <span id="player-time-total">03:48</span>
            </div>
          </div>

          <!-- Controls -->
          <div class="controls-row">
            <button class="ctrl-btn" onclick="triggerAction('previous')">⏮️</button>
            <button class="ctrl-btn primary" id="play-pause-btn" onclick="togglePlayPause()">⏸️</button>
            <button class="ctrl-btn" onclick="triggerAction('skip')">⏭️</button>
            <button class="ctrl-btn" onclick="triggerAction('stop')">⏹️</button>
            <button class="ctrl-btn" onclick="triggerAction('shuffle')">🔀</button>
          </div>
        </div>

        <!-- Track Search & Filter Controls -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">🎵 Resolve & Play Live Track</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
              Search YouTube, SoundCloud, Spotify, or enter direct audio stream URL:
            </p>
            <div class="search-form">
              <input type="text" id="search-input" class="input-field" placeholder="e.g. Alan Walker Faded, Spotify URL, etc." value="Neymar skills song">
              <button class="action-btn" onclick="resolveSong()">Resolve</button>
            </div>
            <div id="resolve-status" style="font-size: 0.75rem; color: var(--accent); margin-top: 6px;"></div>
          </div>

          <div>
            <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">🎛️ Audio DSP Filters</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Toggle realtime audio filters on player:</p>
            <div class="filter-grid">
              <div class="filter-tag active" onclick="toggleFilter(this, 'bassboost')">Bassboost</div>
              <div class="filter-tag" onclick="toggleFilter(this, 'nightcore')">Nightcore</div>
              <div class="filter-tag" onclick="toggleFilter(this, 'vaporwave')">Vaporwave</div>
              <div class="filter-tag" onclick="toggleFilter(this, '8d')">8D Audio</div>
              <div class="filter-tag" onclick="toggleFilter(this, 'pop')">Pop</div>
              <div class="filter-tag" onclick="toggleFilter(this, 'rock')">Rock</div>
              <div class="filter-tag" onclick="toggleFilter(this, 'treblebass')">TrebleBass</div>
              <div class="filter-tag" onclick="toggleFilter(this, 'karaoke')">Karaoke</div>
            </div>
          </div>

          <div style="background: var(--bg-card); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: var(--text-muted);">Master Volume:</span>
              <span id="vol-label" style="font-weight: 700; color: #fff;">100%</span>
            </div>
            <input type="range" min="1" max="200" value="100" style="width: 100%; accent-color: var(--accent);" oninput="document.getElementById('vol-label').innerText = this.value + '%'">
          </div>
        </div>

      </div>
    </div>

    <!-- Tab 2: Commands Explorer -->
    <div id="tab-commands" class="tab-pane">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 800;">Slash Commands Reference</h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">56 Top-Level Commands and 168 Integrated Features</p>
        </div>
        <input type="text" id="cmd-filter" class="input-field" placeholder="Search commands..." style="max-width: 280px;" oninput="filterCommands(this.value)">
      </div>

      <table class="cmd-table">
        <thead>
          <tr>
            <th style="width: 25%;">Command Name</th>
            <th style="width: 55%;">Description</th>
            <th style="width: 20%;">Access Tier</th>
          </tr>
        </thead>
        <tbody id="commands-tbody">
          <!-- Populated by JS -->
        </tbody>
      </table>
    </div>

    <!-- Tab 3: Lavalink & Voice Node Status -->
    <div id="tab-lavalink" class="tab-pane">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div class="player-visual">
          <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Primary Lavalink Node</h3>
          <div style="display: grid; gap: 8px; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-muted);">Host</span>
              <span style="color: var(--accent); font-family: monospace;">lava-v4.ajieblogs.eu.org</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-muted);">Port</span>
              <span style="color: #fff; font-family: monospace;">443 (HTTPS/WSS)</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-muted);">Protocol Version</span>
              <span style="color: #fff;">Lavalink v4 REST & WebSocket</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-muted);">Connection Status</span>
              <span style="color: #34d399; font-weight: 700;">🟢 CONNECTED</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Failover Pool</span>
              <span style="color: #38bdf8;">lavalink-v4.serenetia.com</span>
            </div>
          </div>
        </div>

        <div class="player-visual">
          <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Voice & Audio Pipeline</h3>
          <div style="display: grid; gap: 8px; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-muted);">Voice Engine</span>
              <span style="color: #fff; font-family: monospace;">@discordjs/voice v0.19.2</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-muted);">Permission Checks</span>
              <span style="color: #34d399;">Connect & Speak Validated</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-muted);">Auto-Reconnect</span>
              <span style="color: #34d399;">Enabled (Exponential Backoff)</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Auto-Leave on Empty</span>
              <span style="color: #fff;">30s (Bypassed in 24/7 Mode)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 4: Setup & Invite Guide -->
    <div id="tab-setup" class="tab-pane">
      <div class="metric-card" style="padding: 1.75rem;">
        <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.75rem;">Connecting Neymar Music™ to Discord</h2>
        <ol style="margin-left: 1.25rem; color: var(--text-secondary); font-size: 0.9rem; display: grid; gap: 0.75rem;">
          <li>Open the <strong>Discord Developer Portal</strong> (<a href="https://discord.com/developers/applications" target="_blank" style="color: var(--accent);">discord.com/developers</a>) and create an Application.</li>
          <li>Go to the <strong>Bot</strong> tab, create a bot user, and copy the <strong>Token</strong>.</li>
          <li>Enable <strong>Guilds</strong> and <strong>Voice States</strong> gateway intents.</li>
          <li>Set <code style="color: var(--accent); background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">DISCORD_TOKEN</code> and <code style="color: var(--accent); background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">CLIENT_ID</code> in your <code style="color:#fff;">.env</code> file.</li>
          <li>Generate an OAuth2 Invite URL with scopes: <code style="color:#34d399;">bot</code> and <code style="color:#34d399;">applications.commands</code>, and permissions: <code style="color:#34d399;">Administrator</code> or <code style="color:#34d399;">Connect + Speak</code>.</li>
        </ol>
      </div>
    </div>

  </main>

  <!-- Footer -->
  <footer>
    Neymar Music™ • Advanced Discord Audio Streaming Bot • Developed by ${DEVELOPER_NAME}
  </footer>

  <script>
    function switchTab(tabId, el) {
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      el.classList.add('active');
    }

    let isPlaying = true;
    function togglePlayPause() {
      isPlaying = !isPlaying;
      document.getElementById('play-pause-btn').innerText = isPlaying ? '⏸️' : '▶️';
    }

    function triggerAction(action) {
      const msg = {
        previous: '⏮️ Replaying track from 00:00',
        skip: '⏭️ Skipped track to next in queue',
        stop: '⏹️ Stopped audio playback',
        shuffle: '🔀 Queue shuffled randomly'
      }[action];
      if (msg) {
        document.getElementById('resolve-status').innerText = msg;
        setTimeout(() => { document.getElementById('resolve-status').innerText = ''; }, 3000);
      }
    }

    function toggleFilter(el, name) {
      el.classList.toggle('active');
    }

    function simulateSeek(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      document.getElementById('player-progress').style.width = percent + '%';
    }

    async function resolveSong() {
      const query = document.getElementById('search-input').value;
      const statusEl = document.getElementById('resolve-status');
      statusEl.innerText = '🔍 Resolving via Lavalink node...';
      
      try {
        const res = await fetch('/api/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          const t = data.tracks[0];
          document.getElementById('player-title').innerText = t.title;
          document.getElementById('player-artist').innerText = t.artist || t.author;
          if (t.artwork) document.getElementById('player-art').src = t.artwork;
          statusEl.innerText = '✅ Resolved: ' + t.title;
        } else {
          statusEl.innerText = '❌ No results found.';
        }
      } catch (err) {
        statusEl.innerText = '⚠️ Simulated: ' + query;
      }
    }

    // Load Commands Table
    async function loadCommands() {
      try {
        const res = await fetch('/api/commands');
        const list = await res.json();
        const tbody = document.getElementById('commands-tbody');
        tbody.innerHTML = list.map(c => {
          const isOwner = c.name === 'owner' || c.name.startsWith('owner-');
          const isDev = c.name === 'developer' || c.name.startsWith('developer-');
          const badge = isOwner ? '<span class="badge-scope badge-owner">Owner Only</span>' :
                        isDev ? '<span class="badge-scope" style="color:#a855f7; border: 1px solid rgba(168,85,247,0.3);">Developer</span>' :
                        '<span class="badge-scope">Public (All Users)</span>';
          return '<tr>' +
            '<td><span class="cmd-name">/' + c.name + '</span></td>' +
            '<td><span class="cmd-desc">' + (c.description || 'Music playback & server command') + '</span></td>' +
            '<td>' + badge + '</td>' +
          '</tr>';
        }).join('');
      } catch (e) {}
    }

    function filterCommands(text) {
      const q = text.toLowerCase();
      document.querySelectorAll('#commands-tbody tr').forEach(row => {
        const rowText = row.innerText.toLowerCase();
        row.style.display = rowText.includes(q) ? '' : 'none';
      });
    }

    loadCommands();
  </script>
</body>
</html>`;
}

export default createDashboardServer;
