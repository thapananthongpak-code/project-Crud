import { useTheme } from "@/theme/ThemeProvider";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type Chip = {
  value: string;
  label: string;
  count: number;
  color?: string;
};

type Props = {
  chips: readonly Chip[];
  value: string;
  onChange: (value: string) => void;
};

export default function FilterChips({ chips, value, onChange }: Props) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {chips.map((chip) => {
        const active = chip.value === value;
        const accent = chip.color ?? theme.colors.primary;

        return (
          <Pressable
            key={chip.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
              onChange(chip.value);
            }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? accent : theme.colors.surface,
                borderColor: active ? accent : theme.colors.border,
                borderRadius: theme.radius.pill,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text
              style={[styles.label, { color: active ? "#FFFFFF" : theme.colors.textMuted }]}
            >
              {chip.label}
            </Text>

            <View
              style={[
                styles.countBubble,
                {
                  backgroundColor: active ? "rgba(255,255,255,0.28)" : theme.colors.surfaceAlt,
                },
              ]}
            >
              <Text
                style={[styles.count, { color: active ? "#FFFFFF" : theme.colors.textFaint }]}
              >
                {chip.count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  countBubble: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    alignItems: "center",
  },
  count: {
    fontSize: 11.5,
    fontWeight: "800",
  },
});
