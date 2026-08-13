import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Square, Shuffle, Repeat, Music, Sliders, Volume2, Heart, FileText, Sparkles } from 'lucide-react';

interface NowPlayingEmbedProps {
  playerState: any;
  onAction: (action: string, value?: any) => void;
}

export const NowPlayingEmbed: React.FC<NowPlayingEmbedProps> = ({ playerState, onAction }) => {
  const track = playerState?.currentTrack || {
    title: 'Despacito x Neymar Highlights',
    artist: 'Luis Fonsi ft. Neymar Jr',
    duration: 228000,
    url: 'https://youtube.com',
    source: 'youtube',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
    requester: { id: '1353995912006860871', username: 'Dark_Alise' }
  };

  const isPaused = playerState?.paused || false;
  const loopMode = playerState?.loopMode || 'off';
  const volume = playerState?.volume ?? 100;

  return (
    <div id="now-playing-embed-container" className="bg-[#2f3136] rounded-xl p-5 text-white shadow-2xl border border-indigo-500/30 max-w-2xl mx-auto">
      {/* Discord Embed Header */}
      <div className="flex items-center justify-between border-b border-gray-700/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="font-bold text-indigo-400 text-sm tracking-wide">🎧 NEYMAR MUSIC™</span>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">NOW PLAYING</span>
      </div>

      {/* Main Track Info Grid */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <img
          src={track.artwork}
          alt={track.title}
          className="w-28 h-28 rounded-lg object-cover shadow-lg border border-gray-700 flex-shrink-0"
        />

        <div className="flex-1 w-full space-y-2">
          <h3 className="text-lg font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer line-clamp-1">
            {track.title}
          </h3>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <span className="text-gray-400">Artist:</span>{' '}
              <span className="text-gray-200 font-medium">{track.artist}</span>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>{' '}
              <span className="text-gray-200 font-mono">03:48</span>
            </div>
            <div>
              <span className="text-gray-400">Requester:</span>{' '}
              <span className="text-indigo-400 font-medium">@{track.requester?.username || 'User'}</span>
            </div>
            <div>
              <span className="text-gray-400">Queue Position:</span>{' '}
              <span className="text-emerald-400 font-mono">#1</span>
            </div>
            <div>
              <span className="text-gray-400">Loop Mode:</span>{' '}
              <span className="text-amber-300 font-mono uppercase">{loopMode}</span>
            </div>
            <div>
              <span className="text-gray-400">Volume:</span>{' '}
              <span className="text-sky-300 font-mono">{volume}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
              <span>01:15</span>
              <span>03:48</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[35%] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Music Control Panel (/musicpanel) */}
      <div className="mt-6 pt-4 border-t border-gray-700/60 space-y-2">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Discord Interactive Music Control Panel</span>
          <span className="text-indigo-400 text-[10px]">/musicpanel</span>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAction('previous')}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <SkipBack className="w-3.5 h-3.5" /> Previous
          </button>
          <button
            onClick={() => onAction(isPaused ? 'resume' : 'pause')}
            className={`flex items-center justify-center gap-1.5 py-2 text-white text-xs font-semibold rounded-md transition-all active:scale-95 ${
              isPaused ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={() => onAction('skip')}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <SkipForward className="w-3.5 h-3.5" /> Skip
          </button>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAction('stop')}
            className="flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <Square className="w-3.5 h-3.5" /> Stop
          </button>
          <button
            onClick={() => onAction('shuffle')}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5" /> Shuffle
          </button>
          <button
            onClick={() => onAction('loop')}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <Repeat className="w-3.5 h-3.5" /> Loop
          </button>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAction('queue')}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <Music className="w-3.5 h-3.5" /> Queue
          </button>
          <button
            onClick={() => onAction('filters')}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" /> Filters
          </button>
          <button
            onClick={() => onAction('favorite')}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" /> Favorite
          </button>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAction('volume', volume === 100 ? 150 : 100)}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <Volume2 className="w-3.5 h-3.5" /> Volume ({volume}%)
          </button>
          <button
            onClick={() => onAction('lyrics')}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs font-semibold rounded-md transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" /> Lyrics
          </button>
        </div>
      </div>

      {/* Embed Footer Branding */}
      <div className="mt-4 pt-3 border-t border-gray-800 text-center text-[11px] text-gray-400 flex items-center justify-between">
        <span>Neymar Music™</span>
        <span className="font-semibold text-gray-300">Developed by Dark_Alise Development</span>
      </div>
    </div>
  );
};
