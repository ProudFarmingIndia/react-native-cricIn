import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Search Section Header
|--------------------------------------------------------------------------
|
| Used by the "All" tab, which shows a preview of each category rather than
| a single flat list. The count matters here: without it a section capped
| at three rows looks like there were only three matches, and the user
| never discovers the rest.
|
| "See all" is only rendered when there is genuinely more to see.
|
*/

export default function SearchSectionHeader({
  title,
  count = 0,
  hasMore = false,
  onSeeAll,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>

        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>

      {hasMore && (
        <TouchableOpacity
          style={styles.seeAll}
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title.toLowerCase()}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.seeAllText}>See all</Text>

          <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 10,
  },

  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: COLORS.onSurfaceVariant,
  },

  countBadge: {
    marginLeft: 8,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: "center",
  },

  countText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  seeAll: {
    flexDirection: "row",
    alignItems: "center",
  },

  seeAllText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.primary,
    marginRight: 2,
  },
});
