import React, { useState } from 'react';
import { STYLE_PRESETS, StylePreset, VOCAL_TAGS } from '../data/presets';
import {
  Sliders,
  Sparkles,
  Radio,
  Mic,
  BookOpen,
  Zap,
  Moon,
  Compass,
  FastForward,
  Edit3,
  Cpu,
  Info
} from 'lucide-react';

interface ReadingStyleOptionsProps {
  selectedPresetId: string | null;
  customStyle: string;
  onSelectPreset: (preset: StylePreset | null) => void;
  onChangeCustomStyle: (style: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onInsertVocalTag: (tag: string) => void;
}

export const ReadingStyleOptions: React.FC<ReadingStyleOptionsProps> = ({
  selectedPresetId,
  customStyle,
  onSelectPreset,
  onChangeCustomStyle,
  selectedModel,
  onSelectModel,
  onInsertVocalTag
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  const getIcon = (name: string) => {
    switch (name) {
      case 'Radio':
        return <Radio className="w-4 h-4" />;
      case 'Mic':
        return <Mic className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Moon':
        return <Moon className="w-4 h-4" />;
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      case 'FastForward':
        return <FastForward className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header and Style Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Options: How the Text is Read
          </h3>
        </div>

        {/* Style Presets vs Custom Directive */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'presets'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Style Presets
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('custom');
              onSelectPreset(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'custom'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Custom Prompt</span>
          </button>
        </div>
      </div>

      {/* Preset Grid Mode */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {STYLE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-950 ring-1 ring-indigo-500'
                      : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-indigo-400'
                        }`}
                      >
                        {getIcon(preset.iconName)}
                      </div>
                      <span className="font-semibold text-xs text-slate-100">
                        {preset.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {preset.description}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-indigo-300 font-mono italic truncate">
                    "{preset.prompt.slice(0, 38)}..."
                  </div>
                </button>
              );
            })}
          </div>

          {selectedPresetId && (
            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-center justify-between">
              <span className="truncate">
                Active Directive:{' '}
                <strong className="text-white">
                  {STYLE_PRESETS.find((p) => p.id === selectedPresetId)?.prompt}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  const current = STYLE_PRESETS.find((p) => p.id === selectedPresetId);
                  if (current) onChangeCustomStyle(current.prompt);
                  setActiveTab('custom');
                  onSelectPreset(null);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline shrink-0 ml-2"
              >
                Customize
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom Directive Input Mode */}
      {activeTab === 'custom' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Describe the voice tone, delivery, emotion, or cadence:</span>
            <span className="text-slate-500">Passed directly to Gemini speechMetadata</span>
          </div>
          <textarea
            value={customStyle}
            onChange={(e) => onChangeCustomStyle(e.target.value)}
            placeholder="e.g. Speak with quiet, mysterious contemplation and slow rhythmic breaths, like a Victorian scholar uncovering a secret..."
            rows={2}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1 self-center">Quick inspirations:</span>
            {[
              'Energetic radio presenter',
              'Subtle whisper, intimate ASMR',
              'Authoritative British documentary',
              'Sarcastic dry humor',
              'Fast excited auctioneer'
            ].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => onChangeCustomStyle(quick)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700/50"
              >
                {quick}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vocal Bursts & Gemini Speech Tags Bar */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Acoustic Vocal Bursts & Pauses:</span>
            <span className="text-[11px] text-slate-500">(Click to insert into your text)</span>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.8-flash-lite-tts">
                Gemini 3.8 Flash Lite TTS (Fastest & Crisp)
              </option>
              <option value="gemini-3.8-flash-tts">
                Gemini 3.8 Flash TTS (Flagship & Expressive)
              </option>
            </select>
          </div>
        </div>

        {/* Vocal Tag Insertion Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {VOCAL_TAGS.map((tagObj) => (
            <button
              key={tagObj.tag}
              type="button"
              onClick={() => onInsertVocalTag(tagObj.tag)}
              title={tagObj.description}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-indigo-900/50 hover:border-indigo-500/60 text-slate-300 hover:text-indigo-200 border border-slate-700/70 font-mono transition-all flex items-center gap-1 active:scale-95"
            >
              <span className="text-indigo-400 font-bold">+</span>
              <span>{tagObj.tag}</span>
              <span className="text-[10px] text-slate-400 font-sans ml-1">({tagObj.label})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
