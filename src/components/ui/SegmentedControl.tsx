import { useTheme } from "@/theme/ThemeProvider";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export type SegmentOption = {
  value: string;
  label: string;
  /** Tint used for the thumb when this option is selected. */
  color?: string;
};

type Props = {
  label?: string;
  options: readonly SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const PADDING = 4;

export default function SegmentedControl({ label, options, value, onChange, error }: Props) {
  const theme = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const segmentWidth = trackWidth > 0 ? (trackWidth - PADDING * 2) / options.length : 0;
  const thumbColor = options[selectedIndex]?.color ?? theme.colors.primary;

  const thumbStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    // Nothing is selected yet: keep the thumb hidden rather than parked on the first option.
    opacity: withTiming(selectedIndex >= 0 ? 1 : 0, { duration: 140 }),
    backgroundColor: withTiming(thumbColor, { duration: 180 }),
    transform: [
      {
        translateX: withTiming(Math.max(selectedIndex, 0) * segmentWidth, { duration: 200 }),
      },
    ],
  }));

  const onTrackLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text> : null}

      <View
        onLayout={onTrackLayout}
        style={[
          styles.track,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
            borderColor: error ? theme.colors.danger : "transparent",
            borderWidth: error ? 1.5 : 0,
          },
        ]}
      >
        <Animated.View style={[styles.thumb, { borderRadius: theme.radius.sm }, thumbStyle]} />

        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.selectionAsync().catch(() => {});
                }
                onChange(option.value);
              }}
              style={styles.segment}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  { color: active ? "#FFFFFF" : theme.colors.textMuted },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)}>
          <Text style={[styles.helper, { color: theme.colors.danger }]}>{error}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

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
  track: {
    flexDirection: "row",
    padding: PADDING,
    position: "relative",
  },
  thumb: {
    position: "absolute",
    top: PADDING,
    left: PADDING,
    bottom: PADDING,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentLabel: {
    fontSize: 14.5,
    fontWeight: "700",
  },
  helper: {
    fontSize: 12.5,
    fontWeight: "600",
    marginLeft: 2,
  },
});
