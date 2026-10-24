/** Three tiny stars above a finished stop. */

import { StyleSheet, View } from "react-native";

import { StarIcon } from "@/components/ui/icons";
import { ABOVE, starSize } from "@/features/home/components/level-node/constants";

/** Three tiny stars above a finished level. */
export default function DoneStars({ size, big }: Readonly<{ size: number; big: boolean }>) {
  return (
    <View pointerEvents="none" style={[styles.stars, { left: 0, right: 0, bottom: ABOVE + size + 4 }]}>
      {[-16, 0, 16].map((tilt) => (
        <View
          key={tilt}
          style={
            tilt === 0 ? { marginHorizontal: -1, transform: [{ translateY: -4 }] } : { transform: [{ rotate: `${tilt}deg` }] }
          }
        >
          <StarIcon
            size={starSize(tilt, big)}
            fill="#ffd54a"
            stroke="#1b1b1b"
            strokeWidth={1.7}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stars: { position: "absolute", flexDirection: "row", justifyContent: "center", alignItems: "flex-end" },
});
