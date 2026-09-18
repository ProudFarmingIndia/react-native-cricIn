import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import EmptySquadState from "./EmptySquadState";
import TeamPlayerCard from "./TeamPlayerCard";

import { COLORS } from "../../../constants/colors";

/*
| `statusOf` comes from useTeamInvitations - it maps a player id to their
| invitation status, or null for a confirmed member. Optional, so this
| component still renders correctly anywhere it is used without it.
*/

export default function CurrentSquadSection({
  team,
  players = [],
  canManage = false,
  onPlayerPress,
  onRemovePlayer,
  statusOf,
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
        /*
        | Wrapped rather than changing TeamPlayerCard's own marginBottom -
        | that card is also used in TeamPlayersTab and the team profile,
        | and this list is the only place that wanted more air between rows.
        */
        players.map((player) => (
          <View key={player._id} style={styles.cardWrapper}>
            <TeamPlayerCard
              player={player}
              team={team}
              invitationStatus={statusOf?.(player._id)}
              canManage={canManage}
              onPress={onPlayerPress}
              onRemove={onRemovePlayer}
            />
          </View>
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

  cardWrapper: {
    marginBottom: 6,
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