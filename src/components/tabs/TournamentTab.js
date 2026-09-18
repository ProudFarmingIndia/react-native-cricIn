/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| File:
| components/tabs/TournamentTab.js
|
| Description:
| The Tournaments tab inside the Matches screen. Real data now - this
| file used to render five hardcoded strings ("IPL 2026", "PSL") which
| looked like a working feature and was not one.
|
| Two sections, in the order somebody actually wants them:
|
|   RUNNING     tournaments with matches being played right now
|   UPCOMING    published, open, not started
|
| Plus "Mine" - the tournaments this user organizes or whose team is in
| one. It is a filter rather than a third section because a user with no
| involvement would otherwise stare at a permanently empty heading.
|
| WHY THE FILTER IS ON THIS SCREEN AND NOT IN THE LIST SCREEN ONLY
| The Matches tab is where people look for "what is happening", and for an
| organizer mid-tournament that question is mostly about their own. Making
| them go through the sidebar to answer it would be one tap too many for
| the thing they open the app for.
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

import TournamentCard from "../../features/tournaments/components/TournamentCard";

import { getTournamentsApi } from "../../features/tournaments/services/tournament.service";

/*
| Module scope - a new component type per render would remount every chip
| on each tap, which is exactly when it is most visible.
*/

const FILTERS = [
  { key: "running", label: "Running" },
  { key: "upcoming", label: "Upcoming" },
  { key: "mine", label: "Mine" },
];

/* The server's filter names differ from the chip labels for "running". */

const SERVER_FILTER = {
  running: "live",
  upcoming: "upcoming",
  mine: "mine",
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

export default function TournamentTab() {
  const navigation = useNavigation();

  const [filter, setFilter] = useState("running");

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (which) => {
      try {
        setItems(await getTournamentsApi(SERVER_FILTER[which]));
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
    },
    [],
  );

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

        <View style={styles.chipSpacer} />

        <TouchableOpacity
          style={styles.createChip}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("CreateTournamentScreen")}
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
              <Ionicons name="medal-outline" size={46} color={COLORS.outline} />

              <Text style={styles.emptyTitle}>
                {filter === "mine"
                  ? "Tum kisi tournament mein nahi ho"
                  : filter === "running"
                    ? "Abhi koi tournament chal nahi raha"
                    : "Koi upcoming tournament nahi"}
              </Text>

              <Text style={styles.emptyText}>
                Apna tournament banao - teams invite karo, fixtures app khud
                bana dega.
              </Text>

              <TouchableOpacity
                style={styles.emptyBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("CreateTournamentScreen")}
              >
                <Text style={styles.emptyBtnText}>Create Tournament</Text>
              </TouchableOpacity>
            </View>
          ) : (
            items.map((t) => (
              <TournamentCard
                key={String(t._id)}
                tournament={t}
                onPress={() =>
                  navigation.navigate("TournamentDetailScreen", {
                    tournamentId: t._id,
                  })
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

  chipSpacer: { flex: 1 },

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

  scrollContent: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 },

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
