// Soft chime generated with the Web Audio API — no audio files needed.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

/** Call from a click handler so browsers allow sound later on. */
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}

export function playChime(kind: "break" | "focus" = "break") {
  const c = getCtx();
  if (!c) return;
  const notes = kind === "break" ? [659.25, 880, 1318.5] : [880, 659.25];
  const start = c.currentTime + 0.02;
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = start + i * 0.18;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 1.5);
  });
}
