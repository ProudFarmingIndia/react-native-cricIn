import React, { useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";

import { useSelector } from "react-redux";

import Ionicons from "@expo/vector-icons/Ionicons";

import useTeam from "../../teams/hooks/useTeam";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Team Selection Section
|--------------------------------------------------------------------------
|
| Team A (Home) - only teams YOU captain. This is your team, setting up
| the match, so the list is deliberately narrow rather than showing
| every team you're merely a member of.
|
| Team B (Away) - every team in the system, with search - this is
| whoever you're playing against, so it needs to be findable, not
| restricted to teams you have any relationship with.
*/

export default function TeamSelectionSection({ matchData, updateField }) {
  const { myTeams, allTeams, getMyTeams, getAllTeams } = useTeam();

  const authUser = useSelector((state) => state.auth.user);

  const [pickerOpen, setPickerOpen] = useState(null); // "teamA" | "teamB" | null
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getMyTeams();
    getAllTeams();
  }, [getMyTeams, getAllTeams]);

  /*
  |--------------------------------------------------------------------------
  | Team A Pool - Captain Only
  |--------------------------------------------------------------------------
  */

  const captainTeams = useMemo(
    () =>
      (myTeams || []).filter(
        (team) => String(team.captainId?.userId?._id) === String(authUser?._id),
      ),
    [myTeams, authUser],
  );

  /*
  |--------------------------------------------------------------------------
  | Team B Pool - Everyone Except Your Own Captain Teams, Searchable
  |--------------------------------------------------------------------------
  |
  | Team B is "the opponent" - a team you captain has no business showing
  | up here too, or you could end up picking your own team as the
  | opponent of itself.
  */

  const captainTeamIds = useMemo(
    () => new Set(captainTeams.map((team) => team._id)),
    [captainTeams],
  );

  const searchableTeams = useMemo(() => {
    const pool = (allTeams || []).filter((team) => !captainTeamIds.has(team._id));

    if (!searchText.trim()) return pool;

    return pool.filter((team) =>
      team.teamName?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [allTeams, captainTeamIds, searchText]);

  const handleOpenPicker = (slot) => {
    setSearchText("");
    setPickerOpen(slot);
  };

  const handleSelect = (team) => {
    updateField(pickerOpen, team);
    setPickerOpen(null);
  };

  const pickerPool = pickerOpen === "teamA" ? captainTeams : searchableTeams;

  return (
    <View style={styles.row}>
      {/* ---------------------------------------------------------- */}
      {/* Team A */}
      {/* ---------------------------------------------------------- */}

      <TeamSlot
        label="Team A (Home)"
        team={matchData.teamA}
        placeholder="Select your team"
        icon="shield"
        onPress={() => handleOpenPicker("teamA")}
      />

      {/* ---------------------------------------------------------- */}
      {/* Team B */}
      {/* ---------------------------------------------------------- */}

      <TeamSlot
        label="Team B (Away)"
        team={matchData.teamB}
        placeholder="Search or select team"
        icon="people"
        onPress={() => handleOpenPicker("teamB")}
      />

      {/* ---------------------------------------------------------- */}
      {/* Picker Modal */}
      {/* ---------------------------------------------------------- */}

      <Modal visible={!!pickerOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {pickerOpen === "teamA" ? "Select Your Team" : "Select Opponent"}
              </Text>

              <TouchableOpacity onPress={() => setPickerOpen(null)}>
                <Ionicons name="close" size={22} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {pickerOpen === "teamB" && (
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={COLORS.onSurfaceVariant} />

                <TextInput
                  style={styles.searchInput}
                  placeholder="Search teams..."
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus
                />
              </View>
            )}

            {pickerOpen === "teamA" && captainTeams.length === 0 ? (
              <Text style={styles.emptyText}>
                You're not captain of any team yet. Create a team first to quick-score a match.
              </Text>
            ) : (
              <FlatList
                data={pickerPool}
                keyExtractor={(item) => item._id}
                style={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.teamRow}
                    onPress={() => handleSelect(item)}
                  >
                    <Image
                      source={{ uri: item?.logo?.url || "https://placehold.co/100" }}
                      style={styles.teamRowLogo}
                    />

                    <Text style={styles.teamRowName}>{item.teamName}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No teams found.</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Team Slot
|--------------------------------------------------------------------------
*/

function TeamSlot({ label, team, placeholder, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.slot} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.slotIconContainer}>
        {team?.logo?.url ? (
          <Image source={{ uri: team.logo.url }} style={styles.slotLogo} />
        ) : (
          <Ionicons name={icon} size={26} color={COLORS.primary} />
        )}
      </View>

      <Text style={styles.slotLabel}>{label}</Text>

      <Text style={[styles.slotValue, !team && styles.slotPlaceholder]} numberOfLines={1}>
        {team?.teamName || placeholder}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },

  slot: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },

  slotIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  slotLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  slotLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 6,
  },

  slotValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  slotPlaceholder: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "400",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "75%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.onSurface,
  },

  list: {
    marginTop: 4,
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  teamRowLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceVariant,
    marginRight: 12,
  },

  teamRowName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  emptyText: {
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
});