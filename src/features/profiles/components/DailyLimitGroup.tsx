import { Pressable, StyleSheet, Text, View } from "react-native";

import { GROWN_UP } from "@/components/ui/GrownUpNote";
import { SettingsGroup } from "@/components/ui/SettingsList";
import { ClockIcon } from "@/components/ui/icons";
import { sfx } from "@/services/audio";
import { actions, useAppState } from "@/state/store";
import { colors, fonts } from "@/theme";
import { DAILY_LIMIT_CHOICES, dailyLimitSeconds, playedToday } from "@/types/domain";

/**
 * The family's daily play limit, chosen from a row of minute chips. It is shared by every child on this phone and
 * kept on the phone only. Already behind the gear's hold, so a tap changes it.
 */
export default function DailyLimitGroup() {
  const { dailyLimitMinutes, screenTime } = useAppState();
  const limitSeconds = dailyLimitSeconds(dailyLimitMinutes);
  const chosen = limitSeconds / 60;

  return (
    <SettingsGroup
      title="Daily play limit"
      note={`Shared by every child on this phone. ${playedToday(screenTime.usedSeconds, limitSeconds)}. Lowering it below that ends play for today.`}
    >
      <View style={styles.row}>
        <View style={styles.head}>
          <ClockIcon size={22} strokeWidth={2.2} color={GROWN_UP.ink} />
          <Text style={styles.label}>Minutes a day</Text>
        </View>
        <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Daily play limit in minutes">
          {DAILY_LIMIT_CHOICES.map((minutes) => {
            const on = minutes === chosen;
            return (
              <Pressable
                key={minutes}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${minutes} minutes`}
                onPress={() => {
                  sfx.click();
                  actions.setDailyLimit(minutes);
                }}
                hitSlop={4}
                style={({ pressed }) => [styles.chip, on && styles.chipOn, pressed && styles.pressed]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{minutes}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SettingsGroup>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontFamily: fonts.textBold, fontSize: 17, color: GROWN_UP.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minWidth: 52,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: GROWN_UP.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: { backgroundColor: GROWN_UP.ink, borderColor: GROWN_UP.ink },
  pressed: { opacity: 0.7 },
  chipText: { fontFamily: fonts.textBold, fontSize: 16, color: GROWN_UP.ink },
  chipTextOn: { color: colors.white },
});
