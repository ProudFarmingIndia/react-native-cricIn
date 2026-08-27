import React from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function TeamHeader({
  team,
}) {
  return (
    <View style={styles.container}>
      {/* ------------------------------------------------------- */}
      {/* Logo */}
      {/* ------------------------------------------------------- */}

      <Image
        source={{
          uri:
            team?.logo?.url ||
            "https://placehold.co/120",
        }}
        style={styles.logo}
      />

      {/* ------------------------------------------------------- */}
      {/* Team Name */}
      {/* ------------------------------------------------------- */}

      <Text style={styles.teamName}>
        {team?.teamName}
      </Text>

      {/* ------------------------------------------------------- */}
      {/* Location */}
      {/* ------------------------------------------------------- */}

      <View style={styles.locationRow}>
        <Ionicons
          name="location"
          size={16}
          color={COLORS.onSurfaceVariant}
        />

        <Text style={styles.location}>
          {[team?.city, team?.state]
            .filter(Boolean)
            .join(", ")}
        </Text>
      </View>

      {/* ------------------------------------------------------- */}
      {/* Captain / Vice Captain */}
      {/* ------------------------------------------------------- */}

      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>
            Captain
          </Text>

          <Text style={styles.badgeValue}>
            {team?.captainId?.playerName ||
              "Not Assigned"}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>
            Vice Captain
          </Text>

          <Text style={styles.badgeValue}>
            {team?.viceCaptainId
              ?.playerName ||
              "Not Assigned"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:
      COLORS.surfaceContainerLowest,

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

    backgroundColor:
      COLORS.surfaceVariant,
  },

  teamName: {
    marginTop: 16,

    fontSize: 24,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  locationRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 8,
  },

  location: {
    marginLeft: 6,

    color:
      COLORS.onSurfaceVariant,

    fontSize: 15,
  },

  badgeContainer: {
    flexDirection: "row",

    marginTop: 20,
  },

  badge: {
    flex: 1,

    backgroundColor:
      COLORS.surfaceVariant,

    marginHorizontal: 6,

    borderRadius: 14,

    paddingVertical: 10,

    alignItems: "center",
  },

  badgeLabel: {
    fontSize: 12,

    color:
      COLORS.onSurfaceVariant,
  },

  badgeValue: {
    marginTop: 4,

    fontWeight: "700",

    color: COLORS.primary,
  },
});