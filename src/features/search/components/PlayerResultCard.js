import React from "react";

import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import FollowButton from "../../follows/components/FollowButton";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Player Result Card
|--------------------------------------------------------------------------
|
| The previous card showed a name and a bare playerType string, which is
| not enough to tell two players with the same name apart - the exact
| moment a search result has to be useful.
|
| It now shows the things a captain actually scans for: the role, how they
| bat/bowl, where they play, and how much cricket they've played. Every
| line is built from fields the search endpoint already returns, so this
| costs no extra request.
|
| Everything below the name is optional and collapses cleanly: a brand new
| profile with nothing filled in renders as a clean name row rather than a
| card full of "-" placeholders.
|
*/

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function PlayerResultCard({
  player,
  onPress,

  /*
  | Set false where a Follow button makes no sense - the signed-in user's
  | own row, or a list that is already about following.
  */
  showFollow = true,
}) {
  const name = player?.playerName || player?.userId?.fullName || "Unknown player";

  const avatarUrl = player?.profileImage?.url || player?.userId?.profileImage?.url;

  const location = [player?.city, player?.state].filter(Boolean).join(", ");

  const stats = player?.stats || {};

  const matches = stats.totalMatches || 0;

  /*
  | Batting and bowling style are free-text fields, so they're shown as
  | typed rather than parsed. Joined with a middle dot only when both are
  | present, which avoids a leading or trailing separator.
  */

  const styleLine = [player?.battingStyle, player?.bowlingStyle]
    .filter(Boolean)
    .join(" · ");

  /*
  | canFollow is stamped on by the search endpoint. It is false for local
  | players - squad entries with no CricIn account behind them, who have
  | nobody to notify and nothing to follow for updates.
  |
  | The `?? !player?.isLocal` fallback covers rows that came from somewhere
  | other than search (a team squad, a followers list), where the field was
  | never set.
  */

  const canFollow = player?.canFollow ?? !player?.isLocal;

  const followerCount = Math.max(
    0,
    player?.followerCount ?? player?.followers ?? 0,
  );

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress?.(player)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${name}'s profile`}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitials}>{initialsOf(name) || "?"}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>

          {/*
          | Local players are squad entries created by a captain for
          | someone who has no CricIn account. Marking them matters:
          | you cannot invite or follow a local player, so without this
          | the tap lands on a profile that behaves unexpectedly.
          */}
          {!!player?.isLocal && (
            <View style={styles.localBadge}>
              <Text style={styles.localBadgeText}>LOCAL</Text>
            </View>
          )}
        </View>

        {!!player?.playerType && (
          <View style={styles.roleRow}>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>{player.playerType}</Text>
            </View>

            {!!styleLine && (
              <Text style={styles.styleText} numberOfLines={1}>
                {styleLine}
              </Text>
            )}
          </View>
        )}

        {(!!location || matches > 0 || followerCount > 0) && (
          <View style={styles.metaRow}>
            {!!location && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={COLORS.onSurfaceVariant}
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            )}

            {matches > 0 && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={COLORS.onSurfaceVariant}
                />
                <Text style={styles.metaText}>
                  {matches} {matches === 1 ? "match" : "matches"}
                </Text>
              </View>
            )}

            {followerCount > 0 && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="people-outline"
                  size={12}
                  color={COLORS.onSurfaceVariant}
                />
                <Text style={styles.metaText}>
                  {followerCount}{" "}
                  {followerCount === 1 ? "follower" : "followers"}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/*
      | The Follow button replaces the chevron rather than sitting beside
      | it - two tappable things on the right of one row, one of which does
      | something quite different from tapping the row itself, is how a
      | mistap happens. The whole row still opens the profile.
      */}
      {showFollow && canFollow ? (
        <FollowButton targetType="PLAYER" targetId={player?._id} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginRight: 12,
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryContainer,
  },

  avatarInitials: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  content: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    flexShrink: 1,
    fontSize: 15.5,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  localBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  localBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: COLORS.onSurfaceVariant,
  },

  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainer,
  },

  roleChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },

  styleText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    flexShrink: 1,
  },

  metaText: {
    marginLeft: 4,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },
});
