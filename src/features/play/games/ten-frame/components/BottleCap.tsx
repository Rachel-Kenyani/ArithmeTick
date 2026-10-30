/**
 * A draggable / tappable bottle cap: springs between computed spots, pops, wobbles and glows.
 * Under PAL, a cap past the target ("extra") hops on the spot until it is tapped back to the tray.
 */

import { memo, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated";

import { useBreath } from "../hooks/useBreath";
import { useCapFx } from "../hooks/useCapFx";
import { useCapGesture } from "../hooks/useCapGesture";
import { capColor } from "../logic/caps";
import { styles } from "../styles";
import type { CapMotion, DragShared, FxSignal, GroupTone, PaletteKey } from "../types";
import { clamp } from "../utils/math";
import { RM, SPRING_POP } from "../utils/motion";
import CounterFace, { type CounterItem } from "@/features/play/components/CounterFace";

import { ToneOverlay } from "./CapFace";
import { CountBubble } from "./CountBubble";

interface BottleCapProps {
  /** What the cap is drawn as: a bottle top, or the story's item (feathers, shells…). */
  item: CounterItem;
  id: number;
  size: number;
  mv: CapMotion;
  slot: number | null;
  group: GroupTone;
  locked: boolean;
  extra: boolean;
  frozen: boolean;
  visible: boolean;
  fx: FxSignal | undefined;
  reduced: boolean;
  drag: DragShared;
  onDragStart: (id: number) => void;
  onNear: (near: boolean) => void;
  onDragEnd: (id: number, x: number, y: number) => void;
  onTap: (id: number) => void;
}

function capLabel(colorName: string, slot: number | null, locked: boolean, extra: boolean): string {
  if (slot === null) return `${colorName} bottle cap in the tray, tap to place`;
  if (extra) return `Extra ${colorName.toLowerCase()} bottle cap in slot ${slot + 1}, tap to send it back`;
  return locked
    ? `${colorName} bottle cap in slot ${slot + 1}, part of the group of five`
    : `${colorName} bottle cap in slot ${slot + 1}, tap to send back`;
}

export const BottleCap = memo(function BottleCap({
  id,
  size,
  mv,
  slot,
  group,
  locked,
  extra,
  frozen,
  visible,
  fx,
  reduced,
  item,
  drag,
  onDragStart,
  onNear,
  onDragEnd,
  onTap,
}: Readonly<BottleCapProps>) {
  const color = capColor(id);
  const inTray = slot === null;
  const canDrag = inTray && !frozen && visible;
  const canTap = !frozen && visible;

  const appear = useSharedValue(0);
  const lift = useSharedValue(1);
  const dragT = useSharedValue(0);
  const dragging = useSharedValue(0);
  const [prevSlot, setPrevSlot] = useState<number | null>(slot);
  const [landed, setLanded] = useState(0);
  const [tones, setTones] = useState<PaletteKey[]>([]);

  // Render-time bookkeeping (React's "adjust state on prop change" pattern):
  // landing in a slot triggers the squash-pop; tone overlays mount the first time they're needed.
  if (prevSlot !== slot) {
    setPrevSlot(slot);
    if (prevSlot === null && slot !== null) setLanded(landed + 1);
  }
  if (group && !tones.includes(group)) setTones([...tones, group]);

  // Pop in once the board has its real size.
  useEffect(() => {
    appear.set(withDelay(visible ? 50 + id * 35 : 0, withSpring(visible ? 1 : 0, SPRING_POP), RM));
  }, [visible, id, appear]);
  const fxStyle = useCapFx(fx, landed, reduced);
  const gesture = useCapGesture({ id, size, mv, drag, canDrag, canTap, lift, dragT, dragging, onDragStart, onNear, onDragEnd, onTap });

  const restingZ = inTray ? 11 : 12;
  const outerStyle = useAnimatedStyle(() => {
    const a = appear.get();
    return {
      zIndex: dragging.get() ? 30 : restingZ,
      opacity: clamp(a, 0, 1),
      transform: [
        { translateX: mv.x.get() - size / 2 },
        { translateY: mv.y.get() - size / 2 },
        { scale: 0.35 + 0.65 * a },
      ],
    };
  });
  const hop = useBreath(extra && !reduced, 0, -size * 0.14, 0, 380);
  const liftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: hop.get() }, { scale: lift.get() }] }));
  const shadowStyle = useAnimatedStyle(() => {
    const t = dragT.get();
    return {
      opacity: 0.3 - 0.14 * t,
      transform: [{ translateY: size * (0.07 + 0.1 * t) }, { scale: 1 - 0.1 * t }],
    };
  });

  const colorName = item === "cap" ? (color === "teal" ? "Teal" : "Purple") : item;
  const label = capLabel(colorName, slot, locked, extra);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible={visible}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: frozen }}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? "yes" : "no-hide-descendants"}
        onAccessibilityTap={() => {
          if (!frozen) onTap(id);
        }}
        pointerEvents={visible ? "auto" : "none"}
        style={[styles.cap, { width: size, height: size }, outerStyle]}
      >
        {/* lift layer: grows while held / dragged */}
        <Animated.View style={[StyleSheet.absoluteFill, liftStyle]}>
          {/* chunky shadow that drops away when lifted */}
          <Animated.View style={[StyleSheet.absoluteFill, styles.capShadow, { borderRadius: size / 2 }, shadowStyle]} />
          {/* fx layer: pops, wobbles, bounces */}
          <Animated.View style={[StyleSheet.absoluteFill, fxStyle]}>
            <CounterFace item={item} palette={color} size={size * 0.92} />
            {item === "cap" && tones.map((t) => (
              <ToneOverlay key={t} tone={t} on={group === t} delayMs={slot !== null ? slot * 60 : 0} />
            ))}
            {locked ? <View pointerEvents="none" style={[styles.lockRing, { borderRadius: size }]} /> : null}
          </Animated.View>
        </Animated.View>
        {fx?.kind === "count" && fx.label ? <CountBubble key={fx.n} label={fx.label} delayMs={fx.delay * 1000} size={size} /> : null}
      </Animated.View>
    </GestureDetector>
  );
});
