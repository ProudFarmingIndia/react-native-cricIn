import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import StatsFilterBar from "../../features/stats/components/StatsFilterBar";

import { getLeaderboardsApi } from "../../features/stats/services/stats.service";

import { COLORS } from "../../constants/colors";

/*
|--------------------------------------------------------------------------
| Stats Tab
|--------------------------------------------------------------------------
|
| Was three hardcoded cards - "Virat Kohli - 765 Runs", "Bumrah - 32
| Wickets", "Surya Kumar - 189.3" - that never touched the API.
|
| Now five real leaderboards, top 10 each, aggregated from the ball-by-ball
| Scoring collection: Most Runs, Most Wickets, Best Strike Rate, Most Fours,
| Most Sixes. Filterable by period, city, state, country, ball type and
| format.
|
| All five come from ONE request. They are five sorts of the same two
| aggregations, so splitting them into five calls would repeat the same
| scan five times for the same rows.
|
| A note on strike rate: the server applies a minimum-balls qualifier
| (30 by default) and reports it in meta. Without it the board is won by
| whoever faced one ball and hit a six.
|
*/

const BOARDS = [
  {
    key: "topRunScorers",
    title: "Most Runs",
    icon: "podium",
    primary: (row) => `${row.runs}`,
    secondary: (row) =>
      `${row.balls} balls · SR ${row.strikeRate} · ${row.fours || 0}x4 ${row.sixes || 0}x6`,
  },

  {
    key: "topWicketTakers",
    title: "Most Wickets",
    icon: "flame",
    primary: (row) => `${row.wickets}`,
    secondary: (row) => `${row.overs} ov · ${row.runsConceded} runs · Econ ${row.economy}`,
  },

  {
    key: "bestStrikeRates",
    title: "Best Strike Rate",
    icon: "flash",
    primary: (row) => `${row.strikeRate}`,
    secondary: (row) => `${row.runs} runs off ${row.balls} balls`,
  },

  {
    key: "mostFours",
    title: "Most Fours",
    icon: "tennisball",
    primary: (row) => `${row.fours}`,
    secondary: (row) => `${row.runs} runs · ${row.balls} balls`,
  },

  {
    key: "mostSixes",
    title: "Most Sixes",
    icon: "rocket",
    primary: (row) => `${row.sixes}`,
    secondary: (row) => `${row.runs} runs · ${row.balls} balls`,
  },

  /*
  | Milestone boards. These count qualifying INNINGS, not totals, so the
  | secondary line shows the best single effort rather than an aggregate -
  | "HS 124" next to a century count reads correctly, "486 runs" would not.
  */

  {
    key: "mostCenturies",
    title: "Most Centuries",
    icon: "trophy",
    primary: (row) => `${row.centuries}`,
    secondary: (row) => `Best ${row.highestScore} · ${row.innings} inns`,
  },

  {
    key: "mostFifties",
    title: "Most Fifties",
    icon: "ribbon",
    primary: (row) => `${row.fifties}`,
    secondary: (row) => `Best ${row.highestScore} · ${row.innings} inns`,
  },

  {
    key: "mostFiveWicketHauls",
    title: "Most 5-Wicket Hauls",
    icon: "medal",
    primary: (row) => `${row.fiveWicketHauls}`,
    secondary: (row) => `Best ${row.bestWickets} wkts · ${row.innings} inns`,
  },

  {
    key: "mostHatTricks",
    title: "Most Hat-Tricks",
    icon: "flame",
    primary: (row) => `${row.hatTricks}`,
    secondary: (row) => `${row.innings} innings bowled`,
  },
];

const initialsOf = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export default function StatsTab() {
  const navigation = useNavigation();

  const [filters, setFilters] = useState({ range: "all" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        setData(await getLeaderboardsApi(filters));
      } catch (e) {
        setError(
          e.response?.data?.message || e.message || "Could not load stats.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    load();
  }, [load]);

  const openPlayer = (playerId) => {
    if (!playerId) {
      return;
    }

    navigation.navigate("TeamStack", {
      screen: "PlayerProfileScreen",
      params: { playerId },
    });
  };

  const renderRow = (row, index, board) => (
    <TouchableOpacity
      key={String(row.playerId)}
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => openPlayer(row.playerId)}
    >
      <Text style={[styles.rank, index < 3 && styles.rankTop]}>
        {index + 1}
      </Text>

      {row.profileImage?.url ? (
        <Image source={{ uri: row.profileImage.url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarText}>
            {initialsOf(row.playerName) || "?"}
          </Text>
        </View>
      )}

      <View style={styles.rowContent}>
        <Text style={styles.playerName} numberOfLines={1}>
          {row.playerName}
        </Text>

        <Text style={styles.rowMeta} numberOfLines={1}>
          {board.secondary(row)}
        </Text>
      </View>

      <Text style={styles.primary}>{board.primary(row)}</Text>
    </TouchableOpacity>
  );

  const renderBoard = (board) => {
    const rows = data?.[board.key] || [];

    return (
      <View key={board.key} style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name={board.icon} size={16} color={COLORS.primary} />

          <Text style={styles.cardTitle}>{board.title}</Text>

          {board.key === "bestStrikeRates" && !!data?.meta?.minBallsForStrikeRate && (
            <Text style={styles.qualifier}>
              min {data.meta.minBallsForStrikeRate} balls
            </Text>
          )}

          {/*
          | Spelled out because it is a real convention people check: a
          | scorecard counts 112 as a hundred, not as a fifty as well.
          */}
          {board.key === "mostFifties" && (
            <Text style={styles.qualifier}>50-99 only</Text>
          )}
        </View>

        {rows.length === 0 ? (
          <Text style={styles.emptyBoard}>Not enough data yet.</Text>
        ) : (
          rows.map((row, index) => renderRow(row, index, board))
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatsFilterBar
        filters={filters}
        onChange={setFilters}
        fields={["range", "city", "state", "country", "ballType", "matchType"]}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loading}
        />
      ) : error ? (
        <View style={styles.stateBlock}>
          <View style={[styles.stateIcon, styles.stateIconError]}>
            <Ionicons
              name="cloud-offline-outline"
              size={26}
              color={COLORS.error}
            />
          </View>

          <Text style={styles.stateTitle}>Couldn't load stats</Text>

          <Text style={styles.stateText}>{error}</Text>

          <TouchableOpacity style={styles.retry} onPress={() => load()}>
            <Ionicons name="refresh" size={15} color={COLORS.onPrimary} />

            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={COLORS.primary}
            />
          }
        >
          {data?.meta?.matches === 0 ? (
            <View style={styles.stateBlock}>
              <View style={styles.stateIcon}>
                <Ionicons name="stats-chart" size={26} color={COLORS.primary} />
              </View>

              <Text style={styles.stateTitle}>No matches in range</Text>

              <Text style={styles.stateText}>
                Leaderboards are built from scored matches. Widen the period or
                clear the filters.
              </Text>
            </View>
          ) : (
            BOARDS.map(renderBoard)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loading: {
    marginTop: 48,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: 14,
    paddingBottom: 4,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },

  cardTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  qualifier: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.outline,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  rank: {
    width: 22,
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.outline,
  },

  rankTop: {
    color: COLORS.primary,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryContainer,
  },

  avatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  rowContent: {
    flex: 1,
    marginRight: 8,
  },

  playerName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  rowMeta: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },

  primary: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },

  emptyBoard: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },

  stateBlock: {
    alignItems: "center",
    marginTop: 48,
    paddingHorizontal: 32,
  },

  stateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  stateIconError: {
    backgroundColor: COLORS.errorContainer,
  },

  stateTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  stateText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  retry: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
  },

  retryText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onPrimary,
  },
});
