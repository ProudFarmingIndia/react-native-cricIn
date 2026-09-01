import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import EmptySquadState from "./EmptySquadState";
import TeamPlayerCard from "./TeamPlayerCard";

import { COLORS } from "../../../constants/colors";

export default function CurrentSquadSection({
  team,
  players = [],
  canManage = false,
  onPlayerPress,
  onRemovePlayer,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Current Squad
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {players.length}/15
          </Text>
        </View>
      </View>

      {players.length === 0 ? (
        <EmptySquadState />
      ) : (
        players.map((player) => (
          <TeamPlayerCard
            key={player._id}
            player={player}
            team={team}
            canManage={canManage}
            onPress={onPlayerPress}
            onRemove={onRemovePlayer}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 18,
  },

  title: {
    fontSize: 22,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  badge: {
    backgroundColor: COLORS.surfaceContainer,

    paddingHorizontal: 14,

    paddingVertical: 6,

    borderRadius: 20,
  },

  badgeText: {
    fontSize: 14,

    fontWeight: "700",

    color: COLORS.onSurfaceVariant,
  },
});