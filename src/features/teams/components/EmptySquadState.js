import React from "react";

import { View, Text, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function EmptySquadState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="people-outline" size={70} color="#BDBDBD" />
      </View>

      <Text style={styles.title}>Your Squad is Empty</Text>

      <Text style={styles.subtitle}>
        Invite CricIn players, search by mobile number, or add local players to
        start building your team.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    borderWidth: 1,

    borderStyle: "dashed",

    borderColor: "#DADADA",

    paddingVertical: 40,

    paddingHorizontal: 24,

    alignItems: "center",

    justifyContent: "center",
  },

  iconContainer: {
    width: 110,

    height: 110,

    borderRadius: 55,

    backgroundColor: "#F7F7F7",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 22,
  },

  title: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.text,

    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,

    color: "#777",

    textAlign: "center",

    lineHeight: 22,
  },
});
