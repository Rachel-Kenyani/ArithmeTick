/**
 * Sound effects — the web app's Web Audio recipes pre-rendered to WAVs (scripts/render-sfx.mjs).
 *
 * Usage:   import { sfx } from "@/services/audio";   sfx.snap(3);
 *
 * - Same API as the web version, so screens port unchanged.
 * - One player per sound, created on first use and rewound on each play.
 * - Sounds are deliberately soft and warm. There is NO buzzer / "wrong" sound.
 */

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

import { HOLD_STEPS, SFX_ASSETS, type SfxName } from "@/services/audio/sfxAssets";

const players = new Map<SfxName, AudioPlayer>();
let muted = false;
let modeSet = false;
const listeners = new Set<(muted: boolean) => void>();

function play(name: SfxName) {
  if (muted) return;
  if (!modeSet) {
    modeSet = true;
    // Kids' tablets are often on silent; the game sounds are part of the feedback.
    void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }
  try {
    let p = players.get(name);
    if (!p) {
      p = createAudioPlayer(SFX_ASSETS[name]);
      players.set(name, p);
    }
    void p.seekTo(0);
    p.play();
  } catch {
    // Audio unavailable: the game works silently.
  }
}

const PENTA_STEPS = 10;

export const sfx = {
  click: () => play("click"),
  pickup: () => play("pickup"),
  /** Pass the 0-based slot index so successive snaps climb a pentatonic scale. */
  snap: (slotIndex = 0) => play(`snap${Math.max(0, slotIndex) % PENTA_STEPS}` as SfxName),
  release: () => play("release"),
  boing: () => play("boing"),
  nudge: () => play("nudge"),
  palShimmer: () => play("palShimmer"),
  groupPulse: () => play("groupPulse"),
  bundle: () => play("bundle"),
  solved: () => play("solved"),
  celebrate: () => play("celebrate"),
  sparkle: () => play("sparkle"),
  clap: () => play("clap"),
  /** Long-press progress tick (adult verification). progress 0..1 raises the pitch. */
  holdTick: (progress: number) => {
    const p = Math.min(1, Math.max(0, progress));
    play(`holdTick${Math.round(p * (HOLD_STEPS - 1))}` as SfxName);
  },
  pause: () => play("pause"),
};

export function setMuted(next: boolean) {
  muted = next;
  listeners.forEach((fn) => fn(muted));
}

export function isMuted() {
  return muted;
}

export function subscribeMuted(fn: (muted: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Kept for API parity with the web app (no warm-up needed on native). */
export function unlockAudio() {}
