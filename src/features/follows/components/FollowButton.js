import React from "react";

import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import useFollow from "../hooks/useFollow";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Follow Button
|--------------------------------------------------------------------------
|
| Self-contained: give it a targetType and targetId and it reads its own
| state from the store and dispatches its own toggle. Nothing above it has
| to hold follow state or thread callbacks down.
|
| Two sizes - "sm" for the compact button on a search result row, "md" for
| a profile header.
|
| The states read differently on purpose:
|
|   Not following - filled green. It is the action being offered.
|   Following     - outlined, muted. It is a status, not a call to action,
|                   and a second filled button on every row you already
|                   follow makes a list look like a wall of buttons.
|
| It does NOT confirm before unfollowing. Unfollow is cheap to undo and a
| confirm dialog on every tap is worse than the occasional mistap - and on
| react-native-web Alert is a no-op unless the webAlert shim is loaded,
| so a confirm here would silently do nothing in the browser.
|
*/

export default function FollowButton({
  targetType,
  targetId,
  size = "sm",
  disabled = false,
  style,
}) {
  const { isFollowing, isPending, toggleFollow } = useFollow(
    targetType,
    targetId,
  );

  const isSmall = size === "sm";

  /*
  | `disabled` is how a caller says "this target can't be followed" - a
  | local player with no account behind them. The backend refuses those
  | anyway; hiding the affordance is friendlier than letting the tap fail.
  */

  if (disabled) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSmall ? styles.buttonSm : styles.buttonMd,
        isFollowing ? styles.buttonFollowing : styles.buttonFollow,
        style,
      ]}
      onPress={toggleFollow}
      disabled={isPending}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected: isFollowing, busy: isPending }}
      accessibilityLabel={isFollowing ? "Unfollow" : "Follow"}
    >
      {isPending ? (
        /*
        | Sized to the text it replaces so the button does not change width
        | mid-tap, which would shift every row below it in a list.
        */
        <ActivityIndicator
          size="small"
          color={isFollowing ? COLORS.onSurfaceVariant : COLORS.onPrimary}
        />
      ) : (
        <>
          <Ionicons
            name={isFollowing ? "checkmark" : "add"}
            size={isSmall ? 13 : 15}
            color={isFollowing ? COLORS.onSurfaceVariant : COLORS.onPrimary}
          />

          <Text
            style={[
              styles.label,
              isSmall ? styles.labelSm : styles.labelMd,
              isFollowing ? styles.labelFollowing : styles.labelFollow,
            ]}
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  buttonSm: {
    height: 32,

    /*
    | Fixed width, not padding. "Follow" and "Following" are different
    | lengths, so a content-sized button resizes the instant it is tapped
    | and nudges everything around it.
    */
    width: 96,

    borderRadius: 16,
  },

  buttonMd: {
    height: 40,
    width: 124,
    borderRadius: 20,
  },

  buttonFollow: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  buttonFollowing: {
    backgroundColor: "transparent",
    borderColor: COLORS.outlineVariant,
  },

  label: {
    fontWeight: "700",
    marginLeft: 4,
  },

  labelSm: {
    fontSize: 12,
  },

  labelMd: {
    fontSize: 13.5,
  },

  labelFollow: {
    color: COLORS.onPrimary,
  },

  labelFollowing: {
    color: COLORS.onSurfaceVariant,
  },
});
