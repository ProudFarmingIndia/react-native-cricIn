import React from "react";

import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import FollowButton from "../../follows/components/FollowButton";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Team Result Card
|--------------------------------------------------------------------------
|
| Deciding whether a team is worth challenging needs more than a name and
| a city. The card now surfaces the squad size, the record, and the review
| rating - the three things asked about before a challenge is sent.
|
| The rating badge only renders when reviewCount > 0. Previously it showed
| whenever rating > 0, which meant a single review displayed as an
| authoritative "5.0" with nothing to indicate how thin that was.
|
*/

export default function TeamResultCard({ team, onPress, showFollow = true }) {
  const logoUrl = team?.logo?.url;

  const location = [team?.city, team?.state].filter(Boolean).join(", ");

  const squadSize = Array.isArray(team?.players) ? team.players.length : 0;

  const matches = team?.totalMatches || 0;

  const wins = team?.wins || 0;

  const rating = team?.rating || 0;

  const reviewCount = team?.reviewCount || 0;

  /*
  | Stamped on by the search endpoint. Falls back to the raw schema field
  | for rows that came from elsewhere (a following list, a team squad).
  */

  const followerCount = Math.max(
    0,
    team?.followerCount ?? team?.followersCount ?? 0,
  );

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress?.(team)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${team?.teamName || "team"}`}
    >
      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.logoFallback]}>
          <Text style={styles.logoInitials} numberOfLines={1}>
            {team?.shortName || (team?.teamName || "?").slice(0, 3).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {team?.teamName || "Unnamed team"}
          </Text>

          {!!team?.isVerified && (
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={COLORS.primary}
              style={styles.verifiedIcon}
            />
          )}
        </View>

        <View style={styles.chipRow}>
          {!!team?.shortName && (
            <View style={styles.shortNameChip}>
              <Text style={styles.shortNameText}>{team.shortName}</Text>
            </View>
          )}

          {!!team?.teamType && (
            <Text style={styles.typeText} numberOfLines={1}>
              {team.teamType}
              {squadSize > 0
                ? ` · ${squadSize} ${squadSize === 1 ? "player" : "players"}`
                : ""}
            </Text>
          )}
        </View>

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
                  name="trophy-outline"
                  size={12}
                  color={COLORS.onSurfaceVariant}
                />
                <Text style={styles.metaText}>
                  {wins}/{matches} won
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

      {reviewCount > 0 && (
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={11} color={COLORS.secondaryContainer} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      )}

      {/*
      | Replaces the chevron rather than sitting next to it - see the same
      | note in PlayerResultCard. Tapping the row still opens the team.
      */}
      {showFollow ? (
        <FollowButton targetType="TEAM" targetId={team?._id} />
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

  logo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginRight: 12,
  },

  logoFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 4,
  },

  logoInitials: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
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

  verifiedIcon: {
    marginLeft: 5,
  },

  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  shortNameChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainer,
    marginRight: 8,
  },

  shortNameText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: COLORS.primary,
  },

  typeText: {
    flex: 1,
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

  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginRight: 6,
  },

  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.onSecondary,
    marginLeft: 3,
  },
});
