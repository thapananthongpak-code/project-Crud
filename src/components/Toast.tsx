import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tone = "success" | "error" | "info";

type ToastOptions = {
  message: string;
  tone?: Tone;
  action?: { label: string; onPress: () => void };
  /** Milliseconds on screen. Defaults to 3.2s, or 6s when there is an action. */
  duration?: number;
};

type ToastContextValue = {
  show: (options: ToastOptions) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<Tone, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const show = useCallback(
    (options: ToastOptions) => {
      clearTimer();
      setToast(options);
      const duration = options.duration ?? (options.action ? 6000 : 3200);
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  const tone = toast?.tone ?? "info";
  const accent =
    tone === "success"
      ? theme.colors.success
      : tone === "error"
        ? theme.colors.danger
        : theme.colors.primary;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          entering={SlideInDown.duration(220)}
          exiting={SlideOutDown.duration(180)}
          pointerEvents="box-none"
          style={[styles.wrapper, { bottom: insets.bottom + theme.spacing.lg }]}
        >
          <View
            style={[
              styles.toast,
              theme.shadows.floating,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            <View style={[styles.iconDot, { backgroundColor: accent + "22" }]}>
              <Ionicons name={TONE_ICON[tone]} size={18} color={accent} />
            </View>

            <Text style={[styles.message, { color: theme.colors.text }]} numberOfLines={3}>
              {toast.message}
            </Text>

            {toast.action ? (
              <Pressable
                onPress={() => {
                  const run = toast.action!.onPress;
                  hide();
                  run();
                }}
                hitSlop={8}
                style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
              >
                <Text style={[styles.actionLabel, { color: theme.colors.primary }]}>
                  {toast.action.label}
                </Text>
              </Pressable>
            ) : (
              <Pressable onPress={hide} hitSlop={8} style={styles.close}>
                <Ionicons name="close" size={18} color={theme.colors.textFaint} />
              </Pressable>
            )}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
  action: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
  close: {
    padding: 2,
  },
});
