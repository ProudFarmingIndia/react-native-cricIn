import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

const tournaments = [
  "IPL 2026",
  "World Cup 2027",
  "Asia Cup",
  "Big Bash League",
  "PSL",
];

export default function TournamentTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {tournaments.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.title}>{item}</Text>
          <Text style={styles.subText}>
            16 Teams • Live Updates • Fixtures
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 18,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  subText: {
    marginTop: 8,
    color: "#666",
  },
});