import React from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

const MAX_BIO_LENGTH = 300;

export default function TeamBioSection({
  teamData,
  updateField,
}) {
  const bio = teamData.bio || "";

  return (
    <View style={styles.card}>
      {/* Header */}

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name="document-text-outline"
            size={22}
            color={COLORS.primary}
          />

          <Text style={styles.title}>
            Team Bio
          </Text>
        </View>

        <Text style={styles.counter}>
          {bio.length}/{MAX_BIO_LENGTH}
        </Text>
      </View>

      {/* Input */}

      <TextInput
        multiline
        textAlignVertical="top"
        placeholder="Tell everyone about your team..."
        placeholderTextColor="#9CA3AF"
        value={bio}
        maxLength={MAX_BIO_LENGTH}
        onChangeText={(text) =>
          updateField("bio", text)
        }
        style={styles.input}
      />

      {/* Footer */}

      <Text style={styles.helper}>
        Describe your team, achievements, playing style and vision.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 20,

    marginBottom: 20,

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 16,
  },

  titleContainer: {
    flexDirection: "row",

    alignItems: "center",
  },

  title: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.primary,

    marginLeft: 8,
  },

  counter: {
    fontSize: 13,

    color: "#6B7280",

    fontWeight: "600",
  },

  input: {
    minHeight: 120,

    borderWidth: 1,

    borderColor: "#E5E7EB",

    borderRadius: 14,

    padding: 16,

    fontSize: 16,

    color: "#111827",

    backgroundColor: "#FFF",
  },

  helper: {
    marginTop: 10,

    fontSize: 13,

    color: "#6B7280",

    lineHeight: 20,
  },
});