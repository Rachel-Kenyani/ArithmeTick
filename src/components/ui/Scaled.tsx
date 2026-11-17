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
