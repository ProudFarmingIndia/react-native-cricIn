import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function TeamProfileHero({
  team,
  navigation,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>
          {team.name.charAt(0)}
        </Text>
      </View>

      <Text style={styles.teamName}>
        {team.name}
      </Text>

      <Text style={styles.location}>
        📍 {team.city}, {team.state}
      </Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {team.type}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate(
            "ChallengeMatchScreen",
            { team }
          )
        }
      >
        <Text style={styles.buttonText}>
          Challenge Team
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8F5E9",

    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    fontSize: 42,
    fontWeight: "700",
  },

  teamName: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 16,
  },

  location: {
    color: "#666",
    marginTop: 8,
  },

  badge: {
    marginTop: 10,

    backgroundColor: "#FFB74D",

    paddingHorizontal: 16,
    paddingVertical: 6,

    borderRadius: 30,
  },

  badgeText: {
    fontWeight: "700",
  },

  button: {
    marginTop: 20,

    backgroundColor: "#0B7A0B",

    paddingHorizontal: 24,
    paddingVertical: 14,

    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});