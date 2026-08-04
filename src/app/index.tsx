import EmptyState from "@/components/EmptyState";
import FilterChips, { type Chip } from "@/components/FilterChips";
import PhoneCard from "@/components/PhoneCard";
import SearchBar from "@/components/SearchBar";
import SkeletonCard from "@/components/SkeletonCard";
import { useToast } from "@/components/Toast";
import { usePhones } from "@/hooks/usePhones";
import { useTheme, useThemeContext } from "@/theme/ThemeProvider";
import { SECTIONS } from "@/theme/theme";
import type { Phone } from "@/types/phone";
import { matchesQuery } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ALL = "ALL";
type SortKey = "name-asc" | "name-desc";

export default function Index() {
  const theme = useTheme();
  const { preference, toggle } = useThemeContext();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const { phones, status, error, refreshing, reload, remove } = usePhones();

  const [query, setQuery] = useState("");
  const [section, setSection] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("name-asc");

  // The hook already loads on mount; only re-sync when coming *back* to this screen.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reload("silent");
    }, [reload]),
  );

  const searched = useMemo(
    () => phones.filter((phone) => matchesQuery(phone, query)),
    [phones, query],
  );

  const chips = useMemo<Chip[]>(
    () => [
      { value: ALL, label: "All", count: searched.length },
      ...SECTIONS.map((s) => ({
        value: s.value,
        label: s.label,
        color: s.color,
        count: searched.filter((p) => p.sect === s.value).length,
      })),
    ],
    [searched],
  );

  const visible = useMemo(() => {
    const list = section === ALL ? searched : searched.filter((p) => p.sect === section);
    const direction = sort === "name-asc" ? 1 : -1;
    return [...list].sort(
      (a, b) => direction * a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [searched, section, sort]);

  const handleDelete = useCallback(
    async (phone: Phone) => {
      const result = await remove(phone);

      if (!result.ok) {
        toast.show({ message: result.message, tone: "error" });
        return;
      }

      toast.show({
        message: result.message,
        tone: "success",
        action: {
          label: "Undo",
          onPress: () => {
            result.undo?.().catch(() =>
              toast.show({ message: "Could not restore that contact.", tone: "error" }),
            );
          },
        },
      });
    },
    [remove, toast],
  );

  const handleEdit = useCallback((phone: Phone) => {
    router.push({
      pathname: "/editPhone",
      params: { id: phone.id, name: phone.name, sect: phone.sect, tel: phone.tel },
    });
  }, []);

  const toggleSort = useCallback(() => {
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
    setSort((prev) => (prev === "name-asc" ? "name-desc" : "name-asc"));
  }, []);

  const themeIcon = preference === "light" ? "moon" : "sunny";

  const filtering = query.trim().length > 0 || section !== ALL;
  const subtitle =
    status === "loading"
      ? "Loading contacts…"
      : filtering
        ? `${visible.length} of ${phones.length} contacts`
        : `${phones.length} ${phones.length === 1 ? "contact" : "contacts"}`;

  const renderBody = () => {
    if (status === "loading") {
      return (
        <View style={styles.skeletons}>
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} delay={i} />
          ))}
        </View>
      );
    }

    if (status === "error") {
      return (
        <EmptyState
          icon="cloud-offline"
          tone="error"
          title="Can't load your contacts"
          description={error ?? "The phone server didn't respond."}
          actionLabel="Try again"
          onAction={() => reload("initial")}
        />
      );
    }

    return (
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 110 },
          visible.length === 0 && styles.listContentEmpty,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => reload("refresh")}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(300)}
            layout={LinearTransition.duration(220)}
          >
            <PhoneCard phone={item} onEdit={handleEdit} onDelete={handleDelete} />
          </Animated.View>
        )}
        ListEmptyComponent={
          filtering ? (
            <EmptyState
              icon="search"
              title="No matches"
              description="Try a different name, number or section."
              actionLabel="Clear filters"
              onAction={() => {
                setQuery("");
                setSection(ALL);
              }}
            />
          ) : (
            <EmptyState
              icon="people"
              title="No contacts yet"
              description="Add your first classmate and their number will show up right here."
              actionLabel="Add contact"
              onAction={() => router.push("/addPhone")}
            />
          )
        }
      />
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 14 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Phonebook</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${preference === "light" ? "dark" : "light"} mode`}
            style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name={themeIcon} size={19} color="#FFFFFF" />
          </Pressable>
        </View>

        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search name, number or section"
        />
      </LinearGradient>

      <View style={styles.controls}>
        <View style={styles.chipsWrap}>
          <FilterChips chips={chips} value={section} onChange={setSection} />
        </View>

        <Pressable
          onPress={toggleSort}
          accessibilityRole="button"
          accessibilityLabel={`Sort ${sort === "name-asc" ? "A to Z" : "Z to A"}. Tap to reverse.`}
          style={({ pressed }) => [
            styles.sortButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.pill,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons
            name={sort === "name-asc" ? "arrow-down" : "arrow-up"}
            size={14}
            color={theme.colors.textMuted}
          />
          <Text style={[styles.sortLabel, { color: theme.colors.textMuted }]}>
            {sort === "name-asc" ? "A–Z" : "Z–A"}
          </Text>
        </Pressable>
      </View>

      {renderBody()}

      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          }
          router.push("/addPhone");
        }}
        accessibilityRole="button"
        accessibilityLabel="Add contact"
        style={({ pressed }) => [
          styles.fab,
          theme.shadows.floating,
          { bottom: insets.bottom + 22, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <LinearGradient
          colors={theme.colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "rgba(255,255,255,0.82)",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  chipsWrap: {
    flex: 1,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sortLabel: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  skeletons: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  fabInner: {
    flex: 1,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
