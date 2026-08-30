import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

const INNINGS_LABEL = {
  1: "1st Innings",
  2: "2nd Innings",
};

/*
|--------------------------------------------------------------------------
| Live Match Header
|--------------------------------------------------------------------------
|
| WHOSE SCORE IS THIS
|
| The header read "Nav Chetna society vs Ajay choudhary Team" with "28/1"
| underneath - a fixture line and a number, with nothing joining them. The
| scorer could not tell at a glance which of those two teams the 28 belonged
| to, which is the single most important thing on a scoring screen.
|
| The batting side is now the headline and the bowling side is named
| underneath it. The fixture line is gone: "A vs B" says less than
| "A batting, B bowling" and takes the same room.
|
| It degrades honestly - if the batting side cannot be resolved (an innings
| whose team is not among the two loaded here) the old fixture line comes
| back rather than a confidently wrong name.
|
| TARGET is conditional: there is none in the first innings, and it used to
| print the word next to nothing.
|
| The Scorecard button gives the person scoring the same full scorecard
| every spectator gets, without leaving the match: it opens
| MatchDetailsScreen on its Scorecard tab.
|
*/

export default function MatchHeader({
  teamAName,
  teamBName,
  battingTeamName,
  bowlingTeamName,
  inningsNumber,
  score,
  wickets,
  overs,
  target,
  runRate,
  onPressScorecard,
}) {
  const hasTarget = target !== null && target !== undefined;

  const needed = hasTarget ? Math.max(0, target - (score || 0)) : 0;

  const knowsSides = !!battingTeamName;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />

            <Text style={styles.live}>LIVE</Text>
          </View>

          <Text style={styles.match} numberOfLines={2}>
            {knowsSides
              ? battingTeamName
              : teamAName && teamBName
                ? `${teamAName} vs ${teamBName}`
                : "Match in progress"}
          </Text>

          {knowsSides && (
            <View style={styles.rolesRow}>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>BATTING</Text>
              </View>

              {!!bowlingTeamName && (
                <Text style={styles.bowlingName} numberOfLines={1}>
                  v {bowlingTeamName}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {INNINGS_LABEL[inningsNumber] || "Innings"}
          </Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreBlock}>
          <Text style={styles.score}>
            {score}/{wickets}
          </Text>

          <Text style={styles.overs}>({overs} ov)</Text>
        </View>

        <View style={styles.metaBlock}>
          {!!runRate && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>CRR</Text>
              <Text style={styles.metaValue}>{runRate}</Text>
            </View>
          )}

          {/* Only in a chase - there is no target in the first innings. */}
          {hasTarget && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>NEED</Text>
              <Text style={[styles.metaValue, styles.metaValueTarget]}>
                {needed}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/*
      | Named again under the score, because by the time the eye reaches the
      | numbers it has left the title - and "bowling" is the label a scorer
      | needs when picking the next bowler.
      */}
      {knowsSides && !!bowlingTeamName && (
        <Text style={styles.bowlingLine} numberOfLines={1}>
          Bowling: <Text style={styles.bowlingLineName}>{bowlingTeamName}</Text>
        </Text>
      )}

      {!!onPressScorecard && (
        <TouchableOpacity
          style={styles.scorecardButton}
          onPress={onPressScorecard}
          activeOpacity={0.7}
        >
          <Ionicons name="list-outline" size={15} color={COLORS.primary} />

          <Text style={styles.scorecardText}>Full Scorecard</Text>

          <Ionicons name="chevron-forward" size={15} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  titleWrap: {
    flex: 1,
    marginRight: 10,
  },

  liveRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: 5,
  },

  live: {
    color: COLORS.error,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.8,
  },

  match: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 5,
    color: COLORS.onSurface,
  },

  rolesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  rolePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#E8F5E9",
  },

  rolePillText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: COLORS.primary,
  },

  bowlingName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },

  bowlingLine: {
    marginTop: 10,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },

  bowlingLineName: {
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 11,
  },

  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
  },

  scoreBlock: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  score: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.primary,
  },

  overs: {
    marginLeft: 8,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
  },

  metaBlock: {
    flexDirection: "row",
  },

  metaItem: {
    alignItems: "center",
    marginLeft: 16,
  },

  metaLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: COLORS.outline,
  },

  metaValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  metaValueTarget: {
    color: COLORS.secondary,
  },

  scorecardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  scorecardText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
