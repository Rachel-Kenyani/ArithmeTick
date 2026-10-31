/**
 * Animated SVG group + matrix-prop hook used by every independently moving Brijo part.
 */

import Animated, { useAnimatedProps } from "react-native-reanimated";
import { G, type GProps } from "react-native-svg";

/* ------------------------------------------------------------------------------------------
 * Animated SVG group
 * ---------------------------------------------------------------------------------------- */

export const AnimatedG = Animated.createAnimatedComponent(G);

/** `matrix` is react-native-svg's native transform prop; updating it skips JS transform parsing. */
export function useMatrixProps(fn: () => number[]) {
  // Not part of the public GProps type, hence the cast.
  return useAnimatedProps(() => ({ matrix: fn() }) as unknown as GProps);
}
