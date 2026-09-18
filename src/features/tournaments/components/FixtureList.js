/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| FixtureList.js
|
| Description:
| The schedule, grouped by round.
|
| A fixture here is a real Match, so tapping one opens the same match
| screen as anywhere else in the app - there is no separate "fixture"
| concept for the user to learn.
|
| The interesting case is a playoff slot whose teams are not known yet.
| It still has a date and a ground booked, so it is shown - as "To be
| decided" rather than hidden. Hiding it would make the schedule look
| shorter than it is and give the organizer nothing to edit.
|
|--------------------------------------------------------------------------
*/

import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import TeamBadge from "../../../components/matches/TeamBadge";

import { COLORS } from "../../../constants/colors";

const when = (value) => {
  if (!value) return "Date TBD";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "Date TBD";

  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Side = ({ team, won }) => (
  <View style={styles.side}>
    <TeamBadge team={team} size={30} />

    <Text
      style={[styles.sideName, won && styles.sideNameWon]}
      numberOfLines={1}
    >
      {team?.teamName || "To be decided"}
    </Text>

    {won ? (
      <Ionicons name="trophy" size={13} color={COLORS.secondary} />
    ) : null}
  </View>
);

export default function FixtureList({
  rounds = [],
  onPressMatch,
  canManage = false,
  onEditFixture,
}) {
  if (!rounds.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="calendar-outline" size={26} color={COLORS.outline} />

        <Text style={styles.emptyText}>
          Fixtures abhi nahi bane. Organizer teams lock karke schedule
          banayega.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {rounds.map((round) => (
        <View key={round.label} style={styles.round}>
          <View style={styles.roundHead}>
            <Text style={styles.roundLabel}>
              {String(round.label).toUpperCase()}
            </Text>

            <Text style={styles.roundCount}>
              {round.matches.length}{" "}
              {round.matches.length === 1 ? "match" : "matches"}
            </Text>
          </View>

          {round.matches.map((match) => {
            const winnerId = match.winnerTeam?._id
              ? String(match.winnerTeam._id)
              : match.winnerTeam
                ? String(match.winnerTeam)
                : null;

            const done = match.status === "completed";

            const live = match.status === "live";

            const pending = !match.teamA || !match.teamB;

            return (
              <TouchableOpacity
                key={String(match._id)}
                style={[styles.match, live && styles.matchLive]}
                activeOpacity={pending ? 1 : 0.85}
                onPress={() => !pending && onPressMatch?.(match)}
              >
                <View style={styles.matchTop}>
                  <Text style={styles.matchNumber}>
                    MATCH {match.tournamentRound?.matchNumber ?? "—"}
                  </Text>

                  {live && (
                    <View style={styles.liveTag}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  )}

                  {done && <Text style={styles.doneText}>RESULT</Text>}
                </View>

                <Side
                  team={match.teamA}
                  won={!!winnerId && String(match.teamA?._id) === winnerId}
                />

                <Side
                  team={match.teamB}
                  won={!!winnerId && String(match.teamB?._id) === winnerId}
                />

                <View style={styles.matchMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={COLORS.onSurfaceVariant}
                    />
                    <Text style={styles.metaText}>{when(match.startTime)}</Text>
                  </View>

                  {!!match.venueName && (
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color={COLORS.onSurfaceVariant}
                      />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {match.venueName}
                      </Text>
                    </View>
                  )}
                </View>

                {done && !!match.result && (
                  <Text style={styles.result} numberOfLines={2}>
                    {match.result}
                  </Text>
                )}

                {/*
                | Date and ground only. Teams are not editable - the draw
                | came out of the format, and hand-swapping one pairing
                | breaks the guarantee that everybody plays everybody.
                */}
                {canManage && !done && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => onEditFixture?.(match)}
                  >
                    <Ionicons
                      name="create-outline"
                      size={13}
                      color={COLORS.primary}
                    />
                    <Text style={styles.editText}>Date / ground</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20 },

  round: { gap: 10 },

  roundHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  roundLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.primary,
  },

  roundCount: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  match: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
  },

  matchLive: {
    borderColor: COLORS.error,
    borderLeftWidth: 4,
  },

  matchTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  matchNumber: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },

  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.error,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },

  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ffffff",
  },

  liveText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.6,
  },

  doneText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: COLORS.outline,
  },

  side: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 4,
  },

  sideName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  sideNameWon: {
    fontWeight: "800",
    color: COLORS.primary,
  },

  matchMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 9,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  result: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  editText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.primary,
  },

  empty: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 34,
    paddingHorizontal: 24,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },
});
