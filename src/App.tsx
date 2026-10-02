/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Sparkles,
  Play,
  RotateCcw,
  Clipboard,
  Trash2,
  Download,
  AlertCircle,
  Clock,
  Type,
  Sliders,
  AudioWaveform,
  Volume2,
  FileText,
  Check
} from 'lucide-react';
import { VOICES, STYLE_PRESETS, SAMPLE_TEXTS, StylePreset } from './data/presets';
import { VoiceSelector } from './components/VoiceSelector';
import { ReadingStyleOptions } from './components/ReadingStyleOptions';
import { AudioPlayer, GeneratedAudioData } from './components/AudioPlayer';
import { HistoryList } from './components/HistoryList';
import { estimateReadTime } from './utils/audio';

export default function App() {
  // Main form state
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0].text);
  const [selectedVoice, setSelectedVoice] = useState<string>(SAMPLE_TEXTS[0].voice);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(SAMPLE_TEXTS[0].styleId);
  const [customStyle, setCustomStyle] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash-lite-tts');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioData | null>(null);
  const [history, setHistory] = useState<GeneratedAudioData[]>([]);
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gemini_tts_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setCurrentAudio(parsed[0]);
        }
      }
    } catch (e) {
      console.warn('Could not read history from localStorage');
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (items: GeneratedAudioData[]) => {
    setHistory(items);
    try {
      // Keep up to 10 recent items to prevent exceeding localStorage quotas
      const slice = items.slice(0, 10);
      localStorage.setItem('gemini_tts_history', JSON.stringify(slice));
    } catch (e) {
      console.warn('Could not save history to localStorage');
    }
  };

  // Word & character stats
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;
  const estimatedDuration = estimateReadTime(wordCount);

  // Handle Preset selection
  const handleSelectPreset = (preset: StylePreset | null) => {
    if (preset) {
      setSelectedPresetId(preset.id);
      setCustomStyle(preset.prompt);
    } else {
      setSelectedPresetId(null);
    }
  };

  // Insert Vocal Tag at cursor position
  const handleInsertVocalTag = (tag: string) => {
    if (!textareaRef.current) {
      setText((prev) => prev + ' ' + tag);
      return;
    }
    const elem = textareaRef.current;
    const start = elem.selectionStart;
    const end = elem.selectionEnd;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + (before.endsWith(' ') || before.length === 0 ? '' : ' ') + tag + ' ' + after;
    setText(newText);

    setTimeout(() => {
      elem.focus();
      const newCursorPos = start + tag.length + 2;
      elem.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Handle Paste
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch (err) {
      // Fallback: focus textarea for standard Ctrl+V
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Load sample text
  const handleLoadSample = (sample: typeof SAMPLE_TEXTS[0]) => {
    setText(sample.text);
    setSelectedVoice(sample.voice);
    setSelectedPresetId(sample.styleId);
    const matchedPreset = STYLE_PRESETS.find((p) => p.id === sample.styleId);
    if (matchedPreset) {
      setCustomStyle(matchedPreset.prompt);
    }
  };

  // Primary Generate Speech function
  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setErrorMessage('Please enter or paste some text to speak.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    // Determine the style string
    let resolvedStyle = '';
    if (selectedPresetId) {
      const matched = STYLE_PRESETS.find((p) => p.id === selectedPresetId);
      resolvedStyle = matched ? matched.prompt : '';
    } else if (customStyle.trim()) {
      resolvedStyle = customStyle.trim();
    }

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
          style: resolvedStyle,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate audio from Gemini TTS');
      }

      const newAudioItem: GeneratedAudioData = {
        id: 'audio-' + Date.now(),
        mp3Base64: data.mp3Base64,
        wavBase64: data.wavBase64,
        metadata: data.metadata,
        text: text.trim(),
        timestamp: Date.now(),
      };

      setCurrentAudio(newAudioItem);
      const updatedHistory = [newAudioItem, ...history.filter((h) => h.id !== newAudioItem.id)];
      saveHistory(updatedHistory);

      // Scroll to player smoothly
      const playerElement = document.getElementById('studio-audio-player');
      if (playerElement) {
        playerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err: any) {
      console.error('Error generating speech:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while generating speech.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Key combo Ctrl+Enter to generate
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerateSpeech();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Mic className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight">
                  Gemini VoiceStudio
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  TTS & MP3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lifelike text-to-speech with expressive reading styles & direct MP3 export
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini 3.8 TTS Engine</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Sample Templates Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Try sample scripts:</span>
          </span>
          {SAMPLE_TEXTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-600/50 text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <span>{sample.title}</span>
              <span className="text-[10px] text-slate-500 font-mono">({sample.voice})</span>
            </button>
          ))}
        </div>

        {/* Large Text Area Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <label htmlFor="tts-text-input" className="text-sm font-semibold text-slate-200">
                Text to Speak
              </label>
              <span className="text-xs text-slate-500">
                (Type or paste any text below)
              </span>
            </div>

            {/* Paste & Clear Toolbar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/60"
                title="Paste from clipboard"
              >
                {pasteSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Pasted!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Paste Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setText('')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors border border-transparent hover:border-rose-900/50"
                title="Clear text box"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* LARGE TEXT BOX */}
          <div className="relative">
            <textarea
              id="tts-text-input"
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your article, script, announcement, book passage, or dialogue here..."
              rows={7}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-slate-100 placeholder-slate-500 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent transition-all shadow-inner font-sans resize-y min-h-[170px]"
            />
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-slate-500" />
                <span>{wordCount} words</span>
              </span>
              <span>•</span>
              <span>{charCount} characters</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-300">
                <Clock className="w-3.5 h-3.5" />
                <span>Est. speech duration: {estimatedDuration}</span>
              </span>
            </div>
            <div className="text-slate-500 text-[11px] hidden sm:block">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Ctrl+Enter</kbd> to generate
            </div>
          </div>
        </div>

        {/* Options How The Text Is Read: Voice Persona */}
        <VoiceSelector
          selectedVoice={selectedVoice}
          onSelectVoice={(v) => setSelectedVoice(v)}
        />

        {/* Options How The Text Is Read: Reading Style, Persona, Vocal Bursts */}
        <ReadingStyleOptions
          selectedPresetId={selectedPresetId}
          customStyle={customStyle}
          onSelectPreset={handleSelectPreset}
          onChangeCustomStyle={setCustomStyle}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onInsertVocalTag={handleInsertVocalTag}
        />

        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-300">Speech Generation Error</p>
              <p className="text-xs text-rose-200 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="flex justify-center pt-1 pb-2">
          <button
            type="button"
            onClick={handleGenerateSpeech}
            disabled={isGenerating || !text.trim()}
            className={`w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-xl cursor-pointer ${
              isGenerating || !text.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Audio with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>Generate Speech & Export MP3</span>
              </>
            )}
          </button>
        </div>

        {/* Studio Audio Player (with Large Play Button & MP3 Export) */}
        <div id="studio-audio-player" className="scroll-mt-20">
          <AudioPlayer audioData={currentAudio} />
        </div>

        {/* Session History & Export Library */}
        <HistoryList
          history={history}
          currentAudioId={currentAudio?.id}
          onSelectAudio={(item) => setCurrentAudio(item)}
          onClearHistory={() => saveHistory([])}
          onDeleteItem={(id) => {
            const filtered = history.filter((h) => h.id !== id);
            saveHistory(filtered);
            if (currentAudio?.id === id) {
              setCurrentAudio(filtered[0] || null);
            }
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Gemini VoiceStudio</span>
            <span>•</span>
            <span>Powered by Gemini 3.8 TTS & Native MP3 Audio Engine</span>
          </div>
          <div>
            <span>Direct MP3 downloads • No external plugins required</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
