import React, { useEffect, useMemo } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import useScoring from "../../scoring/hooks/useScoring";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Innings Summary Screen
|--------------------------------------------------------------------------
|
| Expects via route.params: matchId, inningsId, battingSquad,
| bowlingSquad, target (undefined for the 1st innings).
|
| Everything shown here is computed client-side from the innings' ball
| log (already fetched once, no separate scorecard endpoints needed for
| a single-innings recap).
*/

export default function InningsSummaryScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const {
    matchId,
    inningsId,
    battingSquad = [],
    bowlingSquad = [],
    target,
    battingTeamId,
    bowlingTeamId,
  } = route.params || {};

  const { currentInnings, balls, loading, getInningsScorecard } = useScoring();

  useEffect(() => {
    if (inningsId) getInningsScorecard(inningsId);
  }, [inningsId, getInningsScorecard]);

  const stats = useMemo(() => {
    if (!currentInnings) return null;

    const fours = balls.filter((b) => b.runs === 4 && !b.extraType).length;
    const sixes = balls.filter((b) => b.runs === 6 && !b.extraType).length;

    const battingTotals = {};
    battingSquad.forEach((p) => {
      battingTotals[p._id] = { playerName: p.playerName, runs: 0, balls: 0 };
    });

    balls.forEach((b) => {
      const id = b.batsmanId?._id || b.batsmanId;
      if (!battingTotals[id]) return;

      if (b.extraType !== "bye" && b.extraType !== "legBye") {
        battingTotals[id].runs += b.runs || 0;
      }
      if (b.extraType !== "wide") {
        battingTotals[id].balls += 1;
      }
    });

    const topBatter = Object.values(battingTotals).sort((a, b) => b.runs - a.runs)[0];

    const bowlingTotals = {};
    bowlingSquad.forEach((p) => {
      bowlingTotals[p._id] = {
        playerName: p.playerName,
        wickets: 0,
        runs: 0,
        legalBalls: 0,
      };
    });

    balls.forEach((b) => {
      const id = b.bowlerId?._id || b.bowlerId;
      if (!bowlingTotals[id]) return;

      bowlingTotals[id].runs += b.teamRuns ?? b.runs ?? 0;
      if (b.isLegalDelivery !== false) bowlingTotals[id].legalBalls += 1;
      if (b.isWicket) bowlingTotals[id].wickets += 1;
    });

    const topBowler = Object.values(bowlingTotals).sort(
      (a, b) => b.wickets - a.wickets,
    )[0];

    return {
      fours,
      sixes,
      topBatter: topBatter
        ? {
            ...topBatter,
            strikeRate: topBatter.balls > 0 ? ((topBatter.runs / topBatter.balls) * 100).toFixed(1) : "0.0",
          }
        : null,
      topBowler: topBowler
        ? {
            ...topBowler,
            overs: `${Math.floor(topBowler.legalBalls / 6)}.${topBowler.legalBalls % 6}`,
            economy: topBowler.legalBalls > 0 ? (topBowler.runs / (topBowler.legalBalls / 6)).toFixed(2) : "0.00",
          }
        : null,
    };
  }, [currentInnings, balls, battingSquad, bowlingSquad]);

  const handleContinue = () => {
    if (target != null) {
      // Second innings just ended - the match is over.
      navigation.navigate("MatchResultScreen", { matchId });
      return;
    }

    navigation.navigate("SecondInningsScreen", {
      matchId,
      battingTeamSquad: bowlingSquad, // roles swap for the chase
      bowlingTeamSquad: battingSquad,
      battingTeamId: bowlingTeamId,
      bowlingTeamId: battingTeamId,
      target: currentInnings?.totalRuns != null ? currentInnings.totalRuns + 1 : undefined,
    });
  };

  if (loading || !currentInnings || !stats) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const overs = `${Math.floor(currentInnings.balls / 6)}.${currentInnings.balls % 6}`;
  const runRate =
    currentInnings.balls > 0
      ? (currentInnings.totalRuns / (currentInnings.balls / 6)).toFixed(2)
      : "0.00";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.scoreCard}>
          <Text style={styles.eyebrow}>
            {target != null ? "2ND INNINGS COMPLETE" : "1ST INNINGS COMPLETE"}
          </Text>

          <Text style={styles.score}>
            {currentInnings.totalRuns}/{currentInnings.wickets}
          </Text>

          <Text style={styles.oversText}>
            Overs: {overs} • RR: {runRate}
          </Text>

          <View style={styles.boundaryRow}>
            <View style={styles.boundaryBox}>
              <Text style={styles.boundaryLabel}>4s</Text>
              <Text style={styles.boundaryValue}>{stats.fours}</Text>
            </View>

            <View style={styles.boundaryBox}>
              <Text style={styles.boundaryLabel}>6s</Text>
              <Text style={styles.boundaryValue}>{stats.sixes}</Text>
            </View>
          </View>
        </View>

        {stats.topBatter && (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>★ Top Batter</Text>
            <Text style={styles.playerBigName}>{stats.topBatter.playerName}</Text>

            <View style={styles.playerStatsRow}>
              <Text style={styles.bigStat}>{stats.topBatter.runs} runs</Text>
              <Text style={styles.smallStat}>
                {stats.topBatter.balls} balls{"\n"}SR: {stats.topBatter.strikeRate}
              </Text>
            </View>
          </View>
        )}

        {stats.topBowler && stats.topBowler.wickets > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>⚡ Top Bowler</Text>
            <Text style={styles.playerBigName}>{stats.topBowler.playerName}</Text>

            <View style={styles.playerStatsRow}>
              <Text style={styles.bigStat}>{stats.topBowler.wickets} wickets</Text>
              <Text style={styles.smallStat}>
                {stats.topBowler.overs} overs{"\n"}Econ: {stats.topBowler.economy}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>
          {target != null ? "View Match Result" : "Start Second Innings"}
        </Text>
      </TouchableOpacity>
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

  scoreCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },

  score: {
    fontSize: 40,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 6,
  },

  oversText: {
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },

  boundaryRow: {
    flexDirection: "row",
    marginTop: 16,
  },

  boundaryBox: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 6,
    alignItems: "center",
  },

  boundaryLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "700",
  },

  boundaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 6,
  },

  playerBigName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  playerStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
  },

  bigStat: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  smallStat: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: "right",
  },

  button: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
});
