import React from 'react';
import { DroneParameters } from '../audio/droneEngine';
import { Flame, Compass, Radio, Wind, Sliders } from 'lucide-react';

export interface Preset {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  params: DroneParameters;
}

export const PRESETS: Preset[] = [
  {
    id: 'foundry',
    name: 'Heavy Foundry',
    subtitle: 'Industrial furnace with iron grit and steam hiss',
    icon: <Flame className="w-4 h-4 text-amber-400" />,
    params: {
      baseFreq: 46,
      volume: 0.75,
      noiseLevel: 0.45,
      resonance: 4.8,
      lfoRate: 0.14,
      grit: 0.35,
      detuneSpread: 22,
    },
  },
  {
    id: 'subterranean',
    name: 'Subterranean Shaft',
    subtitle: 'Earth-shaking 34Hz seismic cavern rumble',
    icon: <Compass className="w-4 h-4 text-emerald-400" />,
    params: {
      baseFreq: 34,
      volume: 0.8,
      noiseLevel: 0.25,
      resonance: 5.5,
      lfoRate: 0.06,
      grit: 0.15,
      detuneSpread: 12,
    },
  },
  {
    id: 'reactor',
    name: 'Reactor Core',
    subtitle: 'Electromagnetic hum with pulsing coolant conduits',
    icon: <Radio className="w-4 h-4 text-cyan-400" />,
    params: {
      baseFreq: 55,
      volume: 0.7,
      noiseLevel: 0.3,
      resonance: 6.2,
      lfoRate: 0.28,
      grit: 0.28,
      detuneSpread: 28,
    },
  },
  {
    id: 'turbine',
    name: 'Decommissioned Turbine',
    subtitle: 'Metallic rotational mass & ventilation friction',
    icon: <Wind className="w-4 h-4 text-purple-400" />,
    params: {
      baseFreq: 41,
      volume: 0.75,
      noiseLevel: 0.5,
      resonance: 3.8,
      lfoRate: 0.1,
      grit: 0.4,
      detuneSpread: 32,
    },
  },
  {
    id: 'void',
    name: 'Monolithic Deep Void',
    subtitle: 'Ultra-low 29Hz pure sub-harmonic pressure',
    icon: <Sliders className="w-4 h-4 text-sky-400" />,
    params: {
      baseFreq: 29,
      volume: 0.85,
      noiseLevel: 0.15,
      resonance: 3.0,
      lfoRate: 0.04,
      grit: 0.1,
      detuneSpread: 8,
    },
  },
];

interface SoundscapePresetsProps {
  currentPresetId: string | null;
  onSelectPreset: (preset: Preset) => void;
  isActive: boolean;
}

export const SoundscapePresets: React.FC<SoundscapePresetsProps> = ({
  currentPresetId,
  onSelectPreset,
  isActive,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h3 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          Acoustic Presets
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          SELECT INDUSTRIAL PROFILE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {PRESETS.map((p) => {
          const isSelected = currentPresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 font-medium text-sm text-slate-200">
                  {p.icon}
                  <span className={isSelected ? 'text-amber-400 font-bold' : ''}>
                    {p.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-300/80 border border-slate-800">
                  {p.params.baseFreq} Hz
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{p.subtitle}</p>
            </button>
          );
        })}
      </div>
      {!isActive && (
        <p className="text-[11px] font-mono text-amber-400/70 mt-3 text-center">
          * Selecting a preset while running will smoothly morph the drone acoustics in real-time.
        </p>
      )}
    </div>
  );
};
