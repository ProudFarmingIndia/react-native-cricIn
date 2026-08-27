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
  updateMatchResultApi,
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
        | Determine Winner And Result String
        |----------------------------------------------------------------------
        */

        let winnerTeamId;
        let margin;

        if (secondInnings.runs > firstInnings.runs) {
          // Chasing team won
          winnerTeamId = resolvedSecondTeam._id;
          const wicketsInHand = 10 - secondInnings.wickets;
          margin = `${resolvedSecondTeam.teamName} won by ${wicketsInHand} wicket${wicketsInHand !== 1 ? "s" : ""}`;
        } else if (firstInnings.runs > secondInnings.runs) {
          // First-batting team won
          winnerTeamId = resolvedFirstTeam._id;
          const runMargin = firstInnings.runs - secondInnings.runs;
          margin = `${resolvedFirstTeam.teamName} won by ${runMargin} run${runMargin !== 1 ? "s" : ""}`;
        } else {
          margin = "Match tied";
        }

        setResultText(margin);

        /*
        |----------------------------------------------------------------------
        | Persist Result
        | Skipped if match is already completed (e.g. user revisits screen)
        | to avoid hitting the backend's must-be-live guard unnecessarily.
        |----------------------------------------------------------------------
        */

        if (winnerTeamId && matchData.status !== "completed") {
          await updateMatchResultApi(matchId, {
            winnerTeam: winnerTeamId,
            result: margin,
          });
        }
      } catch (error) {
        console.error("Failed to load match result:", error);
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
          <Text style={styles.conclusionText}>{resultText || "Loading result…"}</Text>
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
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate("ScorecardScreen", { matchId })
          }
        >
          <Text style={styles.secondaryButtonText}>View Scorecard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate("MatchCenterScreen", { matchId })
          }
        >
          <Text style={styles.primaryButtonText}>Go To Match Center</Text>
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