import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
} from "victory-native";

export default function WicketsTrendChart({
  data,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Wickets Trend
      </Text>

      <VictoryChart>
        <VictoryAxis />

        <VictoryAxis dependentAxis />

        <VictoryLine
          data={data}
          x="month"
          y="wickets"
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 16,
    padding: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
});