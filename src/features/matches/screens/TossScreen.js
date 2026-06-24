import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useNavigation } from "@react-navigation/native";

import { COLORS } from "../../../constants/colors";

export default function TossScreen() {
  const navigation = useNavigation();

  const [tossData, setTossData] = useState({
    call: "Heads",

    tossWinner: null,

    electedTo: null,

    coinSide: "🪙",
  });

  const TEAMS = [
    {
      id: "1",
      name: "Lions CC",
      icon: "🦁",
    },
    {
      id: "2",
      name: "Wolves United",
      icon: "🐺",
    },
  ];

  const updateField = (field, value) => {
    setTossData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFlipCoin = () => {
    const result = Math.random() > 0.5 ? "Heads" : "Tails";

    updateField("coinSide", result === "Heads" ? "🪙" : "🔘");

    Alert.alert("Coin Result", result);
  };

  const handleContinue = () => {
    if (!tossData.tossWinner) {
      Alert.alert("Please select toss winner");

      return;
    }

    if (!tossData.electedTo) {
      Alert.alert("Please select Bat or Bowl");

      return;
    }

    navigation.navigate("PlayingXISelectionScreen");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 140,
        }}
      >
        {/* Coin Section */}

        <View style={styles.coinCard}>
          <Text style={styles.sectionTitle}>Coin Toss</Text>

          <View style={styles.row}>
            {["Heads", "Tails"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.choiceButton,

                  tossData.call === item && styles.selectedChoice,
                ]}
                onPress={() => updateField("call", item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.coin}>{tossData.coinSide}</Text>

          <TouchableOpacity style={styles.flipButton} onPress={handleFlipCoin}>
            <Ionicons name="refresh" size={20} color="#fff" />

            <Text style={styles.flipText}>Flip Coin</Text>
          </TouchableOpacity>
        </View>

        {/* Toss Winner */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Toss Winner</Text>

          {TEAMS.map((team) => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamCard,

                tossData.tossWinner === team.id && styles.selectedCard,
              ]}
              onPress={() => updateField("tossWinner", team.id)}
            >
              <Text style={styles.teamEmoji}>{team.icon}</Text>

              <Text style={styles.teamName}>{team.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Decision */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Elected To</Text>

          <View style={styles.row}>
            {["Bat", "Bowl"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.actionCard,

                  tossData.electedTo === item && styles.selectedCard,
                ]}
                onPress={() => updateField("electedTo", item)}
              >
                <Text style={styles.actionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}

        {tossData.tossWinner && tossData.electedTo && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Toss Result</Text>

            <Text style={styles.summaryText}>
              {TEAMS.find((t) => t.id === tossData.tossWinner)?.name} won the
              toss and elected to {tossData.electedTo} first.
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue To Playing XI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  card: {
    backgroundColor: "#fff",

    borderRadius: 16,

    padding: 16,

    marginBottom: 16,
  },

  coinCard: {
    backgroundColor: "#fff",

    borderRadius: 16,

    padding: 20,

    alignItems: "center",

    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,

    fontWeight: "700",

    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
  },

  choiceButton: {
    paddingHorizontal: 20,

    paddingVertical: 10,

    borderWidth: 1,

    borderColor: "#ddd",

    borderRadius: 30,

    marginHorizontal: 5,
  },

  selectedChoice: {
    backgroundColor: "#E8F5E9",

    borderColor: COLORS.primary,
  },

  coin: {
    fontSize: 80,

    marginVertical: 20,
  },

  flipButton: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: COLORS.primary,

    paddingHorizontal: 20,

    paddingVertical: 12,

    borderRadius: 30,
  },

  flipText: {
    color: "#fff",

    marginLeft: 8,

    fontWeight: "700",
  },

  teamCard: {
    flexDirection: "row",

    alignItems: "center",

    padding: 12,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: "#eee",

    marginBottom: 10,
  },

  selectedCard: {
    borderColor: COLORS.primary,

    backgroundColor: "#E8F5E9",
  },

  teamEmoji: {
    fontSize: 28,
  },

  teamName: {
    marginLeft: 12,

    fontWeight: "700",
  },

  actionCard: {
    flex: 1,

    padding: 20,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: "#ddd",

    alignItems: "center",

    marginHorizontal: 5,
  },

  actionText: {
    fontWeight: "700",
  },

  summaryCard: {
    backgroundColor: "#E8F5E9",

    borderRadius: 16,

    padding: 16,
  },

  summaryTitle: {
    fontSize: 18,

    fontWeight: "700",

    marginBottom: 8,
  },

  summaryText: {
    fontSize: 16,
  },

  continueButton: {
    position: "absolute",

    bottom: 16,

    left: 16,

    right: 16,

    height: 56,

    backgroundColor: COLORS.primary,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",
  },

  continueText: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "700",
  },
});
