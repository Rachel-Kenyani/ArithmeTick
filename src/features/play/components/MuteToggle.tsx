/**
 * MuteToggle — the chunky top-bar sound switch.
 */

import { Pressable, StyleSheet, View } from "react-native";

import { PILL_EDGE } from "@/features/play/components/playStyles";
import { SpeakerIcon, SpeakerOffIcon } from "@/components/ui/icons";
import { isMuted, setMuted, sfx } from "@/services/audio";
import { colors } from "@/theme";

export default function MuteToggle({ muted, size }: Readonly<{ muted: boolean; size: number }>) {
  const toggle = () => {
    const next = !isMuted();
    setMuted(next);
    if (!next) sfx.click();
  };
  const tint = muted ? "rgba(0,79,74,0.7)" : colors.atTeal;
  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: muted }}
      accessibilityLabel="Mute sounds"
      accessibilityHint={muted ? "Sounds off" : "Sounds on"}
      hitSlop={4}
      style={{ width: size, height: size + 4 }}
    >
      {({ pressed }) => (
        <>
          <View style={[StyleSheet.absoluteFill, styles.muteEdge, { top: 4 }]} />
          <View
            style={[
              styles.muteFace,
              { width: size, height: size, backgroundColor: muted ? colors.atMintDeep : "rgba(255,255,255,0.92)" },
              pressed && { transform: [{ translateY: 3 }] },
            ]}
          >
            {muted ? (
              <SpeakerOffIcon size={26} strokeWidth={2.3} color={tint} />
            ) : (
              <SpeakerIcon size={26} strokeWidth={2.3} color={tint} />
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  muteEdge: { borderRadius: 16, backgroundColor: PILL_EDGE },
  muteFace: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
