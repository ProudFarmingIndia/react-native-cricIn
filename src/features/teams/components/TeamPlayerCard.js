import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function TeamPlayerCard({
  player,
}) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>
          {player.name}

          {player.captain &&
            " (C)"}

          {player.viceCaptain &&
            " (VC)"}
        </Text>

        <Text>
          {player.role}
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

      padding: 16,

      borderRadius: 12,

      marginBottom: 12,
    },

    name: {
      fontWeight: "700",

      fontSize: 16,
    },
  });