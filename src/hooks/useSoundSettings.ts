import { useEffect } from "react";

import { setCalmSounds, setMuted } from "@/services/audio";
import { useCalm } from "@/hooks/useCalm";
import { narration } from "@/services/voice/narration";
import { useActiveProfile } from "@/state/store";
import { DEFAULT_SOUND, type SoundSettings } from "@/types/models";

export function useSound(): SoundSettings {
  const profile = useActiveProfile();
  return { ...DEFAULT_SOUND, ...profile?.sound };
}

export function useApplySoundSettings() {
  const { effects, voice } = useSound();
  const calm = useCalm();
  useEffect(() => {
    setCalmSounds(calm);
  }, [calm]);
  useEffect(() => {
    setMuted(!effects);
  }, [effects]);
  useEffect(() => {
    narration.setVoiceOn(voice);
  }, [voice]);
}
