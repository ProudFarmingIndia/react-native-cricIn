import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import TeamCard from "../../../../cards/TeamCard";
import { COLORS } from "../../../../constants/colors";

export default function TeamsTab({ profile = {} }) {
  const teams = profile?.teams || [];

  if (teams.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Teams Joined</Text>

        <Text style={styles.emptyDescription}>
          This player hasn't joined any team yet.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={teams}
      keyExtractor={(item) => item._id?.toString()}
      renderItem={({ item }) => <TeamCard team={item} />}
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

    alignItems: "center",

    justifyContent: "center",

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

    fontSize: 14,

    lineHeight: 22,

    color: COLORS.onSurfaceVariant,
  },
});
