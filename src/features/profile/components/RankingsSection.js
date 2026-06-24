import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function RankingsSection() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Rankings
      </Text>

      <View style={styles.row}>
        <Text>
          Batting Rank
        </Text>

        <Text>#4</Text>
      </View>

      <View style={styles.row}>
        <Text>
          Bowling Rank
        </Text>

        <Text>#22</Text>
      </View>

      <View style={styles.row}>
        <Text>
          All Round Rank
        </Text>

        <Text>#10</Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#fff",
      margin: 16,
      padding: 16,
      borderRadius: 16,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },

    row: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },
  });