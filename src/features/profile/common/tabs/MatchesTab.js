import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

import MatchCard from "../../../../cards/MatchCard";

import { COLORS } from "../../../../constants/colors";

export default function MatchesTab({ profile = {} }) {
  const matches = profile?.matches || [];

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Matches Found</Text>

        <Text style={styles.emptyDescription}>
          Match history will appear here after playing your first match.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item._id?.toString()}
      renderItem={({ item }) => <MatchCard match={item} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 30,
  },

  emptyContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingVertical: 60,

    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  emptyDescription: {
    marginTop: 10,

    textAlign: "center",

    lineHeight: 22,

    fontSize: 14,

    color: COLORS.onSurfaceVariant,
  },
});
