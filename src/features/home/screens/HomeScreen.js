import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";

import { getProfile } from "../../profile/store/profileSlice";
import { getProfileCompletion } from "../../../utils/profileCompletion";

import {
  getLiveMatchesApi,
  getUpcomingMatchesApi,
  getRecentMatchesApi,
} from "../../matches/services/matches.services";

import TeamBadge from "../../../components/matches/TeamBadge";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/
const formatMatchDate = (dateStr) => {
  if (!dateStr) return "Date TBD";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatMatchTime = (dateStr) => {
  if (!dateStr) return "Time TBD";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Time TBD";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/*
|--------------------------------------------------------------------------
| HomeScreen
|--------------------------------------------------------------------------
|
| "Your Matches" section:
|   1. Live matches — with current innings score
|   2. Upcoming matches — horizontal slider showing ALL upcoming matches,
|      each card with match number, name, teams, date + time + PIN row
|
*/
export default function HomeScreen() {
  const navigation = useNavigation();

  const dispatch = useDispatch();

  /*
  |--------------------------------------------------------------------------
  | Profile Completion
  |--------------------------------------------------------------------------
  |
  | HomeScreen had no redux wiring at all, which is why the status card was
  | hardcoded. The profile is refetched on focus alongside the matches, so
  | the bar reflects an edit the moment the user comes back from
  | EditProfileScreen.
  |
  */

  const profile = useSelector((state) => state.profile?.profile);

  const completion = getProfileCompletion(profile);

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

        /*
        | Capped at 5: Home is a launchpad, not an archive. The full list
        | lives on the Matches tab, which is what "VIEW ALL" opens.
        */
        getRecentMatchesApi(5),
      ]);

      setLiveMatches(Array.isArray(live) ? live : []);
      setUpcomingMatches(Array.isArray(upcoming) ? upcoming : []); // all upcoming, no cap
      setRecentMatches(Array.isArray(recent) ? recent : []);
    } catch (err) {
      console.error("[HomeScreen] Failed to load matches:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      dispatch(getProfile());
    }, [load, dispatch]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    load(true);
    dispatch(getProfile());
  };

  const openLiveMatch = (match) => {
    const inn = match.currentInnings;

    /*
    | QuickScoreFlow moved from the Matches tab up to RootNavigator, so it
    | is addressed directly instead of through the tab. Going via the tab
    | is what pushed the flow onto the Matches stack and left "Matches"
    | showing Quick Score afterwards.
    */

    navigation.navigate("QuickScoreFlow", {
      screen: "LiveScoringScreen",
      params: {
        matchId: match._id,
        inningsId: inn?.inningsId,
        battingSquad: inn?.battingSquad || [],
        bowlingSquad: inn?.bowlingSquad || [],
        target: inn?.target,
      },
    });
  };

  const openUpcomingMatch = (matchId) => {
    navigation.navigate("QuickScoreFlow", {
      screen: "MatchDetailsScreen",
      params: { matchId },
    });
  };

  const totalAttention =
    liveMatches.length +
    upcomingMatches.filter((m) => m.confirmationStatus === "pending").length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <ScrollView
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
        {/* ── Profile Status ──────────────────────────────────── */}
        {/*
          Percentage, headline, bar width and description are all derived
          from the real profile now. This card used to be four hardcoded
          values - "Almost there, Champ!" and 75%, in the text AND in
          progressFill's stylesheet width - so it said the same thing on a
          brand-new empty profile as on a finished one.

          Hidden entirely once the profile is complete: a permanent 100%
          bar is just noise on the home screen.
        */}
        {!completion.isComplete && (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("Profile", { screen: "EditProfileScreen" })
            }
          >
            <View style={styles.profileTop}>
              <View style={styles.profileHeadingBlock}>
                <Text style={styles.sectionLabel}>PROFILE STATUS</Text>
                <Text style={styles.title}>{completion.headline}</Text>
              </View>

              <Text style={styles.progressText}>{completion.percent}%</Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completion.percent}%` },
                ]}
              />
            </View>

            <Text style={styles.description}>
              {completion.missing.length > 0
                ? `Next: ${completion.missing[0].label}. ${completion.missing.length} ${
                    completion.missing.length === 1 ? "item" : "items"
                  } left.`
                : "Complete your profile to unlock advanced scout analytics."}
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Your Matches Header ──────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Matches</Text>

          {totalAttention > 0 && (
            <View style={styles.attentionBadge}>
              <View style={styles.attentionDot} />
              <Text style={styles.attentionText}>{totalAttention} ACTIVE</Text>
            </View>
          )}
        </View>

        {/* ── Live Matches ─────────────────────────────────────── */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loadingIndicator}
          />
        ) : liveMatches.length > 0 ? (
          <>
            <View style={styles.subsectionHeader}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>LIVE NOW</Text>
              </View>
            </View>

            {liveMatches.map((match) => {
              const inn = match.currentInnings;

                /*
                | Teams are STACKED, not "A vs B" on one line.
                |
                | Side-by-side forced both names to share the width, so
                | anything long truncated - "Ajay choudha..." - and the
                | score had to float between them belonging to neither.
                | Stacked gives each name the full row, puts the score
                | against the team actually batting, and is how every
                | cricket app shows a live game.
                */

                const battingId = String(inn?.battingTeamId || "");

                const isTeamABatting =
                  !!battingId && String(match.teamA?._id) === battingId;

                const isTeamBBatting =
                  !!battingId && String(match.teamB?._id) === battingId;

                return (
                  <TouchableOpacity
                    key={match._id}
                    style={[styles.card, styles.liveCard]}
                    onPress={() => openLiveMatch(match)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.chipGroup}>
                        <View style={styles.formatChip}>
                          <Text style={styles.formatChipText}>
                            {match.matchType}
                          </Text>
                        </View>

                        {!!inn?.inningsNumber && (
                          <View style={styles.inningsChip}>
                            <Text style={styles.inningsChipText}>
                              {inningsLabel(inn.inningsNumber)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {!!inn && (
                        <Text style={styles.rrText}>RR {inn.runRate}</Text>
                      )}
                    </View>

                    {/* Team A */}
                    <View style={styles.sideRow}>
                      <TeamBadge team={match.teamA} size={38} />

                      <Text
                        style={[
                          styles.sideName,
                          isTeamABatting && styles.sideNameBatting,
                        ]}
                        numberOfLines={1}
                      >
                        {match.teamA?.teamName ?? "Team A"}
                      </Text>

                      {isTeamABatting && inn ? (
                        <View style={styles.sideScoreWrap}>
                          <Text style={styles.sideScore}>
                            {inn.runs}/{inn.wickets}
                          </Text>

                          <Text style={styles.sideOvers}>
                            {inn.overs} ov · RR {inn.runRate}
                          </Text>
                        </View>
                      ) : isTeamBBatting && inn?.inningsNumber === 1 ? (
                        /*
                        | Only meaningful in the first innings. In the
                        | second, the other side has already batted - they
                        | are not "yet to bat", they are defending.
                        */
                        <Text style={styles.sideYetToBat}>Yet to bat</Text>
                      ) : null}
                    </View>

                    {/* Team B */}
                    <View style={styles.sideRow}>
                      <TeamBadge team={match.teamB} size={38} />

                      <Text
                        style={[
                          styles.sideName,
                          isTeamBBatting && styles.sideNameBatting,
                        ]}
                        numberOfLines={1}
                      >
                        {match.teamB?.teamName ?? "Team B"}
                      </Text>

                      {isTeamBBatting && inn ? (
                        <View style={styles.sideScoreWrap}>
                          <Text style={styles.sideScore}>
                            {inn.runs}/{inn.wickets}
                          </Text>

                          <Text style={styles.sideOvers}>
                            {inn.overs} ov · RR {inn.runRate}
                          </Text>
                        </View>
                      ) : isTeamABatting && inn?.inningsNumber === 1 ? (
                        <Text style={styles.sideYetToBat}>Yet to bat</Text>
                      ) : null}
                    </View>

                    {/*
                    | A live match with no innings yet is a real state - the
                    | toss is done and scoring has not started. Saying so is
                    | better than a card that looks broken, which is what
                    | the second card in the list was doing.
                    */}
                    {/*
                    | Fallback when there IS a score but we cannot tell
                    | whose it is - an older backend that does not send
                    | battingTeamId yet.
                    |
                    | The first version of this card hid the score entirely
                    | in that case, which is the wrong failure: an unknown
                    | side is a reason to show the score unattributed, not
                    | to drop the most important number on the card.
                    */}
                    {!!inn && !isTeamABatting && !isTeamBBatting && (
                      <View style={styles.neutralScoreRow}>
                        <Text style={styles.sideScore}>
                          {inn.runs}/{inn.wickets}
                        </Text>

                        <Text style={styles.neutralOvers}>
                          ({inn.overs} ov) · RR {inn.runRate}
                        </Text>
                      </View>
                    )}

                    {!inn && (
                      <Text style={styles.awaitingText}>
                        Waiting for the first ball
                      </Text>
                    )}

                    {!!inn?.target && (
                      <Text style={styles.targetText}>
                        Needs {Math.max(0, inn.target - inn.runs)} more to win
                      </Text>
                    )}

                    <View style={styles.primaryButton}>
                      <Text style={styles.primaryButtonText}>SCORE NOW →</Text>
                    </View>
                  </TouchableOpacity>
                );
            })}
          </>
        ) : null}

        {/* ── Upcoming Matches (horizontal slider) ─────────────── */}
        {!loading && upcomingMatches.length > 0 && (
          <>
            <View style={styles.subsectionHeader}>
              <Text style={styles.subsectionLabel}>UPCOMING</Text>

              <TouchableOpacity onPress={() => navigation.navigate("Matches")}>
                <Text style={styles.seeAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingSlider}
            >
              {upcomingMatches.map((match, index) => (
                <TouchableOpacity
                  key={match._id}
                  style={[styles.upcomingCard, styles.card]}
                  onPress={() => openUpcomingMatch(match._id)}
                >
                  {/* Match number + type */}
                  <View style={styles.upcomingTop}>
                    <View style={styles.matchNumberBadge}>
                      <Text style={styles.matchNumberText}>
                        MATCH {index + 1}
                      </Text>
                    </View>

                    <Text style={styles.matchTypeLabel}>{match.matchType}</Text>
                  </View>

                  {match.matchTitle ? (
                    <Text style={styles.matchName} numberOfLines={1}>
                      {match.matchTitle}
                    </Text>
                  ) : null}

                  {/* Stacked, same reasoning as the live card. */}
                  <View style={styles.sideRow}>
                    <TeamBadge team={match.teamA} size={34} />

                    <Text style={styles.sideName} numberOfLines={1}>
                      {match.teamA?.teamName ?? "Team A"}
                    </Text>
                  </View>

                  <View style={styles.sideRow}>
                    <TeamBadge team={match.teamB} size={34} />

                    <Text style={styles.sideName} numberOfLines={1}>
                      {match.teamB?.teamName ?? "Team B"}
                    </Text>
                  </View>

                  {/* Date + time + PIN */}
                  <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeItem}>
                      <MaterialIcons
                        name="event"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text style={styles.dateTimeText}>
                        {formatMatchDate(
                          match.scheduledStartTime || match.startTime,
                        )}
                      </Text>
                    </View>

                    <View style={styles.dateTimeItem}>
                      <MaterialIcons
                        name="schedule"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text style={styles.dateTimeText}>
                        {formatMatchTime(
                          match.scheduledStartTime || match.startTime,
                        )}
                      </Text>
                    </View>
                  </View>

                  {match.canManage && match.matchPin ? (
                    <View style={styles.pinChip}>
                      <MaterialIcons
                        name="lock"
                        size={14}
                        color={COLORS.secondary}
                      />
                      <Text style={styles.pinChipText}>
                        PIN {match.matchPin}
                      </Text>
                    </View>
                  ) : null}

                  {match.venueName ? (
                    <View style={styles.dateTimeItem}>
                      <MaterialIcons
                        name="place"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text style={styles.dateTimeText} numberOfLines={1}>
                        {match.venueName}
                      </Text>
                    </View>
                  ) : null}

                  {match.confirmationStatus === "pending" && (
                    <View style={styles.pendingBanner}>
                      <Text style={styles.pendingText}>
                        ⏳ Awaiting confirmation
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Recent Results ───────────────────────────────────── */}
        {!loading && recentMatches.length > 0 && (
          <>
            <View style={styles.subsectionHeader}>
              <Text style={styles.subsectionLabel}>RECENT RESULTS</Text>

              <TouchableOpacity onPress={() => navigation.navigate("Matches")}>
                <Text style={styles.seeAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            {recentMatches.map((match) => {
              const winnerId = String(
                match.winnerTeam?._id || match.winnerTeam || "",
              );

              const teamAWon = !!winnerId && String(match.teamA?._id) === winnerId;

              const teamBWon = !!winnerId && String(match.teamB?._id) === winnerId;

              return (
                <TouchableOpacity
                  key={match._id}
                  style={[styles.card, styles.recentCard]}
                  onPress={() => openUpcomingMatch(match._id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.formatChip}>
                      <Text style={styles.formatChipText}>
                        {match.matchType}
                      </Text>
                    </View>

                    <Text style={styles.completedText}>COMPLETED</Text>
                  </View>

                  {/*
                  | The winner is marked with a tick and bolder text rather
                  | than left to be inferred from the result sentence -
                  | the result line is free text a captain typed, so it
                  | might say anything or nothing at all.
                  */}
                  <View style={styles.sideRow}>
                    <TeamBadge team={match.teamA} size={34} />

                    <Text
                      style={[
                        styles.sideName,
                        teamAWon && styles.sideNameWinner,
                      ]}
                      numberOfLines={1}
                    >
                      {match.teamA?.teamName ?? "Team A"}
                    </Text>

                    {teamAWon && (
                      <MaterialIcons
                        name="emoji-events"
                        size={17}
                        color={COLORS.secondary}
                      />
                    )}
                  </View>

                  <View style={styles.sideRow}>
                    <TeamBadge team={match.teamB} size={34} />

                    <Text
                      style={[
                        styles.sideName,
                        teamBWon && styles.sideNameWinner,
                      ]}
                      numberOfLines={1}
                    >
                      {match.teamB?.teamName ?? "Team B"}
                    </Text>

                    {teamBWon && (
                      <MaterialIcons
                        name="emoji-events"
                        size={17}
                        color={COLORS.secondary}
                      />
                    )}
                  </View>

                  <Text style={styles.resultText} numberOfLines={2}>
                    {match.result ||
                      (winnerId ? "Result recorded" : "No result recorded")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── Empty state if no matches at all ─────────────────── */}
        {!loading &&
          liveMatches.length === 0 &&
          upcomingMatches.length === 0 &&
          recentMatches.length === 0 && (
            <View style={[styles.card, styles.emptyMatchCard]}>
              <MaterialIcons
                name="sports-cricket"
                size={28}
                color={COLORS.outline}
              />
              <Text style={styles.emptyMatchText}>
                No active or upcoming matches.{"\n"}Create one or accept a
                challenge!
              </Text>
            </View>
          )}

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, styles.quickActionsTitle]}>
          Quick Actions
        </Text>

        <View style={styles.quickGrid}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("QuickScoreFlow")
            }
            style={styles.quickCard}
          >
            <View style={styles.quickIcon}>
              <MaterialIcons
                name="edit-note"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.quickText}>QUICK SCORE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("TeamStack", { screen: "CreateTeamScreen" })
            }
            style={styles.quickCard}
          >
            <View style={styles.quickIcon}>
              <MaterialIcons name="groups" size={22} color={COLORS.primary} />
            </View>

            <Text style={styles.quickText}>CREATE TEAM</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/*
| "1st Innings" / "2nd Innings". Spelled out rather than shown as a bare
| number, because "2" next to a score reads as part of the score.
*/

const inningsLabel = (n) => {
  if (n === 1) return "1st Innings";
  if (n === 2) return "2nd Innings";
  return n ? `Innings ${n}` : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  loadingIndicator: {
    marginBottom: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  profileTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "700",
    letterSpacing: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 4,
  },

  progressText: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primary,
  },

  progressBar: {
    height: 10,
    backgroundColor: "#e8ece4",
    borderRadius: 50,
    marginTop: 18,
    overflow: "hidden",
  },

  progressFill: {
    // width is applied inline from the computed percentage
    height: "100%",
    backgroundColor: COLORS.primary,
  },

  profileHeadingBlock: {
    flex: 1,
    paddingRight: 12,
  },

  description: {
    marginTop: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },

  // ── Section headers ───────────────────────────────────────────────────

  sectionHeader: {
    marginTop: 22,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  quickActionsTitle: {
    marginTop: 22,
    marginHorizontal: 16,
  },

  attentionBadge: {
    flexDirection: "row",
    alignItems: "center",
  },

  attentionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: 5,
  },

  attentionText: {
    color: COLORS.error,
    fontWeight: "700",
    fontSize: 11,
  },

  subsectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },

  subsectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },

  seeAll: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 11,
  },

  // ── Live ──────────────────────────────────────────────────────────────

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "18",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
    alignSelf: "flex-start",
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

  liveCard: {
    borderTopWidth: 4,
    borderTopColor: COLORS.error,
  },

  recentCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.outline,
  },

  /*
  |--------------------------------------------------------------------------
  | Stacked Match Rows
  |--------------------------------------------------------------------------
  |
  | One row per team: badge, name, then the number that belongs to that
  | team. Replaces the old single "A vs B" line, where two names competed
  | for one row's width and long ones truncated.
  |
  */

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  formatChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: COLORS.surfaceContainer,
  },

  formatChipText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: COLORS.primary,
  },

  rrText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  completedText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: COLORS.outline,
  },

  sideRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  sideName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14.5,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  // The batting side is the one the eye should land on first.
  sideNameBatting: {
    fontWeight: "800",
    color: COLORS.primary,
  },

  sideNameWinner: {
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  sideScoreWrap: {
    alignItems: "flex-end",
  },

  sideScore: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.primary,
  },

  sideOvers: {
    fontSize: 10.5,
    color: COLORS.onSurfaceVariant,
  },

  sideYetToBat: {
    fontSize: 11,
    fontStyle: "italic",
    color: COLORS.outline,
  },

  chipGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  inningsChip: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: COLORS.primaryContainer,
  },

  inningsChipText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: COLORS.onPrimary,
  },

  neutralScoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },

  neutralOvers: {
    marginLeft: 8,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  awaitingText: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: "italic",
    color: COLORS.onSurfaceVariant,
  },

  targetText: {
    marginTop: 8,
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  resultText: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },

  // ── Upcoming (horizontal slider) ──────────────────────────────────────

  upcomingSlider: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 12,
  },

  upcomingCard: {
    width: 300,
    marginHorizontal: 0,
    marginTop: 0,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },

  upcomingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  matchNumberBadge: {
    backgroundColor: "#e8f0e8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  matchNumberText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  matchName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },

  matchTypeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },

  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
    flexWrap: "wrap",
  },

  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },

  dateTimeText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "600",
  },

  pinChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff8ef",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },

  pinChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.secondary,
    letterSpacing: 1,
  },

  pendingBanner: {
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },

  pendingText: {
    fontSize: 12,
    color: "#ef6c00",
    fontWeight: "600",
  },

  // ── Shared match card ─────────────────────────────────────────────────







  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",

    /*
    | Breathing room above the button. It previously sat flush against the
    | last team row, so the score and the tap target read as one block.
    */
    marginTop: 14,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Empty ─────────────────────────────────────────────────────────────

  emptyMatchCard: {
    alignItems: "center",
    paddingVertical: 24,
  },

  emptyMatchText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Quick Actions ─────────────────────────────────────────────────────

  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 14,
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#dff1df",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  quickText: {
    fontWeight: "700",
    color: COLORS.text,
    fontSize: 12,
  },
});
