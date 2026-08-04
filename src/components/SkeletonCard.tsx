import { useTheme } from "@/theme/ThemeProvider";
import { useEffect } from "react";
import { StyleSheet, View, type DimensionValue } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

/** A single pulsing placeholder block. */
function Bone({
  width,
  height,
  radius = 8,
  progress,
}: {
  width: DimensionValue;
  height: number;
  radius?: number;
  progress: SharedValue<number>;
}) {
  const theme = useTheme();
  const style = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.colors.skeleton },
        style,
      ]}
    />
  );
}

export default function SkeletonCard({ delay = 0 }: { delay?: number }) {
  const theme = useTheme();
  const progress = useSharedValue(0.45);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.45, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [progress]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          // Staggering the opacity start makes the list feel alive rather than strobing.
          opacity: 1 - delay * 0.12,
        },
      ]}
    >
      <Bone width={50} height={50} radius={25} progress={progress} />
      <View style={styles.lines}>
        <Bone width="55%" height={13} progress={progress} />
        <Bone width="78%" height={11} progress={progress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  lines: {
    flex: 1,
    gap: 9,
  },
});
