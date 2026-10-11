/**
 * Industrial Drone Audio Synthesizer Engine
 * Built with Web Audio API
 */

export interface DroneParameters {
  baseFreq: number; // Hz (e.g., 30 - 90)
  volume: number; // 0 - 1
  noiseLevel: number; // 0 - 1
  resonance: number; // 1 - 12
  lfoRate: number; // Hz (0.02 - 0.8)
  grit: number; // Saturation 0 - 1
  detuneSpread: number; // Cents (5 - 35)
}

export const DEFAULT_PARAMETERS: DroneParameters = {
  baseFreq: 46,
  volume: 0.7,
  noiseLevel: 0.35,
  resonance: 4.5,
  lfoRate: 0.12,
  grit: 0.25,
  detuneSpread: 18,
};

export class DroneEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private params: DroneParameters = { ...DEFAULT_PARAMETERS };

  // Nodes
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Drone Oscillators
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private oscHarmonic: OscillatorNode | null = null;

  // Filters & Modulation
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Noise Generator
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  // Saturation / WaveShaper
  private waveShaper: WaveShaperNode | null = null;

  public initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const k = typeof amount === 'number' ? amount * 40 : 10;
    const n_samples = 44100;
    const buffer = new ArrayBuffer(n_samples * 4);
    const curve = new Float32Array(buffer);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private createBrownianNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 4; // 4 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 2.5; // Gain boost for deep low frequency roar
    }
    return buffer;
  }

  public start(): void {
    const ctx = this.initContext();
    if (this.isRunning) return;

    const now = ctx.currentTime;

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(this.params.volume, now + 1.2);

    // Analyser Node for Visualizers
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.85;

    // Distortion / Saturation Node
    this.waveShaper = ctx.createWaveShaper();
    this.waveShaper.curve = this.makeDistortionCurve(this.params.grit);
    this.waveShaper.oversample = '2x';

    // Main Filter
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(this.params.baseFreq * 2.8, now);
    this.filter.Q.setValueAtTime(this.params.resonance, now);

    // LFO for industrial breathing filter sweep
    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(this.params.lfoRate, now);

    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.setValueAtTime(this.params.baseFreq * 1.5, now);
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);

    // Oscillators:
    // Osc 1: Core Sawtooth Drone
    this.osc1 = ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(this.params.baseFreq, now);

    // Osc 2: Detuned Triangle Drone for natural phasing
    this.osc2 = ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(this.params.baseFreq, now);
    this.osc2.detune.setValueAtTime(this.params.detuneSpread, now);

    // Osc Sub: Deep Sub-bass Sine (1 octave down)
    this.oscSub = ctx.createOscillator();
    this.oscSub.type = 'sine';
    this.oscSub.frequency.setValueAtTime(this.params.baseFreq * 0.5, now);

    // Osc Harmonic: 3rd harmonic square wave with soft mix for metallic industrial drone
    this.oscHarmonic = ctx.createOscillator();
    this.oscHarmonic.type = 'square';
    this.oscHarmonic.frequency.setValueAtTime(this.params.baseFreq * 2.5, now);

    const oscMix = ctx.createGain();
    oscMix.gain.setValueAtTime(0.4, now);

    const subMix = ctx.createGain();
    subMix.gain.setValueAtTime(0.7, now);

    const harmMix = ctx.createGain();
    harmMix.gain.setValueAtTime(0.08, now);

    this.osc1.connect(oscMix);
    this.osc2.connect(oscMix);
    this.oscSub.connect(subMix);
    this.oscHarmonic.connect(harmMix);

    oscMix.connect(this.filter);
    subMix.connect(this.filter);
    harmMix.connect(this.filter);

    // Noise Generator (Ventilation / Steam / Machine Rumble)
    const noiseBuffer = this.createBrownianNoiseBuffer(ctx);
    this.noiseSource = ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.setValueAtTime(75, now);
    this.noiseFilter.Q.setValueAtTime(2.0, now);

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.setValueAtTime(this.params.noiseLevel * 0.45, now);

    this.noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.filter);

    // Chain: Filter -> WaveShaper -> MasterGain -> Analyser -> Destination
    this.filter.connect(this.waveShaper);
    this.waveShaper.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    // Start Generators
    this.osc1.start(now);
    this.osc2.start(now);
    this.oscSub.start(now);
    this.oscHarmonic.start(now);
    this.lfo.start(now);
    this.noiseSource.start(now);

    this.isRunning = true;
  }

  public stop(): void {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    setTimeout(() => {
      try {
        this.osc1?.stop();
        this.osc2?.stop();
        this.oscSub?.stop();
        this.oscHarmonic?.stop();
        this.lfo?.stop();
        this.noiseSource?.stop();

        this.osc1?.disconnect();
        this.osc2?.disconnect();
        this.oscSub?.disconnect();
        this.oscHarmonic?.disconnect();
        this.lfo?.disconnect();
        this.noiseSource?.disconnect();
      } catch {
        // ignore already stopped
      }
      this.isRunning = false;
    }, 650);
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public setParameters(params: Partial<DroneParameters>): void {
    this.params = { ...this.params, ...params };
    if (!this.ctx || !this.isRunning) return;

    const now = this.ctx.currentTime;

    if (params.volume !== undefined && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(params.volume, now, 0.05);
    }

    if (params.baseFreq !== undefined) {
      const f = params.baseFreq;
      this.osc1?.frequency.setTargetAtTime(f, now, 0.1);
      this.osc2?.frequency.setTargetAtTime(f, now, 0.1);
      this.oscSub?.frequency.setTargetAtTime(f * 0.5, now, 0.1);
      this.oscHarmonic?.frequency.setTargetAtTime(f * 2.5, now, 0.1);
      this.filter?.frequency.setTargetAtTime(f * 2.8, now, 0.1);
      this.lfoGain?.gain.setTargetAtTime(f * 1.5, now, 0.1);
    }

    if (params.detuneSpread !== undefined && this.osc2) {
      this.osc2.detune.setTargetAtTime(params.detuneSpread, now, 0.05);
    }

    if (params.resonance !== undefined && this.filter) {
      this.filter.Q.setTargetAtTime(params.resonance, now, 0.05);
    }

    if (params.lfoRate !== undefined && this.lfo) {
      this.lfo.frequency.setTargetAtTime(params.lfoRate, now, 0.05);
    }

    if (params.noiseLevel !== undefined && this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(params.noiseLevel * 0.45, now, 0.05);
    }

    if (params.grit !== undefined && this.waveShaper) {
      this.waveShaper.curve = this.makeDistortionCurve(params.grit);
    }
  }

  public getParameters(): DroneParameters {
    return { ...this.params };
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  /**
   * Industrial Sound Effects triggered over the drone
   */
  public triggerImpact(type: 'anvil' | 'steam' | 'clank'): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    if (type === 'anvil') {
      // Heavy low frequency metallic clank with deep sub resonance
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);
      filter.Q.setValueAtTime(8, now);

      gain.gain.setValueAtTime(0.55 * this.params.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.analyser || ctx.destination);

      osc.start(now);
      osc.stop(now + 1.9);
    } else if (type === 'steam') {
      // High pressure steam burst
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + 1.4);
      filter.Q.setValueAtTime(3, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35 * this.params.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.analyser || ctx.destination);

      source.start(now);
      source.stop(now + 1.5);
    } else if (type === 'clank') {
      // Metallic resonant iron pipe strike
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.6);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(630, now);
      osc2.frequency.exponentialRampToValueAtTime(240, now + 0.6);

      gain.gain.setValueAtTime(0.3 * this.params.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.analyser || ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.85);
      osc2.stop(now + 0.85);
    }
  }
}

export const droneEngine = new DroneEngine();
