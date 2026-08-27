import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function EmptyChallengeState() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>
        📤
      </Text>

      <Text style={styles.title}>
        No Pending Requests
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Find Opponents
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 60,
  },

  icon: {
    fontSize: 60,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },

  button: {
    marginTop: 20,
    backgroundColor: "#0B7A0B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
  },
});