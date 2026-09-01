import React, { useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import TeamPlayerCard from "./TeamPlayerCard";

import { COLORS } from "../../../constants/colors";

export default function TeamPlayersTab({
  team,
  onPlayerPress,
  canManage = false,
  onRemovePlayer,
}) {
  /*
  |--------------------------------------------------------------------------
  | Players
  |--------------------------------------------------------------------------
  */

  const players = useMemo(
    () => team?.players || [],
    [team],
  );

  /*
  |--------------------------------------------------------------------------
  | Empty
  |--------------------------------------------------------------------------
  */

  if (players.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          No Players
        </Text>

        <Text style={styles.emptySubtitle}>
          This team doesn't have any players yet.
        </Text>
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  |
  | This tab is already nested inside TeamDetailsScreen's outer
  | ScrollView, so it renders a plain list here instead of a FlatList -
  | a VirtualizedList inside a ScrollView with the same orientation
  | breaks windowing (and throws exactly that warning in the console).
  |
  */

  return (
    <View style={styles.list}>
      {players.map((player) => (
        <TeamPlayerCard
          key={String(player._id)}
          player={player}
          team={team}
          onPress={onPlayerPress}
          canManage={canManage}
          onRemove={onRemovePlayer}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,

    paddingVertical: 16,

    paddingBottom: 40,
  },

  emptyContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingVertical: 80,
  },

  emptyTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  emptySubtitle: {
    marginTop: 8,

    fontSize: 14,

    textAlign: "center",

    color: COLORS.onSurfaceVariant,
  },
});