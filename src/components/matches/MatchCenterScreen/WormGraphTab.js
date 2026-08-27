import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function WormGraphTab() {
  return (
    <View style={styles.container}>
      <Text>
        Worm Graph
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});