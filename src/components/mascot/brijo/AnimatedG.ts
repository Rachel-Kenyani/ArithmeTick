import Animated, { useAnimatedProps } from "react-native-reanimated";
import { G, type GProps } from "react-native-svg";

export const AnimatedG = Animated.createAnimatedComponent(G);

export function useMatrixProps(fn: () => number[]) {
  return useAnimatedProps(() => ({ matrix: fn() }) as unknown as GProps);
}
