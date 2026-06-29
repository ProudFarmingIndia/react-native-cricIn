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
    name: "Alex Johnson",
  },
  {
    id: "2",
    name: "David Warner",
  },
  {
    id: "3",
    name: "Steve Smith",
  },
  {
    id: "4",
    name: "Glenn Maxwell",
  },
];

const BOWLERS = [
  {
    id: "1",
    name: "M. Shami",
  },
  {
    id: "2",
    name: "J. Bumrah",
  },
  {
    id: "3",
    name: "R. Khan",
  },
];

export default function SecondInningsScreen() {
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

  const handleStartChase = () => {
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

    navigation.replace("LiveScoringScreen", {
      innings: 2,
      target: 185,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 140,
        }}
      >
        {/* TARGET CARD */}

        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>Target To Win</Text>

          <Text style={styles.targetScore}>185</Text>

          <Text style={styles.targetInfo}>Need 185 Runs In 20 Overs</Text>
        </View>

        {/* CHASE INFO */}

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>184/6</Text>

            <Text style={styles.infoLabel}>First Innings</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>9.20</Text>

            <Text style={styles.infoLabel}>Required RR</Text>
          </View>
        </View>

        {/* BATTERS */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Opening Batters</Text>

          <View style={styles.selectedBox}>
            <Text>Striker: {lineupData.striker?.name || "Not Selected"}</Text>
          </View>

          <View style={styles.selectedBox}>
            <Text>
              Non-Striker: {lineupData.nonStriker?.name || "Not Selected"}
            </Text>
          </View>

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
              <Text style={styles.playerName}>{player.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOWLER */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Opening Bowler</Text>

          <View style={styles.selectedBox}>
            <Text>{lineupData.openingBowler?.name || "Not Selected"}</Text>
          </View>

          {BOWLERS.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={styles.playerCard}
              onPress={() => updateField("openingBowler", player)}
            >
              <Text style={styles.playerName}>{player.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleStartChase}>
        <Text style={styles.buttonText}>Start Chase</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  targetCard: {
    backgroundColor: COLORS.primary,

    borderRadius: 16,

    padding: 24,

    alignItems: "center",

    marginBottom: 16,
  },

  targetLabel: {
    color: "#fff",

    fontSize: 14,

    fontWeight: "600",
  },

  targetScore: {
    color: "#fff",

    fontSize: 52,

    fontWeight: "700",
  },

  targetInfo: {
    color: "#fff",
  },

  infoCard: {
    flexDirection: "row",

    backgroundColor: "#fff",

    borderRadius: 16,

    padding: 16,

    marginBottom: 16,
  },

  infoItem: {
    flex: 1,

    alignItems: "center",
  },

  infoValue: {
    fontSize: 24,

    fontWeight: "700",

    color: COLORS.primary,
  },

  infoLabel: {
    color: "#666",

    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",

    borderRadius: 16,

    padding: 16,

    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,

    fontWeight: "700",

    marginBottom: 16,
  },

  selectedBox: {
    padding: 12,

    borderRadius: 10,

    backgroundColor: "#F5F5F5",

    marginBottom: 10,
  },

  playerCard: {
    padding: 14,

    borderBottomWidth: 1,

    borderBottomColor: "#eee",
  },

  playerName: {
    fontWeight: "600",
  },

  button: {
    position: "absolute",

    left: 16,

    right: 16,

    bottom: 16,

    height: 56,

    borderRadius: 12,

    backgroundColor: COLORS.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  buttonText: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "700",
  },
});
