import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../../../constants/colors";

export default function NotificationEmpty() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔔</Text>
      <Text style={styles.title}>No notifications</Text>
      <Text style={styles.message}>
        You are all caught up. New updates will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  icon: {
    fontSize: 42,
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});
