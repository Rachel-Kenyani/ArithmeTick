import { useState, type ReactNode } from "react";
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";

import { useUiScale } from "@/hooks/useUiScale";

export interface ScaledProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Style for the phone-sized inner layout, e.g. its gap. */
  innerStyle?: StyleProp<ViewStyle>;
}

/**
 * Lays its children out at phone size, then enlarges them to fill the space on a tablet, so text, buttons, spacing and
 * art grow together. On phones it is a plain View. Taps follow the enlarged positions.
 */
export default function Scaled({ children, style, innerStyle }: Readonly<ScaledProps>) {
  const scale = useUiScale();
  const [outerWidth, setOuterWidth] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);

  if (scale === 1) return <View style={[style, innerStyle]}>{children}</View>;

  const onOuter = (e: LayoutChangeEvent) => setOuterWidth(e.nativeEvent.layout.width);
  const onInner = (e: LayoutChangeEvent) => setInnerHeight(e.nativeEvent.layout.height);

  return (
    <View style={[style, styles.outer, innerHeight ? { height: innerHeight * scale } : null]} onLayout={onOuter}>
      <View
        onLayout={onInner}
        style={[
          innerStyle,
          styles.inner,
          { width: outerWidth / scale, transform: [{ scale }], opacity: outerWidth ? 1 : 0 },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: "100%" },
  inner: { position: "absolute", left: 0, top: 0, transformOrigin: "top left" },
});

/**
 * Like Scaled, but for an area that fills its parent, such as a level's play mat: the children get a phone-sized box of
 * the same shape, which is then enlarged to fill the space on a tablet. On phones it is a plain filling View.
 */
export function ScaledFill({ children, style }: Readonly<{ children: ReactNode; style?: StyleProp<ViewStyle> }>) {
  const scale = useUiScale();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  if (scale === 1) return <View style={[fillStyles.fill, style]}>{children}</View>;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev?.width === width && prev?.height === height ? prev : { width, height }));
  };

  return (
    <View style={[fillStyles.fill, style]} onLayout={onLayout}>
      {size ? (
        <View style={[styles.inner, { width: size.width / scale, height: size.height / scale, transform: [{ scale }] }]}>{children}</View>
      ) : null}
    </View>
  );
}

const fillStyles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0 },
});
