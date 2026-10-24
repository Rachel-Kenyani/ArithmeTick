/**
 * Live preview of the avatar the new Explorer will get, popping in beside the name field.
 */

import { StyleSheet } from "react-native";
import Animated, { ReduceMotion, ZoomIn, ZoomOut } from "react-native-reanimated";

import Avatar from "@/components/ui/Avatar";
import { AVATAR_LABELS, type AvatarKind } from "@/types/models";

const AVATAR_IN = ZoomIn.springify().stiffness(520).damping(18).reduceMotion(ReduceMotion.System);
const AVATAR_OUT = ZoomOut.duration(150).reduceMotion(ReduceMotion.System);

export default function AvatarPreview({ avatar }: Readonly<{ avatar: AvatarKind }>) {
  return (
    <Animated.View key={avatar} entering={AVATAR_IN} exiting={AVATAR_OUT} style={styles.avatar}>
      <Avatar kind={avatar} size={44} title={`Your Explorer's avatar: ${AVATAR_LABELS[avatar]}`} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  avatar: { marginRight: 4 },
});
