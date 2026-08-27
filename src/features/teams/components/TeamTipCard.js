import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function TeamTipCard() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="information-circle"
          size={26}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Team Captain Information
        </Text>

        <Text style={styles.description}>
          As the Team Captain, you can manage players,
          accept or reject invitations, schedule matches,
          challenge other teams, edit team information,
          and manage team settings.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    backgroundColor: "#EEF8EE",

    borderRadius: 18,

    padding: 18,

    marginBottom: 24,

    borderWidth: 1,

    borderColor: "#D7EED7",
  },

  iconContainer: {
    marginRight: 14,

    marginTop: 2,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.primary,

    marginBottom: 6,
  },

  description: {
    fontSize: 14,

    lineHeight: 22,

    color: "#4B5563",
  },
});