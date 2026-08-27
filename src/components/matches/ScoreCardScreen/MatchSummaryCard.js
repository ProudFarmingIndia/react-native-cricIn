import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| MatchSummaryCard
|--------------------------------------------------------------------------
|
| Props:
|   match       — match document (teamA, teamB, result, status, matchType)
|   inningsData — array from getScorecardByInningsApi (per-innings objects)
|
| Layout: Team A score | VS | Team B score on one row.
| If only 1 innings exists (match still live or single-innings format),
| shows "-" for the team that hasn't batted yet.
|
*/

export default function MatchSummaryCard({ match, inningsData = [] }) {
  if (!match) return null;

  const teamAName = match.teamA?.teamName ?? "Team A";
  const teamBName = match.teamB?.teamName ?? "Team B";
  const teamAId = match.teamA?._id ?? match.teamA;
  const teamBId = match.teamB?._id ?? match.teamB;

  // Match innings to teams via battingTeamName
  const inn1 = inningsData.find((i) => i.inningsNumber === 1);
  const inn2 = inningsData.find((i) => i.inningsNumber === 2);

  // Determine which team batted in which innings
  const teamAScore = (() => {
    if (inn1?.battingTeamName === teamAName) return inn1.summary;
    if (inn2?.battingTeamName === teamAName) return inn2.summary;
    return null;
  })();

  const teamBScore = (() => {
    if (inn1?.battingTeamName === teamBName) return inn1.summary;
    if (inn2?.battingTeamName === teamBName) return inn2.summary;
    return null;
  })();

  const formatScore = (summary) => {
    if (!summary) return "-";
    return `${summary.runs}/${summary.wickets} (${summary.overs})`;
  };

  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";

  return (
    <View style={styles.card}>
      {/* ── Header ──────────────────────────────────────────── */}

      <View style={styles.header}>
        <Text style={styles.matchType}>{match.matchType || "T20"}</Text>

        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>COMPLETED</Text>
          </View>
        )}
      </View>

      {/* ── Scores ──────────────────────────────────────────── */}

      <View style={styles.scoresRow}>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName} numberOfLines={1}>
            {teamAName}
          </Text>

          <Text style={styles.score}>{formatScore(teamAScore)}</Text>
        </View>

        <Text style={styles.vs}>VS</Text>

        <View style={[styles.teamBlock, styles.teamBlockRight]}>
          <Text
            style={[styles.teamName, styles.teamNameRight]}
            numberOfLines={1}
          >
            {teamBName}
          </Text>

          <Text style={[styles.score, styles.scoreRight]}>
            {formatScore(teamBScore)}
          </Text>
        </View>
      </View>

      {/* ── Result ──────────────────────────────────────────── */}

      {match.result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{match.result}</Text>
        </View>
      ) : isLive ? (
        <View style={styles.resultContainer}>
          <Text style={styles.liveStatusText}>Match in progress...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  // ── Header ─────────────────────────────────────────────────

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  matchType: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.errorContainer,
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

  liveText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.error,
    letterSpacing: 0.5,
  },

  completedBadge: {
    backgroundColor: COLORS.primary + "22",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  completedText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  // ── Scores ─────────────────────────────────────────────────

  scoresRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  teamBlock: {
    flex: 1,
  },

  teamBlockRight: {
    alignItems: "flex-end",
  },

  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },

  teamNameRight: {
    textAlign: "right",
  },

  score: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  scoreRight: {
    textAlign: "right",
  },

  vs: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    marginHorizontal: 12,
  },

  // ── Result ─────────────────────────────────────────────────

  resultContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    alignItems: "center",
  },

  resultText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
  },

  liveStatusText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontStyle: "italic",
  },
});