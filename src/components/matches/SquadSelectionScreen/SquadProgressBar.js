import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

export default function SquadProgressBar({
  selectedCount,
  onContinue,
}) {
  const progress =
    (selectedCount / 22) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Squad Progress
      </Text>

      <Text style={styles.count}>
        {selectedCount} / 22 Selected
      </Text>

      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onContinue}
      >
        <Text style={styles.buttonText}>
          Continue To Toss
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",

    bottom: 0,

    left: 0,

    right: 0,

    backgroundColor: "#fff",

    padding: 16,

    borderTopWidth: 1,

    borderTopColor: "#eee",
  },

  label: {
    fontSize: 12,

    fontWeight: "700",
  },

  count: {
    marginTop: 4,

    marginBottom: 8,
  },

  progressBg: {
    height: 10,

    backgroundColor: "#E5E5E5",

    borderRadius: 20,

    overflow: "hidden",

    marginBottom: 12,
  },

  progressFill: {
    height: "100%",

    backgroundColor:
      COLORS.primary,
  },

  button: {
    height: 52,

    borderRadius: 12,

    backgroundColor:
      COLORS.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  buttonText: {
    color: "#fff",

    fontWeight: "700",
  },
});