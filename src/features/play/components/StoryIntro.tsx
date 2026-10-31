/**
 * The level's story stop, built for children who can't read yet (KICD Grade 1: voice and pictures over text):
 *   1. The story is drawn: the items in rows of 5, and on take-away levels the ones Brijo takes, heading for
 *      his basket.
 *   2. One short caption (≤ 8 words) with the numbers big and coloured.
 *   3. The full sentence sits in the plum grown-up note, to read aloud together.
 * "Let's go!" opens the puzzle.
 */

import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  ZoomIn,
} from "react-native-reanimated";

import BasketArt from "@/components/illustrations/BasketArt";
import BrijoMascot from "@/components/mascot/BrijoMascot";
import Button from "@/components/ui/Button";
import GrownUpNote from "@/components/ui/GrownUpNote";
import Panel from "@/components/ui/Panel";
import CounterFace from "@/features/play/components/CounterFace";
import type { StoryScene, StoryStop } from "@/data/stories";
import { colors, fonts } from "@/theme";
import Divider from "@/components/ui/Divider";

const POP = ZoomIn.springify()
  .stiffness(300)
  .damping(20)
  .reduceMotion(ReduceMotion.System);
const ITEM = 56;

interface StoryIntroProps {
  story: StoryStop;
  scene: StoryScene;
  childName: string;
  onStart: () => void;
}

export default function StoryIntro({
  story,
  scene,
  childName,
  onStart,
}: Readonly<StoryIntroProps>) {
  const line = story.ask(childName);

  return (
    <Animated.View
      entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(180).reduceMotion(ReduceMotion.System)}
      style={[StyleSheet.absoluteFill, styles.overlay]}
      accessibilityViewIsModal
    >
      <Animated.View entering={POP} style={styles.card}>
        <Panel style={styles.panel}>
          <View style={styles.top}>
            <BrijoMascot mood="talk" size={112} />
          </View>

          <Scene story={story} scene={scene} />

          <Caption text={scene.caption} />

          <Divider />

          <GrownUpNote>{line}</GrownUpNote>

          <Button trailing="arrow" onPress={onStart}>
            Let&apos;s go!
          </Button>
        </Panel>
      </Animated.View>
    </Animated.View>
  );
}

/** The story as a picture: the items in rows of 5; the ones Brijo takes float above, by her basket. */
function Scene({
  story,
  scene,
}: Readonly<{ story: StoryStop; scene: StoryScene }>) {
  const stay = scene.items - scene.away;
  const label = scene.away
    ? `${scene.items} ${story.many}, Brijo takes ${scene.away}`
    : `${scene.items} ${story.many}`;
  return (
    <View style={styles.scene} accessible accessibilityLabel={label}>
      {scene.away ? (
        <View style={styles.basketRow}>
          <View style={styles.basket}>
            <BasketArt />
          </View>
          <View style={styles.items}>
            {Array.from({ length: scene.away }, (_, i) => (
              <Animated.View
                key={i}
                entering={FadeIn.delay(500 + i * 200)}
                style={[styles.item, styles.taking]}
              >
                <CounterFace
                  item={story.treasure}
                  palette={(stay + i) % 3 === 2 ? "purple" : "teal"}
                  size={ITEM}
                />
              </Animated.View>
            ))}
          </View>
        </View>
      ) : null}
      <View style={styles.items}>
        {Array.from({ length: scene.items }, (_, i) => {
          const going = i >= stay;
          return (
            <View key={i} style={[styles.item, going ? styles.gone : null]}>
              {going ? null : (
                <CounterFace
                  item={story.treasure}
                  palette={i % 3 === 2 ? "purple" : "teal"}
                  size={ITEM}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** The caption with every number big and coloured, so the numbers lead even before the words can be read. */
function Caption({ text }: Readonly<{ text: string }>) {
  const parts = text.split(/(\d+)/);
  return (
    <Text style={styles.caption}>
      {parts.map((p, i) =>
        /^\d+$/.test(p) ? (
          <Text key={i} style={[styles.num, i > 1 ? styles.numAway : null]}>
            {p}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(0,40,37,0.35)",
  },
  card: { width: "100%", maxWidth: 420 },
  panel: { alignItems: "center", gap: 12 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  scene: {
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.atMint,
    borderRadius: 20,
    padding: 10,
    alignSelf: "stretch",
  },
  basketRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  basket: { width: 72, height: 40 },
  // rows of 5, like the ten-frame
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
    maxWidth: 5 * ITEM + 4 * 4,
  },
  item: { width: ITEM, height: ITEM },
  taking: { transform: [{ rotate: "-8deg" }] },
  gone: {
    borderRadius: ITEM,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(0,111,104,0.35)",
  },
  caption: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.atInk,
    textAlign: "center",
  },
  num: { fontFamily: fonts.bodyBold, fontSize: 30, color: colors.atTeal },
  numAway: { color: colors.atPurple },
});
