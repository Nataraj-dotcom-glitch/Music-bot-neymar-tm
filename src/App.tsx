import React, { useState, useEffect } from 'react';
import { Music2, Shield, Terminal, Radio, Server, Sparkles, CheckCircle2, Bot, BookOpen, Layers, RefreshCw } from 'lucide-react';
import { NowPlayingEmbed } from './components/NowPlayingEmbed';
import { CommandRunner } from './components/CommandRunner';
import { StatusManager } from './components/StatusManager';
import { NodeInspector } from './components/NodeInspector';

export default function App() {
  const [status, setStatus] = useState<any>(null);
  const [commands, setCommands] = useState<any[]>([]);
  const [playerState, setPlayerState] = useState<any>({
    guildId: '123456789012345678',
    currentTrack: {
      title: 'Despacito x Neymar Highlights',
      artist: 'Luis Fonsi ft. Neymar Jr',
      duration: 228000,
      url: 'https://youtube.com',
      source: 'youtube',
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      requester: { id: '1353995912006860871', username: 'Dark_Alise' }
    },
    queueSize: 3,
    volume: 100,
    paused: false,
    loopMode: 'off'
  });
  const [activeTab, setActiveTab] = useState<'panel' | 'commands' | 'status' | 'nodes' | 'owners'>('panel');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      // Fallback
    }
  };

  const fetchCommands = async () => {
    try {
      const res = await fetch('/api/commands');
      const data = await res.json();
      if (data.commands) setCommands(data.commands);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchCommands();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteCommand = async (commandName: string, options: any) => {
    const res = await fetch('/api/commands/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commandName, options })
    });
    const data = await res.json();
    if (data.playerState) setPlayerState(data.playerState);
    return data;
  };

  const handlePlayerAction = async (action: string, value?: any) => {
    const res = await fetch('/api/player/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, value })
    });
    const data = await res.json();
    setPlayerState(data);
  };

  const handleUpdatePresence = async (mode: string, type: string, message: string) => {
    await fetch('/api/commands/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commandName: 'owner-status-set',
        options: { mode, type, text: message }
      })
    });
    fetchStatus();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Header Banner */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Neymar Music™</h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full">
                  v2.5.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Developed by <span className="text-slate-200 font-semibold">Dark_Alise Development</span>
              </p>
            </div>
          </div>

          {/* Quick Status Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="bg-slate-800/90 border border-slate-700/70 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Bot:</span>
              <span className={status?.discordConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-medium'}>
                {status?.discordConnected ? '🟢 Connected' : ' Ready (Waiting Token)'}
              </span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/70 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400">Commands:</span>
              <span className="text-indigo-300 font-bold">{commands.length || 160}+ Slash</span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/70 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Lavalink:</span>
              <span className="text-emerald-400 font-bold">Main Node 14ms</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('panel')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'panel'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Music2 className="w-4 h-4" /> Now Playing Embed & Music Panel
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'commands'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" /> 100+ Slash Commands Tester
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'status'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" /> Bot Presence & Rotation Manager
          </button>

          <button
            onClick={() => setActiveTab('nodes')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'nodes'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" /> Lavalink & Database Inspector
          </button>

          <button
            onClick={() => setActiveTab('owners')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'owners'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" /> 3-Owner Hierarchy & Brand
          </button>
        </div>

        {/* Tab View Renderers */}
        {activeTab === 'panel' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">🎵 Neymar Music™ Interactive Discord Embed</p>
                <p className="text-slate-400">
                  This preview renders the exact Discord Now Playing Embed and <code className="text-indigo-300">/musicpanel</code> buttons. Click any button below to test interactions in real-time.
                </p>
              </div>
              <button
                onClick={fetchStatus}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-semibold text-slate-200 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh State
              </button>
            </div>

            <NowPlayingEmbed playerState={playerState} onAction={handlePlayerAction} />
          </div>
        )}

        {activeTab === 'commands' && (
          <CommandRunner commands={commands} onExecute={handleExecuteCommand} />
        )}

        {activeTab === 'status' && (
          <StatusManager presence={status?.presence} onUpdatePresence={handleUpdatePresence} />
        )}

        {activeTab === 'nodes' && (
          <NodeInspector status={status} />
        )}

        {activeTab === 'owners' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Shield className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Centralized 3-Owner & Developer Permission Architecture</h2>
                <p className="text-xs text-slate-400">Strict permission hierarchy for Neymar Music™</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owners Box */}
              <div className="bg-slate-950 border border-amber-900/40 rounded-lg p-4 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  👑 Designated Bot Owners (3 Slots)
                </span>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Owner Slot 1 (Fixed):</span>
                      <p className="text-amber-300 font-bold">1353995912006860871</p>
                    </div>
                    <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded">PRIMARY</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-400">Owner Slot 2 (.env OWNER_ID_2):</span>
                    <p className="text-slate-300 font-bold">{status?.owners?.[1] || 'Configurable in .env'}</p>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-400">Owner Slot 3 (.env OWNER_ID_3):</span>
                    <p className="text-slate-300 font-bold">{status?.owners?.[2] || 'Configurable in .env'}</p>
                  </div>
                </div>
              </div>

              {/* Developers Box */}
              <div className="bg-slate-950 border border-indigo-900/40 rounded-lg p-4 space-y-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  🛠️ Bot Developers & Brand
                </span>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-indigo-950/30 border border-indigo-800/40 rounded">
                    <span className="text-slate-400">Brand / Developer Name:</span>
                    <p className="text-indigo-300 font-bold text-sm">Dark_Alise Development</p>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-400">Free Request Limit:</span>
                    <p className="text-amber-400 font-bold">3 Free Song Requests (Non-Premium)</p>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-400">Permission Hierarchy:</span>
                    <p className="text-slate-300">
                      Level 6 (OWNER) &gt; Level 5 (DEVELOPER) &gt; Level 4 (ADMIN) &gt; Level 3 (DJ) &gt; Level 2 (PREMIUM) &gt; Level 1 (USER)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
