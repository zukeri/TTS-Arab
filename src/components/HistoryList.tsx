import React from 'react';
import { GeneratedAudioData } from './AudioPlayer';
import { History, Play, Download, Trash2, Clock, Check } from 'lucide-react';
import { formatTime, formatBytes, downloadBlob, base64ToBlob } from '../utils/audio';

interface HistoryListProps {
  history: GeneratedAudioData[];
  currentAudioId?: string;
  onSelectAudio: (item: GeneratedAudioData) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  currentAudioId,
  onSelectAudio,
  onClearHistory,
  onDeleteItem,
}) => {
  const handleDownloadMp3 = (item: GeneratedAudioData, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = base64ToBlob(item.mp3Base64, 'audio/mp3');
      const filename = `gemini-tts-${item.metadata.voice.toLowerCase()}-${item.id.slice(0, 6)}.mp3`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Session History & Export Library ({history.length})
          </h3>
        </div>
        <button
          onClick={onClearHistory}
          className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto pr-1">
        {history.map((item) => {
          const isSelected = item.id === currentAudioId;
          const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelectAudio(item)}
              className={`py-3 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                isSelected
                  ? 'bg-indigo-950/40 border border-indigo-500/50'
                  : 'hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {item.metadata.voice}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 truncate max-w-[140px]">
                      {item.metadata.style}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {dateStr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">
                    "{item.text}"
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {item.metadata.duration}s • {formatBytes(item.metadata.mp3SizeBytes)} • {item.metadata.wordCount} words
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDownloadMp3(item, e)}
                  title="Download MP3"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all border border-slate-700/60"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  title="Delete take"
                  className="p-2 rounded-lg hover:bg-rose-950 hover:text-rose-300 text-slate-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
