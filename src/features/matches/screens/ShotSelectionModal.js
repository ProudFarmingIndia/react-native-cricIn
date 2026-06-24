import React, { useState } from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

const SHOTS = [
  "Cover Drive",
  "Straight Drive",
  "Pull Shot",
  "Cut Shot",
  "Sweep",
  "Flick",
];

const TIMINGS = ["Perfect", "Good", "Mistimed"];

const INTENTS = ["Defensive", "Normal", "Aggressive"];

export default function ShotSelectionModal() {
  const navigation = useNavigation();

  const route = useRoute();

  const { runs } = route.params;

  const [shotType, setShotType] = useState(null);

  const [timing, setTiming] = useState(null);

  const [intent, setIntent] = useState(null);

  const handleContinue = () => {
    navigation.navigate("BallDirectionModalScreen", {
      runs,
      shotType,
      timing,
      intent,
    });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Shot Selection</Text>

        <Text style={styles.label}>Shot Type</Text>

        <View style={styles.row}>
          {SHOTS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, shotType === item && styles.selected]}
              onPress={() => setShotType(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Timing</Text>

        <View style={styles.row}>
          {TIMINGS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, timing === item && styles.selected]}
              onPress={() => setTiming(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Intent</Text>

        <View style={styles.row}>
          {INTENTS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, intent === item && styles.selected]}
              onPress={() => setIntent(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  label: {
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  selected: {
    backgroundColor: "#DFF6DD",
  },

  button: {
    backgroundColor: "#2E7D32",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
