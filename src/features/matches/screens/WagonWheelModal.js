import React, { useState } from "react";

import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

const REGIONS = [
  "Third Man",
  "Point",
  "Cover",
  "Mid Off",
  "Straight",
  "Mid On",
  "Mid Wicket",
  "Square Leg",
  "Fine Leg",
];

export default function WagonWheelModal() {
  const navigation = useNavigation();

  const route = useRoute();

  const { runs, shotType, timing, intent } = route.params;

  const [region, setRegion] = useState(null);

  const handleConfirm = () => {
    const shotAnalytics = {
      runs,
      shotType,
      timing,
      intent,
      region,
    };

    console.log("SHOT DATA", shotAnalytics);

    Alert.alert("Saved", "Shot analytics saved successfully");

    navigation.pop(2);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Ball Direction</Text>

        <Text style={styles.subtitle}>Select Region</Text>

        <View style={styles.grid}>
          {REGIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.regionCard, region === item && styles.selected]}
              onPress={() => setRegion(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Confirm Direction</Text>
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
    marginBottom: 10,
  },

  subtitle: {
    marginBottom: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  regionCard: {
    width: "48%",
    height: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  selected: {
    backgroundColor: "#DFF6DD",
    borderColor: "#2E7D32",
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
