import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function ChallengeHeroCard({
  opponentTeam,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.team}>
        <View
          style={styles.logo}
        >
          <Text>DW</Text>
        </View>

        <Text
          style={styles.name}
        >
          Delhi Warriors
        </Text>

        <Text>
          HOST
        </Text>
      </View>

      <View style={styles.vs}>
        <Text
          style={styles.vsText}
        >
          VS
        </Text>
      </View>

      <View style={styles.team}>
        <View
          style={styles.logo}
        >
          <Text>MT</Text>
        </View>

        <Text
          style={styles.name}
        >
          {opponentTeam.name}
        </Text>

        <Text>
          CHALLENGED
        </Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#fff",

      borderRadius: 16,

      padding: 20,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 20,
    },

    team: {
      flex: 1,

      alignItems:
        "center",
    },

    logo: {
      width: 70,

      height: 70,

      borderRadius: 35,

      backgroundColor:
        "#E8F5E9",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    name: {
      marginTop: 8,

      fontWeight:
        "700",
    },

    vs: {
      width: 60,

      height: 60,

      borderRadius: 30,

      backgroundColor:
        "#FFD54F",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    vsText: {
      fontWeight:
        "800",

      fontSize: 20,
    },
  });