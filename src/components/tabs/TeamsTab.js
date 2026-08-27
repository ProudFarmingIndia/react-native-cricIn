import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

const teams = [
  "India",
  "Australia",
  "England",
  "Pakistan",
  "South Africa",
  "New Zealand",
];

export default function TeamsTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {teams.map((team, index) => (
        <View key={index} style={styles.teamCard}>
          <Text style={styles.teamName}>{team}</Text>
          <Text style={styles.rank}>ICC Ranking: #{index + 1}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },

  teamCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 20,
  },

  teamName: {
    fontSize: 22,
    fontWeight: "700",
  },

  rank: {
    marginTop: 6,
    color: "#666",
  },
});