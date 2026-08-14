# 🎵 Neymar Music™ — Pure JavaScript Discord Music Bot

Developed by **Dark_Alise Development**

---

## 🌟 Overview

**Neymar Music™** is a lightweight, high-performance, pure JavaScript Discord music bot built with **discord.js v14**, **MongoDB/Mongoose**, and **Lavalink**. It is engineered specifically for low-resource VPS, cloud instances, and mobile hosting environments (Termux, Pterodactyl, Docker).

### ✨ Features & Capabilities
- 🏆 **100+ Discord Slash Commands** across 10 categories (Music, Filters, Queue, Playlist, Favorites, Premium, Admin, Owner, Developer, Information).
- 🚫 **Pure Slash Commands** — Modern Discord interactions with autocomplete, buttons, and select menus.
- 🎧 **High-Quality Lavalink Audio Engine** — Lossless playback with multi-node support, automatic reconnects, and fault tolerance.
- 🎛️ **Audio Filters & Effects** — Bassboost, Nightcore, Vaporwave, 8D Spatial Audio, Karaoke, Tremolo, Vibrato, Equalizer.
- 🎛️ **Interactive Music Panel (`/musicpanel`)** — Rich Discord action buttons (`⏮`, `⏸`, `▶`, `⏭`, `⏹`, `🔀`, `🔁`, `🔉`, `🔊`, `📜`).
- ⭐ **Premium Subscription System** — Supports 1d, 3d, 7d, 14d, 30d, 90d, 180d, 1y, and permanent tiers.
- 🎵 **Free Request Limit Enforcement** — Configurable non-premium user limit with automatic reset tracking.
- 👑 **Centralized 3-Owner Hierarchy** — Fixed Primary Owner Slot 1 (`1353995912006860871`) plus 2 configurable owner slots.
- 🛠️ **Developer Branding & Access** — **Dark_Alise Development** team slots and administrative tools.
- 🟢 **Automated Presence Rotation** — Rotates bot status every 30 seconds across customizable activities.
- 🛡️ **Fault Tolerant & Resilient** — Handles uncaught exceptions, unhandled rejections, voice reconnects, shard drops, and graceful SIGINT/SIGTERM shutdowns.

---

## 📂 Project Structure

```
├── .env.example
├── README.md
├── package.json
├── config/
│   ├── developers.js
│   └── owners.js
└── src/
    ├── index.js                     # Main Discord bot entrypoint
    ├── deploy-commands.js           # Slash command deployment script
    ├── commands/                    # 100+ Slash Command Definitions
    │   └── index.js
    ├── events/                      # Discord.js Event Handlers
    │   ├── ready.js
    │   ├── interactionCreate.js
    │   ├── voiceStateUpdate.js
    │   ├── guildCreate.js
    │   └── guildDelete.js
    ├── music/                       # Lavalink Engine & Player Manager
    │   ├── PlayerManager.js
    │   ├── LavalinkManager.js
    │   ├── Queue.js
    │   ├── Filters.js
    │   └── SourceManager.js
    ├── database/                    # MongoDB Models & Connection
    │   ├── connection.js
    │   └── models/
    │       ├── User.js
    │       ├── Guild.js
    │       ├── Premium.js
    │       ├── Playlist.js
    │       ├── Favorite.js
    │       ├── History.js
    │       ├── Player.js
    │       ├── Settings.js
    │       ├── Blacklist.js
    │       ├── Whitelist.js
    │       └── Log.js
    ├── services/                    # Business Logic Services
    │   ├── MusicService.js
    │   ├── PremiumService.js
    │   ├── PlaylistService.js
    │   ├── PresenceService.js
    │   └── LoggingService.js
    ├── utils/                       # Utilities, Embeds & Cooldowns
    │   ├── embeds.js
    │   ├── permissions.js
    │   ├── formatters.js
    │   ├── validators.js
    │   └── cooldowns.js
    └── config/                      # Central Branding Configuration
        ├── owners.js
        ├── developers.js
        └── index.js
```

---

## 🚀 Quick Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
Create a `.env` file (see `.env.example`):
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id_here
OWNER_ID_1=1353995912006860871
```

### 3. Deploy Slash Commands
```bash
npm run deploy
```

### 4. Start the Bot
```bash
npm start
```

---

Developed with ❤️ by **Dark_Alise Development**.
