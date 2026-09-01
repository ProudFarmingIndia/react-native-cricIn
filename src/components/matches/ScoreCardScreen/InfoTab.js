import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| InfoTab
|--------------------------------------------------------------------------
|
| Props:
|   match — full match document from getMatchByIdApi:
|     { matchType, ballType, pitchType, umpire1, umpire2, scorer,
|       tossWinner: { teamName }, tossDecision, scheduledStartTime,
|       teamA: { teamName }, teamB: { teamName }, result }
|
*/

const InfoRow = ({ label, value }) => {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const Divider = () => <View style={styles.divider} />;

export default function InfoTab({ match }) {
  if (!match) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Match info unavailable.</Text>
      </View>
    );
  }

  const tossWinnerName = match.tossWinner?.teamName ?? null;
  const tossInfo = tossWinnerName
    ? `${tossWinnerName} won toss, chose to ${match.tossDecision ?? "Bat"}`
    : null;

  const umpires = [match.umpire1, match.umpire2].filter(Boolean).join(", ");

  const scheduledDate = match.scheduledStartTime
    ? new Date(match.scheduledStartTime).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <View style={styles.container}>
      {/* ── Match Details ────────────────────────────────────── */}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Match Details</Text>

        <InfoRow label="Format" value={match.matchType} />
        <Divider />
        <InfoRow label="Ball Type" value={match.ballType} />
        <Divider />
        <InfoRow label="Pitch Type" value={match.pitchType} />
        {scheduledDate && <Divider />}
        <InfoRow label="Scheduled" value={scheduledDate} />
      </View>

      {/* ── Toss ─────────────────────────────────────────────── */}

      {tossInfo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Toss</Text>

          <InfoRow label="Result" value={tossInfo} />
        </View>
      )}

      {/* ── Officials ────────────────────────────────────────── */}

      {(umpires || match.scorer) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Officials</Text>

          {umpires ? <InfoRow label="Umpires" value={umpires} /> : null}
          {match.scorer && <Divider />}
          {match.scorer ? <InfoRow label="Scorer" value={match.scorer} /> : null}
        </View>
      )}

      {/* ── Result ───────────────────────────────────────────── */}

      {match.result && (
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultText}>{match.result}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  infoLabel: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
    flex: 1,
  },

  infoValue: {
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: "700",
    flex: 2,
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.5,
  },

  resultCard: {
    backgroundColor: COLORS.primary + "15",
    borderColor: COLORS.primary + "40",
    paddingVertical: 16,
    alignItems: "center",
  },

  resultText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
  },

  empty: {
    padding: 32,
    alignItems: "center",
  },

  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
});