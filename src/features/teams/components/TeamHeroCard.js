import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";

export default function TeamHeroCard({
  teamData,
  players,
}) {
  return (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            teamData.logo ||
            "https://via.placeholder.com/300",
        }}
        style={styles.logo}
      />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {teamData.visibility}
        </Text>
      </View>

      <Text style={styles.teamName}>
        {teamData.teamName}
      </Text>

      <Text style={styles.shortName}>
        {teamData.shortName}
      </Text>

      <Text style={styles.location}>
        {teamData.city},{" "}
        {teamData.state}
      </Text>

      <Text style={styles.members}>
        {players.length} Squad Members
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },

  logo: {
    height: 180,
    width: "100%",
  },

  badge: {
    position: "absolute",
    top: 15,
    right: 15,

    backgroundColor: "#fff",

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20,
  },

  badgeText: {
    fontWeight: "700",
  },

  teamName: {
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  shortName: {
    paddingHorizontal: 20,
    color: "#777",
  },

  location: {
    paddingHorizontal: 20,
    marginTop: 6,
  },

  members: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 8,
  },
});