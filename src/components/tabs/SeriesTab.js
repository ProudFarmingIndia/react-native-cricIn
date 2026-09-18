/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| File:
| components/tabs/SeriesTab.js
|
| Description:
| The Series tab inside the Matches screen. Running, Upcoming and Mine -
| the same three chips as the Tournaments tab next to it, deliberately, so
| the two read as siblings rather than as two different features that
| happen to live in the same screen.
|
| It is a separate tab and not a filter on the Tournaments tab because a
| series and a tournament are different things a user chooses between: a
| tournament is "many teams, one winner", a series is "us against them,
| over N games". Mixing a card that says "2-1" with one that says "8
| teams" in the same list reads as one broken feed rather than two.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../constants/colors";

import SeriesCard from "../../features/series/components/SeriesCard";

import { getSeriesListApi } from "../../features/series/services/series.service";

/* Module scope - a new type per render would remount every chip on tap. */

const FILTERS = [
  { key: "running", label: "Running" },
  { key: "upcoming", label: "Upcoming" },
  { key: "mine", label: "Mine" },
];

const SERVER_FILTER = {
  running: "live",
  upcoming: "upcoming",
  mine: "mine",
};

const EMPTY_COPY = {
  running: "Abhi koi series chal nahi rahi",
  upcoming: "Koi upcoming series nahi",
  mine: "Tum kisi series mein nahi ho",
};

const Chip = ({ active, label, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipOn]}
    activeOpacity={0.85}
    onPress={onPress}
  >
    <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
  </TouchableOpacity>
);

export default function SeriesTab() {
  const navigation = useNavigation();

  const [filter, setFilter] = useState("running");

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (which) => {
    try {
      setItems(await getSeriesListApi(SERVER_FILTER[which]));
    } catch {
      /*
      | Left as an empty list rather than an error banner. This is a tab
      | inside another screen - a red strip here would sit above whatever
      | else the user came to the Matches screen for.
      */

      setItems([]);
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      load(filter);
    }, [filter, load]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.createChip}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("CreateSeriesScreen")}
        >
          <Ionicons name="add" size={16} color={COLORS.onPrimary} />

          <Text style={styles.createChipText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);

                load(filter);
              }}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="git-compare-outline"
                size={46}
                color={COLORS.outline}
              />

              <Text style={styles.emptyTitle}>{EMPTY_COPY[filter]}</Text>

              <Text style={styles.emptyText}>
                Doosri team ko challenge do — 3 match, 5 match, jitne chaho.
                Fixtures app khud bana dega.
              </Text>

              <TouchableOpacity
                style={styles.emptyBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("CreateSeriesScreen")}
              >
                <Text style={styles.emptyBtnText}>Create Series</Text>
              </TouchableOpacity>
            </View>
          ) : (
            items.map((s) => (
              <SeriesCard
                key={String(s._id)}
                series={s}
                onPress={() =>
                  navigation.navigate("SeriesDetailScreen", { seriesId: s._id })
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: { paddingVertical: 60, alignItems: "center" },

  chips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },

  spacer: { flex: 1 },

  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },

  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  chipTextOn: { color: COLORS.onPrimary },

  createChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  createChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 16,
    gap: 8,
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  emptyBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },

  emptyBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },
});
