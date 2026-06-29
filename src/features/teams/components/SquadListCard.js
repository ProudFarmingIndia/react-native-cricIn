import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function SquadListCard({
  players,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Squad Members
      </Text>

      {players.map(
        (
          player,
          index
        ) => (
          <View
            key={player.id}
            style={styles.row}
          >
            <Text
              style={
                styles.number
              }
            >
              {String(
                index + 1
              ).padStart(
                2,
                "0"
              )}
            </Text>

            <View>
              <Text
                style={
                  styles.name
                }
              >
                {player.name}

                {player.isCaptain &&
                  " (C)"}

                {player.isViceCaptain &&
                  " (VC)"}
              </Text>

              <Text>
                {player.role}
              </Text>
            </View>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",

    borderRadius: 16,

    padding: 16,
  },

  title: {
    fontSize: 18,

    fontWeight: "700",

    marginBottom: 12,
  },

  row: {
    flexDirection: "row",

    alignItems: "center",

    paddingVertical: 12,

    borderBottomWidth: 1,

    borderBottomColor:
      "#eee",
  },

  number: {
    width: 40,

    fontSize: 18,

    fontWeight: "700",
  },

  name: {
    fontWeight: "700",
  },
});