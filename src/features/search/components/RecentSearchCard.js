import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Recent Search Row
|--------------------------------------------------------------------------
|
| This file existed but was empty (0 bytes), so nothing could import it -
| which is why the search screen opened to a blank prompt with no history.
|
| Deliberately flatter than the result cards: recent searches are terms,
| not entities, and boxing them like results made the empty screen read as
| if the search had already returned something.
|
| The row and its remove button are separate touch targets - tapping the
| term re-runs it, tapping the X only forgets it.
|
*/

const SCOPE_LABELS = {
  all: null,
  players: "in Players",
  teams: "in Teams",
  grounds: "in Grounds",
};

export default function RecentSearchCard({ entry, onPress, onRemove }) {
  const scopeLabel = SCOPE_LABELS[entry?.scope] || null;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.main}
        activeOpacity={0.6}
        onPress={() => onPress?.(entry)}
        accessibilityRole="button"
        accessibilityLabel={`Search again for ${entry?.term}`}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="time-outline" size={16} color={COLORS.onSurfaceVariant} />
        </View>

        <Text style={styles.term} numberOfLines={1}>
          {entry?.term}
        </Text>

        {!!scopeLabel && <Text style={styles.scope}>{scopeLabel}</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove?.(entry)}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${entry?.term} from recent searches`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color={COLORS.outline} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
  },

  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  term: {
    flexShrink: 1,
    fontSize: 14.5,
    color: COLORS.onSurface,
  },

  scope: {
    marginLeft: 8,
    fontSize: 11.5,
    color: COLORS.outline,
  },

  removeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
