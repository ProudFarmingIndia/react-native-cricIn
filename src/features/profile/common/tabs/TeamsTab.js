import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";

import Ionicons from "@expo/vector-icons/Ionicons";

import TeamCard from "../../../teams/components/TeamCard";

import useTeam from "../../../teams/hooks/useTeam";

import { COLORS } from "../../../../constants/colors";

export default function TeamsTab() {
  const navigation = useNavigation();

  const { myTeams, loading, getMyTeams, deleteTeam, leaveTeam } = useTeam();

  const authUser = useSelector((state) => state.auth.user);

  /*
  |--------------------------------------------------------------------------
  | Selection Mode
  |--------------------------------------------------------------------------
  */

  const [selecting, setSelecting] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | Load Teams
  |--------------------------------------------------------------------------
  |
  | useFocusEffect (not useEffect) so returning to this tab after creating
  | or leaving a team always shows the current list, not a stale one.
  |
  */

  useFocusEffect(
    useCallback(() => {
      getMyTeams();
    }, [getMyTeams]),
  );

  /*
  |--------------------------------------------------------------------------
  | Ownership
  |--------------------------------------------------------------------------
  */

  const isOwnerOf = (team) => {
    const ownerId = team?.userId?._id || team?.userId;
    return String(ownerId) === String(authUser?._id);
  };

  /*
  |--------------------------------------------------------------------------
  | Selection Handlers
  |--------------------------------------------------------------------------
  */

  const toggleSelecting = () => {
    setSelecting((prev) => !prev);
    setSelectedIds([]);
  };

  const toggleSelected = (teamId) => {
    setSelectedIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Bulk Delete / Leave
  |--------------------------------------------------------------------------
  |
  | A single "Remove" action covers both cases - teams you own get
  | deleted, teams you've just joined get left. Each selected team is
  | resolved according to its own relationship to you, not a single
  | global choice, since a multi-select batch can easily contain both.
  |
  */

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) return;

    const selectedTeams = myTeams.filter((team) =>
      selectedIds.includes(team._id),
    );

    const ownedCount = selectedTeams.filter(isOwnerOf).length;
    const joinedCount = selectedTeams.length - ownedCount;

    const parts = [];
    if (ownedCount > 0) parts.push(`delete ${ownedCount} team(s) you own`);
    if (joinedCount > 0) parts.push(`leave ${joinedCount} team(s) you've joined`);

    Alert.alert(
      "Remove Teams",
      `This will ${parts.join(" and ")}. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            for (const team of selectedTeams) {
              if (isOwnerOf(team)) {
                await deleteTeam(team._id);
              } else {
                await leaveTeam(team._id);
              }
            }

            setSelecting(false);
            setSelectedIds([]);
          },
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Create Team
  |--------------------------------------------------------------------------
  */

  const handleCreateTeam = () => {
    navigation.navigate("TeamStack", {
      screen: "CreateTeamScreen",
    });
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
          You haven't joined any teams yet.
        </Text>

        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.85}
          onPress={handleCreateTeam}
        >
          <Ionicons name="add" size={18} color="#FFF" style={styles.buttonIcon} />
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
          <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} style={styles.headerActionIcon} />
          <Text style={styles.headerActionText}>Create Team</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerAction}
          activeOpacity={0.8}
          onPress={toggleSelecting}
        >
          <Text
            style={[
              styles.headerActionText,
              selecting && styles.headerActionTextActive,
            ]}
          >
            {selecting ? "Cancel" : "Select"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {myTeams.map((item) => (
          <TeamCard
            key={item._id}
            team={item}
            selectable={selecting}
            selected={selectedIds.includes(item._id)}
            onPress={() => {
              if (selecting) {
                toggleSelected(item._id);
                return;
              }

              navigation.navigate("TeamDetailsScreen", {
                teamId: item._id,
              });
            }}
          />
        ))}
      </View>

      {selecting && selectedIds.length > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.removeButton}
            activeOpacity={0.85}
            onPress={handleRemoveSelected}
          >
            <Text style={styles.removeButtonText}>
              Remove {selectedIds.length} Team
              {selectedIds.length > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: "space-between",
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

  headerActionTextActive: {
    color: COLORS.error,
  },

  listContainer: {
    paddingBottom: 30,
  },

  actionBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },

  removeButton: {
    backgroundColor: COLORS.error,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  removeButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
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
