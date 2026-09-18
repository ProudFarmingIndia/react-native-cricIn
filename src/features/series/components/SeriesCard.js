/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Series
|
| File:
| SeriesCard.js
|
| Description:
| One series in a list. Used on Home, on the Matches tab and on the series
| list screen, so a series looks the same wherever it turns up.
|
| WHY THE SCORELINE IS THE HEADLINE AND NOT THE NAME
| A tournament card leads with its banner because "Sunday Cup 2026" is how
| people refer to it. A series is referred to by its scoreline - "we're 2-1
| up" - and the name is secondary. So the two teams and the number get the
| middle of the card, and the name sits above them in one line.
|
|--------------------------------------------------------------------------
*/

import React from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import TeamBadge from "../../../components/matches/TeamBadge";

import { COLORS } from "../../../constants/colors";

import {
  SERIES_STATUS_META,
  scorelineSummary,
  formatMoney,
} from "../constants/seriesConstants";

const formatDate = (value) => {
  if (!value) return null;

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function SeriesCard({ series, onPress, compact = false }) {
  if (!series) return null;

  const status = SERIES_STATUS_META[series.status] || SERIES_STATUS_META.published;

  const a = series.teamAWins ?? 0;

  const b = series.teamBWins ?? 0;

  const start = formatDate(series.startDate);

  const end = formatDate(series.endDate);

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      activeOpacity={0.85}
      onPress={() => onPress?.(series)}
    >
      {/* ── Banner strip ────────────────────────────────────────── */}

      <View style={styles.banner}>
        {series.bannerImage ? (
          <Image
            source={{ uri: series.bannerImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : null}

        {/* Scrim so white text stays readable on a bright photo. */}
        {series.bannerImage ? <View style={styles.scrim} /> : null}

        <View style={styles.bannerTop}>
          <View style={[styles.pill, { backgroundColor: status.bg }]}>
            <Text style={[styles.pillText, { color: status.fg }]}>
              {status.label}
            </Text>
          </View>

          <Text style={styles.length}>
            {series.totalMatches} MATCH {series.matchType || ""}
          </Text>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {series.seriesName}
        </Text>
      </View>

      {/* ── Scoreline ───────────────────────────────────────────── */}

      <View style={styles.body}>
        <View style={styles.side}>
          <TeamBadge team={series.teamA} size={30} />

          <Text style={styles.sideName} numberOfLines={1}>
            {series.teamA?.teamName || "Team A"}
          </Text>
        </View>

        <View style={styles.score}>
          <Text style={[styles.scoreNum, a > b && styles.scoreNumLead]}>
            {a}
          </Text>

          <Text style={styles.scoreDash}>-</Text>

          <Text style={[styles.scoreNum, b > a && styles.scoreNumLead]}>
            {b}
          </Text>
        </View>

        <View style={styles.side}>
          <TeamBadge team={series.teamB} size={30} />

          <Text style={styles.sideName} numberOfLines={1}>
            {/*
            | A series with no opponent yet is a real state - the
            | organizer created it and the invite has not been answered.
            | Saying so is better than a blank badge.
            */}
            {series.teamB?.teamName || "Opponent baaki"}
          </Text>
        </View>
      </View>

      {/* ── Footer ──────────────────────────────────────────────── */}

      <View style={styles.footer}>
        <Text style={styles.summary} numberOfLines={1}>
          {scorelineSummary(series)}
        </Text>

        <View style={styles.footerMeta}>
          {!!start && (
            <>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={COLORS.onSurfaceVariant}
              />

              <Text style={styles.metaText}>
                {start}
                {end && end !== start ? ` – ${end}` : ""}
              </Text>
            </>
          )}

          {!!series.prizePool && (
            <>
              <Text style={styles.metaDot}>·</Text>

              <Ionicons name="trophy" size={12} color={COLORS.secondary} />

              <Text style={styles.metaPrize}>
                {formatMoney(series.prizePool)}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: "hidden",
    marginBottom: 14,
  },

  cardCompact: { marginBottom: 0 },

  /* ── Banner ───────────────────────────────────────────────────── */

  banner: {
    height: 84,
    backgroundColor: COLORS.primary,
    padding: 11,
    justifyContent: "space-between",
  },

  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  bannerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pill: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
  },

  pillText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  length: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.85)",
  },

  name: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
  },

  /* ── Body ─────────────────────────────────────────────────────── */

  body: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 13,
  },

  side: { flex: 1, alignItems: "center", gap: 5 },

  sideName: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  score: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
  },

  scoreNum: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.onSurfaceVariant,
    fontVariant: ["tabular-nums"],
  },

  scoreNumLead: { color: COLORS.primary },

  scoreDash: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.outline,
  },

  /* ── Footer ───────────────────────────────────────────────────── */

  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 5,
  },

  summary: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  footerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metaText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },

  metaDot: { color: COLORS.outline, fontSize: 11 },

  metaPrize: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.secondary,
  },
});
