import React, { useEffect } from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import useFollow from "../hooks/useFollow";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Follow Stats
|--------------------------------------------------------------------------
|
| The "1.2k Followers · 48 Following" pair on a profile header. Both halves
| are tappable and open the corresponding list.
|
| Fetches its own stats on mount. The counts come back counted live rather
| than read from the denormalised column, so this is the number to trust -
| the header is exactly where someone would notice a count being wrong.
|
| A team has no "Following" half: a team does not follow anything, and
| showing it as a permanent 0 invites the question of why.
|
*/

const formatCount = (value = 0) => {
  const n = Math.max(0, value);

  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}m`;
  }

  if (n >= 1000) {
    return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  }

  return String(n);
};

/*
| A half is only a button when a handler was given for it.
|
| Rendering everything as a TouchableOpacity and letting `onPress?.()`
| no-op looks identical but feels broken: the number depresses under your
| finger and then nothing happens. The "Following" count on ANOTHER
| player's profile is exactly that case - the API has no route for a third
| party's following list - so there it is a plain label.
*/

const Stat = ({ value, label, onPress, accessibilityLabel }) => {
  const content = (
    <>
      <Text style={styles.value}>{formatCount(value)}</Text>

      <Text style={styles.label}>{label}</Text>
    </>
  );

  if (!onPress) {
    return <View style={styles.stat}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.stat}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </TouchableOpacity>
  );
};

export default function FollowStats({
  targetType,
  targetId,
  onPressFollowers,
  onPressFollowing,
  style,
}) {
  const { followers, following, loadStats } = useFollow(targetType, targetId);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /*
  | A team is followed but never follows anything back, so it gets only the
  | Followers half. A permanent "0 Following" on every team page would just
  | invite the question of what it could ever mean.
  */

  const showFollowing = targetType === "PLAYER";

  return (
    <View style={[styles.row, style]}>
      <Stat
        value={followers}
        label={followers === 1 ? "Follower" : "Followers"}
        onPress={onPressFollowers}
        accessibilityLabel={`${followers} followers`}
      />

      {showFollowing && (
        <>
          <View style={styles.divider} />

          <Stat
            value={following}
            label="Following"
            onPress={onPressFollowing}
            accessibilityLabel={`Following ${following}`}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  stat: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  label: {
    marginTop: 1,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  divider: {
    width: 1,
    height: 26,
    backgroundColor: COLORS.outlineVariant,
  },
});
