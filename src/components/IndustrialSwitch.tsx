import React from 'react';
import { Power, Radio, ShieldAlert } from 'lucide-react';

interface IndustrialSwitchProps {
  isActive: boolean;
  onToggle: () => void;
  frequency: number;
}

export const IndustrialSwitch: React.FC<IndustrialSwitchProps> = ({
  isActive,
  onToggle,
  frequency,
}) => {
  return (
    <div className="relative group bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-6 shadow-2xl transition-all duration-300">
      {/* Heavy Steel Frame Screws */}
      <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />
      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />
      <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />
      <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />

      {/* Industrial Caution Striping Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
          <span className="font-mono text-xs tracking-wider uppercase text-slate-300 font-semibold">
            PRIMARY DRONE GENERATOR
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Pilot Lamp LED */}
          <div
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse'
                : 'bg-rose-950 border border-rose-700'
            }`}
          />
          <span
            className={`font-mono text-[11px] font-bold tracking-widest uppercase ${
              isActive ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {isActive ? 'ENGAGED' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Main Lever / Toggle Area */}
      <div className="my-6 flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2.5">
            <Radio className={`w-5 h-5 ${isActive ? 'text-amber-400 animate-spin-slow' : 'text-slate-500'}`} />
            Low-Frequency Drone
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {isActive
              ? `Acoustic resonance streaming at ${frequency.toFixed(1)} Hz`
              : 'Click to start Web Audio context and engage sub-bass vibration'}
          </p>
        </div>

        {/* Tactile Rocker / Lever Switch Button */}
        <button
          onClick={onToggle}
          aria-label={isActive ? 'Disengage Drone' : 'Engage Industrial Drone'}
          className={`relative cursor-pointer select-none px-6 py-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 shadow-xl active:scale-95 ${
            isActive
              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-amber-500/30'
              : 'bg-gradient-to-r from-slate-800 to-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 shadow-black/50'
          }`}
        >
          {/* Industrial switch mechanical groove */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-slate-950 text-amber-400 border-amber-300/40'
                  : 'bg-slate-950/80 text-slate-400 border-slate-800'
              }`}
            >
              <Power className={`w-6 h-6 transition-transform ${isActive ? 'rotate-180 text-amber-400' : ''}`} />
            </div>

            <div className="text-left font-mono">
              <div className="text-[10px] tracking-widest uppercase opacity-75 font-semibold">
                AUDIO CONTEXT
              </div>
              <div className="text-sm font-black tracking-wider uppercase">
                {isActive ? 'POWER: ON' : 'POWER: OFF'}
              </div>
            </div>
          </div>

          {/* Toggle Indicator Slider representation */}
          <div className="ml-2 w-14 h-8 bg-slate-950 rounded-full p-1 border border-slate-800 flex items-center shadow-inner">
            <div
              className={`w-6 h-6 rounded-full transition-all duration-300 shadow-md ${
                isActive
                  ? 'translate-x-6 bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                  : 'translate-x-0 bg-slate-600'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Bottom Status Ticker */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <span className="text-amber-500">◈</span>
          HARMONIC DETUNE: ACTIVE (DUAL OSC)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-500">◈</span>
          LOWPASS RESONANT BREATHING: LFO LINKED
        </span>
      </div>
    </div>
  );
};
