import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import { COLORS } from "../../../constants/colors";

const MOCK_TEAMS = [
  {
    _id: "1",
    name: "Lions XI",
    city: "Mumbai",
  },
  {
    _id: "2",
    name: "Super Strikers",
    city: "Delhi",
  },
  {
    _id: "3",
    name: "Desert Warriors",
    city: "Dubai",
  },
  {
    _id: "4",
    name: "City Knights",
    city: "London",
  },
];

export default function TeamSelectionScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const matchData = route.params?.matchData || {};

  const [teamSelection, setTeamSelection] = useState({
    activeSlot: "teamA",

    teamA: null,

    teamB: null,

    searchText: "",
  });

  const filteredTeams = useMemo(() => {
    return MOCK_TEAMS.filter(
      (team) =>
        team.name
          .toLowerCase()
          .includes(teamSelection.searchText.toLowerCase()) ||
        team.city
          .toLowerCase()
          .includes(teamSelection.searchText.toLowerCase()),
    );
  }, [teamSelection.searchText]);

  const updateField = (field, value) => {
    setTeamSelection((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectTeam = (team) => {
    const oppositeTeam =
      teamSelection.activeSlot === "teamA"
        ? teamSelection.teamB
        : teamSelection.teamA;

    if (oppositeTeam && oppositeTeam._id === team._id) {
      Alert.alert(
        "Invalid Selection",
        "You cannot select the same team twice.",
      );

      return;
    }

    setTeamSelection((prev) => ({
      ...prev,
      [prev.activeSlot]: team,
    }));

    if (teamSelection.activeSlot === "teamA" && !teamSelection.teamB) {
      updateField("activeSlot", "teamB");
    }
  };

  const handleContinue = () => {
    if (!teamSelection.teamA) {
      Alert.alert("Validation", "Please select Team A");
      return;
    }

    if (!teamSelection.teamB) {
      Alert.alert("Validation", "Please select Team B");
      return;
    }

    navigation.navigate("SquadSelectionScreen", {
      matchData: {
        ...matchData,

        teamA: teamSelection.teamA,

        teamB: teamSelection.teamB,
      },
    });
  };

  const renderTeamCard = ({ item }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => handleSelectTeam(item)}
    >
      <Text style={styles.teamName}>{item.name}</Text>

      <Text style={styles.teamCity}>{item.city}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* SEARCH */}

      <TextInput
        style={styles.searchInput}
        placeholder="Search Team..."
        value={teamSelection.searchText}
        onChangeText={(text) => updateField("searchText", text)}
      />

      {/* TEAM A */}

      <TouchableOpacity
        style={[
          styles.selectedCard,

          teamSelection.activeSlot === "teamA" && styles.activeCard,
        ]}
        onPress={() => updateField("activeSlot", "teamA")}
      >
        <Text style={styles.slotLabel}>Team A</Text>

        <Text style={styles.slotValue}>
          {teamSelection.teamA?.name || "Select Team A"}
        </Text>
      </TouchableOpacity>

      {/* TEAM B */}

      <TouchableOpacity
        style={[
          styles.selectedCard,

          teamSelection.activeSlot === "teamB" && styles.activeCard,
        ]}
        onPress={() => updateField("activeSlot", "teamB")}
      >
        <Text style={styles.slotLabel}>Team B</Text>

        <Text style={styles.slotValue}>
          {teamSelection.teamB?.name || "Select Team B"}
        </Text>
      </TouchableOpacity>

      {/* TEAM LIST */}

      <FlatList
        data={filteredTeams}
        keyExtractor={(item) => item._id}
        renderItem={renderTeamCard}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      />

      {/* CONTINUE */}

      <TouchableOpacity
        style={[
          styles.continueButton,

          (!teamSelection.teamA || !teamSelection.teamB) && {
            opacity: 0.5,
          },
        ]}
        disabled={!teamSelection.teamA || !teamSelection.teamB}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>Continue</Text>
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

  searchInput: {
    height: 50,

    backgroundColor: "#fff",

    borderRadius: 12,

    paddingHorizontal: 16,

    marginBottom: 16,
  },

  selectedCard: {
    backgroundColor: "#fff",

    padding: 16,

    borderRadius: 12,

    marginBottom: 12,

    borderWidth: 2,

    borderColor: "transparent",
  },

  activeCard: {
    borderColor: COLORS.primary,
  },

  slotLabel: {
    fontSize: 12,

    fontWeight: "700",
  },

  slotValue: {
    marginTop: 4,

    fontSize: 16,

    fontWeight: "600",
  },

  teamCard: {
    backgroundColor: "#fff",

    padding: 16,

    borderRadius: 12,

    marginBottom: 12,
  },

  teamName: {
    fontSize: 16,

    fontWeight: "700",
  },

  teamCity: {
    marginTop: 4,

    color: "#666",
  },

  continueButton: {
    position: "absolute",

    left: 16,

    right: 16,

    bottom: 16,

    height: 56,

    backgroundColor: COLORS.primary,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",
  },

  continueText: {
    color: "#fff",

    fontWeight: "700",

    fontSize: 16,
  },
});
