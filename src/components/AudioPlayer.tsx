import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  FileAudio,
  Check,
  Sparkles,
  Share2
} from 'lucide-react';
import { formatTime, formatBytes, downloadBlob, base64ToBlob } from '../utils/audio';
import { AudioVisualizer } from './AudioVisualizer';

export interface GeneratedAudioData {
  id: string;
  mp3Base64: string;
  wavBase64: string;
  metadata: {
    voice: string;
    style: string;
    model: string;
    sampleRate: number;
    channels: number;
    duration: number;
    mp3SizeBytes: number;
    wavSizeBytes: number;
    wordCount: number;
    charCount: number;
  };
  text: string;
  timestamp: number;
}

interface AudioPlayerProps {
  audioData: GeneratedAudioData | null;
  onClearAudio?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Update audio source when audioData changes
  useEffect(() => {
    if (!audioData) {
      setAudioUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    try {
      const blob = base64ToBlob(audioData.mp3Base64, 'audio/mp3');
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setDuration(audioData.metadata.duration || 0);
      setCurrentTime(0);
      setIsPlaying(false);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Failed to create audio blob:', err);
    }
  }, [audioData]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio play failed:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(pos * duration, duration));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Direct MP3 Download handler
  const handleExportMp3 = () => {
    if (!audioData) return;
    setIsDownloading(true);

    try {
      const blob = base64ToBlob(audioData.mp3Base64, 'audio/mp3');
      const cleanVoice = audioData.metadata.voice.toLowerCase();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `gemini-tts-${cleanVoice}-${timestamp}.mp3`;

      downloadBlob(blob, filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to export MP3:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // WAV Download option for lossless audio
  const handleExportWav = () => {
    if (!audioData) return;
    try {
      const blob = base64ToBlob(audioData.wavBase64, 'audio/wav');
      const cleanVoice = audioData.metadata.voice.toLowerCase();
      const filename = `gemini-tts-${cleanVoice}-master.wav`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Failed to export WAV:', err);
    }
  };

  if (!audioData || !audioUrl) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center backdrop-blur-sm">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-indigo-400 border border-slate-700">
          <FileAudio className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">No Audio Generated Yet</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
          Paste or write your text in the box above, choose how you want it read, and click{' '}
          <span className="text-indigo-400 font-medium">"Generate Speech"</span> to listen and download MP3.
        </p>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden standard Audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-base">
                Voice: {audioData.metadata.voice}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                {audioData.metadata.style}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {audioData.metadata.wordCount} words • {audioData.metadata.duration}s • MP3 ({formatBytes(audioData.metadata.mp3SizeBytes)})
            </p>
          </div>
        </div>

        {/* MP3 Export Feature Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMp3}
            disabled={isDownloading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg ${
              downloadSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:shadow-indigo-500/50 active:scale-95'
            }`}
            title="Download direct MP3 file"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>MP3 Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export MP3</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportWav}
            className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-colors"
            title="Download original uncompressed WAV"
          >
            WAV
          </button>
        </div>
      </div>

      {/* Visualizer Waves */}
      <div className="my-2">
        <AudioVisualizer isPlaying={isPlaying} audioRef={audioRef} />
      </div>

      {/* Scrubber / Progress Bar */}
      <div className="space-y-1.5 pt-2">
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className="relative w-full h-3 bg-slate-800 rounded-full cursor-pointer group flex items-center overflow-hidden hover:h-3.5 transition-all"
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute h-4 w-4 bg-white rounded-full shadow-md -ml-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls Row with BIG PLAY BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-2">
        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => handleSpeedChange(rate)}
              className={`px-2 py-1 rounded-lg transition-all ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Center: Rewind, BIG PLAY, Forward */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSkip(-5)}
            className="p-2.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Rewind 5 seconds"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* LARGE PLAY BUTTON */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 hover:shadow-indigo-500/60 active:scale-95 transition-all transform hover:scale-105"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={() => handleSkip(5)}
            className="p-2.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Forward 5 seconds"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
