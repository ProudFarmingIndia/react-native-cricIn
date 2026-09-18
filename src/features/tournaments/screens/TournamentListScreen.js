/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| TournamentListScreen.js
|
| Description:
| Discovery. Reached from the sidebar, from Home's "View all", and from
| the Matches tab.
|
| "Mine" is the one filter that ignores publication: an organizer has to be
| able to find their own draft, and a captain has to find a tournament
| their team is in whatever its visibility. Every other filter shows only
| published tournaments, from any team - that openness is the whole point
| of a public tournament list.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import TournamentCard from "../components/TournamentCard";

import { getTournamentsApi } from "../services/tournament.service";

const FILTERS = [
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "mine", label: "Mine" },
  { key: "completed", label: "Results" },
];

const Separator = () => <View style={styles.gap} />;

export default function TournamentListScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const [filter, setFilter] = useState(
    FILTERS.some((f) => f.key === route.params?.initialFilter)
      ? route.params.initialFilter
      : "upcoming",
  );

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (key, silent = false) => {
      if (!silent) setLoading(true);

      try {
        const data = await getTournamentsApi(key);

        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      load(filter, true);
    }, [load, filter]),
  );

  const open = (tournament) =>
    navigation.navigate("TournamentDetailScreen", {
      tournamentId: tournament._id,
    });

  return (
    <View style={styles.container}>
      <View style={styles.chipBar}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            activeOpacity={0.85}
            onPress={() => {
              setFilter(f.key);

              setLoading(true);

              load(f.key);
            }}
          >
            <Text
              style={[
                styles.chipText,
                filter === f.key && styles.chipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item._id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          renderItem={({ item }) => (
            <TournamentCard tournament={item} onPress={open} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);

                load(filter, true);
              }}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={30} color={COLORS.outline} />

              <Text style={styles.emptyTitle}>
                {filter === "mine"
                  ? "Tum kisi tournament mein nahi ho"
                  : filter === "live"
                    ? "Abhi koi tournament chal nahi raha"
                    : "Koi tournament nahi mila"}
              </Text>

              <Text style={styles.emptyBody}>
                Apna tournament banao — teams invite karo, app khud saara
                schedule bana dega.
              </Text>

              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate("CreateTournamentScreen")}
              >
                <Ionicons name="add" size={17} color={COLORS.onPrimary} />
                <Text style={styles.createButtonText}>Create tournament</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/*
      | Always reachable, even with a full list - the person who came here
      | to create one should not have to scroll to the bottom to find out
      | they can.
      */}
      {!loading && items.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("CreateTournamentScreen")}
        >
          <Ionicons name="add" size={24} color={COLORS.onPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  chipBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 12, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  list: { padding: 16, paddingBottom: 100, flexGrow: 1 },

  gap: { height: 14 },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    gap: 9,
  },

  emptyTitle: {
    marginTop: 6,
    fontSize: 15.5,
    fontWeight: "800",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 13,
  },

  createButtonText: { fontSize: 14, fontWeight: "800", color: COLORS.onPrimary },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});
