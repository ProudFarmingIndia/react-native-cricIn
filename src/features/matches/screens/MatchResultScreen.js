import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import {
  getMatchByIdApi,
  getMatchSummaryApi,
  completeMatchApi,
} from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Match Result Screen
|--------------------------------------------------------------------------
|
| Expects via route.params: matchId only.
|
| FIX — team-score mapping bug:
| The original render always showed teamA with firstInnings and teamB
| with secondInnings regardless of the toss. If teamB batted first the
| scores were displayed against the wrong team names.
|
| Fix: derive firstTeamData / secondTeamData from the toss inside the
| useEffect and store them in state, then use them in the render instead
| of the hardcoded match.teamA / match.teamB.
|
| FIX — unnecessary API call on revisit:
| updateMatchResultApi is now skipped when the match is already
| completed so revisiting this screen doesn't hit the backend guard
| with an avoidable error.
*/

export default function MatchResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { matchId } = route.params || {};

  const [match, setMatch] = useState(null);
  const [innings, setInnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultText, setResultText] = useState("");

  // Shown when the result could not be saved - see the load effect.
  const [resultError, setResultError] = useState(null);

  /*
   * FIX: store which team batted in which innings so the render can
   * pair team names with their correct scores.
   */
  const [firstTeamData, setFirstTeamData] = useState(null);
  const [secondTeamData, setSecondTeamData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const matchData = await getMatchByIdApi(matchId);
        const summary = await getMatchSummaryApi(matchId);

        setMatch(matchData);
        setInnings(summary);

        /*
        |----------------------------------------------------------------------
        | Derive Which Team Batted In Which Innings (from Toss)
        |----------------------------------------------------------------------
        |
        | tossWinner + tossDecision tells us who opened the batting:
        |   "Bat"  → tossWinner batted first
        |   "Bowl" → tossWinner bowled first (so the other team batted first)
        */

        const tossWinnerId =
          matchData.tossWinner?._id || matchData.tossWinner;

        const teamAId = matchData.teamA._id;
        const teamBId = matchData.teamB._id;

        const firstBattingTeamId =
          matchData.tossDecision === "Bat"
            ? tossWinnerId
            : [teamAId, teamBId].find((id) => String(id) !== String(tossWinnerId));

        const secondBattingTeamId = [teamAId, teamBId].find(
          (id) => String(id) !== String(firstBattingTeamId),
        );

        const resolvedFirstTeam =
          String(firstBattingTeamId) === String(teamAId)
            ? matchData.teamA
            : matchData.teamB;

        const resolvedSecondTeam =
          String(secondBattingTeamId) === String(teamAId)
            ? matchData.teamA
            : matchData.teamB;

        setFirstTeamData(resolvedFirstTeam);
        setSecondTeamData(resolvedSecondTeam);

        const firstInnings = summary.find((i) => i.inningsNumber === 1);
        const secondInnings = summary.find((i) => i.inningsNumber === 2);

        if (!firstInnings || !secondInnings) {
          setLoading(false);
          return;
        }

        /*
        |----------------------------------------------------------------------
        | The Result Comes From The Server
        |----------------------------------------------------------------------
        |
        | This screen used to work the result out itself and write it back,
        | and that arrangement had four separate holes:
        |
        |   A TIE WAS NEVER SAVED. The write was guarded on having a winner,
        |   so a tied match printed "Match tied" and stayed `live` forever -
        |   never reaching Recent, never leaving the live feed.
        |
        |   THE MARGIN ASSUMED ELEVEN A SIDE. `10 - wickets` reported the
        |   wrong margin in any smaller match, and that text was fanned out
        |   to every follower.
        |
        |   A TRANSFERRED SCORER COULD NOT SAVE IT. updateMatchResult
        |   authorises on captaincy, but scoring can be handed to any squad
        |   player - their write came back 400 and the catch only logged it,
        |   so the screen showed a result that had not been recorded.
        |
        |   CLOSING THE APP ON THE WINNING RUN LOST IT, because this screen
        |   was the only writer and had not been reached.
        |
        | The server now finalises the match when the second innings ends
        | (finalizeMatchFromInnings), so this screen reads what was recorded
        | instead of deciding it.
        */

        if (matchData.result) {
          setResultText(matchData.result);
          setLoading(false);
          return;
        }

        /*
        | No stored result: an older match, or the finalise call failed.
        | Ask the server to complete it, then show what it decided - rather
        | than printing a verdict of our own that nothing has saved.
        */

        try {
          const completed = await completeMatchApi(matchId);

          setResultText(
            completed?.result ||
              (secondInnings.runs === firstInnings.runs
                ? "Match tied"
                : "Result recorded"),
          );
        } catch (completionError) {
          /*
          | Surfaced, not swallowed. The scorer needs to know the result is
          | not saved - previously this failed silently behind a result that
          | looked official.
          */
          setResultError(
            completionError.response?.data?.message ||
              "The result could not be saved. Reopen this match to try again.",
          );

          setResultText(
            secondInnings.runs === firstInnings.runs
              ? "Match tied"
              : secondInnings.runs > firstInnings.runs
                ? `${resolvedSecondTeam?.teamName || "The chasing side"} won`
                : `${resolvedFirstTeam?.teamName || "The defending side"} won`,
          );
        }
      } catch (error) {
        console.error("Failed to load match result:", error);

        setResultError(
          error.response?.data?.message || "Could not load the match result.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (matchId) load();
  }, [matchId]);

  if (loading || !match) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const firstInnings = innings.find((i) => i.inningsNumber === 1);
  const secondInnings = innings.find((i) => i.inningsNumber === 2);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.conclusionCard}>
          <Text style={styles.conclusionLabel}>MATCH CONCLUSION</Text>
          <Text style={styles.conclusionText}>
            {resultText || "Loading result…"}
          </Text>

          {!!resultError && (
            <Text style={styles.resultErrorText}>{resultError}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Match Summary</Text>

          {/*
           * FIX: Use firstTeamData / secondTeamData (derived from toss) instead
           * of hardcoded match.teamA / match.teamB so the correct team name
           * is always shown alongside its innings score.
           */}

          <View style={styles.summaryRow}>
            <Text style={styles.teamNameText}>
              {firstTeamData?.teamName ?? match.teamA?.teamName}
            </Text>
            <Text style={styles.scoreText}>
              {firstInnings
                ? `${firstInnings.runs}/${firstInnings.wickets} (${firstInnings.overs})`
                : "-"}
            </Text>
          </View>

          <Text style={styles.vsText}>vs</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.teamNameText}>
              {secondTeamData?.teamName ?? match.teamB?.teamName}
            </Text>
            <Text style={styles.scoreText}>
              {secondInnings
                ? `${secondInnings.runs}/${secondInnings.wickets} (${secondInnings.overs})`
                : "-"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {/*
        |------------------------------------------------------------------
        | View Scorecard -> MatchDetailsScreen, on its Scorecard tab
        |------------------------------------------------------------------
        |
        | This used to open ScorecardScreen, a standalone screen showing one
        | innings and nothing else - no bowling figures alongside it, no
        | fall of wickets, no over-by-over, no way to reach the other
        | innings, and no Player of the Match.
        |
        | MatchDetailsScreen is where the real scorecard lives: six tabs
        | over the same match, both innings, and the award card at the top
        | of Live. It already accepts `initialTab`, so it opens directly on
        | the scorecard rather than on Info.
        |
        | This is the same route LiveScoringScreen's header uses for its own
        | scorecard link, so the scorer and a spectator now land on exactly
        | the same screen from both places.
        */}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate("MatchDetailsScreen", {
              matchId,
              initialTab: "Scorecard",
            })
          }
        >
          <Text style={styles.secondaryButtonText}>View Scorecard</Text>
        </TouchableOpacity>

        {/*
        |------------------------------------------------------------------
        | Back To Matches -> the Matches tab, on its own list screen
        |------------------------------------------------------------------
        |
        | This used to open MatchCenterScreen, which pushed ANOTHER screen
        | on top of the scoring flow. The match is finished at this point -
        | the scorer wants out of the flow, not deeper into it. Every screen
        | behind this one (the pad, the innings summaries, the toss) was
        | still sitting in the stack underneath, and none of them is safe to
        | return to once the match is complete.
        |
        | WHY THE NESTED SHAPE, AND NOT navigate("MatchesScreen")
        |
        | "MatchesScreen" is registered in MatchesStackNavigator, which is
        | the Matches TAB of MainNavigator, which is the "MainTabs" route of
        | RootNavigator. This screen lives in QuickScoreStackNavigator - a
        | sibling root route ("QuickScoreFlow"). A navigator only resolves
        | route names it can see, so a bare
        | navigation.navigate("MatchesScreen") throws
        | "not handled by any navigator" - the name is not in this stack, nor
        | in the root stack above it.
        |
        | Naming each level walks down to it: MainTabs -> Matches tab ->
        | MatchesScreen.
        |
        | (Note that "MatchListScreen" is the FUNCTION name exported from
        | features/matches/screens/MatchesScreen.js, not a route name.
        | Navigation resolves the name given to <Stack.Screen>, which is
        | "MatchesScreen".)
        |
        | WHY THIS ALSO CLOSES THE FLOW
        |
        | MainTabs sits BELOW QuickScoreFlow in the root stack, so navigating
        | to it pops the whole scoring flow rather than pushing over it. The
        | finished match is left behind properly, and the back gesture from
        | the Matches list can no longer walk back into a dead scoring pad.
        */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate("MainTabs", {
              screen: "Matches",
              params: { screen: "MatchesScreen" },
            })
          }
        >
          <Text style={styles.primaryButtonText}>Back To Matches</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  conclusionCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  conclusionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onPrimary,
    letterSpacing: 0.5,
    opacity: 0.85,
  },

  conclusionText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onPrimary,
    marginTop: 8,
  },

  resultErrorText: {
    marginTop: 10,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.error,
    textAlign: "center",
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  teamNameText: {
    fontWeight: "600",
    color: COLORS.onSurface,
    flex: 1,
  },

  scoreText: {
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  vsText: {
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },

  footer: {
    padding: 16,
    gap: 10,
  },

  primaryButton: {
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: COLORS.onSecondaryContainer,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },
});