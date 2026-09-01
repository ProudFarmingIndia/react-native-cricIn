import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

export default function TeamStatsOverview({
  team,
}) {
  const stats = [
    {
      label: "Matches",
      value: team?.totalMatches ?? 0,
      color: COLORS.primary,
    },
    {
      label: "Wins",
      value: team?.wins ?? 0,
      color: "#16A34A",
    },
    {
      label: "Losses",
      value: team?.losses ?? 0,
      color: "#DC2626",
    },
    {
      label: "Win %",
      value: `${team?.winPercentage ?? 0}%`,
      color: COLORS.primary,
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((item) => (
        <View
          key={item.label}
          style={styles.card}
        >
          <Text style={styles.label}>
            {item.label}
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: item.color,
              },
            ]}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginHorizontal: 16,

    marginBottom: 20,
  },

  card: {
    flex: 1,

    backgroundColor:
      COLORS.surfaceContainerLowest,

    borderRadius: 16,

    paddingVertical: 16,

    marginHorizontal: 4,

    alignItems: "center",

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  label: {
    fontSize: 12,

    color:
      COLORS.onSurfaceVariant,

    marginBottom: 8,
  },

  value: {
    fontSize: 22,

    fontWeight: "700",
  },
});