import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

import { HOLD_STEPS, SFX_ASSETS, type SfxName } from "@/services/audio/sfxAssets";

/**
 * Players keep the audio session active when they finish. Otherwise iOS switches the session off just after each
 * sound, which cuts Brijo off mid-sentence whenever a line has no recording and is spoken by the phone's voice.
 */
const players = new Map<SfxName, AudioPlayer>();
let muted = false;
let modeSet = false;
const listeners = new Set<(muted: boolean) => void>();

function play(name: SfxName) {
  if (muted) return;
  if (!modeSet) {
    modeSet = true;
    void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }
  try {
    let p = players.get(name);
    if (!p) {
      p = createAudioPlayer(SFX_ASSETS[name], { keepAudioSessionActive: true });
      players.set(name, p);
    }
    void p.seekTo(0);
    p.play();
  } catch {
  }
}

const PENTA_STEPS = 10;

export const sfx = {
  click: () => play("click"),
  pickup: () => play("pickup"),
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
  holdTick: (progress: number) => {
    const p = Math.min(1, Math.max(0, progress));
    play(`holdTick${Math.round(p * (HOLD_STEPS - 1))}` as SfxName);
  },
  pause: () => play("pause"),
};

/** Turns sound effects off or on. Brijo's voice has its own switch in narration. */
export function setMuted(next: boolean) {
  if (next === muted) return;
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

export function unlockAudio() {}
