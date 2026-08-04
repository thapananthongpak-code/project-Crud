import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: Props) {
  const theme = useTheme();
  const isBlocked = disabled || loading;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: "transparent", fg: "#FFFFFF", border: "transparent" },
    secondary: {
      bg: theme.colors.surfaceAlt,
      fg: theme.colors.text,
      border: theme.colors.border,
    },
    ghost: { bg: "transparent", fg: theme.colors.textMuted, border: "transparent" },
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.danger, border: "transparent" },
  };
  const colors = palette[variant];

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={colors.fg} /> : null}
          <Text style={[styles.label, { color: colors.fg }]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      disabled={isBlocked}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: theme.radius.md,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: variant === "secondary" ? StyleSheet.hairlineWidth : 0,
          opacity: isBlocked ? 0.55 : pressed ? 0.8 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={theme.colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: theme.radius.md }]}
        />
      ) : null}
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fullWidth: {
    flex: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
});
