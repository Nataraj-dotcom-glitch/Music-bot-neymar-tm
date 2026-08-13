# 🎵 Neymar Music™ — Advanced Discord Music Bot

Developed by **Dark_Alise Development**

---

## 🌟 Overview

**Neymar Music™** is a feature-packed, production-ready Discord music bot built with **discord.js v14**, **MongoDB/Mongoose**, and **Lavalink**.

### ✨ Highlights
- 🏆 **100+ Working Slash Commands** across 10 categories (Music, Queue, Filters, Playlists, Favorites, Premium, Admin, Owner, Developer, Information).
- 🚫 **Strictly Slash Commands Only** — Zero prefix commands (`!play`, `?play`).
- 🎧 **High-Quality Lavalink Playback** — Multi-node support with automatic failover and reconnect.
- 🎛️ **Advanced Lavalink Filters** — Bassboost, Nightcore, Vaporwave, 8D, Karaoke, Tremolo, Vibrato, Distortion, Lowpass, Equalizer.
- 🎛️ **Interactive Music Panel (`/musicpanel`)** — Discord action buttons (`⏮`, `⏸`, `▶`, `⏭`, `⏹`, `🔀`, `🔁`, `🎵`, `🎛`, `🔊`, `📜`, `❤️`).
- ⭐ **Discord Premium System** — Durations: 1d, 3d, 7d, 14d, 30d, 90d, 180d, 1y, permanent.
- 🎵 **Free Request Limit Enforcement** — Non-premium users get 3 song requests per reset before seeing the "Free Limit Reached" prompt.
- 👑 **Centralized 3-Owner Hierarchy** — Owner Slot 1 fixed to `1353995912006860871`.
- 🛠️ **Centralized 3-Developer Slots** — `Dark_Alise Development` branding.
- 🟢 **Owner Presence Controls** — Configurable Online/Idle/DND/Invisible status and status rotation.

---

## 📂 Project Structure

```
├── config/
│   ├── owners.js
│   └── developers.js
├── src/
│   ├── index.js                     # Main Discord bot entrypoint
│   ├── deploy-commands.js           # Slash command deployment script
│   ├── commands/                    # 100+ Slash Command Definitions
│   │   └── index.js
│   ├── events/                      # Discord.js Event Handlers
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   ├── voiceStateUpdate.js
│   │   ├── guildCreate.js
│   │   └── guildDelete.js
│   ├── music/                       # Lavalink Engine & Source Resolution
│   │   ├── PlayerManager.js
│   │   ├── LavalinkManager.js
│   │   ├── Queue.js
│   │   ├── Filters.js
│   │   └── SourceManager.js
│   ├── database/                    # MongoDB Models & Connection
│   │   ├── connection.js
│   │   └── models/
│   │       ├── User.js
│   │       ├── Guild.js
│   │       ├── Premium.js
│   │       ├── Playlist.js
│   │       ├── Favorite.js
│   │       ├── History.js
│   │       ├── Player.js
│   │       ├── Settings.js
│   │       ├── Blacklist.js
│   │       ├── Whitelist.js
│   │       └── Log.js
│   ├── services/                    # Business Logic Services
│   │   ├── MusicService.js
│   │   ├── PremiumService.js
│   │   ├── PlaylistService.js
│   │   ├── PresenceService.js
│   │   └── LoggingService.js
│   ├── utils/
│   │   ├── embeds.js                # Standardized Discord Embeds
│   │   ├── permissions.js           # Permission Hierarchy Checkers
│   │   ├── formatters.js            # Time & Progress Bar Formatters
│   │   ├── validators.js
│   │   └── cooldowns.js
│   └── config/                      # Central Branding Configuration
│       ├── owners.js
│       ├── developers.js
│       └── index.js
├── server.ts                        # Full-stack Express API & Vite Console
├── package.json
├── .env.example
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Discord Credentials
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
MONGODB_URI=mongodb://localhost:27017/neymar_music

# 3 Owner Slots (Owner 1 fixed to 1353995912006860871)
OWNER_ID_1=1353995912006860871
OWNER_ID_2=
OWNER_ID_3=

# 3 Developer Slots
DEVELOPER_ID_1=
DEVELOPER_ID_2=
DEVELOPER_ID_3=

# Lavalink Settings
LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false

# Support & Links
SUPPORT_SERVER=https://discord.gg/darkalise
PREMIUM_URL=https://neymarmusic.app/premium

# Branding
BOT_NAME=Neymar Music™
DEVELOPER_NAME=Dark_Alise Development
```

---

## 🚀 Quick Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy Slash Commands to Discord
```bash
node src/deploy-commands.js
```

### 3. Start the Application
```bash
npm run dev
```

---

## 👑 Owner Commands Example

- `/owner-premium-grant user:@User duration:30d`
- `/owner-status-set mode:dnd type:playing text:"🎵 /play | Neymar Music™"`
- `/owner-free-limit limit:3`

---

Developed with ❤️ by **Dark_Alise Development**.
