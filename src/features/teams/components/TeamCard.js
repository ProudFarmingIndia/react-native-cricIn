import React from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function TeamCard({
  team,
  navigation,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate(
          "TeamProfileScreen",
          {
            teamId: team.id,
          }
        )
      }
    >
      <Image
        source={{
          uri: team.banner,
        }}
        style={styles.banner}
      />

      <View style={styles.content}>
        <View style={styles.row}>
          <View>
            <Text style={styles.name}>
              {team.name}
            </Text>

            <Text style={styles.caption}>
              Captain: {team.captain}
            </Text>
          </View>

          <View>
            <Text
              style={styles.strength}
            >
              {team.strength}
            </Text>

            <Text
              style={styles.small}
            >
              Strength
            </Text>
          </View>
        </View>

        <Text style={styles.location}>
          📍 {team.location}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              "ChallengeMatchScreen",
              {
                team,
              }
            )
          }
        >
          <Text
            style={styles.buttonText}
          >
            Challenge
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },

  banner: {
    width: "100%",
    height: 180,
  },

  content: {
    padding: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
  },

  caption: {
    color: "#777",
    marginTop: 4,
  },

  strength: {
    fontWeight: "700",
    color: "green",
    textAlign: "right",
  },

  small: {
    color: "#999",
    fontSize: 12,
  },

  location: {
    marginTop: 10,
  },

  button: {
    marginTop: 14,
    backgroundColor:
      "#0B7A0B",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});