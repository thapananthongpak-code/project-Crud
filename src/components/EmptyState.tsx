import Button from "@/components/ui/Button";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "neutral" | "error";
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = "neutral",
}: Props) {
  const theme = useTheme();
  const accent = tone === "error" ? theme.colors.danger : theme.colors.primary;
  const halo = tone === "error" ? theme.colors.dangerSoft : theme.colors.primarySoft;

  return (
    <Animated.View entering={FadeInDown.duration(320)} style={styles.container}>
      <View style={[styles.halo, { backgroundColor: halo }]}>
        <Ionicons name={icon} size={34} color={accent} />
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text>

      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant={tone === "error" ? "secondary" : "primary"}
          icon={tone === "error" ? "refresh" : "add"}
          style={styles.action}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 10,
  },
  halo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14.5,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 21,
  },
  action: {
    marginTop: 12,
    minWidth: 190,
  },
});
