import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

import TeamPlayerCard from "./TeamPlayerCard";
import TeamMatchCard from "./TeamMatchCard";
import UpcomingMatchCard from "./UpcomingMatchCard";

export default function TeamOverviewTab({
  team,
  onPlayerPress,
  onViewAllPlayers,
}) {
  /*
  |--------------------------------------------------------------------------
  | Players
  |--------------------------------------------------------------------------
  */

  const players = team?.players || [];

  return (
    <View style={styles.container}>
      {/* ------------------------------------------------------- */}
      {/* Active Squad */}
      {/* ------------------------------------------------------- */}

      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Active Squad
          </Text>

          <TouchableOpacity onPress={onViewAllPlayers}>
            <Text style={styles.action}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {players.length === 0 ? (
          <Text style={styles.emptyText}>
            No players added yet.
          </Text>
        ) : (
          players
            .slice(0, 3)
            .map((player) => (
              <TeamPlayerCard
                key={player._id}
                player={player}
                team={team}
                onPress={onPlayerPress}
              />
            ))
        )}
      </View>

      {/* ------------------------------------------------------- */}
      {/* Recent Match */}
      {/* ------------------------------------------------------- */}

      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Recent Match
          </Text>
        </View>

        <TeamMatchCard
          team={team}
        />
      </View>

      {/* ------------------------------------------------------- */}
      {/* Upcoming Match */}
      {/* ------------------------------------------------------- */}

      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Upcoming Match
          </Text>
        </View>

        <UpcomingMatchCard
          team={team}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,

    paddingBottom: 30,
  },

  section: {
    marginBottom: 30,
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
  },

  action: {
    color: COLORS.primary,

    fontWeight: "600",
  },

  emptyText: {
    color:
      COLORS.onSurfaceVariant,

    fontSize: 14,
  },
});