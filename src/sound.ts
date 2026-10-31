/**
 * A short "coins into a jar" clink, synthesised with the Web Audio API so
 * there's no audio file to load.
 *
 * Browsers only allow sound after a user gesture, so call primeAudio()
 * synchronously inside the click handler; playClink() can follow right after.
 */

type AudioCtor = typeof AudioContext;

let ctx: AudioContext | null = null;

export function primeAudio() {
  try {
    const AC: AudioCtor | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null; // audio unavailable; the bar still animates
  }
}

// Inharmonic partials (frequency multiple, decay seconds, level) give a metallic ring.
const PARTIALS: [number, number, number][] = [
  [1, 0.32, 1],
  [1.5, 0.22, 0.55],
  [2.76, 0.14, 0.32],
  [5.4, 0.07, 0.18],
];

function strike(audio: AudioContext, at: number, pitch: number, level: number) {
  const out = audio.createGain();
  out.gain.value = level;
  out.connect(audio.destination);
  for (const [mult, decay, amp] of PARTIALS) {
    const osc = audio.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch * mult, at);
    const env = audio.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(amp, at + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(env).connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.02);
  }
}

/** Three quick coin strikes, each a little softer and higher. */
export function playClink() {
  if (!ctx) primeAudio();
  if (!ctx) return;
  const now = ctx.currentTime + 0.01;
  strike(ctx, now, 2350, 0.16);
  strike(ctx, now + 0.09, 2650, 0.11);
  strike(ctx, now + 0.2, 2480, 0.07);
}
