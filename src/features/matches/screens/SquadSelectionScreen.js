import React, { useMemo, useState } from "react";

import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import SquadTeamSection from "../../../components/matches/SquadSelectionScreen/SquadTeamSection";
import SquadProgressBar from "../../../components/matches/SquadSelectionScreen/SquadProgressBar";

import { updateMatchApi } from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Squad Selection Screen
|--------------------------------------------------------------------------
|
| Expects via route.params: matchId, teamA, teamB (full Team docs with
| populated .players, from TeamSelectionScreen).
|
| This screen is only about who's playing today - captain/vice-captain
| are already set at the team level (team.captainId/viceCaptainId) and
| aren't reselected per match.
|
| On continue: persists both Playing XIs to the Match record
| (teamASquad/teamBSquad) so they survive an app restart, then forwards
| the selected squads to TossScreen.
*/

export default function SquadSelectionScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { matchId, teamA, teamB } = route.params || {};

  const [selectedA, setSelectedA] = useState([]);
  const [selectedB, setSelectedB] = useState([]);

  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");

  const [saving, setSaving] = useState(false);

  const poolA = useMemo(
    () =>
      (teamA?.players || []).filter((p) =>
        p.playerName?.toLowerCase().includes(searchA.toLowerCase()),
      ),
    [teamA, searchA],
  );

  const poolB = useMemo(
    () =>
      (teamB?.players || []).filter((p) =>
        p.playerName?.toLowerCase().includes(searchB.toLowerCase()),
      ),
    [teamB, searchB],
  );

  const togglePlayer = (player, selected, setter) => {
    setter((prev) => {
      const exists = prev.find((p) => p._id === player._id);

      if (exists) {
        return prev.filter((p) => p._id !== player._id);
      }

      if (prev.length >= 11) {
        Alert.alert("Maximum 11 players allowed");
        return prev;
      }

      return [...prev, player];
    });
  };

  const handleContinue = async () => {
    if (selectedA.length !== 11 || selectedB.length !== 11) {
      Alert.alert("Both teams must have 11 players selected.");
      return;
    }

    try {
      setSaving(true);

      await updateMatchApi(matchId, {
        teamASquad: selectedA.map((p) => p._id),
        teamBSquad: selectedB.map((p) => p._id),
      });

      navigation.navigate("TossScreen", {
        matchId,
        teamA: { ...teamA, squad: selectedA },
        teamB: { ...teamB, squad: selectedB },
      });
    } catch (error) {
      Alert.alert(
        "Failed",
        error.response?.data?.message || "Could not save the squads.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SquadTeamSection
          teamLabel="TEAM A"
          teamName={teamA?.teamName || "Team A"}
          players={poolA}
          selectedPlayers={selectedA}
          searchText={searchA}
          onSearch={setSearchA}
          onSelectPlayer={(player) => togglePlayer(player, selectedA, setSelectedA)}
        />

        <SquadTeamSection
          teamLabel="TEAM B"
          teamName={teamB?.teamName || "Team B"}
          players={poolB}
          selectedPlayers={selectedB}
          searchText={searchB}
          onSearch={setSearchB}
          onSelectPlayer={(player) => togglePlayer(player, selectedB, setSelectedB)}
        />
      </ScrollView>

      {saving ? (
        <View style={styles.savingBar}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : (
        <SquadProgressBar
          selectedCount={selectedA.length + selectedB.length}
          onContinue={handleContinue}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 160,
  },

  savingBar: {
    padding: 16,
    alignItems: "center",
  },
});