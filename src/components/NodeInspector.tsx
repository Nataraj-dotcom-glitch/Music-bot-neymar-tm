import React from 'react';
import { Server, Database, Cpu, HardDrive, Zap, ShieldCheck } from 'lucide-react';

interface NodeInspectorProps {
  status: any;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ status }) => {
  const node = status?.lavalink?.[0] || {
    name: 'Main Lavalink Node',
    status: '🟢 Online',
    ping: '14ms',
    cpu: '8.4%',
    ram: '520MB',
    players: 1
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Lavalink Node Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white">Lavalink Audio Engine</h3>
          </div>
          <span className="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded">
            {node.status}
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Latency:</span>
            <span className="text-emerald-400 font-bold">{node.ping}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-indigo-400" /> CPU Load:</span>
            <span className="text-indigo-300">{node.cpu}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-purple-400" /> RAM Allocated:</span>
            <span className="text-purple-300">{node.ram}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Active Players:</span>
            <span className="text-slate-200 font-bold">{node.players} Active Stream</span>
          </div>
        </div>
      </div>

      {/* MongoDB Database Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white">MongoDB Database</h3>
          </div>
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
            status?.dbConnected
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
              : 'bg-amber-950 text-amber-300 border-amber-800/50'
          }`}>
            {status?.dbConnected ? '🟢 Connected' : '⚡ Memory Fallback Mode'}
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Database Models:</span>
            <span className="text-slate-200">11 Schemas Loaded</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Free Request Limit:</span>
            <span className="text-amber-400 font-bold">{status?.freeLimit || 3} Songs / Reset</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Owner Slot 1:</span>
            <span className="text-indigo-400 font-bold">1353995912006860871</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Developer Brand:</span>
            <span className="text-emerald-400 font-bold">{status?.developerName || 'Dark_Alise Development'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
