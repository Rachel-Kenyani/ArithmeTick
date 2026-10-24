/**
 * The base text field: icon, input and trailing slot over the shared field face.
 */

import { useState, type ReactNode, type Ref } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
  type TextInputInstance,
} from "react-native";

import { FieldMessage } from "./FieldMessage";
import { fieldStyles, PLACEHOLDER_COLOR } from "./fieldStyles";

export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  icon?: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  trailing?: ReactNode;
  ref?: Ref<TextInputInstance>;
  style?: StyleProp<ViewStyle>;
}

export function TextField({
  label,
  icon,
  error,
  hint,
  trailing,
  ref,
  style,
  onFocus,
  onBlur,
  ...rest
}: Readonly<TextFieldProps>) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={style}>
      <View
        style={[
          fieldStyles.face,
          focused && fieldStyles.focused,
          error ? fieldStyles.error : null,
        ]}
      >
        {icon}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? undefined}
          placeholderTextColor={PLACEHOLDER_COLOR}
          style={[fieldStyles.text, styles.input]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailing}
      </View>
      <FieldMessage error={error} hint={hint} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { flex: 1, minWidth: 0, height: 60, paddingVertical: 0 },
});
