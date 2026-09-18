/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Series
|
| File:
| Scoreline.js
|
| Description:
| "2 - 1". The one number a series exists to produce.
|
| WHY THIS IS NOT A POINTS TABLE
| A tournament's table answers "who is best of many" and needs points, net
| run rate and a qualifying line. A series has two teams, so run rate
| decides nothing the win count has not already decided, and a two-row
| table with one column is a worse way to show one number than showing the
| number.
|
| WHY DRAWN MATCHES SIT UNDERNEATH RATHER THAN IN THE SCORE
| "2-1-1" is not a scoreline anybody says out loud. Ties and no-results
| are real and have to be shown, but they belong as a footnote to the
| number, not inside it.
|
| The dot strip below is the series at a glance: one dot per match, filled
| in the winner's colour, hollow for what is still to come. It answers
| "how far in are we" without reading a date.
|
|--------------------------------------------------------------------------
*/

import React from "react";

import { View, Text, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import TeamBadge from "../../../components/matches/TeamBadge";

import { COLORS } from "../../../constants/colors";

const Side = ({ team, wins, leading }) => (
  <View style={styles.side}>
    <TeamBadge team={team} size={44} />

    <Text style={styles.sideName} numberOfLines={2}>
      {team?.teamName || "To be decided"}
    </Text>

    <Text style={[styles.sideWins, leading && styles.sideWinsLeading]}>
      {wins ?? 0}
    </Text>
  </View>
);

export default function Scoreline({ scoreline, fixtures = [], compact = false }) {
  if (!scoreline) return null;

  const { teamA, teamB, drawn = 0, played = 0, total = 0 } = scoreline;

  const a = teamA?.wins ?? 0;

  const b = teamB?.wins ?? 0;

  /*
  | One dot per match in the series, in playing order. A flat list of the
  | round-grouped fixtures, because the server returns them grouped so the
  | app's FixtureList can render tournaments and series with no branch.
  */

  const matches = (fixtures || []).flatMap((round) => round.matches || []);

  const dots =
    matches.length > 0
      ? matches
      : Array.from({ length: total }, () => ({ status: "upcoming" }));

  const dotColor = (m) => {
    if (m.status !== "completed") return null;

    if (!m.winnerTeam) return COLORS.outline;

    const winnerId = String(m.winnerTeam?._id ?? m.winnerTeam);

    if (winnerId === String(teamA?.teamId)) return COLORS.primary;

    if (winnerId === String(teamB?.teamId)) return COLORS.secondaryContainer;

    return COLORS.outline;
  };

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.row}>
        <Side team={teamA} wins={a} leading={a > b} />

        <View style={styles.middle}>
          <Text style={styles.dash}>—</Text>

          <Text style={styles.progress}>
            {played} / {total}
          </Text>
        </View>

        <Side team={teamB} wins={b} leading={b > a} />
      </View>

      {/* ── Dot strip ─────────────────────────────────────────────── */}

      <View style={styles.dots}>
        {dots.map((m, i) => {
          const color = dotColor(m);

          return (
            <View
              key={i}
              style={[
                styles.dot,
                color ? { backgroundColor: color, borderColor: color } : null,
              ]}
            />
          );
        })}
      </View>

      {/* ── Footnotes ─────────────────────────────────────────────── */}

      {drawn > 0 && (
        <Text style={styles.note}>
          {drawn} match {drawn > 1 ? "bina result ke rahe" : "bina result ke raha"}.
        </Text>
      )}

      {/*
      | "Decided" is the honest middle state: one side is beyond reach but
      | the remaining matches are still scheduled and will still be played,
      | because the ground is booked and both teams turn up.
      */}

      {scoreline.decided && scoreline.status !== "completed" && (
        <View style={styles.decided}>
          <Ionicons name="flag" size={13} color={COLORS.secondary} />

          <Text style={styles.decidedText}>
            Series decide ho chuki — bache hue match dead rubber hain.
          </Text>
        </View>
      )}

      {scoreline.status === "completed" && (
        <View style={styles.decided}>
          <Ionicons name="trophy" size={13} color={COLORS.primary} />

          <Text style={[styles.decidedText, styles.decidedWon]}>
            {a === b
              ? "Series barabar rahi."
              : `${(a > b ? teamA : teamB)?.teamName} ne series jeeti.`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 16,
  },

  wrapCompact: { padding: 12 },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  side: { flex: 1, alignItems: "center", gap: 6 },

  sideName: {
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  sideWins: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.onSurfaceVariant,
    fontVariant: ["tabular-nums"],
  },

  sideWinsLeading: { color: COLORS.primary },

  middle: {
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 22,
  },

  dash: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.outline,
  },

  progress: {
    marginTop: 4,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Dots ─────────────────────────────────────────────────────── */

  dots: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    backgroundColor: "transparent",
  },

  note: {
    marginTop: 10,
    fontSize: 11.5,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  decided: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 11,
  },

  decidedText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  decidedWon: { color: COLORS.primary },
});
