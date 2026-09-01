import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import TeamBadge from "./TeamBadge";

import { COLORS } from "../../constants/colors";

/*
|--------------------------------------------------------------------------
| Match Card
|--------------------------------------------------------------------------
|
| One card for live, upcoming and recent matches, so a fixture looks the
| same wherever it appears. The Matches tab previously drew its own three
| variants, which had drifted from the Home screen's - same data, two
| designs, two places to fix anything.
|
| Teams are STACKED rather than "A vs B" on one line: side by side, both
| names share the row's width and anything long truncates
| ("Ajay choudha..."), and a score has to float between them belonging to
| neither.
|
*/

const formatDate = (value) => {
  if (!value) return "Date TBD";

  const d = new Date(value);

  if (isNaN(d.getTime())) return "Date TBD";

  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
};

const formatTime = (value) => {
  if (!value) return "Time TBD";

  const d = new Date(value);

  if (isNaN(d.getTime())) return "Time TBD";

  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function MatchCard({ match, variant = "upcoming", onPress }) {
  const inn = match?.currentInnings;

  const battingId = String(inn?.battingTeamId || "");

  const isTeamABatting = !!battingId && String(match?.teamA?._id) === battingId;

  const isTeamBBatting = !!battingId && String(match?.teamB?._id) === battingId;

  const winnerId = String(match?.winnerTeam?._id || match?.winnerTeam || "");

  const teamAWon = !!winnerId && String(match?.teamA?._id) === winnerId;

  const teamBWon = !!winnerId && String(match?.teamB?._id) === winnerId;

  const when = match?.scheduledStartTime || match?.startTime;

  const scoreBlock = inn ? (
    <View style={styles.scoreWrap}>
      <Text style={styles.score}>
        {inn.runs}/{inn.wickets}
      </Text>

      <Text style={styles.scoreOvers}>{inn.overs} ov</Text>
    </View>
  ) : null;

  const renderSide = (team, isBatting, hasWon) => (
    <View style={styles.sideRow}>
      <TeamBadge team={team} size={36} />

      <Text
        style={[
          styles.sideName,
          isBatting && styles.sideNameBatting,
          hasWon && styles.sideNameWinner,
        ]}
        numberOfLines={1}
      >
        {team?.teamName || "Team"}
      </Text>

      {variant === "live" && isBatting ? scoreBlock : null}

      {variant === "recent" && hasWon && (
        <MaterialIcons
          name="emoji-events"
          size={17}
          color={COLORS.secondary}
        />
      )}
    </View>
  );

  return (
    <TouchableOpacity
      style={[
        styles.card,
        variant === "live" && styles.cardLive,
        variant === "upcoming" && styles.cardUpcoming,
        variant === "recent" && styles.cardRecent,
      ]}
      activeOpacity={0.85}
      onPress={() => onPress?.(match)}
    >
      <View style={styles.topRow}>
        {variant === "live" ? (
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : (
          <View style={styles.formatChip}>
            <Text style={styles.formatChipText}>
              {match?.matchType || "T20"}
            </Text>
          </View>
        )}

        {variant === "live" && !!inn && (
          <Text style={styles.rrText}>RR {inn.runRate}</Text>
        )}

        {variant === "recent" && (
          <Text style={styles.completedText}>COMPLETED</Text>
        )}

        {variant === "upcoming" && !!match?.matchType && (
          <Text style={styles.oversText}>{match.overs || 20} ov</Text>
        )}
      </View>

      {!!match?.matchTitle && variant !== "live" && (
        <Text style={styles.matchTitle} numberOfLines={1}>
          {match.matchTitle}
        </Text>
      )}

      {renderSide(match?.teamA, isTeamABatting, teamAWon)}

      {renderSide(match?.teamB, isTeamBBatting, teamBWon)}

      {/* Score shown unattributed when the batting side cannot be resolved. */}
      {variant === "live" && !!inn && !isTeamABatting && !isTeamBBatting && (
        <View style={styles.neutralScore}>
          <Text style={styles.score}>
            {inn.runs}/{inn.wickets}
          </Text>

          <Text style={styles.neutralOvers}>({inn.overs} ov)</Text>
        </View>
      )}

      {variant === "live" && !inn && (
        <Text style={styles.awaiting}>Waiting for the first ball</Text>
      )}

      {variant === "live" && !!inn?.target && (
        <Text style={styles.target}>
          Needs {Math.max(0, inn.target - inn.runs)} more to win
        </Text>
      )}

      {variant === "upcoming" && (
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons name="event" size={14} color={COLORS.primary} />
            <Text style={styles.metaText}>{formatDate(when)}</Text>
          </View>

          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={14} color={COLORS.primary} />
            <Text style={styles.metaText}>{formatTime(when)}</Text>
          </View>

          {!!match?.venueName && (
            <View style={styles.metaItem}>
              <MaterialIcons name="place" size={14} color={COLORS.primary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {match.venueName}
              </Text>
            </View>
          )}
        </View>
      )}

      {variant === "upcoming" && match?.confirmationStatus === "pending" && (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingText}>Awaiting confirmation</Text>
        </View>
      )}

      {variant === "recent" && (
        <Text style={styles.resultText} numberOfLines={2}>
          {match?.result ||
            (winnerId ? "Result recorded" : "No result recorded")}
        </Text>
      )}

      {variant === "live" && (
        <View style={styles.action}>
          <Text style={styles.actionText}>SCORE NOW →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardLive: { borderTopWidth: 4, borderTopColor: COLORS.error },

  cardUpcoming: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },

  cardRecent: { borderLeftWidth: 4, borderLeftColor: COLORS.outline },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  liveRow: { flexDirection: "row", alignItems: "center" },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: 5,
  },

  liveText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: COLORS.error,
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

  oversText: { fontSize: 11, color: COLORS.onSurfaceVariant },

  completedText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: COLORS.outline,
  },

  matchTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
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

  sideNameBatting: { fontWeight: "800", color: COLORS.primary },

  sideNameWinner: { fontWeight: "800", color: COLORS.onSurface },

  scoreWrap: { alignItems: "flex-end" },

  score: { fontSize: 19, fontWeight: "800", color: COLORS.primary },

  scoreOvers: { fontSize: 10.5, color: COLORS.onSurfaceVariant },

  neutralScore: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },

  neutralOvers: {
    marginLeft: 8,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  awaiting: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: "italic",
    color: COLORS.onSurfaceVariant,
  },

  target: {
    marginTop: 8,
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 10,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginTop: 4,
    flexShrink: 1,
  },

  metaText: {
    marginLeft: 4,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  pendingBanner: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#FFF4E5",
  },

  pendingText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  resultText: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },

  action: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },

  actionText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: COLORS.onPrimary,
  },
});
