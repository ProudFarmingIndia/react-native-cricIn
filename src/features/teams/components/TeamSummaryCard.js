import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function TeamSummaryCard({
  teamData,
  players = [],
}) {
  const name =
    teamData?.teamName ||
    "Untitled Team";

  return (
    <View style={styles.card}>
      <Text style={styles.teamName}>
        {name}
      </Text>

      <Text>
        Captain: Current User
      </Text>

      <Text>
        Squad: {players.length}/15
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  teamName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
});