import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function StatsTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>Top Run Scorer</Text>
        <Text style={styles.player}>Virat Kohli - 765 Runs</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Top Wicket Taker</Text>
        <Text style={styles.player}>Bumrah - 32 Wickets</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Highest Strike Rate</Text>
        <Text style={styles.player}>Surya Kumar - 189.3</Text>
      </View>
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
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  player: {
    fontSize: 16,
    color: "#444",
  },
});