import type { SfxName } from "@/services/audio/sfxAssets";

/** Sounds that only celebrate. Calm mode keeps the sounds that tell a child what happened, and drops these. */
export const CELEBRATION_SOUNDS: ReadonlySet<SfxName> = new Set<SfxName>(["celebrate", "sparkle", "clap", "boing"]);

/** Whether a sound plays: never when muted, and not a celebration sound in calm mode. */
export function shouldPlay(name: SfxName, state: { muted: boolean; calm: boolean }): boolean {
  if (state.muted) return false;
  return !(state.calm && CELEBRATION_SOUNDS.has(name));
}
