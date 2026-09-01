import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import StatsFilterBar from "../../features/stats/components/StatsFilterBar";

import { getTeamRankingsApi } from "../../features/stats/services/stats.service";

import { COLORS } from "../../constants/colors";

/*
|--------------------------------------------------------------------------
| Teams Tab
|--------------------------------------------------------------------------
|
| Was a hardcoded list - India, Australia, England with invented ICC
| rankings - that never touched the API.
|
| Now a real league table of CricIn teams, ranked and filterable by city,
| state, country and team type.
|
| HOW THE RANKING WORKS
| Points, the system everyone already reads off a league table: 3 for a
| win, 1 for a draw. Win percentage breaks ties, then matches played - so
| between two teams on equal points the better record wins, and between two
| equal records the one who played more.
|
| The record is counted from completed Match documents, NOT from Team.wins
| and Team.losses. Those columns exist on the schema but nothing maintains
| them, so a table built on them would show every team on zero.
|
| Teams with no completed matches are left out rather than listed at the
| bottom on zero - unranked is not the same as bad, and a table padded with
| empty rows is harder to read.
|
*/

export default function TeamsTab() {
  const navigation = useNavigation();

  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
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
        const data = await getTeamRankingsApi(filters);

        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(
          e.response?.data?.message || e.message || "Could not load teams.",
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

  const openTeam = (teamId) => {
    navigation.navigate("TeamStack", {
      screen: "TeamDetailsScreen",
      params: { teamId },
    });
  };

  const renderItem = ({ item }) => {
    const team = item.team;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => openTeam(team._id)}
      >
        <Text style={[styles.rank, item.rank <= 3 && styles.rankTop]}>
          {item.rank}
        </Text>

        {team.logo?.url ? (
          <Image source={{ uri: team.logo.url }} style={styles.logo} />
        ) : (
          <View style={[styles.logo, styles.logoFallback]}>
            <Text style={styles.logoText} numberOfLines={1}>
              {team.shortName || (team.teamName || "?").slice(0, 3).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.teamName} numberOfLines={1}>
            {team.teamName}
          </Text>

          <Text style={styles.meta} numberOfLines={1}>
            {[team.city, team.teamType].filter(Boolean).join(" · ")}
          </Text>

          {/*
          | Played / Won / Lost spelled out, because "12" on its own next
          | to a points total is ambiguous - it could be either.
          */}
          <Text style={styles.record} numberOfLines={1}>
            P {item.played} · W {item.won} · L {item.lost}
            {item.drawn > 0 ? ` · D ${item.drawn}` : ""}
          </Text>
        </View>

        <View style={styles.pointsWrap}>
          <Text style={styles.points}>{item.points}</Text>

          <Text style={styles.pointsLabel}>PTS</Text>

          <Text style={styles.winPct}>{item.winPercentage}%</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.stateBlock}>
      <View style={styles.stateIcon}>
        <Ionicons name="shield-outline" size={26} color={COLORS.primary} />
      </View>

      <Text style={styles.stateTitle}>No ranked teams</Text>

      <Text style={styles.stateText}>
        Teams appear here once they have completed a match. Clear the filters
        if you expected to see more.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatsFilterBar
        filters={filters}
        onChange={setFilters}
        fields={["city", "state", "country", "teamType"]}
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

          <Text style={styles.stateTitle}>Couldn't load teams</Text>

          <Text style={styles.stateText}>{error}</Text>

          <TouchableOpacity style={styles.retry} onPress={() => load()}>
            <Ionicons name="refresh" size={15} color={COLORS.onPrimary} />

            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.team._id)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            rows.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={COLORS.primary}
            />
          }
        />
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

  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 120,
  },

  listEmpty: {
    flexGrow: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
    marginBottom: 10,
  },

  rank: {
    width: 24,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.outline,
  },

  rankTop: {
    color: COLORS.primary,
  },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  logoFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 3,
  },

  logoText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: COLORS.onPrimary,
  },

  content: {
    flex: 1,
    marginRight: 8,
  },

  teamName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  meta: {
    marginTop: 2,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  record: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.outline,
  },

  pointsWrap: {
    alignItems: "center",
    minWidth: 46,
  },

  points: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },

  pointsLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: COLORS.outline,
  },

  winPct: {
    marginTop: 3,
    fontSize: 10.5,
    fontWeight: "700",
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
