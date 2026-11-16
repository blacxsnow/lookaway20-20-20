// Soothing sounds synthesized with the Web Audio API — no audio files needed.
import type { SoundKind } from "./eye-timer";

export const SOUNDS: { id: SoundKind; label: string; hint: string }[] = [
  { id: "chime", label: "Chime", hint: "Bright, gentle three-note chime" },
  { id: "bowl", label: "Singing bowl", hint: "Warm, long-ringing tone" },
  { id: "windchimes", label: "Wind chimes", hint: "Soft, scattered bells" },
  { id: "kalimba", label: "Kalimba", hint: "Soft plucked thumb-piano notes" },
  { id: "marimba", label: "Marimba", hint: "Round, wooden notes" },
];

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

/** Call from a click handler so browsers allow sound later on. */
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}

function tone(
  c: AudioContext,
  out: AudioNode,
  freq: number,
  at: number,
  peak: number,
  decay: number,
  type: OscillatorType = "sine",
  attack = 0.02,
) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + attack + decay + 0.1);
}

/** `start` plays when a break begins, `end` when it finishes. */
export function playSound(kind: SoundKind, volume = 60, moment: "start" | "end" = "start") {
  const c = getCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = Math.max(0, Math.min(1, volume / 100));
  master.connect(c.destination);
  const t = c.currentTime + 0.03;

  switch (kind) {
    case "chime": {
      const notes = moment === "start" ? [659.25, 880, 1318.5] : [880, 659.25];
      notes.forEach((f, i) => tone(c, master, f, t + i * 0.18, 0.2, 1.4));
      break;
    }
    case "bowl": {
      const f = moment === "start" ? 196 : 220;
      // Inharmonic partials + slight detune give the "wah-wah" shimmer of a real bowl.
      tone(c, master, f, t, 0.28, 6, "sine", 0.08);
      tone(c, master, f * 1.004, t, 0.18, 6, "sine", 0.08);
      tone(c, master, f * 2.76, t, 0.08, 4, "sine", 0.06);
      tone(c, master, f * 5.4, t, 0.03, 2.5, "sine", 0.05);
      break;
    }
    case "windchimes": {
      const scale = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093];
      const count = moment === "start" ? 7 : 4;
      for (let i = 0; i < count; i++) {
        const f = scale[Math.floor(Math.random() * scale.length)]!;
        const at = t + i * 0.22 + Math.random() * 0.15;
        tone(c, master, f, at, 0.09, 2);
        tone(c, master, f * 2.01, at, 0.02, 1.2);
      }
      break;
    }
    case "kalimba": {
      // Plucked tines: quick attack, gentle decay, a faint high overtone.
      const notes = moment === "start" ? [587.33, 739.99, 880, 1174.66] : [880, 739.99, 587.33];
      notes.forEach((f, i) => {
        const at = t + i * 0.24;
        tone(c, master, f, at, 0.22, 1.6, "sine", 0.004);
        tone(c, master, f * 2, at, 0.05, 0.6, "sine", 0.004);
        tone(c, master, f * 5.3, at, 0.015, 0.12, "sine", 0.002);
      });
      break;
    }
    case "marimba": {
      const notes = moment === "start" ? [523.25, 659.25, 784, 1046.5] : [784, 659.25, 523.25];
      notes.forEach((f, i) => {
        tone(c, master, f, t + i * 0.16, 0.25, 0.7, "sine", 0.005);
        tone(c, master, f * 4, t + i * 0.16, 0.04, 0.15, "sine", 0.003);
      });
      break;
    }
  }
}
