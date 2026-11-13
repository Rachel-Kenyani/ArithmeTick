import { useEffect } from "react";

import { setMuted } from "@/services/audio";
import { narration } from "@/services/narration";
import { useActiveProfile } from "@/state/store";
import { DEFAULT_SOUND, type SoundSettings } from "@/types/models";

export function useSound(): SoundSettings {
  const profile = useActiveProfile();
  return { ...DEFAULT_SOUND, ...profile?.sound };
}

export function useApplySoundSettings() {
  const { effects, voice } = useSound();
  useEffect(() => {
    setMuted(!effects);
  }, [effects]);
  useEffect(() => {
    narration.setVoiceOn(voice);
  }, [voice]);
}
