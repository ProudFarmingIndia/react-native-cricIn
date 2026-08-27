import React from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function TeamLocationSection({
  teamData,
  updateField,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Team Location
      </Text>

      {/* Country */}

      <View style={styles.field}>
        <Text style={styles.label}>
          Country
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="earth-outline"
            size={20}
            color="#6B7280"
          />

          <TextInput
            placeholder="India"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={teamData.country}
            onChangeText={(text) =>
              updateField(
                "country",
                text
              )
            }
          />
        </View>
      </View>

      {/* State */}

      <View style={styles.field}>
        <Text style={styles.label}>
          State
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#6B7280"
          />

          <TextInput
            placeholder="Delhi"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={teamData.state}
            onChangeText={(text) =>
              updateField(
                "state",
                text
              )
            }
          />
        </View>
      </View>

      {/* City */}

      <View style={styles.field}>
        <Text style={styles.label}>
          City
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="business-outline"
            size={20}
            color="#6B7280"
          />

          <TextInput
            placeholder="New Delhi"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={teamData.city}
            onChangeText={(text) =>
              updateField(
                "city",
                text
              )
            }
          />
        </View>
      </View>
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

  title: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.primary,

    marginBottom: 20,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,

    fontWeight: "600",

    color: "#374151",

    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#E5E7EB",

    borderRadius: 14,

    backgroundColor: "#FFF",

    paddingHorizontal: 14,

    height: 54,
  },

  input: {
    flex: 1,

    marginLeft: 10,

    fontSize: 16,

    color: "#111827",
  },
});