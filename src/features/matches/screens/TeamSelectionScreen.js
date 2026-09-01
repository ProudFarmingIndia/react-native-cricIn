import React, { useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import useTeam from "../../teams/hooks/useTeam";
import { createMatchApi } from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Team Selection Screen
|--------------------------------------------------------------------------
|
| Picks the two teams for a locally-scored match (both entered by the
| same scorer), then actually creates the Match record - this used to
| just pass local state forward with a hardcoded team list and never
| touch the backend at all.
*/

export default function TeamSelectionScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const matchData = route.params?.matchData || {};

  const { allTeams, loading, getAllTeams } = useTeam();

  useEffect(() => {
    getAllTeams();
  }, [getAllTeams]);

  const [activeSlot, setActiveSlot] = useState("teamA");
  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [creating, setCreating] = useState(false);

  const filteredTeams = useMemo(() => {
    return (allTeams || []).filter(
      (team) =>
        team.teamName?.toLowerCase().includes(searchText.toLowerCase()) &&
        team._id !== teamA?._id &&
        team._id !== teamB?._id,
    );
  }, [allTeams, searchText, teamA, teamB]);

  const handleSelectTeam = (team) => {
    if (activeSlot === "teamA") {
      setTeamA(team);
      if (!teamB) setActiveSlot("teamB");
    } else {
      setTeamB(team);
    }
  };

  const handleContinue = async () => {
    if (!teamA) {
      Alert.alert("Validation", "Please select Team A");
      return;
    }

    if (!teamB) {
      Alert.alert("Validation", "Please select Team B");
      return;
    }

    if (teamA._id === teamB._id) {
      Alert.alert("Validation", "Team A and Team B must be different.");
      return;
    }

    try {
      setCreating(true);

      const match = await createMatchApi({
        matchTitle: matchData.matchName || `${teamA.teamName} vs ${teamB.teamName}`,
        matchType: matchData.matchType || "T20",
        overs: matchData.overs || 20,
        teamA: teamA._id,
        teamB: teamB._id,
        venueName: matchData.ground || "",
      });

      navigation.navigate("SquadSelectionScreen", {
        matchId: match._id,
        teamA,
        teamB,
      });
    } catch (error) {
      Alert.alert(
        "Failed",
        error.response?.data?.message || "Could not create the match.",
      );
    } finally {
      setCreating(false);
    }
  };

  const renderTeamCard = (team, slotLabel) => (
    <TouchableOpacity
      style={[
        styles.slot,
        activeSlot === slotLabel && styles.slotActive,
      ]}
      onPress={() => setActiveSlot(slotLabel)}
    >
      <Text style={styles.slotLabel}>{slotLabel === "teamA" ? "TEAM A" : "TEAM B"}</Text>

      {team ? (
        <Text style={styles.slotTeamName}>{team.teamName}</Text>
      ) : (
        <Text style={styles.slotPlaceholder}>Tap to select</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Teams</Text>

      <View style={styles.slotsRow}>
        {renderTeamCard(teamA, "teamA")}
        {renderTeamCard(teamB, "teamB")}
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={COLORS.onSurfaceVariant} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search teams..."
          placeholderTextColor={COLORS.onSurfaceVariant}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={filteredTeams}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.teamRow}
              onPress={() => handleSelectTeam(item)}
            >
              <Text style={styles.teamRowName}>{item.teamName}</Text>
              <Text style={styles.teamRowMeta}>{item.city || ""}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No teams found.</Text>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.continueButton, creating && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.continueText}>Continue to Squad Selection</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },

  loadingIndicator: {
    marginTop: 30,
  },

  listContent: {
    paddingBottom: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 16,
  },

  slotsRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  slot: {
    flex: 1,
    marginHorizontal: 4,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  slotActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  slotLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  slotTeamName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginTop: 4,
  },

  slotPlaceholder: {
    fontSize: 13,
    color: COLORS.outline,
    marginTop: 4,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    color: COLORS.onSurface,
  },

  teamRow: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  teamRowName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  teamRowMeta: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },

  emptyText: {
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
    marginTop: 30,
  },

  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  continueButtonDisabled: {
    opacity: 0.6,
  },

  continueText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },
});
