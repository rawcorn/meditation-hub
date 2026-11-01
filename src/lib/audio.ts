// Web Audio API procedural ambient sound generator
// Distraction-free, calming acoustic backdrop with no pseudo-scientific claims.

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private noiseNode: AudioNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private isRunning: boolean = false;
  private volume: number = 0.4;

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.25, this.ctx.currentTime, 0.2);
    }
  }

  public playAmbientDrone() {
    this.initContext();
    if (!this.ctx) return;
    if (this.isRunning) return;

    try {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume * 0.25, this.ctx.currentTime + 3.0); // Soft 3s fade in
      this.masterGain.connect(this.ctx.destination);

      // Low pass filter for velvety warmth
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(280, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Gentle fundamental oscillator (110 Hz - A2 warm resonant tone)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(110, this.ctx.currentTime);
      this.osc1.connect(this.filter);
      this.osc1.start();

      // Soft harmonic fifth (165 Hz - E3 with slow chorus beating)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(165.2, this.ctx.currentTime);
      
      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.osc2.connect(osc2Gain);
      osc2Gain.connect(this.filter);
      this.osc2.start();

      // Soft procedural pink noise generator (simulating distant wind/breath)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.04;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(this.masterGain);
      noiseSource.start();
      this.noiseNode = noiseSource;

      this.isRunning = true;
    } catch {
      // Audio autoplay policy fallback
      this.isRunning = false;
    }
  }

  public stopAmbientDrone() {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;
    try {
      const stopTime = this.ctx.currentTime + 1.5;
      this.masterGain.gain.linearRampToValueAtTime(0.0001, stopTime);

      setTimeout(() => {
        try {
          if (this.osc1) {
            this.osc1.stop();
            this.osc1.disconnect();
            this.osc1 = null;
          }
          if (this.osc2) {
            this.osc2.stop();
            this.osc2.disconnect();
            this.osc2 = null;
          }
          if (this.noiseNode) {
            (this.noiseNode as AudioScheduledSourceNode).stop();
            this.noiseNode.disconnect();
            this.noiseNode = null;
          }
          if (this.masterGain) {
            this.masterGain.disconnect();
            this.masterGain = null;
          }
          this.isRunning = false;
        } catch {
          this.isRunning = false;
        }
      }, 1600);
    } catch {
      this.isRunning = false;
    }
  }

  // Soft Tibetan-style bowl chime for starting / ending meditation session
  public playBowlChime() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, now); // Middle C
      osc.frequency.exponentialRampToValueAtTime(260.0, now + 4.5);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05); // Strike
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0); // 5-second long singing resonance

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 5.2);
    } catch {
      // ignore audio context restrictions
    }
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }
}

export const ambientAudio = new AmbientSoundEngine();
