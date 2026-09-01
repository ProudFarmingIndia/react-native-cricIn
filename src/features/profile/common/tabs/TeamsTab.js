import React, { useCallback } from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import TeamCard from "../../../teams/components/TeamCard";

import useTeam from "../../../teams/hooks/useTeam";

import { COLORS } from "../../../../constants/colors";

/*
|--------------------------------------------------------------------------
| TeamsTab
|--------------------------------------------------------------------------
|
| Your teams, on your own profile. A plain list plus Create Team.
|
| The multi-select "Select" mode and its bulk Remove action have been
| taken out. That action deleted every selected team you owned and left
| the ones you had joined - a destructive, irreversible operation reached
| by two taps from a list, with no per-team context and no undo.
|
| Deleting a team now lives in exactly one place: that team's own Settings
| tab, next to Leave Team, where the team's name and squad are on screen
| and the server can refuse if a match is in flight. Leaving lives in the
| same place, so nothing is lost by dropping this shortcut.
|
*/

export default function TeamsTab() {
  const navigation = useNavigation();

  const { myTeams, loading, getMyTeams } = useTeam();

  /*
  |--------------------------------------------------------------------------
  | Load Teams
  |--------------------------------------------------------------------------
  |
  | useFocusEffect (not useEffect) so returning to this tab after creating,
  | leaving or deleting a team always shows the current list, not a stale
  | one.
  |
  */

  useFocusEffect(
    useCallback(() => {
      getMyTeams();
    }, [getMyTeams]),
  );

  const handleCreateTeam = () => {
    navigation.navigate("TeamStack", {
      screen: "CreateTeamScreen",
    });
  };

  const openTeam = (teamId) => {
    navigation.navigate("TeamDetailsScreen", { teamId });
  };

  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  if (!loading && myTeams.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Teams</Text>

        <Text style={styles.emptyDescription}>
          You haven&apos;t joined any teams yet.
        </Text>

        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.85}
          onPress={handleCreateTeam}
        >
          <Ionicons
            name="add"
            size={18}
            color="#FFF"
            style={styles.buttonIcon}
          />

          <Text style={styles.createButtonText}>Create Team</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerAction}
          activeOpacity={0.8}
          onPress={handleCreateTeam}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color={COLORS.primary}
            style={styles.headerActionIcon}
          />

          <Text style={styles.headerActionText}>Create Team</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {myTeams.map((item) => (
          <TeamCard
            key={item._id}
            team={item}
            onPress={() => openTeam(item._id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },

  buttonIcon: {
    marginRight: 8,
  },

  headerActionIcon: {
    marginRight: 6,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerAction: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  listContainer: {
    paddingBottom: 30,
  },

  emptyContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingVertical: 60,

    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  emptyDescription: {
    marginTop: 10,

    textAlign: "center",

    fontSize: 14,

    lineHeight: 22,

    color: COLORS.onSurfaceVariant,
  },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  createButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
