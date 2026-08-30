import React from "react";

import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import TeamPlayerCard from "./TeamPlayerCard";

/*
|--------------------------------------------------------------------------
| Team Overview Tab
|--------------------------------------------------------------------------
|
| Answers the three questions you actually have when you open a team:
| who runs it, how long it has existed, and who is in the squad.
|
| It used to also carry Recent Match and Upcoming Match panels. Those were
| fed `team={team}` while TeamMatchCard expects {title, value, color} and
| UpcomingMatchCard expects {match, onPress} - so one rendered blank and
| the other sat permanently on its "No Upcoming Match" empty state.
| Matches have their own tab; two broken panels here helped nobody.
|
| props:
|   team              - the populated team document
|   onPlayerPress     - (player) => void, opens that player's profile
|   onViewAllPlayers  - () => void, switches to the Players tab
|
*/

const SQUAD_PREVIEW_COUNT = 5;

const formatDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function TeamOverviewTab({
  team,
  onPlayerPress,
  onViewAllPlayers,
}) {
  const players = team?.players || [];

  const captain = team?.captainId;

  const viceCaptain = team?.viceCaptainId;

  const createdOn = formatDate(team?.createdAt);

  const preview = players.slice(0, SQUAD_PREVIEW_COUNT);

  const remaining = players.length - preview.length;

  return (
    <View style={styles.container}>
      {/* ------------------------------------------------------- */}
      {/* Leadership */}
      {/* ------------------------------------------------------- */}

      <View style={styles.section}>
        <Text style={styles.title}>Leadership</Text>

        <View style={styles.card}>
          <LeaderRow
            label="Captain"
            player={captain}
            icon="ribbon"
            onPress={captain ? () => onPlayerPress?.(captain) : undefined}
          />

          <View style={styles.divider} />

          <LeaderRow
            label="Vice-Captain"
            player={viceCaptain}
            icon="star"
            onPress={
              viceCaptain ? () => onPlayerPress?.(viceCaptain) : undefined
            }
          />
        </View>
      </View>

      {/* ------------------------------------------------------- */}
      {/* Created */}
      {/* ------------------------------------------------------- */}

      {!!createdOn && (
        <View style={styles.section}>
          <Text style={styles.title}>Team Since</Text>

          <View style={[styles.card, styles.createdCard]}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.createdBody}>
              <Text style={styles.createdValue}>{createdOn}</Text>

              <Text style={styles.createdLabel}>
                {team?.teamName || "This team"} was created on this date
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ------------------------------------------------------- */}
      {/* Active Squad */}
      {/* ------------------------------------------------------- */}

      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.titleInline}>Active Squad</Text>

          {players.length > 0 && (
            <TouchableOpacity onPress={onViewAllPlayers} activeOpacity={0.7}>
              <Text style={styles.action}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {players.length === 0 ? (
          <Text style={styles.emptyText}>No players added yet.</Text>
        ) : (
          <>
            {preview.map((player) => (
              <TeamPlayerCard
                key={String(player._id)}
                player={player}
                team={team}
                onPress={onPlayerPress}
              />
            ))}

            {remaining > 0 && (
              <TouchableOpacity
                style={styles.moreButton}
                onPress={onViewAllPlayers}
                activeOpacity={0.8}
              >
                <Text style={styles.moreText}>
                  View {remaining} more{" "}
                  {remaining === 1 ? "player" : "players"}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Leader Row
|--------------------------------------------------------------------------
|
| Tappable when the seat is filled, inert and visibly muted when vacant -
| so an empty vice-captain seat reads as "nobody yet" rather than as a
| button that does nothing.
|
*/

function LeaderRow({ label, player, icon, onPress }) {
  const filled = !!player;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={styles.leaderRow}
      onPress={onPress}
      activeOpacity={0.7}
      {...(onPress
        ? {
            accessibilityRole: "button",
            accessibilityLabel: `${label} profile`,
          }
        : {})}
    >
      {filled ? (
        <Image
          source={{
            uri: player?.profileImage?.url || "https://placehold.co/100",
          }}
          style={styles.leaderAvatar}
        />
      ) : (
        <View style={[styles.leaderAvatar, styles.leaderAvatarEmpty]}>
          <Ionicons name={icon} size={18} color={COLORS.outline} />
        </View>
      )}

      <View style={styles.leaderBody}>
        <Text style={styles.leaderLabel}>{label}</Text>

        <Text
          style={[styles.leaderName, !filled && styles.leaderNameEmpty]}
          numberOfLines={1}
        >
          {player?.playerName || "Not assigned"}
        </Text>
      </View>

      {filled && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  section: {
    marginBottom: 26,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 14,
  },

  titleInline: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  action: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 14,
  },

  /* Leadership */

  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },

  leaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceContainerHighest,
  },

  leaderAvatarEmpty: {
    alignItems: "center",
    justifyContent: "center",
  },

  leaderBody: {
    flex: 1,
  },

  leaderLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  leaderName: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  leaderNameEmpty: {
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },

  /* Created */

  createdCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },

  createdBody: {
    flex: 1,
  },

  createdValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  createdLabel: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  /* Squad */

  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },

  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
  },

  moreText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
