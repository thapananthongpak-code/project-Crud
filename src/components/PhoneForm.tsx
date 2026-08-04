import Avatar from "@/components/Avatar";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useTheme } from "@/theme/ThemeProvider";
import { SECTIONS } from "@/theme/theme";
import type { PhoneDraft } from "@/types/phone";
import { formatTel, hasErrors, validateDraft, type FieldErrors } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  subtitle: string;
  submitLabel: string;
  submitIcon?: React.ComponentProps<typeof Ionicons>["name"];
  initial?: Partial<PhoneDraft>;
  /** Stable seed so the avatar keeps its colour while a name is edited. */
  avatarSeed?: string;
  onSubmit: (draft: PhoneDraft) => Promise<void>;
};

export default function PhoneForm({
  title,
  subtitle,
  submitLabel,
  submitIcon = "checkmark",
  initial,
  avatarSeed,
  onSubmit,
}: Props) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(initial?.name ?? "");
  const [sect, setSect] = useState(initial?.sect ?? "");
  const [tel, setTel] = useState(formatTel(initial?.tel ?? ""));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const telRef = useRef<TextInput>(null);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const submit = async () => {
    const draft: PhoneDraft = { name: name.trim(), sect, tel: tel.trim() };
    const found = validateDraft(draft);

    if (hasErrors(found)) {
      setErrors(found);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await onSubmit(draft);
    } finally {
      setSaving(false);
    }
  };

  /** Clearing an error as soon as the user fixes it keeps the form calm. */
  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
        </View>

        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: theme.colors.surfaceAlt, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="close" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(300)} style={styles.preview}>
          <Avatar name={name || "?"} seed={avatarSeed ?? name} size={84} />
          <Text style={[styles.previewName, { color: theme.colors.text }]} numberOfLines={1}>
            {name.trim() || "New contact"}
          </Text>
        </Animated.View>

        <View style={styles.fields}>
          <FormField
            label="Name"
            icon="person-outline"
            value={name}
            onChangeText={(text) => {
              setName(text);
              clearError("name");
            }}
            placeholder="e.g. Steve Davis"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            error={errors.name}
          />

          <SegmentedControl
            label="Section"
            options={SECTIONS.map((s) => ({ value: s.value, label: s.label, color: s.color }))}
            value={sect}
            onChange={(value) => {
              setSect(value);
              clearError("sect");
            }}
            error={errors.sect}
          />

          <FormField
            ref={telRef}
            label="Phone number"
            icon="call-outline"
            value={tel}
            onChangeText={(text) => {
              setTel(formatTel(text));
              clearError("tel");
            }}
            placeholder="08X-XXX-XXXX"
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={submit}
            maxLength={12}
            error={errors.tel}
            hint={errors.tel ? undefined : "Digits are grouped automatically."}
          />
        </View>

        <View style={styles.actions}>
          <Button label="Cancel" variant="secondary" onPress={close} fullWidth />
          <Button
            label={submitLabel}
            icon={submitIcon}
            onPress={submit}
            loading={saving}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 26,
  },
  preview: {
    alignItems: "center",
    gap: 12,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  fields: {
    gap: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
});
