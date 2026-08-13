import React, { useState } from 'react';
import { Shield, Sparkles, RefreshCw, Radio, Check } from 'lucide-react';

interface StatusManagerProps {
  presence: any;
  onUpdatePresence: (mode: string, type: string, message: string) => void;
}

export const StatusManager: React.FC<StatusManagerProps> = ({ presence, onUpdatePresence }) => {
  const [mode, setMode] = useState(presence?.mode || 'online');
  const [type, setType] = useState(presence?.type || 'playing');
  const [text, setText] = useState(presence?.message || '🎵 /play | Neymar Music™');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePresence(mode, type, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Owner Bot Presence & Status Manager</h2>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
          Persistent Config
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Status Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="online">🟢 Online</option>
              <option value="idle">🌙 Idle</option>
              <option value="dnd">⛔ Do Not Disturb</option>
              <option value="invisible">⚫ Invisible</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Activity Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="playing">🎮 Playing</option>
              <option value="watching">👀 Watching</option>
              <option value="listening">🎧 Listening</option>
              <option value="competing">🏆 Competing</option>
              <option value="custom">✨ Custom</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Status Message
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="🎵 /play | Neymar Music™"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Rotation List Preview */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Active Status Rotation Sequence (30s interval)
          </span>
          <div className="space-y-1 font-mono text-xs text-indigo-300">
            {presence?.rotationList?.map((msg: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-600 text-[10px]">#{idx + 1}</span>
                <span>{msg}</span>
              </div>
            )) || (
              <>
                <div>1. 🎵 /play | Neymar Music™</div>
                <div>2. 👀 100+ Slash Commands</div>
                <div>3. 🎧 Premium Music</div>
                <div>4. 🏆 Developed by Dark_Alise Development</div>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <RefreshCw className="w-4 h-4" />}
          {saved ? 'Presence Updated Successfully!' : 'Update Discord Presence (/owner status-set)'}
        </button>
      </form>
    </div>
  );
};
