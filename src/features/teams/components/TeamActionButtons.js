import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function TeamActionButtons({
  navigation,
}) {
  return (
    <View style={styles.grid}>
      <TouchableOpacity
        style={styles.primary}
      >
        <Text
          style={
            styles.primaryText
          }
        >
          Add Player
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondary}
      >
        <Text>Edit Team</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.challenge}
      >
        <Text>
          Challenge Team
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondary}
      >
        <Text>
          Schedule Match
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles =
  StyleSheet.create({
    grid: {
      flexDirection: "row",

      flexWrap: "wrap",

      justifyContent:
        "space-between",

      marginBottom: 20,
    },

    primary: {
      width: "48%",

      padding: 16,

      backgroundColor:
        "#0B7A0B",

      borderRadius: 12,

      marginBottom: 10,
    },

    primaryText: {
      color: "#fff",

      fontWeight: "700",

      textAlign:
        "center",
    },

    challenge: {
      width: "48%",

      padding: 16,

      backgroundColor:
        "#FFC107",

      borderRadius: 12,
    },

    secondary: {
      width: "48%",

      padding: 16,

      backgroundColor:
        "#ECECEC",

      borderRadius: 12,

      marginBottom: 10,
    },
  });