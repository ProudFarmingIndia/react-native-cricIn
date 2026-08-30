import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { COLORS } from "../../../../constants/colors";

/*
|--------------------------------------------------------------------------
| HighlightsTab
|--------------------------------------------------------------------------
|
| Career highlights and achievements. Both are plain string arrays on the
| Player document (player.highlights / player.achievements), edited from
| EditProfileScreen.
|
| Shared by ProfileScreen (your own, with an "Add" action) and
| PlayerProfileScreen (someone else's, read-only). ProfileTabBar has always
| declared six tabs, but ProfileScreen only rendered indices 0-4 - so
| tapping "HighLight" on your own profile showed a blank body.
|
| props:
|   profile   - the player document
|   readOnly  - hide the add action (default false)
|   onAdd     - () => void, called by the add action
|
*/

export default function HighlightsTab({
  profile = {},
  readOnly = false,
  onAdd,
}) {
  const highlights = Array.isArray(profile?.highlights)
    ? profile.highlights
    : [];

  const achievements = Array.isArray(profile?.achievements)
    ? profile.achievements
    : [];

  const name = profile?.playerName || "This player";

  if (highlights.length === 0 && achievements.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="emoji-events" size={56} color={COLORS.outline} />

        <Text style={styles.emptyTitle}>No Highlights Yet</Text>

        <Text style={styles.emptyText}>
          {readOnly
            ? `${name} hasn't added any highlights or achievements.`
            : "Add your best knocks, spells and milestones so teams can see what you bring."}
        </Text>

        {!readOnly && (
          <TouchableOpacity
            style={styles.button}
            onPress={onAdd}
            activeOpacity={0.85}
          >
            <MaterialIcons name="add" size={20} color={COLORS.onPrimary} />

            <Text style={styles.buttonText}>Add Highlights</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {highlights.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Highlights</Text>

          {highlights.map((item, index) => (
            <View key={`highlight-${index}`} style={styles.row}>
              <MaterialIcons
                name="play-circle-outline"
                size={18}
                color={COLORS.primary}
              />

              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {achievements.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Achievements</Text>

          {achievements.map((item, index) => (
            <View key={`achievement-${index}`} style={styles.row}>
              <MaterialIcons
                name="military-tech"
                size={18}
                color={COLORS.secondary}
              />

              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {!readOnly && (
        <TouchableOpacity
          style={styles.inlineButton}
          onPress={onAdd}
          activeOpacity={0.8}
        >
          <MaterialIcons name="edit" size={16} color={COLORS.primary} />

          <Text style={styles.inlineButtonText}>Edit Highlights</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 7,
  },

  rowText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurface,
  },

  inlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },

  inlineButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 26,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
  },

  buttonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
});
