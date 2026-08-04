import Avatar from "@/components/Avatar";
import { useTheme } from "@/theme/ThemeProvider";
import { sectionMeta } from "@/theme/theme";
import type { Phone } from "@/types/phone";
import { formatTel, telHref } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { memo, useCallback, useState } from "react";
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  phone: Phone;
  onEdit: (phone: Phone) => void;
  onDelete: (phone: Phone) => void;
};

function QuickAction({
  icon,
  label,
  color,
  background,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        { backgroundColor: background, opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <Ionicons name={icon} size={17} color={color} />
      <Text style={[styles.quickLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

function PhoneCard({ phone, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const chevron = useSharedValue(0);

  const section = sectionMeta(phone.sect);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value * 180}deg` }],
  }));

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      chevron.value = withTiming(prev ? 0 : 1, { duration: 200 });
      return !prev;
    });
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
  }, [chevron]);

  const dial = useCallback(
    (scheme: "tel" | "sms") => {
      const number = telHref(phone.tel);
      if (!number) return;
      Linking.openURL(`${scheme}:${number}`).catch(() => {
        Alert.alert("Not available", `This device can't open ${scheme} links.`);
      });
    },
    [phone.tel],
  );

  const confirmDelete = useCallback(() => {
    Alert.alert(
      `Delete ${phone.name || "this contact"}?`,
      "You can undo this right after, but it won't stay around for long.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            }
            onDelete(phone);
          },
        },
      ],
      { cancelable: true },
    );
  }, [onDelete, phone]);

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      style={[
        styles.card,
        theme.shadows.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${phone.name}, section ${phone.sect}, ${phone.tel}`}
        accessibilityState={{ expanded }}
        onPress={toggle}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      >
        <Avatar name={phone.name} seed={phone.id} size={50} />

        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {phone.name || "Unnamed contact"}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: section.color + "1F" }]}>
              <Text style={[styles.badgeText, { color: section.color }]}>{phone.sect || "—"}</Text>
            </View>
            <Text style={[styles.tel, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {formatTel(phone.tel) || "No number"}
            </Text>
          </View>
        </View>

        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={20} color={theme.colors.textFaint} />
        </Animated.View>
      </Pressable>

      {expanded ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          style={[styles.actions, { borderTopColor: theme.colors.border }]}
        >
          <QuickAction
            icon="call"
            label="Call"
            color={theme.colors.success}
            background={theme.colors.successSoft}
            onPress={() => dial("tel")}
          />
          <QuickAction
            icon="chatbubble"
            label="Text"
            color={theme.colors.primary}
            background={theme.colors.primarySoft}
            onPress={() => dial("sms")}
          />
          <QuickAction
            icon="create"
            label="Edit"
            color={theme.colors.text}
            background={theme.colors.surfaceAlt}
            onPress={() => onEdit(phone)}
          />
          <QuickAction
            icon="trash"
            label="Delete"
            color={theme.colors.danger}
            background={theme.colors.dangerSoft}
            onPress={confirmDelete}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

export default memo(PhoneCard);

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 16.5,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickLabel: {
    fontSize: 11.5,
    fontWeight: "700",
  },
});
