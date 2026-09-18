import React, { useCallback, useMemo, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import MatchCard from "../matches/MatchCard";

import {
  getLiveMatchesApi,
  getUpcomingMatchesApi,
  getRecentMatchesApi,
} from "../../features/matches/services/matches.services";

import { getLiveStreamingFeedApi } from "../../features/liveStream/services/liveStream.service";

import LiveStreamCard from "../../features/liveStream/components/LiveStreamCard";

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

/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
|
| "All" keeps the original behaviour - Live, Upcoming and Recent stacked
| in one scroll - so nothing anyone is used to has moved. The other four
| are shortcuts into it.
|
| STREAMING IS NOT A FILTER ON THE SAME DATA. The other three feeds are
| personal: the server builds them from teams this user manages or plays
| for. The streaming feed is public - the whole point of a broadcast is
| that people in neither squad watch it - so it comes from a different
| endpoint and renders a different card.
|
| Values are also accepted as a route param (`initialCategory`), which is
| how the sidebar's "Live Now" and "Upcoming" items land here.
|
*/

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "live", label: "Live Now" },
  { key: "streaming", label: "Live Streaming" },
  { key: "upcoming", label: "Upcoming" },
  { key: "recent", label: "Results" },
];

export default function MatchesTab() {
  const navigation = useNavigation();

  const route = useRoute();

  const { initialCategory } = route.params || {};

  const [category, setCategory] = useState(
    CATEGORIES.some((c) => c.key === initialCategory) ? initialCategory : "all",
  );

  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [streamingMatches, setStreamingMatches] = useState([]);
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
      /*
      | allSettled, not all.
      |
      | The streaming feed is the newest endpoint here and the one most
      | likely to be missing on a backend that has not been redeployed
      | yet. With Promise.all, that single 404 would empty the entire
      | Matches tab - live scores included - which is a catastrophic
      | failure mode for one optional section.
      */

      const [live, upcoming, recent, streaming] = await Promise.allSettled([
        getLiveMatchesApi(),
        getUpcomingMatchesApi(),
        getRecentMatchesApi(20),
        getLiveStreamingFeedApi(),
      ]);

      const value = (settled) =>
        settled.status === "fulfilled" && Array.isArray(settled.value)
          ? settled.value
          : [];

      setLiveMatches(value(live));
      setUpcomingMatches(value(upcoming));
      setRecentMatches(value(recent));
      setStreamingMatches(value(streaming));

      if (
        live.status === "rejected" &&
        upcoming.status === "rejected" &&
        recent.status === "rejected"
      ) {
        setError("Could not load matches.");
      }
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

  /*
  | Only the match's scorer is sent to the scoring pad. Everyone else -
  | including the opposing captain - gets the match details screen.
  |
  | This used to route every viewer of a live match straight into the
  | scoring pad, where the server rejected their first ball with an error
  | they had no way to understand.
  */

  const openLive = (match) => {
    const inn = match.currentInnings;

    if (inn?.inningsId && match.isScorer) {
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

  /*
  | A streamed match opens the PLAYER, not the scorecard. Somebody
  | tapping a card with a LIVE badge and "WATCH LIVE" on it and landing
  | on a scorecard would reasonably think the video was broken.
  |
  | WatchLiveScreen is on RootNavigator - see the note there - so it is
  | addressed directly rather than through a tab's stack.
  */

  const openStream = (match) =>
    navigation.navigate("WatchLiveScreen", { matchId: match._id });

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const show = (key) => category === "all" || category === key;

  /*
  | Emptiness is judged against what the CURRENT category would render,
  | not against the whole dataset. Otherwise "Live Streaming" with nothing
  | on air shows a blank scroll while three finished matches sit in
  | memory, and the screen looks broken rather than quiet.
  */

  const isEmpty =
    (show("live") ? liveMatches.length : 0) +
      (show("streaming") ? streamingMatches.length : 0) +
      (show("upcoming") ? sortedUpcoming.length : 0) +
      (show("recent") ? sortedRecent.length : 0) ===
    0;

  return (
    <View style={styles.container}>
      {/* ── Categories ───────────────────────────────────────────── */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((item) => {
          const active = category === item.key;

          /*
          | The count is on the chip on purpose: "Live Streaming 2" is
          | worth a tap, "Live Streaming" with nothing behind it is a
          | wasted one.
          */

          const count =
            item.key === "live"
              ? liveMatches.length
              : item.key === "streaming"
                ? streamingMatches.length
                : item.key === "upcoming"
                  ? sortedUpcoming.length
                  : item.key === "recent"
                    ? sortedRecent.length
                    : 0;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.85}
              onPress={() => setCategory(item.key)}
            >
              {item.key === "streaming" && (
                <View
                  style={[
                    styles.chipDot,
                    streamingMatches.length > 0 && styles.chipDotLive,
                  ]}
                />
              )}

              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
              >
                {item.label}
                {count > 0 ? ` ${count}` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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

        {show("live") && liveMatches.length > 0 && (
          <Section label="LIVE NOW" count={liveMatches.length}>
            {liveMatches.map((m) => (
              <MatchCard
                key={m._id}
                match={m}
                variant="live"
                canScore={!!m.isScorer}
                onPress={openLive}
              />
            ))}
          </Section>
        )}

        {/* ── Live Streaming ─────────────────────────────────────── */}

        {show("streaming") && streamingMatches.length > 0 && (
          <Section label="LIVE STREAMING" count={streamingMatches.length}>
            {streamingMatches.map((m) => (
              <View key={m._id} style={styles.streamCardWrap}>
                <LiveStreamCard match={m} onPress={openStream} />
              </View>
            ))}
          </Section>
        )}

        {show("upcoming") && sortedUpcoming.length > 0 && (
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

        {show("recent") && sortedRecent.length > 0 && (
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
                name={
                  category === "streaming"
                    ? "videocam-off-outline"
                    : "calendar-outline"
                }
                size={26}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.stateTitle}>
              {category === "streaming"
                ? "Abhi koi match live nahi hai"
                : "No matches yet"}
            </Text>

            <Text style={styles.stateText}>
              {category === "streaming"
                ? "Jab kisi match par camera chalu hoga, wo yahan dikhega — chahe wo kisi bhi team ka ho."
                : "Matches you play or score appear here. Start one with Quick Score, or send a challenge to another team."}
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

  /* ── Category chips ──────────────────────────────────────────── */

  chipScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },

  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.outline,
  },

  chipDotLive: {
    backgroundColor: COLORS.error,
  },

  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  chipTextActive: {
    color: COLORS.onPrimary,
  },

  streamCardWrap: {
    marginBottom: 12,
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