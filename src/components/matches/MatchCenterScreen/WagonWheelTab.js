import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function WagonWheelTab() {
  return (
    <View style={styles.container}>
      <Text>
        Wagon Wheel Chart
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});