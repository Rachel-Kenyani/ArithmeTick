/**
 * Animated wrappers shared by the splash components.
 */

import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { G } from "react-native-svg";

export const AnimatedG = Animated.createAnimatedComponent(G);
export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
