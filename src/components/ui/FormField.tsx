import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type Props = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  hint?: string;
};

const FormField = forwardRef<TextInput, Props>(function FormField(
  { label, icon, error, hint, style, onFocus, onBlur, ...inputProps },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.colors.surface,
            borderColor,
            borderRadius: theme.radius.md,
            borderWidth: focused || error ? 1.5 : StyleSheet.hairlineWidth,
          },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.textFaint}
          />
        ) : null}

        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.textFaint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: theme.colors.text }, style]}
          {...inputProps}
        />
      </View>

      {error ? (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)}>
          <Text style={[styles.helper, { color: theme.colors.danger }]}>{error}</Text>
        </Animated.View>
      ) : hint ? (
        <Text style={[styles.helper, { color: theme.colors.textFaint }]}>{hint}</Text>
      ) : null}
    </View>
  );
});

export default FormField;

const styles = StyleSheet.create({
  wrapper: {
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 12,
  },
  helper: {
    fontSize: 12.5,
    fontWeight: "600",
    marginLeft: 2,
  },
});
