/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Web Audio Synthesizer playing a traditional Rajasthani folk-style melody
 * accompanied by dholak/tabla percussion beats. Modeled purely using Web Audio API nodes.
 * Supports multiple festive presets selected in real-time by the user.
 */

export type FolkBeatType = 'kesariya' | 'ghoomar' | 'dhol';

class RajasthaniFolkSynth {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private step: number = 0;
  private intervalId: number | null = null;
  private playCallback: ((step: number, noteName: string | null) => void) | null = null;
  private currentBeatType: FolkBeatType = 'kesariya';

  // Raga Bhairavi scale frequencies (with C4 as tonic)
  private scale: { [key: string]: number } = {
    'S': 261.63,  // Sa (C4)
    'r': 277.18,  // Komal Re (Db4)
    'g': 293.66,  // Komal Ga (Eb4)
    'M': 349.23,  // Ma (F4)
    'P': 392.00,  // Pa (G4)
    'd': 415.30,  // Komal Dha (Ab4)
    'n': 466.16,  // Komal Ni (Bb4)
    'S2': 523.25, // Sa (C5)
    'r2': 554.37, // Komal Re (Db5)
    'g2': 587.33, // Komal Ga (Eb5)
    'M2': 698.46, // Ma (F5)
    'P2': 783.99  // Pa (G5)
  };

  // Three gorgeous custom celebration presets
  private sequences: { [key in FolkBeatType]: { tempo: number; label: string; melody: (string | null)[] } } = {
    kesariya: {
      tempo: 125,
      label: "Kesariya Balam Folk",
      melody: [
        'P',  'd',  'S2', 'r2', // Ke-sa-ri-ya
        'S2', 'n',  'd',  'P',  // Ba-la-a-am
        'M',  'P',  'd',  'P',  // Aa-o-ni-pa
        'M',  'r',  'S',  null  // dha-re-sa- -
      ]
    },
    ghoomar: {
      tempo: 160,
      label: "Royal Ghoomar 3/4",
      melody: [
        'S',  'g',  'M',  'P',  // Ghoo-mar-ra
        'd',  'P',  'd',  'P',  // ghoo-mar-ra
        'M',  'g',  'r',  'S'   // ghoo-mar-ra
      ]
    },
    dhol: {
      tempo: 145,
      label: "Sangeet Dhol-Tasha",
      melody: [
        'S2', 'S2', 'P',  'P',  // High-pitched celebration welcome fanfare
        'r2', 'r2', 'd',  'd',  
        'M2', 'M2', 'g2', 'r2', 
        'r2', 'S2', 'S2', null
      ]
    }
  };

  constructor() {}

  public setCallback(callback: (step: number, noteName: string | null) => void) {
    this.playCallback = callback;
  }

  public getPlayingState(): boolean {
    return this.isPlaying;
  }

  public getBeatType(): FolkBeatType {
    return this.currentBeatType;
  }

  public setBeatType(type: FolkBeatType) {
    this.currentBeatType = type;
    // Reset step to keep rhythm starting neatly on the first beat
    this.step = 0;
  }

  public getActivePresets() {
    return Object.entries(this.sequences).map(([key, config]) => ({
      id: key as FolkBeatType,
      label: config.label,
      tempo: config.tempo
    }));
  }

  public start() {
    if (this.isPlaying) return;

    // Standard Lazy Initialization of AudioContext in response to User interaction
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.step = 0;
    
    // Start scheduler
    let nextTick = this.ctx.currentTime;

    const scheduler = () => {
      if (!this.isPlaying || !this.ctx) return;

      while (nextTick < this.ctx.currentTime + 0.1) {
        const activeConfig = this.sequences[this.currentBeatType];
        const stepDuration = 60 / activeConfig.tempo / 2; // eighth notes
        const melodyLength = activeConfig.melody.length;
        
        // Wrap step if we switch presets with different lengths
        this.step = this.step % melodyLength;

        this.scheduleStep(this.step, nextTick);
        
        // Notify the UI
        if (this.playCallback) {
          try {
            this.playCallback(this.step, activeConfig.melody[this.step]);
          } catch (e) {
            console.error('Callback error', e);
          }
        }

        nextTick += stepDuration;
        this.step = (this.step + 1) % melodyLength;
      }
      this.intervalId = window.setTimeout(scheduler, 25);
    };

    scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  private scheduleStep(step: number, time: number) {
    if (!this.ctx) return;

    const beatType = this.currentBeatType;

    // 1. Synthesize Percussion (Dholak/Dhol/Tabla) based on selected preset rhythm
    if (beatType === 'kesariya') {
      // Standard Kaherva Taal (8 beats / 16 steps)
      if (step % 4 === 0) {
        this.triggerDholakBass(time, step === 0 ? 0.45 : 0.3); // Accent on 0
      } else if (step % 4 === 2) {
        this.triggerDholakTreble(time, 0.25);
      } else if (step % 2 === 1 && Math.random() > 0.4) {
        // Natural humanizing fillers
        if (Math.random() > 0.5) {
          this.triggerDholakBass(time, 0.08, 120);
        } else {
          this.triggerDholakTreble(time, 0.06);
        }
      }
    } 
    else if (beatType === 'ghoomar') {
      // Rotating 3-count Ghoomar rhythm (12 steps total)
      // Beats: 1, 2, 3 (0-3-6-9)
      const relativeStep = step % 6;
      if (relativeStep === 0) {
        this.triggerDholakBass(time, 0.48, 130); // Heavy bass sweep
      } else if (relativeStep === 3) {
        this.triggerDholakTreble(time, 0.28); // Sharp treble slap
      } else if (relativeStep === 4 || relativeStep === 5) {
        // Quick double claps
        this.triggerDholakTreble(time, 0.12, 420);
      } else if (relativeStep === 1 && Math.random() > 0.6) {
        this.triggerDholakBass(time, 0.06, 110);
      }
    } 
    else if (beatType === 'dhol') {
      // High-energy celebrational dhol-tasha troupe (16 steps)
      // Rapid bass punch syncopation
      if (step === 0 || step === 3 || step === 8 || step === 11) {
        this.triggerDholakBass(time, 0.55, 150); // Hard dhol slap
      } else if (step % 4 === 2) {
        this.triggerDholakTreble(time, 0.35, 450); // Rising metal tasha ring
      } else {
        // Continuous rolls on the rim of the dhol
        this.triggerDholakTreble(time, 0.12, 500);
      }
    }

    // 2. Synthesize Shehnai melody
    const activeMelody = this.sequences[beatType].melody;
    const currentNote = activeMelody[step];
    
    if (currentNote) {
      const activeConfig = this.sequences[beatType];
      const freq = this.scale[currentNote];
      const duration = (60 / activeConfig.tempo) * (beatType === 'dhol' ? 0.35 : 0.45); // faster trigger for energetic fanfare
      const volume = beatType === 'dhol' ? 0.14 : 0.12;
      this.triggerShehnai(freq, time, duration, volume);
    }
  }

  /**
   * Models a traditional Shehnai:
   * Rich double-reed wind instrument with prominent harmonics, sharp onset, and wide vibrato.
   */
  private triggerShehnai(freq: number, startTime: number, duration: number, volume: number) {
    if (!this.ctx) return;

    const ctx = this.ctx;
    
    // Main components
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Blend sawtooth and triangle to create nasal, buzzy double-reed shehnai timbre
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 1.008, startTime); // Slight chorus detune

    // Traditional melodic vibrato / vocal simulation (6.5 Hz sweep)
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.value = 6.4; 
    vibratoGain.gain.value = freq * 0.018; // Pitch wobble depth

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);
    vibratoGain.connect(osc2.frequency);

    // Warm wooden lowpass filtering
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2100, startTime);
    filter.frequency.exponentialRampToValueAtTime(1400, startTime + duration);

    // Blown envelope contour
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.04);
    gainNode.gain.setValueAtTime(volume, startTime + duration - 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Route signal path
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Play
    vibrato.start(startTime);
    osc1.start(startTime);
    osc2.start(startTime);

    vibrato.stop(startTime + duration + 0.1);
    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
  }

  /**
   * Models the deep dholak left-hand drum bass:
   * Quick sine sweep from high down to bass.
   */
  private triggerDholakBass(time: number, volume: number, startFreq: number = 145) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.16);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  /**
   * Models the high-pitched dholak/tabla right-hand slap:
   * Short snappy ring.
   */
  private triggerDholakTreble(time: number, volume: number, pitchFreq: number = 380) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitchFreq, time);
    osc.frequency.exponentialRampToValueAtTime(pitchFreq * 0.7, time + 0.07);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(pitchFreq * 1.1, time);
    filter.Q.setValueAtTime(4.5, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.15);
  }
}

export const rajasthaniFolkSynth = new RajasthaniFolkSynth();
