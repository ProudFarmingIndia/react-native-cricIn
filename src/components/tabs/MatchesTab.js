import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import {
  getLiveMatchesApi,
  getUpcomingMatchesApi,
  getRecentMatchesApi,
} from "../../features/matches/services/matches.services";

import { COLORS } from "../../constants/colors";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatResult = (match) => {
  if (!match.result) return match.status;
  return match.result;
};

/*
|--------------------------------------------------------------------------
| Sub-components
|--------------------------------------------------------------------------
*/

const SectionHeader = ({ title, badge, badgeColor }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleRow}>
      {badge && (
        <View style={[styles.sectionDot, { backgroundColor: badgeColor }]} />
      )}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  </View>
);

const EmptyCard = ({ message }) => (
  <View style={styles.emptyCard}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

/*
|--------------------------------------------------------------------------
| LiveMatchCard
|--------------------------------------------------------------------------
*/
const LiveMatchCard = ({ match, onPress }) => {
  const inn = match.currentInnings;

  return (
    <TouchableOpacity
      style={styles.liveCard}
      onPress={() => onPress(match._id)}
    >
      {/* Live badge */}
      <View style={styles.liveCardHeader}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.livePillText}>LIVE</Text>
        </View>

        <Text style={styles.matchType}>{match.matchType}</Text>
      </View>

      {/* Teams */}
      <View style={styles.teamsRow}>
        <Text style={styles.teamName} numberOfLines={1}>
          {match.teamA?.teamName ?? "Team A"}
        </Text>

        <Text style={styles.vsLabel}>vs</Text>

        <Text style={styles.teamName} numberOfLines={1}>
          {match.teamB?.teamName ?? "Team B"}
        </Text>
      </View>

      {/* Current innings score */}
      {inn && (
        <View style={styles.scoreRow}>
          <Text style={styles.liveScore}>
            {inn.runs}/{inn.wickets}
          </Text>

          <Text style={styles.liveOvers}>
            ({inn.overs} ov) • RR {inn.runRate}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => onPress(match._id)}
      >
        <Text style={styles.actionBtnText}>SCORE NOW →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

/*
|--------------------------------------------------------------------------
| UpcomingMatchCard
|--------------------------------------------------------------------------
*/
const UpcomingMatchCard = ({ match, onPress }) => (
  <TouchableOpacity
    style={styles.upcomingCard}
    onPress={() => onPress(match._id, "upcoming")}
  >
    <View style={styles.upcomingHeader}>
      <Text style={styles.upcomingDate}>
        {formatDate(match.scheduledStartTime || match.startTime)}
      </Text>

      <View style={styles.upcomingTypePill}>
        <Text style={styles.upcomingTypeText}>{match.matchType}</Text>
      </View>
    </View>

    <View style={styles.teamsRow}>
      <Text style={styles.teamName} numberOfLines={1}>
        {match.teamA?.teamName ?? "Team A"}
      </Text>

      <Text style={styles.vsLabel}>vs</Text>

      <Text style={styles.teamName} numberOfLines={1}>
        {match.teamB?.teamName ?? "Team B"}
      </Text>
    </View>

    {match.venueName ? (
      <Text style={styles.venueText} numberOfLines={1}>
        📍 {match.venueName}
      </Text>
    ) : null}

    {match.confirmationStatus === "pending" && (
      <View style={styles.pendingBanner}>
        <Text style={styles.pendingBannerText}>
          ⏳ Awaiting opponent confirmation
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

/*
|--------------------------------------------------------------------------
| RecentMatchCard
|--------------------------------------------------------------------------
*/
const RecentMatchCard = ({ match, onPress }) => (
  <TouchableOpacity
    style={styles.recentCard}
    onPress={() => onPress(match._id, "completed")}
  >
    <View style={styles.recentHeader}>
      <Text style={styles.recentDate}>{formatDate(match.endTime)}</Text>

      <View style={styles.completedPill}>
        <Text style={styles.completedPillText}>RESULT</Text>
      </View>
    </View>

    <View style={styles.teamsRow}>
      <Text
        style={[
          styles.teamName,
          match.winnerTeam?._id === match.teamA?._id && styles.winnerText,
        ]}
        numberOfLines={1}
      >
        {match.teamA?.teamName ?? "Team A"}
        {match.winnerTeam?._id === match.teamA?._id ? " 🏆" : ""}
      </Text>

      <Text style={styles.vsLabel}>vs</Text>

      <Text
        style={[
          styles.teamName,
          match.winnerTeam?._id === match.teamB?._id && styles.winnerText,
        ]}
        numberOfLines={1}
      >
        {match.teamB?.teamName ?? "Team B"}
        {match.winnerTeam?._id === match.teamB?._id ? " 🏆" : ""}
      </Text>
    </View>

    {match.result ? (
      <Text style={styles.resultText} numberOfLines={2}>
        {match.result}
      </Text>
    ) : null}
  </TouchableOpacity>
);

/*
|--------------------------------------------------------------------------
| MatchesTab
|--------------------------------------------------------------------------
|
| Three sections: Live → Upcoming → Recent (completed).
| All data from real API — no mock data.
| useFocusEffect ensures data is fresh whenever the tab is visited.
|
*/
export default function MatchesTab() {
  const navigation = useNavigation();

  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      const [live, upcoming, recent] = await Promise.all([
        getLiveMatchesApi(),
        getUpcomingMatchesApi(),
        getRecentMatchesApi(10),
      ]);

      setLiveMatches(Array.isArray(live) ? live : []);
      setUpcomingMatches(Array.isArray(upcoming) ? upcoming : []);
      setRecentMatches(Array.isArray(recent) ? recent : []);
    } catch (err) {
      console.error("[MatchesTab] load failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const handleMatchPress = (matchId, status) => {
    if (status === "completed") {
      navigation.navigate("Matches", {
        screen: "QuickScoreFlow",
        params: { screen: "ScorecardScreen", params: { matchId } },
      });
    } else {
      navigation.navigate("Matches", {
        screen: "QuickScoreFlow",
        params: { screen: "MatchCenterScreen", params: { matchId } },
      });
    }
  };

  const handleLivePress = (matchId) => handleMatchPress(matchId, "live");

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const hasAnyMatch =
    liveMatches.length > 0 ||
    upcomingMatches.length > 0 ||
    recentMatches.length > 0;

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {!hasAnyMatch && (
        <View style={styles.noMatchesContainer}>
          <Text style={styles.noMatchesIcon}>🏏</Text>
          <Text style={styles.noMatchesTitle}>No Matches Yet</Text>
          <Text style={styles.noMatchesSubtitle}>
            Create a match or accept a challenge to get started.
          </Text>
        </View>
      )}

      {/* ── Live ──────────────────────────────────────────────── */}
      {(liveMatches.length > 0 || hasAnyMatch) && (
        <SectionHeader title="Live Matches" badge badgeColor={COLORS.error} />
      )}

      {liveMatches.length === 0
        ? hasAnyMatch && <EmptyCard message="No live matches right now" />
        : liveMatches.map((m) => (
            <LiveMatchCard key={m._id} match={m} onPress={handleLivePress} />
          ))}

      {/* ── Upcoming ──────────────────────────────────────────── */}
      {hasAnyMatch && <SectionHeader title="Upcoming Matches" />}

      {upcomingMatches.length === 0
        ? hasAnyMatch && <EmptyCard message="No upcoming matches scheduled" />
        : upcomingMatches.map((m) => (
            <UpcomingMatchCard
              key={m._id}
              match={m}
              onPress={handleMatchPress}
            />
          ))}

      {/* ── Recent ────────────────────────────────────────────── */}
      {hasAnyMatch && <SectionHeader title="Recent Results" />}

      {recentMatches.length === 0
        ? hasAnyMatch && <EmptyCard message="No completed matches yet" />
        : recentMatches.map((m) => (
            <RecentMatchCard key={m._id} match={m} onPress={handleMatchPress} />
          ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },

  // ── Section ──────────────────────────────────────────────────────────

  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontStyle: "italic",
  },

  // ── No Matches ────────────────────────────────────────────────────────

  noMatchesContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },

  noMatchesIcon: {
    fontSize: 56,
    marginBottom: 16,
  },

  noMatchesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 8,
  },

  noMatchesSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Live Card ─────────────────────────────────────────────────────────

  liveCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.error + "40",
    borderTopWidth: 4,
    borderTopColor: COLORS.error,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  liveCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "18",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },

  livePillText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.error,
    letterSpacing: 0.5,
  },

  matchType: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  // ── Upcoming Card ─────────────────────────────────────────────────────

  upcomingCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    elevation: 1,
  },

  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  upcomingDate: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  upcomingTypePill: {
    backgroundColor: COLORS.primary + "15",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  upcomingTypeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },

  pendingBanner: {
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },

  pendingBannerText: {
    fontSize: 12,
    color: "#ef6c00",
    fontWeight: "600",
  },

  // ── Recent Card ───────────────────────────────────────────────────────

  recentCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  recentDate: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
  },

  completedPill: {
    backgroundColor: COLORS.primary + "15",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  completedPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },

  resultText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  // ── Shared ────────────────────────────────────────────────────────────

  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  teamName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
    flex: 1,
  },

  winnerText: {
    color: "#2e7d32",
  },

  vsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    paddingHorizontal: 10,
  },

  venueText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 6,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
    gap: 8,
  },

  liveScore: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
  },

  liveOvers: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
  },

  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
