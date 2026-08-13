import React, { useState } from 'react';
import { Terminal, Play, CheckCircle2, AlertCircle, Code, Shield } from 'lucide-react';

interface CommandRunnerProps {
  commands: any[];
  onExecute: (commandName: string, options: any) => Promise<any>;
}

export const CommandRunner: React.FC<CommandRunnerProps> = ({ commands, onExecute }) => {
  const [selectedCategory, setSelectedCategory] = useState('music');
  const [selectedCommand, setSelectedCommand] = useState('play');
  const [queryInput, setQueryInput] = useState('Despacito x Neymar Highlights');
  const [durationInput, setDurationInput] = useState('30d');
  const [targetUserInput, setTargetUserInput] = useState('1353995912006860871');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'music', name: '🎵 Music (35)', prefix: 'play' },
    { id: 'queue', name: '📜 Queue (13)', prefix: 'queue' },
    { id: 'filters', name: '🎛️ Filters (18)', prefix: 'filter' },
    { id: 'playlist', name: '📚 Playlist (13)', prefix: 'playlist' },
    { id: 'favorites', name: '❤️ Favorites (10)', prefix: 'favorite' },
    { id: 'premium', name: '⭐ Premium (2)', prefix: 'premium' },
    { id: 'admin', name: '⚙️ Admin (16)', prefix: 'setup' },
    { id: 'owner', name: '👑 Owner (34)', prefix: 'owner' },
    { id: 'developer', name: '🛠️ Developer (10)', prefix: 'developer' },
    { id: 'info', name: 'ℹ️ Information (11)', prefix: 'help' }
  ];

  const filteredCommands = commands.filter(cmd => {
    if (selectedCategory === 'music') return !cmd.name.startsWith('queue-') && !cmd.name.startsWith('playlist-') && !cmd.name.startsWith('owner-') && !cmd.name.startsWith('developer-');
    if (selectedCategory === 'owner') return cmd.name.startsWith('owner-');
    if (selectedCategory === 'developer') return cmd.name.startsWith('developer-');
    if (selectedCategory === 'playlist') return cmd.name.startsWith('playlist-');
    if (selectedCategory === 'queue') return cmd.name.startsWith('queue-');
    if (selectedCategory === 'filters') return ['filter', 'filter-off', 'bassboost', 'nightcore', 'vaporwave', '8d', 'karaoke', 'tremolo', 'vibrato', 'rotation', 'distortion', 'lowpass', 'equalizer', 'speed', 'pitch', 'rate', 'clearfilters', 'filterpreset'].includes(cmd.name);
    return true;
  });

  const handleRun = async () => {
    setLoading(true);
    try {
      const optionsPayload: any = {};
      if (selectedCommand === 'play' || selectedCommand === 'search') {
        optionsPayload.query = queryInput;
      } else if (selectedCommand === 'owner-premium-grant') {
        optionsPayload.user = targetUserInput;
        optionsPayload.duration = durationInput;
      } else if (selectedCommand === 'volume') {
        optionsPayload.level = 100;
      }

      const res = await onExecute(selectedCommand, optionsPayload);
      setExecutionResult(res);
    } catch (e: any) {
      setExecutionResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="command-runner-container" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">100+ Discord Slash Commands Tester</h2>
        </div>
        <span className="text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2.5 py-1 rounded-md">
          {commands.length || 160} Commands Loaded
        </span>
      </div>

      {/* Categories Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4 border-b border-slate-800/80 pb-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              const matching = commands.find(c => c.name.includes(cat.prefix)) || commands[0];
              if (matching) setSelectedCommand(matching.name);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white font-semibold shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Select Command Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Select Command
          </label>
          <select
            value={selectedCommand}
            onChange={(e) => setSelectedCommand(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            {filteredCommands.map(cmd => (
              <option key={cmd.name} value={cmd.name}>
                /{cmd.name} — {cmd.description}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Inputs */}
        <div>
          {selectedCommand === 'play' || selectedCommand === 'search' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Song Query / Link
              </label>
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Song title, Spotify or YouTube URL"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          ) : selectedCommand === 'owner-premium-grant' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Target User ID
                </label>
                <input
                  type="text"
                  value={targetUserInput}
                  onChange={(e) => setTargetUserInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Duration
                </label>
                <select
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-mono"
                >
                  <option value="1d">1 Day</option>
                  <option value="3d">3 Days</option>
                  <option value="7d">7 Days</option>
                  <option value="14d">14 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="180d">180 Days</option>
                  <option value="1y">1 Year</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Command Scope
              </label>
              <div className="bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono flex items-center justify-between">
                <span>Executed inside Discord Guild</span>
                <span className="text-emerald-400">✅ Slash Command Ready</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
      >
        <Play className="w-4 h-4 fill-current" />
        {loading ? 'Executing Command...' : `Execute /${selectedCommand}`}
      </button>

      {/* Execution Results Window */}
      {executionResult && (
        <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Response for /{executionResult.commandExecuted}
            </span>
            <span className="text-[10px] text-slate-500">Discord API Interaction Response</span>
          </div>

          <div className="space-y-2 text-slate-300">
            {executionResult.reply?.content && (
              <p className="text-indigo-300 font-sans font-medium">{executionResult.reply.content}</p>
            )}

            {executionResult.reply?.embeds?.[0] && (
              <div className="bg-[#2f3136] border-l-4 border-indigo-500 rounded p-3 text-slate-100 font-sans">
                <div className="font-bold text-indigo-300 mb-1">
                  {executionResult.reply.embeds[0].data?.title || 'Discord Embed'}
                </div>
                <div className="text-xs text-gray-300 whitespace-pre-line">
                  {executionResult.reply.embeds[0].data?.description}
                </div>
              </div>
            )}

            <details className="mt-2 text-[10px] text-slate-500 cursor-pointer">
              <summary className="hover:text-slate-300">View Raw Interaction JSON Payload</summary>
              <pre className="mt-1 p-2 bg-slate-900 rounded border border-slate-800 overflow-x-auto text-indigo-400">
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};
