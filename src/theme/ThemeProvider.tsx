import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { themes, type Theme, type ThemeName } from "./theme";

type ThemeContextValue = {
  theme: Theme;
  /** Either "light" or "dark" — the app never switches on its own. */
  preference: ThemeName;
  setPreference: (next: ThemeName) => void;
  /** Flips light ↔ dark. */
  toggle: () => void;
};

const STORAGE_KEY = "phonebook.theme-preference";
const DEFAULT_THEME: ThemeName = "light";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        // Older builds stored "system"; anything unrecognised falls back to the default.
        if (stored === "light" || stored === "dark") setPreferenceState(stored);
      })
      .catch(() => {
        // A missing preference is not worth surfacing — the default is fine.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemeName) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themes[preference],
      preference,
      setPreference,
      toggle: () => setPreference(preference === "light" ? "dark" : "light"),
    }),
    [preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used inside <ThemeProvider>");
  return ctx;
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}
