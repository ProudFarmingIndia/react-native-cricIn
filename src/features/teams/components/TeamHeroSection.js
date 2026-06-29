import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function TeamHeroSection({
  team,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>
        {team.teamName}
      </Text>

      <Text style={styles.badge}>
        {team.teamType}
      </Text>

      <View style={styles.row}>
        <View>
          <Text
            style={
              styles.label
            }
          >
            Captain
          </Text>

          <Text>
            {team.captain}
          </Text>
        </View>

        <View>
          <Text
            style={
              styles.label
            }
          >
            Vice Captain
          </Text>

          <Text>
            {team.viceCaptain}
          </Text>
        </View>

        <View>
          <Text
            style={
              styles.label
            }
          >
            Squad
          </Text>

          <Text>
            {
              team.squadSize
            }{" "}
            Players
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#fff",

      padding: 20,

      borderRadius: 20,

      marginBottom: 20,
    },

    name: {
      fontSize: 26,

      fontWeight: "800",
    },

    badge: {
      color: "#2E7D32",

      marginTop: 6,

      fontWeight: "700",
    },

    row: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      marginTop: 20,
    },

    label: {
      color: "#999",

      fontSize: 12,
    },
  });