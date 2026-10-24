import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export default function Divider({
  style,
}: Readonly<{
  label?: string;
  style?: StyleProp<ViewStyle>;
}>) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    alignSelf: "stretch",
  },
  rule: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(0,150,138,0.7)",
  },
});
