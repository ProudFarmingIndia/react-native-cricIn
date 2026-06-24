import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function PlayerCard({
  player,
  onMakeVC,
  onRemove,
}) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>
          {player.name}
        </Text>

        <Text>
          {player.role}
        </Text>

        {player.isCaptain && (
          <Text>
            Captain
          </Text>
        )}

        {player.isViceCaptain && (
          <Text>
            Vice Captain
          </Text>
        )}
      </View>

      {!player.isCaptain && (
        <View>
          {!player.isViceCaptain && (
            <TouchableOpacity
              onPress={() =>
                onMakeVC(
                  player.id
                )
              }
            >
              <Text>
                Make VC
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() =>
              onRemove(
                player.id
              )
            }
          >
            <Text
              style={{
                color: "red",
              }}
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,

    flexDirection: "row",

    justifyContent:
      "space-between",
  },

  name: {
    fontWeight: "700",
    fontSize: 16,
  },
});