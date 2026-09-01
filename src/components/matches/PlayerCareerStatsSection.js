import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../constants/colors";

/*
|--------------------------------------------------------------------------
| PlayerCareerStatsSection
|--------------------------------------------------------------------------
|
| Displays a player's accumulated career stats from Player.stats (which
| is now auto-updated by the backend on every match completion).
|
| Usage:
|   <PlayerCareerStatsSection stats={player.stats} />
|
| props:
|   stats  — the player.stats object from the API response
|
| overs display:
|   The backend stores stats.overs as total legal deliveries (integer).
|   We convert it to "overs.balls" format here for display.
|   e.g. 67 legal balls → "11.1" (11 overs 1 ball)
|
*/

const toOversString = (legalBalls = 0) => {
  const ov = Math.floor(legalBalls / 6);
  const bl = legalBalls % 6;
  return `${ov}.${bl}`;
};

// ── Sub-components ────────────────────────────────────────────────────────

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const StatRow = ({ label, value }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value ?? "-"}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

// ── Main Component ────────────────────────────────────────────────────────

export default function PlayerCareerStatsSection({ stats }) {
  if (!stats) return null;

  const {
    totalMatches = 0,
    innings = 0,
    runs = 0,
    ballsFaced = 0,
    highestScore = 0,
    strikeRate = 0,
    average = 0,
    fours = 0,
    sixes = 0,
    wickets = 0,
    overs: legalBalls = 0,
    economy = 0,
    maidens = 0,
    bestBowling = "",
    catches = 0,
    stumpings = 0,
    runOuts = 0,
    playerOfMatch = 0,
  } = stats;

  const hasBatted = innings > 0 || runs > 0 || ballsFaced > 0;
  const hasBowled = legalBalls > 0 || wickets > 0;
  const hasFielded = catches > 0 || stumpings > 0 || runOuts > 0;

  return (
    <View style={styles.container}>
      {/* ── Career Overview ─────────────────────────────────────── */}

      <View style={styles.overviewRow}>
        <OverviewCard label="Matches" value={totalMatches} />
        <OverviewCard label="Innings" value={innings} />
        <OverviewCard label="POM" value={playerOfMatch} color={COLORS.secondary} />
      </View>

      {/* ── Batting ─────────────────────────────────────────────── */}

      {hasBatted && (
        <View style={styles.card}>
          <SectionTitle title="Batting" />

          <StatRow label="Runs" value={runs} />
          <Divider />
          <StatRow label="Balls Faced" value={ballsFaced} />
          <Divider />
          <StatRow label="Highest Score" value={highestScore} />
          <Divider />
          <StatRow label="Strike Rate" value={strikeRate ? `${strikeRate}` : "0.00"} />
          <Divider />
          <StatRow label="Average" value={average ? `${average}` : "0.00"} />
          <Divider />

          <View style={styles.inlineRow}>
            <View style={styles.inlineCell}>
              <Text style={styles.inlineValue}>{fours}</Text>
              <Text style={styles.inlineLabel}>4s</Text>
            </View>

            <View style={styles.inlineSep} />

            <View style={styles.inlineCell}>
              <Text style={styles.inlineValue}>{sixes}</Text>
              <Text style={styles.inlineLabel}>6s</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Bowling ─────────────────────────────────────────────── */}

      {hasBowled && (
        <View style={styles.card}>
          <SectionTitle title="Bowling" />

          <StatRow label="Wickets" value={wickets} />
          <Divider />
          <StatRow label="Overs" value={toOversString(legalBalls)} />
          <Divider />
          <StatRow label="Economy" value={economy ? `${economy}` : "0.00"} />
          <Divider />
          <StatRow label="Maidens" value={maidens} />
          <Divider />
          <StatRow label="Best Bowling" value={bestBowling || "-"} />
        </View>
      )}

      {/* ── Fielding ─────────────────────────────────────────────── */}

      {hasFielded && (
        <View style={styles.card}>
          <SectionTitle title="Fielding" />

          <StatRow label="Catches" value={catches} />
          <Divider />
          <StatRow label="Stumpings" value={stumpings} />
          <Divider />
          <StatRow label="Run Outs" value={runOuts} />
        </View>
      )}

      {/* ── Empty State ──────────────────────────────────────────── */}

      {!hasBatted && !hasBowled && !hasFielded && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No matches played yet</Text>
          <Text style={styles.emptySubtitle}>
            Stats will appear here after your first scored match.
          </Text>
        </View>
      )}
    </View>
  );
}

// ── OverviewCard ──────────────────────────────────────────────────────────

function OverviewCard({ label, value, color }) {
  return (
    <View style={styles.overviewCard}>
      <Text style={[styles.overviewValue, color ? { color } : null]}>
        {value ?? 0}
      </Text>
      <Text style={styles.overviewLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // ── Overview Row ──────────────────────────────────────────────

  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  overviewCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  overviewValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },

  overviewLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },

  // ── Card ──────────────────────────────────────────────────────

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  // ── Stat Row ──────────────────────────────────────────────────

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
  },

  statLabel: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
  },

  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.6,
  },

  // ── Inline Fours/Sixes ────────────────────────────────────────

  inlineRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
  },

  inlineCell: {
    alignItems: "center",
    flex: 1,
  },

  inlineSep: {
    width: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 4,
  },

  inlineValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  inlineLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
    fontWeight: "600",
  },

  // ── Empty State ───────────────────────────────────────────────

  emptyCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },
});