import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import TeamCard from "../../../teams/components/TeamCard";

import { COLORS } from "../../../../constants/colors";

/*
|--------------------------------------------------------------------------
| PlayerTeamsTab (Read-Only)
|--------------------------------------------------------------------------
|
| The teams ANOTHER player belongs to.
|
| Uses the same TeamCard as your own profile's Teams tab, so a team looks
| identical everywhere in the app - banner, captain, player count,
| location, Matches / Wins / Win %, and the View Team footer.
|
| Distinct from common/tabs/TeamsTab.js, which is for your OWN profile:
| that one owns the data fetch and carries Create Team, multi-select,
| leave and delete actions, none of which apply to someone else's teams.
| Here the teams arrive as a prop and the only interaction is opening one.
|
| GET /players/:id populates `teams` in full - including nested captainId,
| viceCaptainId and players - so every field the card needs is already
| present and no extra request is made.
|
| props:
|   teams       - player.teams array from the API
|   playerName  - for the empty-state copy
|   onTeamPress - (teamId) => void
|
*/

export default function PlayerTeamsTab({ teams = [], playerName, onTeamPress }) {
  const list = Array.isArray(teams) ? teams : [];

  if (list.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="groups" size={56} color={COLORS.outline} />

        <Text style={styles.emptyTitle}>No Teams Yet</Text>

        <Text style={styles.emptyText}>
          {playerName || "This player"} hasn&apos;t joined a team yet.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.count}>
        {list.length} {list.length === 1 ? "Team" : "Teams"}
      </Text>

      {list.map((team) => (
        <TeamCard
          key={team._id}
          team={team}
          onPress={() => onTeamPress?.(team._id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    // TeamCard carries its own marginHorizontal: 16, so this header is
    // indented to line up with the cards below it.
    marginHorizontal: 16,
    marginBottom: 12,

    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },
});
