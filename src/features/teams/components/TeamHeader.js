import React from "react";

import { View, Text, Image, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import FollowButton from "../../follows/components/FollowButton";
import FollowStats from "../../follows/components/FollowStats";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Team Header
|--------------------------------------------------------------------------
|
| A team is followed, but a team never follows anything back - there is no
| "Following" number here, and FollowStats knows to render only the
| Followers half when targetType is "TEAM". A permanent "0 Following" on
| every team page would just invite the question of what it means.
|
| The Follow button is hidden from the owner. Everyone else - including the
| team's own players - can follow, because following is how you get the
| match-live and result notifications, and a squad member wanting those is
| perfectly reasonable.
|
*/

export default function TeamHeader({
  team,
  canFollow = true,
  onPressFollowers,
}) {
  const teamId = team?._id;

  return (
    <View style={styles.container}>
      {/* ------------------------------------------------------- */}
      {/* Logo */}
      {/* ------------------------------------------------------- */}

      <Image
        source={{
          uri: team?.logo?.url || "https://placehold.co/120",
        }}
        style={styles.logo}
      />

      {/* ------------------------------------------------------- */}
      {/* Team Name */}
      {/* ------------------------------------------------------- */}

      <Text style={styles.teamName}>{team?.teamName}</Text>

      {/* ------------------------------------------------------- */}
      {/* Location */}
      {/* ------------------------------------------------------- */}

      <View style={styles.locationRow}>
        <Ionicons name="location" size={16} color={COLORS.onSurfaceVariant} />

        <Text style={styles.location}>
          {[team?.city, team?.state].filter(Boolean).join(", ")}
        </Text>
      </View>

      {/* ------------------------------------------------------- */}
      {/* Followers + Follow */}
      {/* ------------------------------------------------------- */}

      {!!teamId && (
        <View style={styles.followBlock}>
          <FollowStats
            targetType="TEAM"
            targetId={teamId}
            onPressFollowers={onPressFollowers}
          />

          {canFollow && (
            <FollowButton
              targetType="TEAM"
              targetId={teamId}
              size="md"
              style={styles.followButton}
            />
          )}
        </View>
      )}

      {/* ------------------------------------------------------- */}
      {/* Captain / Vice Captain */}
      {/* ------------------------------------------------------- */}

      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Captain</Text>

          <Text style={styles.badgeValue}>
            {team?.captainId?.playerName || "Not Assigned"}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Vice Captain</Text>

          <Text style={styles.badgeValue}>
            {team?.viceCaptainId?.playerName || "Not Assigned"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainerLowest,

    margin: 16,

    borderRadius: 20,

    padding: 20,

    alignItems: "center",

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  logo: {
    width: 90,

    height: 90,

    borderRadius: 45,

    backgroundColor: COLORS.surfaceVariant,
  },

  teamName: {
    marginTop: 16,

    fontSize: 24,

    fontWeight: "700",

    color: COLORS.onSurface,

    textAlign: "center",
  },

  locationRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 8,
  },

  location: {
    marginLeft: 6,

    color: COLORS.onSurfaceVariant,

    fontSize: 15,
  },

  followBlock: {
    alignItems: "center",

    marginTop: 16,

    paddingTop: 16,

    borderTopWidth: 1,

    borderTopColor: COLORS.outlineVariant,

    alignSelf: "stretch",
  },

  followButton: {
    marginTop: 12,
  },

  badgeContainer: {
    flexDirection: "row",

    marginTop: 20,

    alignSelf: "stretch",
  },

  badge: {
    flex: 1,

    backgroundColor: COLORS.surfaceVariant,

    marginHorizontal: 6,

    borderRadius: 14,

    paddingVertical: 10,

    alignItems: "center",
  },

  badgeLabel: {
    fontSize: 12,

    color: COLORS.onSurfaceVariant,
  },

  badgeValue: {
    marginTop: 4,

    fontWeight: "700",

    color: COLORS.primary,
  },
});
