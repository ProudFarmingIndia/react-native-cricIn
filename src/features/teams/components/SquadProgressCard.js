import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

const MAX_PLAYERS = 11;

export default function SquadProgressCard({
  players = [],
  captain,
  viceCaptain,
}) {
  const totalPlayers = players.length;

  const remaining =
    MAX_PLAYERS - totalPlayers;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          Squad Progress
        </Text>

        <Text style={styles.progress}>
          {totalPlayers}/{MAX_PLAYERS}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(
                (totalPlayers / MAX_PLAYERS) *
                  100,
                100
              )}%`,
            },
          ]}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Ionicons
            name="people"
            size={18}
            color={COLORS.primary}
          />

          <Text style={styles.label}>
            Players
          </Text>

          <Text style={styles.value}>
            {totalPlayers}
          </Text>
        </View>

        <View style={styles.item}>
          <Ionicons
            name="star"
            size={18}
            color="#F59E0B"
          />

          <Text style={styles.label}>
            Captain
          </Text>

          <Text style={styles.value}>
            {captain
              ? captain.playerName
              : "--"}
          </Text>
        </View>

        <View style={styles.item}>
          <Ionicons
            name="shield-checkmark"
            size={18}
            color="#2563EB"
          />

          <Text style={styles.label}>
            Vice
          </Text>

          <Text style={styles.value}>
            {viceCaptain
              ? viceCaptain.playerName
              : "--"}
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>
        {remaining > 0
          ? `${remaining} more player${
              remaining > 1 ? "s" : ""
            } needed`
          : "Squad Complete 🎉"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",

    borderRadius: 20,

    padding: 18,

    marginBottom: 24,

    borderWidth: 1,

    borderColor: "#EFEFEF",

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  heading: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.text,
  },

  progress: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.primary,
  },

  progressBar: {
    height: 8,

    backgroundColor: "#ECECEC",

    borderRadius: 6,

    marginTop: 16,

    overflow: "hidden",
  },

  progressFill: {
    height: "100%",

    backgroundColor: COLORS.primary,

    borderRadius: 6,
  },

  row: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: 24,
  },

  item: {
    alignItems: "center",

    flex: 1,
  },

  label: {
    marginTop: 8,

    fontSize: 12,

    color: "#777",
  },

  value: {
    marginTop: 6,

    fontWeight: "700",

    color: COLORS.text,

    textAlign: "center",
  },

  footer: {
    marginTop: 20,

    textAlign: "center",

    color: COLORS.primary,

    fontWeight: "600",
  },
});