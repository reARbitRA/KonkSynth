import { useState, useEffect, useCallback } from 'react';
import { droneEngine, DEFAULT_PARAMETERS, DroneParameters } from './audio/droneEngine';
import { IndustrialSwitch } from './components/IndustrialSwitch';
import { AudioVisualizer } from './components/AudioVisualizer';
import { SoundscapePresets, PRESETS, Preset } from './components/SoundscapePresets';
import { ParameterControls } from './components/ParameterControls';
import {
  Volume2,
  Headphones,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function App() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [params, setParams] = useState<DroneParameters>(DEFAULT_PARAMETERS);
  const [currentPresetId, setCurrentPresetId] = useState<string | null>('foundry');
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [audioContextState, setAudioContextState] = useState<string>('uninitialized');
  const [sampleRate, setSampleRate] = useState<number>(44100);

  // Handle master switch toggle
  const handleToggle = useCallback(() => {
    const running = droneEngine.toggle();
    setIsActive(running);

    const ctx = droneEngine.initContext();
    setAudioContextState(ctx.state);
    setSampleRate(ctx.sampleRate);
  }, []);

  // Update parameters in real-time
  const handleParamsChange = (updated: Partial<DroneParameters>) => {
    setParams((prev) => {
      const next = { ...prev, ...updated };
      droneEngine.setParameters(next);
      return next;
    });
    // If customized manually, clear selected preset highlight
    if (Object.keys(updated).some((k) => k !== 'volume')) {
      setCurrentPresetId(null);
    }
  };

  // Select a preset soundscape
  const handleSelectPreset = (preset: Preset) => {
    setCurrentPresetId(preset.id);
    const updated = { ...preset.params, volume: params.volume };
    setParams(updated);
    droneEngine.setParameters(updated);
  };

  // Keyboard shortcut: Spacebar to toggle drone
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggle]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black font-sans pb-16">
      {/* Background Industrial Ambience Grid */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.07),rgba(255,255,255,0))] z-0" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-6">
        {/* Top Header / Spec Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-mono text-xs tracking-widest uppercase text-amber-500 font-bold">
                ACOUSTIC LAB // UNIT 44
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              Industrial Drone Audio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Low-frequency resonant soundscape synthesizer powered by Web Audio API
            </p>
          </div>

          {/* Engine Telemetry Tags */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400">CONTEXT:</span>
              <span
                className={`font-bold ${
                  isActive
                    ? 'text-emerald-400'
                    : audioContextState === 'running'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {isActive ? 'RUNNING' : audioContextState.toUpperCase()}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-400">
              <span>RATE:</span>
              <span className="text-slate-200 font-bold">{sampleRate / 1000} kHz</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-400">
              <span>KEY:</span>
              <kbd className="px-1 py-0.2 rounded bg-slate-800 text-[10px] text-amber-400 border border-slate-700">
                SPACE
              </kbd>
            </div>
          </div>
        </header>

        {/* Advisory Banner for Bass Response */}
        <div className="bg-amber-950/30 border border-amber-600/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-200/90 font-mono">
          <div className="flex items-center gap-2.5">
            <Headphones className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Best experienced with headphones or subwoofers capable of reproducing 30Hz - 60Hz.
            </span>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer shrink-0"
          >
            <Info className="w-3.5 h-3.5" />
            {showGuide ? 'Hide Technical Architecture' : 'Acoustics Guide'}
          </button>
        </div>

        {/* Technical Architecture Drawer (Collapsible) */}
        {showGuide && (
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 text-xs text-slate-300 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-amber-400 font-bold text-sm">
                SYNTHESIS ARCHITECTURE & ACOUSTIC PRINCIPLES
              </span>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1">
                <p className="font-bold text-amber-300">1. Sub-Harmonic Detuning</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Dual oscillators (sawtooth + triangle) slightly detuned produce natural acoustic phasing
                  and low-frequency beating, generating the visceral physical sensation of turbine rotation.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-emerald-300">2. Resonant Breathing Filter</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  A high-Q lowpass filter is swept by a sub-audio LFO (0.02 - 0.5 Hz), creating that iconic
                  industrial breathing cycle found in foundries, cooling towers, and boiler rooms.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-cyan-300">3. Brownian Steam Noise</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Filtered Brownian noise buffers inject real pneumatic turbulence, air friction, and
                  mechanical conveyor rumblings into the signal path before non-linear saturation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Primary Interactive Section */}
        <section className="space-y-6">
          {/* Main Toggle Switch */}
          <IndustrialSwitch
            isActive={isActive}
            onToggle={handleToggle}
            frequency={params.baseFreq}
          />

          {/* Real-time Oscilloscope & Spectrum Visualizer */}
          <AudioVisualizer isActive={isActive} />

          {/* Soundscape Presets */}
          <SoundscapePresets
            currentPresetId={currentPresetId}
            onSelectPreset={handleSelectPreset}
            isActive={isActive}
          />

          {/* Fine Tuning Rack & Momentary Impacts */}
          <ParameterControls
            params={params}
            onChange={handleParamsChange}
            isActive={isActive}
          />
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-900 text-center text-xs font-mono text-slate-500 space-y-1">
          <p>INDUSTRIAL DRONE AUDIO LAB // WEB AUDIO API ENGINE</p>
          <p className="text-[11px] text-slate-600">
            Oscillator Nodes • BiquadFilter • AudioBufferSource • WaveShaper Saturation
          </p>
        </footer>
      </div>
    </div>
  );
}
