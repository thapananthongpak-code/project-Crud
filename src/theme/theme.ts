import { Platform } from "react-native";

export type ThemeName = "light" | "dark";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 30, fontWeight: "800", letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  heading: { fontSize: 17, fontWeight: "700", letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: "500" },
  label: { fontSize: 13, fontWeight: "600" },
  caption: { fontSize: 12, fontWeight: "600", letterSpacing: 0.2 },
} as const;

const lightColors = {
  background: "#F4F6FB",
  surface: "#FFFFFF",
  surfaceAlt: "#EDF0F7",
  surfaceSunken: "#E6EAF3",
  text: "#0F1420",
  textMuted: "#6A7387",
  textFaint: "#98A1B3",
  border: "#E2E7F0",
  primary: "#5A5AE6",
  primaryText: "#FFFFFF",
  primarySoft: "#EAEAFD",
  gradient: ["#6366F1", "#8B5CF6"] as [string, string],
  danger: "#E23D48",
  dangerSoft: "#FDEBEC",
  success: "#12A150",
  successSoft: "#E7F7EE",
  overlay: "rgba(15, 20, 32, 0.45)",
  skeleton: "#E4E8F1",
};

const darkColors: typeof lightColors = {
  background: "#0A0C12",
  surface: "#151A24",
  surfaceAlt: "#1D2330",
  surfaceSunken: "#11151E",
  text: "#F1F4FA",
  textMuted: "#98A2B6",
  textFaint: "#6B7488",
  border: "#252C3A",
  primary: "#8C8CF7",
  primaryText: "#0A0C12",
  primarySoft: "#20223C",
  gradient: ["#4F46E5", "#7C3AED"],
  danger: "#FF6169",
  dangerSoft: "#2B1519",
  success: "#3ECF77",
  successSoft: "#12241A",
  overlay: "rgba(0, 0, 0, 0.6)",
  skeleton: "#1E2430",
};

export type ThemeColors = typeof lightColors;

/** Elevation that reads correctly on both platforms and both themes. */
function makeShadows(name: ThemeName) {
  const shadowColor = name === "dark" ? "#000000" : "#0F1420";
  const strength = name === "dark" ? 0.5 : 0.08;
  return {
    card: Platform.select({
      ios: {
        shadowColor,
        shadowOpacity: strength,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
      default: {
        boxShadow: `0 6px 14px rgba(15, 20, 32, ${strength})`,
      },
    })!,
    floating: Platform.select({
      ios: {
        shadowColor,
        shadowOpacity: strength * 2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 8 },
      default: {
        boxShadow: `0 10px 20px rgba(15, 20, 32, ${strength * 2})`,
      },
    })!,
  };
}

export type Theme = {
  name: ThemeName;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: ReturnType<typeof makeShadows>;
};

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: "light",
    colors: lightColors,
    spacing,
    radius,
    typography,
    shadows: makeShadows("light"),
  },
  dark: {
    name: "dark",
    colors: darkColors,
    spacing,
    radius,
    typography,
    shadows: makeShadows("dark"),
  },
};

/** The sections a student can belong to. Kept in one place so the form,
 *  the filter chips and the card badge can never drift apart. */
export const SECTIONS = [
  { value: "CED", label: "CED", color: "#0BA5C4", soft: "#E1F5FA" },
  { value: "TCT", label: "TCT", color: "#E08700", soft: "#FDF1DC" },
] as const;

export type SectionValue = (typeof SECTIONS)[number]["value"];

export function sectionMeta(value: string) {
  return SECTIONS.find((s) => s.value === value) ?? SECTIONS[0];
}

/** Deterministic avatar tints so a person keeps the same colour forever. */
export const AVATAR_COLORS = [
  ["#6366F1", "#8B5CF6"],
  ["#0EA5E9", "#22D3EE"],
  ["#F43F5E", "#FB7185"],
  ["#10B981", "#34D399"],
  ["#F59E0B", "#FBBF24"],
  ["#8B5CF6", "#D946EF"],
  ["#0891B2", "#38BDF8"],
  ["#EC4899", "#F472B6"],
] as const;
