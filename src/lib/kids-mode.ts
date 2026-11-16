// Pure Kids-mode rules: daily allowance, parent PIN, stars.
// The PIN is a light deterrent stored on the device, not real security.

export interface KidsSettings {
  enabled: boolean;
  /** Daily screen-time allowance in minutes. */
  allowanceMinutes: number;
  /** SHA-256 hex of the parent PIN; null until set. */
  pinHash: string | null;
  /** Extra minutes a parent granted, valid only for `bonusDay`. */
  bonusDay: string;
  bonusMinutes: number;
}

export const DEFAULT_KIDS: KidsSettings = {
  enabled: false,
  allowanceMinutes: 60,
  pinHash: null,
  bonusDay: "",
  bonusMinutes: 0,
};

export const ALLOWANCE_MIN = 15;
export const ALLOWANCE_MAX = 180;
export const BONUS_STEP_MINUTES = 15;

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`lookaway:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkPin(pin: string, hash: string | null): Promise<boolean> {
  if (!hash || !isValidPin(pin)) return false;
  return (await hashPin(pin)) === hash;
}

/** Total minutes allowed today, including any bonus granted today. */
export function allowanceTodayMs(k: KidsSettings, todayKey: string): number {
  const bonus = k.bonusDay === todayKey ? k.bonusMinutes : 0;
  return (k.allowanceMinutes + bonus) * 60_000;
}

export function allowanceLeftMs(k: KidsSettings, todayKey: string, usedMs: number): number {
  return Math.max(0, allowanceTodayMs(k, todayKey) - usedMs);
}

export function isTimeUp(k: KidsSettings, todayKey: string, usedMs: number): boolean {
  return k.enabled && allowanceLeftMs(k, todayKey, usedMs) === 0;
}

/** Parent grants extra time for today only. */
export function addBonus(k: KidsSettings, todayKey: string, minutes = BONUS_STEP_MINUTES): KidsSettings {
  const current = k.bonusDay === todayKey ? k.bonusMinutes : 0;
  return { ...k, bonusDay: todayKey, bonusMinutes: current + minutes };
}

export function clampAllowance(m: number): number {
  return Math.min(ALLOWANCE_MAX, Math.max(ALLOWANCE_MIN, Math.round(m)));
}

/** One star per finished break, shown as at most 10 stars. */
export function starsFor(breaks: number): number {
  return Math.min(10, Math.max(0, breaks));
}
