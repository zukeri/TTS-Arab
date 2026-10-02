import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  colorTheme?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  audioRef,
  colorTheme = 'indigo'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Connect Web Audio API to the audio element if possible
    if (audioRef?.current && !sourceRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const actx = new AudioCtx();
          audioContextRef.current = actx;
          const analyser = actx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = actx.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          analyser.connect(actx.destination);
          sourceRef.current = source;
        }
      } catch (err) {
        // May fail if cross-origin or already connected; will use dynamic fallback
      }
    }

    const barCount = 36;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / barCount - 2;

      let frequencyData: Uint8Array | null = null;
      if (analyserRef.current && isPlaying) {
        frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(frequencyData as any);
      }

      phase += 0.08;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4; // minimum height

        if (isPlaying) {
          if (frequencyData && frequencyData.length > 0) {
            const freqIndex = Math.floor((i / barCount) * (frequencyData.length * 0.7));
            const val = frequencyData[freqIndex] || 0;
            barHeight = Math.max(4, (val / 255) * height * 0.9);
          } else {
            // Simulated rhythmic audio waveform
            const wave1 = Math.sin(phase + i * 0.35);
            const wave2 = Math.cos(phase * 0.7 + i * 0.2);
            const wave3 = Math.sin(phase * 1.5 + i * 0.5);
            const normalized = (Math.abs(wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2));
            barHeight = Math.max(5, normalized * (height * 0.85));
          }
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        // Gradient styling
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#818cf8'); // indigo-400
        gradient.addColorStop(0.5, '#6366f1'); // indigo-500
        gradient.addColorStop(1, '#a855f7'); // purple-500

        ctx.fillStyle = isPlaying ? gradient : '#475569';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, audioRef]);

  return (
    <div className="w-full flex items-center justify-center py-1">
      <canvas
        ref={canvasRef}
        width={360}
        height={48}
        className="w-full max-w-sm h-12 rounded-lg"
      />
    </div>
  );
};
