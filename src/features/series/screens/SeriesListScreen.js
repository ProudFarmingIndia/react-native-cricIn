/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Series
|
| File:
| SeriesListScreen.js
|
| Description:
| Browse series by state. Same four filters as the tournament list, and
| deliberately so - somebody who has used one should not have to relearn
| the other.
|
|   Running     being played right now
|   Upcoming    published, not started
|   Mine        organized by you, or your team is in it
|   Completed   finished
|
| "Mine" ignores publication on purpose: the organizer has to be able to
| find their own draft, and an invited captain has to find a series their
| team is in whatever its visibility.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import SeriesCard from "../components/SeriesCard";

import { getSeriesListApi } from "../services/series.service";

/*
| Module scope - a new component type per render would remount every chip
| on each tap, which is exactly when it is most visible.
*/

const FILTERS = [
  { key: "live", label: "Running" },
  { key: "upcoming", label: "Upcoming" },
  { key: "mine", label: "Mine" },
  { key: "completed", label: "Completed" },
];

const EMPTY_COPY = {
  live: "Abhi koi series chal nahi rahi.",
  upcoming: "Koi upcoming series nahi.",
  mine: "Tum kisi series mein nahi ho.",
  completed: "Abhi koi series poori nahi hui.",
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

export default function SeriesListScreen() {
  const navigation = useNavigation();

  const [filter, setFilter] = useState("live");

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (which) => {
    try {
      setItems(await getSeriesListApi(which));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  /*
  | Refetched on focus because the user leaves to create a series and
  | comes back - a list that does not contain the thing they just made
  | reads as a failed save.
  */

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      load(filter);
    }, [filter, load]),
  );

  const open = (series) =>
    navigation.navigate("SeriesDetailScreen", { seriesId: series._id });

  const renderItem = ({ item }) => (
    <SeriesCard series={item} onPress={open} />
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
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
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
          ListEmptyComponent={
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
                <Text style={styles.emptyBtnText}>Series banao</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("CreateSeriesScreen")}
      >
        <Ionicons name="add" size={26} color={COLORS.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  center: { paddingVertical: 70, alignItems: "center" },

  chips: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },

  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  chipTextOn: { color: COLORS.onPrimary },

  list: { padding: 16, paddingBottom: 100 },

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

  fab: {
    position: "absolute",
    right: 18,
    bottom: 26,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
