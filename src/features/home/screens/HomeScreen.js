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

import {
  getLiveStreamingFeedApi,
  getMyBroadcastAssignmentsApi,
} from "../../liveStream/services/liveStream.service";

import LiveStreamCard from "../../liveStream/components/LiveStreamCard";

import TournamentCard from "../../tournaments/components/TournamentCard";

import { getTournamentsApi } from "../../tournaments/services/tournament.service";

import SeriesCard from "../../series/components/SeriesCard";

import { getSeriesListApi } from "../../series/services/series.service";

import TeamBadge from "../../../components/matches/TeamBadge";

import { COLORS } from "../../../constants/colors";

import { ANGLE_LABEL } from "../../liveStream/constants/streamConstants";

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

  /*
  | Two new lists, and they answer different questions.
  |
  | streamingMatches - "what can I watch right now", from ANY team. This
  | is the only list on Home that is not personal, and that is the point:
  | discovery is what makes streaming worth building.
  |
  | myAssignments - "somebody asked ME to film something". The person
  | invited is routinely in neither squad, so this match appears nowhere
  | else in their app. Without this card the invite notification is the
  | only route back to it, and notifications get swiped away.
  */

  const [streamingMatches, setStreamingMatches] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);

  /*
  | Running and upcoming tournaments, published by their organizers. Like
  | the streaming feed above, this is deliberately not filtered to the
  | user's own teams - a tournament is a public event, and the first one
  | on the app would otherwise be visible to nobody.
  */

  const [tournaments, setTournaments] = useState([]);

  /*
  | Running and upcoming series. Its own section rather than mixed in with
  | tournaments: the two are different things a user chooses between, and
  | a card that says "2-1" next to one that says "8 teams" in the same
  | strip reads as one broken list rather than two feeds.
  */

  const [seriesList, setSeriesList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      /*
      | allSettled rather than all.
      |
      | Home is the first screen after login. With Promise.all, one
      | failing endpoint - and the two streaming ones are the newest, so
      | the most likely to be missing against an older backend - takes
      | the entire home screen down to an empty state. Each list now
      | fails on its own.
      */

      const [
        live,
        upcoming,
        recent,
        streaming,
        assignments,
        running,
        soon,
        seriesLive,
        seriesSoon,
      ] = await Promise.allSettled([
          getLiveMatchesApi(),
          getUpcomingMatchesApi(),

          /*
          | Capped at 5: Home is a launchpad, not an archive. The full
          | list lives on the Matches tab, which is what "VIEW ALL" opens.
          */
          getRecentMatchesApi(5),

          getLiveStreamingFeedApi(10),
          getMyBroadcastAssignmentsApi(),

          /*
          | Two calls rather than one because the server's filters are
          | mutually exclusive and there is no "either" - and a running
          | tournament ranks above an upcoming one on Home, which one
          | merged list would not preserve.
          */
          getTournamentsApi("live"),
          getTournamentsApi("upcoming"),

          getSeriesListApi("live"),
          getSeriesListApi("upcoming"),
        ]);

      const value = (settled) =>
        settled.status === "fulfilled" && Array.isArray(settled.value)
          ? settled.value
          : [];

      setLiveMatches(value(live));
      setUpcomingMatches(value(upcoming)); // all upcoming, no cap
      setRecentMatches(value(recent));
      setStreamingMatches(value(streaming));
      setMyAssignments(value(assignments));

      /* Running first, then upcoming, capped - Home is a launchpad. */
      setTournaments([...value(running), ...value(soon)].slice(0, 6));

      /*
      | Deduplicated: the server's "live" filter includes scheduled series
      | and "upcoming" includes published ones, and a series can satisfy
      | both. Without this the same series appears twice in one strip.
      */
      setSeriesList(
        [...value(seriesLive), ...value(seriesSoon)]
          .filter(
            (s, i, arr) =>
              arr.findIndex((x) => String(x._id) === String(s._id)) === i,
          )
          .slice(0, 6),
      );
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
    | Only the scorer reaches the scoring pad. The opposing captain and
    | anyone following either team open the match instead - the card they
    | tapped says "VIEW MATCH", and this is what honours it.
    */

    if (!match.isScorer || !inn?.inningsId) {
      openUpcomingMatch(match._id);
      return;
    }

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

  /*
  |--------------------------------------------------------------------------
  | Live Streaming
  |--------------------------------------------------------------------------
  |
  | All three targets live on RootNavigator, so they are addressed
  | directly. Going via a tab is what pushed QuickScoreFlow onto the
  | Matches stack and left "Matches" showing the wrong screen - the same
  | mistake would happen here.
  |
  */

  const openStream = (match) =>
    navigation.navigate("WatchLiveScreen", { matchId: match._id });

  const openStreamingList = () =>
    navigation.navigate("LiveStreamingListScreen");

  const openTournament = (tournament) =>
    navigation.navigate("TournamentDetailScreen", {
      tournamentId: tournament._id,
    });

  const openTournamentList = () =>
    navigation.navigate("TournamentListScreen");

  const openSeries = (series) =>
    navigation.navigate("SeriesDetailScreen", { seriesId: series._id });

  const openSeriesList = () => navigation.navigate("SeriesListScreen");

  /*
  | A pending invite goes to the accept screen; an accepted one goes
  | straight to the stream key. Sending a pending invite to the setup
  | screen shows "can't get the key" - true, but it reads as a bug.
  */

  const openAssignment = (item) =>
    navigation.navigate(
      item.needsResponse || item.assignmentStatus === "pending"
        ? "BroadcastInviteScreen"
        : "BroadcastSetupScreen",
      { matchId: item.matchId, angle: item.angle },
    );

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

        {/* ── Your Camera Duty ─────────────────────────────────── */}

        {/*
        | Above everything, including your own matches.
        |
        | This is not news to read, it is a job somebody has given you
        | with a ground to get to - and if it is a pending invite, the
        | scorer is standing at that ground waiting for an answer. It is
        | also the only place in the whole app this match appears for a
        | person who is in neither squad.
        */}

        {!loading && myAssignments.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Camera Duty</Text>
            </View>

            {myAssignments.map((item) => {
              const pending =
                item.needsResponse || item.assignmentStatus === "pending";

              const fixture = item.match || {};

              return (
                <TouchableOpacity
                  key={`${item.matchId}-${item.angle}`}
                  style={[
                    styles.card,
                    styles.dutyCard,
                    pending && styles.dutyCardPending,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => openAssignment(item)}
                >
                  <View style={styles.dutyTop}>
                    <MaterialIcons
                      name={pending ? "mark-email-unread" : "videocam"}
                      size={16}
                      color={pending ? COLORS.secondary : COLORS.primary}
                    />

                    <Text
                      style={[
                        styles.dutyLabel,
                        pending && styles.dutyLabelPending,
                      ]}
                    >
                      {pending
                        ? "INVITE — NEEDS YOUR ANSWER"
                        : "YOU ARE FILMING"}
                    </Text>
                  </View>

                  <Text style={styles.dutyFixture} numberOfLines={2}>
                    {fixture.teamA?.teamName ||
                      fixture.title ||
                      "Untitled match"}
                    {fixture.teamB?.teamName
                      ? `  vs  ${fixture.teamB.teamName}`
                      : ""}
                  </Text>

                  <Text style={styles.dutyMeta}>
                    {ANGLE_LABEL[item.angle] || item.angle} camera
                    {fixture.venue ? ` · ${fixture.venue}` : ""}
                  </Text>

                  <View
                    style={[
                      styles.primaryButton,
                      !pending && styles.secondaryButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.primaryButtonText,
                        !pending && styles.secondaryButtonText,
                      ]}
                    >
                      {pending ? "OPEN INVITE →" : "OPEN SETUP →"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── Live Streaming ───────────────────────────────────── */}

        {/*
        | The one section on Home that is NOT about this user's own
        | matches. A stranger's game with a camera on it is the whole
        | reason streaming exists - gating this to followed teams would
        | mean the first person to stream a match has an audience of
        | nobody.
        */}

        {!loading && streamingMatches.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Streaming</Text>

              <TouchableOpacity onPress={openStreamingList}>
                <Text style={styles.seeAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingSlider}
            >
              {streamingMatches.map((m) => (
                <View key={m._id} style={styles.streamSlide}>
                  <LiveStreamCard match={m} onPress={openStream} />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Tournaments ──────────────────────────────────────── */}

        {/*
        | Sits above "Your Matches" on purpose. A tournament in progress
        | is the biggest thing happening on the app on any given weekend,
        | and it is also the one thing a user cannot find anywhere else on
        | this screen - their own matches already appear three times below.
        */}

        {!loading && tournaments.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tournaments</Text>

              <TouchableOpacity onPress={openTournamentList}>
                <Text style={styles.seeAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingSlider}
            >
              {tournaments.map((t) => (
                <View key={String(t._id)} style={styles.tournamentSlide}>
                  <TournamentCard
                    tournament={t}
                    compact
                    onPress={openTournament}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Series ───────────────────────────────────────────── */}

        {!loading && seriesList.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Series</Text>

              <TouchableOpacity onPress={openSeriesList}>
                <Text style={styles.seeAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingSlider}
            >
              {seriesList.map((s) => (
                <View key={String(s._id)} style={styles.tournamentSlide}>
                  <SeriesCard series={s} compact onPress={openSeries} />
                </View>
              ))}
            </ScrollView>
          </>
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

                /*
                | THE SIDE BEING CHASED.
                |
                | In the second innings the team that batted first rendered
                | nothing at all: not a score, not "Yet to bat" (correctly -
                | they had batted), just an empty slot beside their name. So
                | the card showed "Needs 342 more to win" with nothing on it
                | to say where 342 came from, and the side defending a total
                | looked like a side that had never been in.
                |
                | `firstInnings` comes from the server and is present for the
                | whole match, not only during the innings break. Shown only
                | once it is complete and only against the side that is NOT
                | currently batting - during the first innings that same
                | innings is already rendered live above, and printing it
                | twice would be worse than not printing it at all.
                */

                const firstInn = match.firstInnings;

                const firstBattingId = String(firstInn?.battingTeamId || "");

                const pastInningsFor = (teamId, teamIsBatting) =>
                  firstInn &&
                  firstInn.isCompleted &&
                  !teamIsBatting &&
                  !!teamId &&
                  String(teamId) === firstBattingId
                    ? firstInn
                    : null;

                const teamAPastInnings = pastInningsFor(
                  match.teamA?._id,
                  isTeamABatting,
                );

                const teamBPastInnings = pastInningsFor(
                  match.teamB?._id,
                  isTeamBBatting,
                );

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
                      ) : teamAPastInnings ? (
                        <View style={styles.sideScoreWrap}>
                          <Text style={styles.sidePastScore}>
                            {teamAPastInnings.runs}/{teamAPastInnings.wickets}
                          </Text>

                          <Text style={styles.sideOvers}>
                            {teamAPastInnings.overs} ov
                          </Text>
                        </View>
                      ) : isTeamBBatting && inn?.inningsNumber === 1 ? (
                        /*
                        | Only meaningful in the first innings. In the
                        | second, the other side has already batted - they
                        | are not "yet to bat", they are defending, and the
                        | branch above prints the total they are defending.
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
                      ) : teamBPastInnings ? (
                        <View style={styles.sideScoreWrap}>
                          <Text style={styles.sidePastScore}>
                            {teamBPastInnings.runs}/{teamBPastInnings.wickets}
                          </Text>

                          <Text style={styles.sideOvers}>
                            {teamBPastInnings.overs} ov
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

                    {/*
                    | Between innings there IS no active innings, so this
                    | said "Waiting for the first ball" on a match that was
                    | half over. The server already says which state it is.
                    */}
                    {!inn && (
                      <Text style={styles.awaitingText}>
                        {match.awaitingSecondInnings
                          ? "Innings break — second innings to come"
                          : "Waiting for the first ball"}
                      </Text>
                    )}

                    {!!inn?.target && (
                      <Text style={styles.targetText}>
                        Needs {Math.max(0, inn.target - inn.runs)} more to win
                      </Text>
                    )}

                    {/*
                    | Every live card used to show SCORE NOW, whoever was
                    | looking. isScorer comes from the server and names the
                    | one person actually recording this match.
                    */}
                    <View
                      style={[
                        styles.primaryButton,
                        !match.isScorer && styles.secondaryButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.primaryButtonText,
                          !match.isScorer && styles.secondaryButtonText,
                        ]}
                      >
                        {match.isScorer ? "SCORE NOW →" : "VIEW MATCH →"}
                      </Text>
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

              /*
              | THE SCORES.
              |
              | A finished card used to show two team names, a trophy beside
              | the winner and a line of free text - "won by 6 wickets" - and
              | no scores at all. The two totals are the first thing anyone
              | looks for on a completed match, and they were the one thing
              | missing.
              |
              | `inningsSummaries` carries every innings in order, so this
              | reads the same way the live card does: each side's score
              | against its own name.
              |
              | Matched by batting team rather than by innings number,
              | because which side batted first is a matter of the toss and
              | nothing here should assume it.
              */

              const summaries = match.inningsSummaries || [];

              const summaryFor = (teamId) =>
                summaries.find(
                  (i) =>
                    !!teamId && String(i.battingTeamId) === String(teamId),
                ) || null;

              const teamAInnings = summaryFor(match.teamA?._id);

              const teamBInnings = summaryFor(match.teamB?._id);

              const renderScore = (innings, won) =>
                innings ? (
                  <View style={styles.sideScoreWrap}>
                    <Text
                      style={[
                        styles.recentScore,
                        won && styles.recentScoreWinner,
                      ]}
                    >
                      {innings.runs}/{innings.wickets}
                    </Text>

                    <Text style={styles.sideOvers}>{innings.overs} ov</Text>
                  </View>
                ) : null;

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

                    {renderScore(teamAInnings, teamAWon)}
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

                    {renderScore(teamBInnings, teamBWon)}
                  </View>

                  {/*
                  | The award, when there is one. It is computed the moment
                  | the match completes, so on a finished card it is almost
                  | always there.
                  */}
                  {!!match.playerOfTheMatch?.playerName && (
                    <View style={styles.recentPotmRow}>
                      <MaterialIcons
                        name="emoji-events"
                        size={13}
                        color={COLORS.secondary}
                      />

                      <Text style={styles.recentPotmText} numberOfLines={1}>
                        {match.playerOfTheMatch.playerName}
                        {match.playerOfTheMatchStats
                          ? ` · ${match.playerOfTheMatchStats}`
                          : ""}
                      </Text>
                    </View>
                  )}

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

        {/*
        | Watch Live is a quick action rather than a permanent section,
        | because most of the time there is nothing streaming and a
        | section that is empty six days a week teaches people to scroll
        | past it. The section above appears only when there IS something;
        | this button is always there for the person who came looking.
        */}

        <View style={styles.quickGrid}>
          <TouchableOpacity
            onPress={openStreamingList}
            style={styles.quickCard}
          >
            <View style={styles.quickIcon}>
              <MaterialIcons
                name="live-tv"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.quickText}>WATCH LIVE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MainTabs", {
                screen: "Matches",
                params: {
                  screen: "MatchesScreen",
                  params: {
                    initialTab: "Matches",
                    initialCategory: "upcoming",
                  },
                },
              })
            }
            style={styles.quickCard}
          >
            <View style={styles.quickIcon}>
              <MaterialIcons
                name="event"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.quickText}>UPCOMING</Text>
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

  /*
  | A finished innings, printed at the same size as the live one so the two
  | sides line up, but in the muted colour - the score being chased is
  | context, and the score in progress is the news.
  */

  sidePastScore: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  /*
  | A finished score. Smaller than the live one - the match is over, so the
  | number is a record rather than news - and the winner's is the darker of
  | the two.
  */

  recentScore: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  recentScoreWinner: {
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  recentPotmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },

  recentPotmText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "600",
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

  /* ── Live streaming ───────────────────────────────────────────────── */

  streamSlide: {
    width: 300,
  },

  /* ── Tournaments ──────────────────────────────────────────────────── */

  tournamentSlide: {
    width: 300,
  },

  /* ── Camera duty ──────────────────────────────────────────────────── */

  dutyCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },

  dutyCardPending: {
    borderLeftColor: COLORS.secondaryContainer,
    backgroundColor: "#fffdf8",
  },

  dutyTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dutyLabel: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.primary,
  },

  dutyLabelPending: {
    color: COLORS.secondary,
  },

  dutyFixture: {
    marginTop: 9,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  dutyMeta: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
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

  // A watcher gets a quiet outline, not the filled call to action.
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  secondaryButtonText: {
    color: COLORS.onSurfaceVariant,
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