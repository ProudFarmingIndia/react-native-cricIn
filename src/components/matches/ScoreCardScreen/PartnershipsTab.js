import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| PartnershipsTab
|--------------------------------------------------------------------------
|
| Props:
|   partnerships — filtered array for current innings from getPartnershipsApi:
|     [{ partnershipNumber, playerAName, playerBName, runs, balls }]
|
*/

export default function PartnershipsTab({ partnerships = [] }) {
  if (!partnerships.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No partnership data yet.</Text>
      </View>
    );
  }

  const best = partnerships.reduce(
    (max, p) => (p.runs > (max?.runs ?? -1) ? p : max),
    null,
  );

  return (
    <View style={styles.container}>
      {/* ── Best Partnership Banner ──────────────────────────── */}

      {best && (
        <View style={styles.bestBanner}>
          <Text style={styles.bestLabel}>⭐ Best Partnership</Text>

          <Text style={styles.bestRuns}>{best.runs} runs</Text>

          <Text style={styles.bestNames}>
            {best.playerAName} & {best.playerBName}
          </Text>

          <Text style={styles.bestBalls}>{best.balls} balls</Text>
        </View>
      )}

      {/* ── All Partnerships ─────────────────────────────────── */}

      <Text style={styles.sectionTitle}>All Partnerships</Text>

      {partnerships.map((p, idx) => {
        const runRate =
          p.balls > 0 ? ((p.runs / p.balls) * 6).toFixed(2) : "0.00";

        const isBest = p === best;

        return (
          <View
            key={idx}
            style={[styles.partnershipRow, isBest && styles.partnershipRowBest]}
          >
            {/* Wicket number */}
            <View style={styles.partNumBlock}>
              <Text style={styles.partNum}>
                {p.partnershipNumber || idx + 1}
                {getOrdinalSuffix(p.partnershipNumber || idx + 1)}
              </Text>

              <Text style={styles.partNumLabel}>wkt</Text>
            </View>

            {/* Player names */}
            <View style={styles.partNames}>
              <Text style={styles.partPlayerA} numberOfLines={1}>
                {p.playerAName}
              </Text>

              <Text style={styles.partAmpersand}>&</Text>

              <Text style={styles.partPlayerB} numberOfLines={1}>
                {p.playerBName}
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.partStats}>
              <Text style={styles.partRuns}>{p.runs}</Text>

              <Text style={styles.partBalls}>({p.balls} b)</Text>

              <Text style={styles.partRR}>RR {runRate}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const getOrdinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  // ── Best Banner ─────────────────────────────────────────────

  bestBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
  },

  bestLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    opacity: 0.85,
  },

  bestRuns: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 4,
  },

  bestNames: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  bestBalls: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.75,
  },

  // ── Section Title ───────────────────────────────────────────

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // ── Partnership Rows ────────────────────────────────────────

  partnershipRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  partnershipRowBest: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },

  partNumBlock: {
    width: 36,
    alignItems: "center",
    marginRight: 12,
  },

  partNum: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },

  partNumLabel: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  partNames: {
    flex: 1,
    marginRight: 8,
  },

  partPlayerA: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  partAmpersand: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginVertical: 2,
  },

  partPlayerB: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  partStats: {
    alignItems: "flex-end",
  },

  partRuns: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
  },

  partBalls: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },

  partRR: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    fontWeight: "600",
  },

  // ── Empty ───────────────────────────────────────────────────

  empty: {
    padding: 32,
    alignItems: "center",
  },

  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
});