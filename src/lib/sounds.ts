"use client";

/**
 * Tiny, programmatic UI sound system. No audio assets.
 *
 * Tones are synthesized on a single shared AudioContext using sine
 * oscillators with short envelopes — very quiet "cosmic" UI clicks.
 * Honors a persistent mute toggle stored in localStorage.
 */

const KEY = "lw.sound.muted";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

function ensure() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const W = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor = W.AudioContext ?? W.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.18;
      masterGain.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function loadMuted() {
  if (typeof window === "undefined") return;
  try {
    muted = window.localStorage.getItem(KEY) === "1";
  } catch {
    muted = false;
  }
}
loadMuted();

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* ignore quota / private mode */
    }
  }
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}

interface ToneOpts {
  freq: number;
  /** seconds */
  duration?: number;
  /** target peak gain 0..1 (relative to master). */
  gain?: number;
  type?: OscillatorType;
  /** optional second tone for chord. */
  freq2?: number;
  /** delay second tone (s). */
  delay2?: number;
}

function tone({
  freq,
  duration = 0.18,
  gain = 0.6,
  type = "sine",
  freq2,
  delay2 = 0.04,
}: ToneOpts) {
  if (muted) return;
  const ac = ensure();
  if (!ac || !masterGain) return;
  const t0 = ac.currentTime;

  const playOne = (f: number, start: number) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g).connect(masterGain!);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  };

  playOne(freq, t0);
  if (freq2) playOne(freq2, t0 + delay2);
}

export const sounds = {
  tap: () => tone({ freq: 880, duration: 0.08, gain: 0.18 }),
  select: () => tone({ freq: 660, duration: 0.07, gain: 0.16 }),
  open: () =>
    tone({
      freq: 440,
      freq2: 660,
      delay2: 0.05,
      duration: 0.22,
      gain: 0.22,
    }),
  close: () =>
    tone({
      freq: 660,
      freq2: 440,
      delay2: 0.05,
      duration: 0.18,
      gain: 0.2,
    }),
  swap: () =>
    tone({
      freq: 523.25,
      freq2: 783.99,
      delay2: 0.07,
      duration: 0.28,
      gain: 0.26,
    }),
  success: () => {
    if (muted) return;
    tone({ freq: 659.25, duration: 0.16, gain: 0.22 });
    setTimeout(() => tone({ freq: 880, duration: 0.18, gain: 0.24 }), 120);
    setTimeout(() => tone({ freq: 1046.5, duration: 0.22, gain: 0.22 }), 260);
  },
  whoosh: () => tone({ freq: 220, duration: 0.32, gain: 0.18, type: "triangle" }),
};
