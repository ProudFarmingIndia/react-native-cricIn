import React from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

const DATA = [
  {
    opponent:
      "Delhi Titans",
    score: "78 (42)",
  },

  {
    opponent:
      "Mumbai Kings",
    score: "34 (18)",
  },

  {
    opponent:
      "Noida Warriors",
    score: "102 (61)",
  },
];

export default function RecentMatchesSection({ profile = {} }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Recent Matches
      </Text>

      <FlatList
        data={DATA}
        scrollEnabled={false}
        keyExtractor={(
          item,
          index
        ) =>
          index.toString()
        }
        renderItem={({
          item,
        }) => (
          <View
            style={
              styles.match
            }
          >
            <Text>
              {
                item.opponent
              }
            </Text>

            <Text>
              {item.score}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#fff",
      margin: 16,
      padding: 16,
      borderRadius: 16,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },

    match: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      marginBottom: 12,
    },
  });