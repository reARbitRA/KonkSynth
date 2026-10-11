import React from 'react';
import { DroneParameters, droneEngine } from '../audio/droneEngine';
import { Volume2, Gauge, Zap, Wind, Waves, Disc3, Hammer } from 'lucide-react';

interface ParameterControlsProps {
  params: DroneParameters;
  onChange: (updated: Partial<DroneParameters>) => void;
  isActive: boolean;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  params,
  onChange,
  isActive,
}) => {
  return (
    <div className="space-y-6">
      {/* Parameter Rack Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
          <h3 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-amber-500" />
            Synthesizer Tuning Rack
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            REAL-TIME ACOUSTIC MODULATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Base Frequency */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 text-amber-400" />
                Fundamental Pitch
              </span>
              <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {params.baseFreq.toFixed(1)} Hz
              </span>
            </div>
            <input
              type="range"
              min="25"
              max="85"
              step="0.5"
              value={params.baseFreq}
              onChange={(e) => onChange({ baseFreq: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>25 Hz (Sub-audio)</span>
              <span>85 Hz (Low mid)</span>
            </div>
          </div>

          {/* Master Volume */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Master Amplitude
              </span>
              <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {Math.round(params.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={params.volume}
              onChange={(e) => onChange({ volume: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0% (Silent)</span>
              <span>100% (Full gain)</span>
            </div>
          </div>

          {/* Steam / Noise Rumble */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                Turbine Noise Texture
              </span>
              <span className="text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {Math.round(params.noiseLevel * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={params.noiseLevel}
              onChange={(e) => onChange({ noiseLevel: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Pure tone</span>
              <span>Heavy friction</span>
            </div>
          </div>

          {/* Harmonic Saturation / Grit */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Overdrive / Saturation
              </span>
              <span className="text-amber-500 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {Math.round(params.grit * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={params.grit}
              onChange={(e) => onChange({ grit: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Clean wave</span>
              <span>Iron clipping</span>
            </div>
          </div>

          {/* Resonant Filter Q */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-emerald-400" />
                Resonance Chamber (Q)
              </span>
              <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {params.resonance.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.2"
              value={params.resonance}
              onChange={(e) => onChange({ resonance: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Wide pass</span>
              <span>Metallic ringing</span>
            </div>
          </div>

          {/* LFO Breathing Throbbing Rate */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-purple-400" />
                LFO Breathing Cycle
              </span>
              <span className="text-purple-400 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {params.lfoRate.toFixed(2)} Hz
              </span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.6"
              step="0.01"
              value={params.lfoRate}
              onChange={(e) => onChange({ lfoRate: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.02 Hz (Tectonic)</span>
              <span>0.6 Hz (Rapid pulse)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Acoustic Impact Soundboard */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h3 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
            <Hammer className="w-3.5 h-3.5 text-amber-500" />
            Tactile Acoustic Impacts (Momentary)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            TEST AUDIO CONTEXT STRIKES
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Trigger one-shot transient industrial sound waves through the Web Audio context over the running drone:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => droneEngine.triggerImpact('anvil')}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 active:scale-95 transition-all text-xs font-mono font-semibold text-slate-200 cursor-pointer shadow-md"
          >
            <Hammer className="w-4 h-4 text-amber-400" />
            <span>Heavy Anvil Strike</span>
          </button>

          <button
            onClick={() => droneEngine.triggerImpact('steam')}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 active:scale-95 transition-all text-xs font-mono font-semibold text-slate-200 cursor-pointer shadow-md"
          >
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>Steam Valve Purge</span>
          </button>

          <button
            onClick={() => droneEngine.triggerImpact('clank')}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-900 active:scale-95 transition-all text-xs font-mono font-semibold text-slate-200 cursor-pointer shadow-md"
          >
            <Disc3 className="w-4 h-4 text-purple-400" />
            <span>Resonant Iron Pipe</span>
          </button>
        </div>
      </div>
    </div>
  );
};
