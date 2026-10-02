import React from 'react';
import { VOICES, VoiceOption } from '../data/presets';
import { Volume2, User, Sparkles } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>Gemini Voice Persona</span>
        </label>
        <span className="text-xs text-slate-400">
          5 Natural Speech Models
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVoice(v.id)}
              className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-900/20 ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors">
                    {v.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      v.gender === 'Female'
                        ? 'bg-pink-950/60 text-pink-300 border-pink-800/60'
                        : v.gender === 'Male'
                        ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    }`}
                  >
                    {v.gender}
                  </span>
                </div>

                <div className="text-xs font-medium text-indigo-300 mb-1">
                  {v.timbre}
                </div>

                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {v.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-800/60">
                {v.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 flex items-center justify-center w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
