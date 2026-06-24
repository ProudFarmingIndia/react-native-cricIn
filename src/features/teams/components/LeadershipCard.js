import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function LeadershipCard({
  title,
  player,
  type,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {player?.name?.charAt(0)}
        </Text>
      </View>

      <View>
        <Text style={styles.label}>
          {title}
        </Text>

        <Text style={styles.name}>
          {player?.name}
        </Text>
      </View>

      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              type === "C"
                ? "#0B7A0B"
                : "#FF9800",
          },
        ]}
      >
        <Text
          style={styles.badgeText}
        >
          {type}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#fff",

    padding: 16,

    borderRadius: 16,

    marginBottom: 12,
  },

  avatar: {
    width: 60,
    height: 60,

    borderRadius: 30,

    backgroundColor:
      "#E8F5E9",

    justifyContent:
      "center",

    alignItems: "center",

    marginRight: 14,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "700",
  },

  label: {
    color: "#777",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
  },

  badge: {
    marginLeft: "auto",

    width: 36,
    height: 36,

    borderRadius: 18,

    justifyContent:
      "center",

    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
  },
});