/**
 * TextField with a show/hide-password eye toggle.
 */

import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { colors } from "@/theme";

import { TextField, type TextFieldProps } from "./TextField";

export type PasswordFieldProps = Omit<
  TextFieldProps,
  "secureTextEntry" | "trailing"
>;

export function PasswordField(props: Readonly<PasswordFieldProps>) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      // Everything else (value, onChangeText, placeholder, autofill hints, submit) passes straight through.
      {...props}
      secureTextEntry={!show}
      trailing={
        <Pressable
          onPress={() => setShow((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="Show password"
          accessibilityState={{ checked: show }}
          hitSlop={6}
          style={styles.eye}
        >
          {show ? (
            <EyeIcon color={colors.jgTeal} />
          ) : (
            <EyeOffIcon color={colors.jgTeal} />
          )}
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  eye: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
