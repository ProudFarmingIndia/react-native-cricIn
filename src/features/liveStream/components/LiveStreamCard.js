/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| LiveStreamCard.js
|
| Description:
| One match in the "Live Streaming" list. Used on Home and on the Matches
| tab, so a streamed match looks identical wherever it appears.
|
| WHY IT IS NOT MatchCard WITH A FLAG
| MatchCard answers "what is the score". This card answers "there is a
| picture, come and watch" - so the thing that has to be biggest on it is
| the LIVE badge and the number of camera angles, not the runs. Bolting a
| streaming mode onto MatchCard would have meant a card that is slightly
| wrong for both jobs.
|
|--------------------------------------------------------------------------
*/

import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import TeamBadge from "../../../components/matches/TeamBadge";

import { COLORS } from "../../../constants/colors";

const minutesSince = (value) => {
  if (!value) return null;

  const started = new Date(value).getTime();

  if (Number.isNaN(started)) return null;

  const mins = Math.floor((Date.now() - started) / 60000);

  if (mins < 1) return "just started";

  if (mins < 60) return `${mins}m`;

  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export default function LiveStreamCard({ match, onPress }) {
  const uptime = minutesSince(match?.streamStartedAt);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress?.(match)}
    >
      <View style={styles.topRow}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.livePillText}>LIVE</Text>
        </View>

        {/*
        | Two angles is the thing that makes this different from every
        | other live score in the app, so it is said on the card rather
        | than discovered after opening it.
        */}

        {match?.angleCount > 1 && (
          <View style={styles.anglePill}>
            <Ionicons
              name="camera-reverse-outline"
              size={12}
              color={COLORS.primary}
            />
            <Text style={styles.anglePillText}>
              {match.angleCount} ANGLES
            </Text>
          </View>
        )}

        <View style={styles.spacer} />

        {!!match?.matchType && (
          <Text style={styles.typeText}>{match.matchType}</Text>
        )}
      </View>

      {!!match?.matchTitle && (
        <Text style={styles.title} numberOfLines={1}>
          {match.matchTitle}
        </Text>
      )}

      <View style={styles.sideRow}>
        <TeamBadge team={match?.teamA} size={34} />

        <Text style={styles.sideName} numberOfLines={1}>
          {match?.teamA?.teamName || "Team A"}
        </Text>
      </View>

      <View style={styles.sideRow}>
        <TeamBadge team={match?.teamB} size={34} />

        <Text style={styles.sideName} numberOfLines={1}>
          {match?.teamB?.teamName || "Team B"}
        </Text>
      </View>

      <View style={styles.metaRow}>
        {!!match?.venueName && (
          <View style={styles.metaItem}>
            <Ionicons
              name="location-outline"
              size={13}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.metaText} numberOfLines={1}>
              {match.venueName}
            </Text>
          </View>
        )}

        {!!uptime && (
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={13}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.metaText}>{uptime}</Text>
          </View>
        )}

        {match?.viewerCount > 0 && (
          <View style={styles.metaItem}>
            <Ionicons
              name="eye-outline"
              size={13}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.metaText}>{match.viewerCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.watchButton}>
        <Ionicons name="play" size={13} color="#ffffff" />
        <Text style={styles.watchText}>WATCH LIVE</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },

  spacer: { flex: 1 },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },

  livePillText: {
    fontSize: 9.5,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.8,
  },

  anglePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceContainer,
  },

  anglePillText: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: COLORS.primary,
  },

  typeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 6,
  },

  sideRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },

  sideName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 8,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  watchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.error,
  },

  watchText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#ffffff",
  },
});