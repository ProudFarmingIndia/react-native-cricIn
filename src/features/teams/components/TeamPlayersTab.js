import React, { useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import TeamPlayerCard from "./TeamPlayerCard";

import useTeamInvitations from "../hooks/useTeamInvitations";

import { COLORS } from "../../../constants/colors";

export default function TeamPlayersTab({
  team,
  onPlayerPress,
  canManage = false,
  onRemovePlayer,
}) {
  /*
  |--------------------------------------------------------------------------
  | Invitation status
  |--------------------------------------------------------------------------
  |
  | Same ribbon as the Add Player squad list, for the same reason: a player
  | who was invited but has not accepted is not a squad member yet, and a
  | captain picking an XI needs to see that here too.
  |
  | The request is scoped by assertCanSendInvitations on the server, so a
  | plain member viewing someone else's team simply gets no rows and no
  | ribbons - which is the right amount of information for them.
  */

  const { statusOf } = useTeamInvitations(team?._id);
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
          invitationStatus={statusOf?.(player._id)}
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