import { avatarGradient, initials } from "@/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";

type Props = {
  name: string;
  /** Keeps the same gradient even while the name is being edited. */
  seed?: string;
  size?: number;
};

export default function Avatar({ name, seed, size = 48 }: Props) {
  const gradient = avatarGradient(seed ?? name ?? "");

  return (
    <LinearGradient
      colors={[gradient[0], gradient[1]] as const}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
