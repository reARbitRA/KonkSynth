import React, { useEffect, useRef, useState } from 'react';
import { droneEngine } from '../audio/droneEngine';
import { Activity, BarChart2 } from 'lucide-react';

interface AudioVisualizerProps {
  isActive: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'wave' | 'spectrum'>('wave');
  const [rmsLevel, setRmsLevel] = useState<number>(0);
  const [peakFreq, setPeakFreq] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = droneEngine.getAnalyser();

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark industrial background
      ctx.fillStyle = '#0a0d12';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = '#161f2e';
      ctx.lineWidth = 1;
      const gridStep = 24;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!isActive || !analyser) {
        // Idle line
        ctx.strokeStyle = '#273449';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        setRmsLevel(0);
        return;
      }

      if (mode === 'wave') {
        const bufferLength = analyser.fftSize;
        const timeData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);

        // Calculate RMS
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (timeData[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / bufferLength);
        setRmsLevel(Math.min(100, Math.round(rms * 160)));

        // Draw phosphor wave glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#f59e0b';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      } else {
        // Spectrum FFT Mode
        const bufferLength = analyser.frequencyBinCount;
        const freqData = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(freqData);

        let maxVal = 0;
        let maxIndex = 0;

        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (freqData[i] / 255) * height * 0.9;

          if (freqData[i] > maxVal) {
            maxVal = freqData[i];
            maxIndex = i;
          }

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#d97706');
          gradient.addColorStop(0.7, '#f59e0b');
          gradient.addColorStop(1, '#fef08a');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, Math.max(1, barWidth - 1), barHeight);

          x += barWidth;
          if (x > width) break;
        }

        // Estimate dominant sub-bass frequency
        const sampleRate = analyser.context.sampleRate;
        const dominantFreq = Math.round((maxIndex * sampleRate) / analyser.fftSize);
        setPeakFreq(dominantFreq);
        setRmsLevel(Math.min(100, Math.round((maxVal / 255) * 100)));
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, mode]);

  return (
    <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Header with Mode Switcher & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400">
            Acoustic Signal Scope
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {isActive ? 'SIGNAL DETECTED' : 'IDLE / OFF'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setMode('wave')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                mode === 'wave'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Waveform
            </button>
            <button
              onClick={() => setMode('spectrum')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                mode === 'spectrum'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Spectrum
            </button>
          </div>
        </div>
      </div>

      {/* Screen Canvas with Glass Reflection Overlay */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        <canvas
          ref={canvasRef}
          width={640}
          height={160}
          className="w-full h-36 md:h-40 block"
        />

        {/* CRT Scanline effect overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-black/30" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/60" />

        {/* Real-time Telemetry On-Canvas Overlay */}
        <div className="absolute top-2 left-3 font-mono text-[10px] text-amber-400/80 flex items-center gap-4">
          <div>
            LEVEL: <span className="text-amber-300 font-bold">{isActive ? `${rmsLevel}%` : '0%'}</span>
          </div>
          {mode === 'spectrum' && (
            <div>
              PEAK: <span className="text-amber-300 font-bold">{isActive ? `${peakFreq} Hz` : '0 Hz'}</span>
            </div>
          )}
          <div>
            SUB-BASS: <span className="text-emerald-400">ACTIVE &lt; 80Hz</span>
          </div>
        </div>

        {/* Signal Level Bar on right side */}
        <div className="absolute right-3 top-3 bottom-3 w-1.5 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
          <div
            className="w-full bg-gradient-to-t from-emerald-500 via-amber-500 to-rose-500 transition-all duration-75 rounded-full"
            style={{ height: `${isActive ? rmsLevel : 0}%` }}
          />
        </div>
      </div>

      {/* Footer Indicators */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2.5 px-1">
        <div className="flex items-center gap-3">
          <span>SAMPLING: 44.1kHz</span>
          <span>BUFFER: 512 SAMPLES</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400/90">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          <span>PHASE-LOCKED DRONE</span>
        </div>
      </div>
    </div>
  );
};
