/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| TournamentCard.js
|
| Description:
| One tournament in a list. Used on Home, on the Matches tab and on the
| tournament list screen, so a tournament looks the same wherever it turns
| up.
|
| The banner does double duty: it is the picture AND the surface the status
| pill and prize strip sit on. With no image uploaded it falls back to a
| flat green ground rather than an empty grey box - a tournament with no
| banner should look deliberate, not broken.
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

import { COLORS } from "../../../constants/colors";

import { PrizeBanner } from "./PrizeList";

import {
  STATUS_META,
  FORMAT_LABEL,
} from "../constants/tournamentConstants";

const formatDate = (value) => {
  if (!value) return null;

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function TournamentCard({ tournament, onPress, compact = false }) {
  if (!tournament) return null;

  const status = STATUS_META[tournament.status] || STATUS_META.published;

  const start = formatDate(tournament.startDate);

  const end = formatDate(tournament.endDate);

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      activeOpacity={0.85}
      onPress={() => onPress?.(tournament)}
    >
      <View style={styles.banner}>
        {tournament.bannerImage ? (
          <Image
            source={{ uri: tournament.bannerImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : null}

        {/*
        | A scrim over the image so white text stays readable on a bright
        | photo. Without it every second banner is illegible.
        */}
        <View style={styles.scrim} />

        <View style={styles.bannerTop}>
          <View style={[styles.pill, { backgroundColor: status.bg }]}>
            {tournament.status === "live" && <View style={styles.liveDot} />}

            <Text style={[styles.pillText, { color: status.fg }]}>
              {status.label}
            </Text>
          </View>

          {tournament.isOrganizer && (
            <View style={styles.ownerPill}>
              <Text style={styles.ownerPillText}>YOURS</Text>
            </View>
          )}
        </View>

        <View style={styles.bannerBottom}>
          <PrizeBanner
            prizes={tournament.prizes}
            prizePool={tournament.prizePool}
          />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {tournament.tournamentName}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="people-outline"
              size={13}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.metaText}>
              {tournament.teamCount ?? 0}
              {tournament.maxTeams ? `/${tournament.maxTeams}` : ""} teams
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name="trophy-outline"
              size={13}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.metaText}>
              {FORMAT_LABEL[tournament.format] || tournament.format}
            </Text>
          </View>

          {!!tournament.overs && (
            <View style={styles.metaItem}>
              <Ionicons
                name="baseball-outline"
                size={13}
                color={COLORS.onSurfaceVariant}
              />
              <Text style={styles.metaText}>{tournament.overs} ov</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {!!tournament.city && (
            <View style={styles.metaItem}>
              <Ionicons
                name="location-outline"
                size={13}
                color={COLORS.onSurfaceVariant}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {tournament.city}
              </Text>
            </View>
          )}

          {!!start && (
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={COLORS.onSurfaceVariant}
              />
              <Text style={styles.metaText}>
                {start}
                {end && end !== start ? ` – ${end}` : ""}
              </Text>
            </View>
          )}
        </View>

        {/*
        | A finished tournament leads with its winner. That is the one
        | thing anybody opening it afterwards is looking for.
        */}
        {tournament.status === "completed" && tournament.winnerTeam ? (
          <View style={styles.winnerRow}>
            <Ionicons name="trophy" size={14} color={COLORS.secondary} />
            <Text style={styles.winnerText} numberOfLines={1}>
              {tournament.winnerTeam?.teamName || "Winner"} won
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  cardCompact: { borderRadius: 14 },

  banner: {
    height: 108,
    backgroundColor: COLORS.primary,
    justifyContent: "space-between",
    padding: 11,
  },

  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  bannerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bannerBottom: { flexDirection: "row" },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },

  pillText: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  ownerPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  ownerPillText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: COLORS.primary,
  },

  body: { padding: 14 },

  name: {
    fontSize: 16.5,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 9,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 6,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  winnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  winnerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.onSurface,
  },
});
