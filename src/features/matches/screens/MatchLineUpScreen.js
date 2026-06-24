import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { COLORS } from "../../../constants/colors";

const BATTERS = [
  {
    id: "1",
    name: "Arjun Mehta",
    role: "Opener",
  },
  {
    id: "2",
    name: "David Warner",
    role: "Opener",
  },
  {
    id: "3",
    name: "Rohit Sharma",
    role: "Opener",
  },
  {
    id: "4",
    name: "Steve Smith",
    role: "Middle Order",
  },
];

const BOWLERS = [
  {
    id: "1",
    name: "Jasprit Bumrah",
    role: "RF",
  },
  {
    id: "2",
    name: "Mitchell Starc",
    role: "LF",
  },
  {
    id: "3",
    name: "Rashid Khan",
    role: "LB",
  },
];

export default function MatchLineupScreen() {
  const navigation = useNavigation();

  const [lineupData, setLineupData] = useState({
    striker: null,
    nonStriker: null,
    openingBowler: null,
  });

  const updateField = (field, value) => {
    setLineupData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStartScoring = () => {
    if (!lineupData.striker) {
      Alert.alert("Select Striker");
      return;
    }

    if (!lineupData.nonStriker) {
      Alert.alert("Select Non-Striker");
      return;
    }

    if (!lineupData.openingBowler) {
      Alert.alert("Select Opening Bowler");
      return;
    }

    navigation.replace("LiveScoringScreen");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 140,
        }}
      >
        <Text style={styles.heading}>Match Setup</Text>

        <View style={styles.tossCard}>
          <Text>Toss won by Green Valley CC</Text>

          <Text>Elected to Bat</Text>
        </View>

        {/* OPENERS */}

        <View style={styles.card}>
          <Text style={styles.title}>Select Openers</Text>

          <TouchableOpacity style={styles.selection}>
            <Text>Striker: {lineupData.striker?.name || "Not Selected"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.selection}>
            <Text>
              Non-Striker: {lineupData.nonStriker?.name || "Not Selected"}
            </Text>
          </TouchableOpacity>

          {BATTERS.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={styles.playerCard}
              onPress={() => {
                if (!lineupData.striker) {
                  updateField("striker", player);
                } else {
                  updateField("nonStriker", player);
                }
              }}
            >
              <Text>{player.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOWLER */}

        <View style={styles.card}>
          <Text style={styles.title}>Select Opening Bowler</Text>

          <Text style={styles.selectedText}>
            {lineupData.openingBowler?.name || "Not Selected"}
          </Text>

          {BOWLERS.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={styles.playerCard}
              onPress={() => updateField("openingBowler", player)}
            >
              <Text>{player.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleStartScoring}>
        <Text style={styles.buttonText}>Start Scoring</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },

  tossCard: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  selection: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },

  playerCard: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  selectedText: {
    marginBottom: 12,
    fontWeight: "600",
  },

  button: {
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

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
