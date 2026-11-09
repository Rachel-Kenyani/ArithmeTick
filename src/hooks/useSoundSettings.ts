import { useEffect } from "react";

import { setMuted } from "@/services/audio";
import { narration } from "@/services/narration";
import { useActiveProfile } from "@/state/store";
import { DEFAULT_SOUND, type SoundSettings } from "@/types/models";

/** The active child's saved sound settings, with both on when nothing is saved. */
export function useSound(): SoundSettings {
  const profile = useActiveProfile();
  return { ...DEFAULT_SOUND, ...profile?.sound };
}

/** Applies the active child's sound settings to the sound effects and to Brijo's voice. Mounted once at the root. */
export function useApplySoundSettings() {
  const { effects, voice } = useSound();
  useEffect(() => {
    setMuted(!effects);
  }, [effects]);
  useEffect(() => {
    narration.setVoiceOn(voice);
  }, [voice]);
}
