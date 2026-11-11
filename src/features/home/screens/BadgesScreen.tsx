import { useEffect, useState } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, ReduceMotion, ZoomIn } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

import SplashBackdrop, { HOME_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { CheckIcon, LockIcon } from "@/components/ui/icons";
import { BADGES, type BadgeDef, type BadgeTone } from "@/data/badges";
import BottomNav, { navigateToTab } from "@/features/home/components/BottomNav";
import MapTopBar from "@/features/home/components/MapTopBar";
import BadgeMedallion from "@/features/play/components/BadgeMedallion";
import { useGuard } from "@/hooks/useGuard";
import { useActiveProfile } from "@/state/store";
import { colors, fonts } from "@/theme";

const MEDAL = 80;
const RING = 92;
const FADE = FadeIn.duration(180).reduceMotion(ReduceMotion.System);
const FADE_OUT = FadeOut.duration(160).reduceMotion(ReduceMotion.System);
const POP = ZoomIn.springify().stiffness(260).damping(18).reduceMotion(ReduceMotion.System);

/** Each badge's colour, for the rays behind it in the pop-up. */
const TONE: Record<BadgeTone, string> = {
  teal: "#00a294",
  purple: "#8457d2",
  yellow: "#ffc83a",
  plum: "#b8457f",
  leaf: "#79ae2d",
};

export default function BadgesScreen() {
  const ready = useGuard("profile");
  const profile = useActiveProfile();
  const [open, setOpen] = useState<BadgeDef | null>(null);

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setOpen(null);
      return true;
    });
    return () => sub.remove();
  }, [open]);

  if (!ready || !profile) return <SplashBackdrop source={HOME_BACKGROUND} />;

  const earned = new Set(profile.badges);
  const isEarned = (b: BadgeDef) => earned.has(b.id);
  const gradeBadges = BADGES.filter((b) => b.grade === profile.grade);
  const everyday = BADGES.filter((b) => b.grade === undefined);
  const all = [...gradeBadges, ...everyday];
  const won = all.filter(isEarned).length;
  const next = gradeBadges.find((b) => !isEarned(b)) ?? everyday.find((b) => !isEarned(b)) ?? null;

  return (
    <SplashBackdrop source={HOME_BACKGROUND}>
      <MapTopBar onBadges />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Hero name={profile.name} won={won} total={all.length} next={next} onNext={setOpen} />
        <Section title={`Grade ${profile.grade} badges`} badges={gradeBadges} isEarned={isEarned} onOpen={setOpen} />
        <Section title="Everyday badges" note="Win these in any grade" badges={everyday} isEarned={isEarned} onOpen={setOpen} />
      </ScrollView>
      <BottomNav active="badges" onNavigate={navigateToTab} />
      {open ? <BadgePopup badge={open} won={isEarned(open)} onClose={() => setOpen(null)} /> : null}
    </SplashBackdrop>
  );
}

/** The banner: how many badges are won, as a ring, and which one to go for next. */
function Hero({ name, won, total, next, onNext }: Readonly<{ name: string; won: number; total: number; next: BadgeDef | null; onNext: (b: BadgeDef) => void }>) {
  const r = RING / 2 - 7;
  const length = 2 * Math.PI * r;
  const left = total - won;
  return (
    <View style={styles.hero}>
      <Sparkles />
      <View style={styles.heroRow}>
        <View style={{ width: RING, height: RING }} accessible accessibilityLabel={`${won} of ${total} badges won`}>
          <Svg width={RING} height={RING}>
            <Circle cx={RING / 2} cy={RING / 2} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={10} fill="none" />
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={r}
              stroke={colors.jgSun}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(length * won) / Math.max(1, total)} ${length}`}
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          </Svg>
          <View style={styles.ringLabel}>
            <Text style={styles.ringWon}>{won}</Text>
            <Text style={styles.ringTotal}>{`of ${total}`}</Text>
          </View>
        </View>
        <View style={styles.heroText}>
          <Text accessibilityRole="header" style={styles.heroTitle} numberOfLines={2}>{`${name}'s Badges`}</Text>
          <Text style={styles.heroSub}>{left === 0 ? "You won every badge!" : `${left} more to win`}</Text>
        </View>
      </View>
      {next ? (
        <Pressable onPress={() => onNext(next)} accessibilityRole="button" accessibilityLabel={`Next up: ${next.name}. ${next.how}`} style={({ pressed }) => [styles.nextUp, pressed ? styles.pressed : null]}>
          <Text style={styles.nextLabel}>NEXT UP</Text>
          <Text style={styles.nextName} numberOfLines={1}>{next.name}</Text>
          <Text style={styles.nextHow} numberOfLines={1}>{next.how}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Sparkles() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d="M300 18l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={colors.jgSun} opacity={0.9} />
      <Path d="M262 70l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill={colors.white} opacity={0.6} />
      <Circle cx={326} cy={86} r={3} fill={colors.atYellowSoft} opacity={0.7} />
      <Circle cx={24} cy={16} r={2.5} fill={colors.white} opacity={0.5} />
    </Svg>
  );
}

function Section({
  title,
  note,
  badges,
  isEarned,
  onOpen,
}: Readonly<{ title: string; note?: string; badges: readonly BadgeDef[]; isEarned: (b: BadgeDef) => boolean; onOpen: (b: BadgeDef) => void }>) {
  const won = badges.filter(isEarned).length;
  return (
    <Panel style={styles.card}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionTitles}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
          {note ? <Text style={styles.sectionNote}>{note}</Text> : null}
        </View>
        <View style={styles.countChip}>
          <Text style={styles.countText}>{`${won}/${badges.length}`}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {badges.map((b) => (
          <Tile key={b.id} badge={b} won={isEarned(b)} onOpen={onOpen} />
        ))}
      </View>
    </Panel>
  );
}

function Tile({ badge, won, onOpen }: Readonly<{ badge: BadgeDef; won: boolean; onOpen: (b: BadgeDef) => void }>) {
  return (
    <Pressable
      onPress={() => onOpen(badge)}
      accessibilityRole="button"
      accessibilityLabel={`${badge.name}. ${won ? "Won" : "Not won yet"}. Tap to see more`}
      style={({ pressed }) => [styles.tile, pressed ? styles.pressed : null]}
    >
      <View pointerEvents="none">
        <BadgeMedallion badge={badge} earned={won} size={MEDAL} />
        <View style={[styles.tag, won ? styles.tagWon : styles.tagLocked]}>
          {won ? <CheckIcon size={14} color={colors.atInk} strokeWidth={3.2} /> : <LockIcon size={13} color={colors.white} strokeWidth={2.6} />}
        </View>
      </View>
      <Text style={[styles.name, won ? null : styles.nameLocked]} numberOfLines={2}>
        {badge.name}
      </Text>
    </Pressable>
  );
}

/** Drawn on the screen itself rather than in a separate window, so it always opens when a badge is tapped. */
function BadgePopup({ badge, won, onClose }: Readonly<{ badge: BadgeDef; won: boolean; onClose: () => void }>) {
  const tone = TONE[badge.tone];
  return (
    <Animated.View entering={FADE} exiting={FADE_OUT} style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
      <Animated.View entering={POP} style={styles.sheet} accessibilityViewIsModal>
        <View style={styles.medalStage}>
          {won ? <Rays color={tone} /> : null}
          <BadgeMedallion badge={badge} earned={won} size={140} />
          {won ? null : (
            <View style={styles.bigLock}>
              <LockIcon size={26} color={colors.white} strokeWidth={2.4} />
            </View>
          )}
        </View>
        <Text style={styles.sheetTitle}>{badge.name}</Text>
        <View style={[styles.ribbon, { backgroundColor: won ? tone : "#e3e9e8" }]}>
          <Text style={[styles.ribbonText, won ? styles.ribbonTextWon : null]}>{won ? "You won this!" : "Not won yet"}</Text>
        </View>
        {won ? (
          <>
            <Text style={styles.about}>{badge.about}</Text>
            <Text style={styles.howSmall}>{badge.how}</Text>
          </>
        ) : (
          <View style={styles.howBox}>
            <Text style={styles.howLabel}>HOW TO WIN IT</Text>
            <Text style={styles.howText}>{badge.how}</Text>
          </View>
        )}
        <Button onPress={onClose}>{won ? "Yay!" : "Got it"}</Button>
      </Animated.View>
    </Animated.View>
  );
}

/** Sun rays in the badge's colour behind a won badge. */
function Rays({ color }: Readonly<{ color: string }>) {
  const size = 200;
  const c = size / 2;
  return (
    <Svg width={size} height={size} style={styles.rays} pointerEvents="none">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const w = Math.PI / 24;
        const x1 = c + Math.cos(a - w) * c;
        const y1 = c + Math.sin(a - w) * c;
        const x2 = c + Math.cos(a + w) * c;
        const y2 = c + Math.sin(a + w) * c;
        return <Path key={`ray-${a}`} d={`M${c} ${c}L${x1} ${y1}L${x2} ${y2}Z`} fill={color} opacity={0.22} />;
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120, gap: 16, width: "100%", maxWidth: 480, alignSelf: "center" },
  pressed: { transform: [{ scale: 0.96 }] },

  hero: { overflow: "hidden", borderRadius: 28, backgroundColor: colors.atTeal, padding: 18, gap: 14, borderWidth: 3, borderColor: "rgba(255,255,255,0.35)" },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  ringLabel: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  ringWon: { fontFamily: fonts.headingBold, fontSize: 30, lineHeight: 34, color: colors.white },
  ringTotal: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.atYellowSoft },
  heroText: { flex: 1, gap: 4 },
  heroTitle: { fontFamily: fonts.headingBold, fontSize: 26, lineHeight: 30, color: colors.white },
  heroSub: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.atYellowSoft },
  nextUp: { backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  nextLabel: { fontFamily: fonts.headingBold, fontSize: 12, letterSpacing: 1, color: colors.jgSun },
  nextName: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.white },
  nextHow: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: "rgba(255,255,255,0.85)" },

  card: { width: "100%", alignItems: "stretch", gap: 14, paddingVertical: 18 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitles: { flexShrink: 1, gap: 2 },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 21, color: colors.atTeal },
  sectionNote: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: "#5b6664" },
  countChip: { borderRadius: 999, backgroundColor: colors.atYellowSoft, paddingHorizontal: 12, paddingVertical: 4 },
  countText: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.atInk },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: 18 },
  tile: { width: "33.33%", alignItems: "center", gap: 6 },
  tag: { position: "absolute", right: -2, top: -2, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.white },
  tagWon: { backgroundColor: colors.jgSun },
  tagLocked: { backgroundColor: "#8a9593" },
  name: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 18, color: colors.atInk, textAlign: "center", paddingHorizontal: 2 },
  nameLocked: { color: "#7a8583" },

  overlay: { ...StyleSheet.absoluteFill, zIndex: 100, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  sheet: { width: "100%", maxWidth: 360, backgroundColor: colors.white, borderRadius: 28, paddingHorizontal: 24, paddingBottom: 24, paddingTop: 16, alignItems: "center", gap: 12 },
  medalStage: { width: 200, height: 180, alignItems: "center", justifyContent: "center" },
  rays: { position: "absolute", top: -10, left: 0 },
  bigLock: { position: "absolute", width: 52, height: 52, borderRadius: 26, backgroundColor: "#8a9593", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.white },
  sheetTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.atTeal, textAlign: "center" },
  ribbon: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 5 },
  ribbonText: { fontFamily: fonts.headingBold, fontSize: 15, color: "#5b6664" },
  ribbonTextWon: { color: colors.white },
  about: { fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 24, color: colors.atInk, textAlign: "center" },
  howSmall: { fontFamily: fonts.bodyMedium, fontSize: 15, color: "#5b6664", textAlign: "center" },
  howBox: { alignSelf: "stretch", backgroundColor: colors.atMint, borderRadius: 18, padding: 14, gap: 4, alignItems: "center" },
  howLabel: { fontFamily: fonts.headingBold, fontSize: 12, letterSpacing: 1, color: colors.atTeal },
  howText: { fontFamily: fonts.headingBold, fontSize: 17, lineHeight: 22, color: colors.atInk, textAlign: "center" },
});
