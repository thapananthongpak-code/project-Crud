import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = "Search" }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <Ionicons name="search" size={18} color={theme.colors.textFaint} />

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textFaint}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel="Search contacts"
        style={[styles.input, { color: theme.colors.text }]}
      />

      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange("")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={({ pressed }) => pressed && { opacity: 0.6 }}
        >
          <Ionicons name="close-circle" size={18} color={theme.colors.textFaint} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    minHeight: 46,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: "500",
    paddingVertical: 10,
  },
});
