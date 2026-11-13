import { Pressable, StyleSheet } from "react-native";

import { MusicNoteIcon, MusicNoteOffIcon } from "@/components/ui/icons";
import { useSound } from "@/hooks/useSoundSettings";
import { setMuted, sfx } from "@/services/audio";
import { actions, useActiveProfile } from "@/state/store";
import { colors } from "@/theme";

export default function SoundToggle() {
  const profile = useActiveProfile();
  const { effects } = useSound();
  if (!profile) return null;

  const toggle = () => {
    const next = !effects;
    actions.setSound(profile.id, { effects: next });
    setMuted(!next);
    if (next) {
      sfx.click();
    }
  };

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: effects }}
      accessibilityLabel="Sound effects"
      accessibilityHint={effects ? "Sound effects are on" : "Sound effects are off"}
      hitSlop={6}
      style={({ pressed }) => [styles.button, effects ? null : styles.off, pressed ? styles.pressed : null]}
    >
      {effects ? <MusicNoteIcon size={24} strokeWidth={2.3} color={colors.atTeal} /> : <MusicNoteOffIcon size={24} strokeWidth={2.3} color="rgba(0,79,74,0.7)" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#00332f",
    shadowOpacity: 0.5,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
  },
  off: { backgroundColor: colors.atMintDeep },
  pressed: { transform: [{ scale: 0.96 }] },
});
