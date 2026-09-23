import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| StarRating.js
|
| Description:
| Stars, both to read and to tap.
|
| WHY ONE COMPONENT FOR BOTH
|
| The read-only row on a ground's detail screen and the tappable row on the
| rating form are the same five stars at different sizes. Two components
| would drift - the filled colour on one, the half-star rule on the other -
| and a review form whose stars look different from the stars it produces is
| quietly confusing.
|
| `onChange` is what makes it interactive. Without it, it renders.
|
| HALF STARS ARE READ-ONLY
|
| An average of 4.3 shows four filled and one half. A person cannot TAP a
| half - every review is a whole number, because "4.5 stars" is not a
| judgement anybody actually makes, and offering it would only add a
| mis-tap.
|
|--------------------------------------------------------------------------
*/

export default function StarRating({
  value = 0,
  onChange,
  size = 14,
  showValue = false,
  count,
  label,
}) {
  const score = Number(value) || 0;

  const interactive = typeof onChange === "function";

  const star = (index) => {
    const position = index + 1;

    /*
    | Read-only: fill, half-fill or leave empty from the average. Tappable:
    | whole stars only, so the icon is simply filled or not.
    */
    const name = interactive
      ? score >= position
        ? "star"
        : "star-outline"
      : score >= position
        ? "star"
        : score >= position - 0.5
          ? "star-half"
          : "star-outline";

    const icon = (
      <Ionicons
        name={name}
        size={size}
        color={score >= position - 0.5 ? COLORS.secondaryContainer : COLORS.outlineVariant}
      />
    );

    if (!interactive) return <View key={position}>{icon}</View>;

    return (
      <TouchableOpacity
        key={position}
        onPress={() => onChange(position)}
        /*
        | The icon is small, so the touch target is padded out rather than
        | the icon made bigger. A five-star row where the third star is hard
        | to hit produces wrong ratings, not no ratings.
        */
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        style={styles.tap}
        activeOpacity={0.7}
      >
        {icon}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.row}>
        {[0, 1, 2, 3, 4].map(star)}

        {showValue && score > 0 ? (
          <Text style={[styles.value, { fontSize: size - 1 }]}>
            {score.toFixed(1)}
            {count != null ? (
              <Text style={styles.count}> ({count})</Text>
            ) : null}
          </Text>
        ) : null}

        {showValue && score === 0 ? (
          <Text style={styles.none}>No reviews</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 3 },

  label: { fontSize: 12, fontWeight: "700", color: COLORS.onSurfaceVariant },

  row: { flexDirection: "row", alignItems: "center", gap: 2 },

  tap: { paddingHorizontal: 2 },

  value: { marginLeft: 5, fontWeight: "800", color: COLORS.onSurface },

  count: { fontWeight: "600", color: COLORS.onSurfaceVariant },

  none: { marginLeft: 5, fontSize: 11.5, color: COLORS.outline },
});
