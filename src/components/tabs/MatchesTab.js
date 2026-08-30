import React, { useCallback, useMemo, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import MatchCard from "../matches/MatchCard";

import {
  getLiveMatchesApi,
  getUpcomingMatchesApi,
  getRecentMatchesApi,
} from "../../features/matches/services/matches.services";

import { COLORS } from "../../constants/colors";

/*
|--------------------------------------------------------------------------
| Matches Tab
|--------------------------------------------------------------------------
|
| Live, upcoming and recent, all as vertical lists.
|
| WHY NO SLIDER
| Upcoming used to be a horizontal carousel. A horizontal strip inside a
| vertical scroll hides everything past the second card, fights the page
| scroll on touch, and cannot show more than a couple of fixtures at once -
| which is the wrong trade for the list you check most often.
|
| WHY ONE CARD COMPONENT
| These used to be three bespoke card layouts that had drifted from the
| Home screen's versions of the same three things. MatchCard is now shared,
| so a fixture looks identical wherever it appears and there is one place
| to change it.
|
*/

/*
| Soonest first. The API returns upcoming matches unordered, so a fixture
| three weeks out could sit above one starting this afternoon - the exact
| opposite of what an "Upcoming" list is for.
|
| Matches with no date at all sort last: they are real fixtures, so they
| should not vanish, but they cannot claim a place in a queue ordered by
| time.
*/

const byStartTimeAscending = (a, b) => {
  const at = new Date(a.scheduledStartTime || a.startTime || 0).getTime();

  const bt = new Date(b.scheduledStartTime || b.startTime || 0).getTime();

  const aValid = at > 0;

  const bValid = bt > 0;

  if (!aValid && !bValid) return 0;

  if (!aValid) return 1;

  if (!bValid) return -1;

  return at - bt;
};

// Most recent first - the opposite question to the one above.
const byEndTimeDescending = (a, b) => {
  const at = new Date(a.endTime || a.startTime || 0).getTime();

  const bt = new Date(b.endTime || b.startTime || 0).getTime();

  return bt - at;
};

const Section = ({ label, count, children }) => (
  <>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>

      {count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </View>

    {children}
  </>
);

export default function MatchesTab() {
  const navigation = useNavigation();

  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [live, upcoming, recent] = await Promise.all([
        getLiveMatchesApi(),
        getUpcomingMatchesApi(),
        getRecentMatchesApi(20),
      ]);

      setLiveMatches(Array.isArray(live) ? live : []);
      setUpcomingMatches(Array.isArray(upcoming) ? upcoming : []);
      setRecentMatches(Array.isArray(recent) ? recent : []);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Could not load matches.",
      );
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

  const sortedUpcoming = useMemo(
    () => [...upcomingMatches].sort(byStartTimeAscending),
    [upcomingMatches],
  );

  const sortedRecent = useMemo(
    () => [...recentMatches].sort(byEndTimeDescending),
    [recentMatches],
  );

  const openLive = (match) => {
    const inn = match.currentInnings;

    if (inn?.inningsId) {
      navigation.navigate("QuickScoreFlow", {
        screen: "LiveScoringScreen",
        params: {
          matchId: match._id,
          inningsId: inn.inningsId,
          battingSquad: inn.battingSquad || [],
          bowlingSquad: inn.bowlingSquad || [],
          target: inn.target,
        },
      });

      return;
    }

    openDetails(match);
  };

  const openDetails = (match) => {
    navigation.navigate("QuickScoreFlow", {
      screen: "MatchDetailsScreen",
      params: { matchId: match._id },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isEmpty =
    liveMatches.length === 0 &&
    sortedUpcoming.length === 0 &&
    sortedRecent.length === 0;

  return (
    <View style={styles.container}>
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
        {!!error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {liveMatches.length > 0 && (
          <Section label="LIVE NOW" count={liveMatches.length}>
            {liveMatches.map((m) => (
              <MatchCard
                key={m._id}
                match={m}
                variant="live"
                onPress={openLive}
              />
            ))}
          </Section>
        )}

        {sortedUpcoming.length > 0 && (
          <Section label="UPCOMING" count={sortedUpcoming.length}>
            {sortedUpcoming.map((m) => (
              <MatchCard
                key={m._id}
                match={m}
                variant="upcoming"
                onPress={openDetails}
              />
            ))}
          </Section>
        )}

        {sortedRecent.length > 0 && (
          <Section label="RECENT RESULTS" count={sortedRecent.length}>
            {sortedRecent.map((m) => (
              <MatchCard
                key={m._id}
                match={m}
                variant="recent"
                onPress={openDetails}
              />
            ))}
          </Section>
        )}

        {isEmpty && !error && (
          <View style={styles.stateBlock}>
            <View style={styles.stateIcon}>
              <Ionicons
                name="calendar-outline"
                size={26}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.stateTitle}>No matches yet</Text>

            <Text style={styles.stateText}>
              Matches you play or score appear here. Start one with Quick
              Score, or send a challenge to another team.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  centered: {
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: COLORS.onSurfaceVariant,
  },

  countBadge: {
    marginLeft: 8,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: "center",
  },

  countText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  errorCard: {
    backgroundColor: COLORS.errorContainer,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  errorText: {
    fontSize: 12.5,
    color: COLORS.onErrorContainer,
  },

  stateBlock: {
    alignItems: "center",
    marginTop: 56,
    paddingHorizontal: 24,
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
});
