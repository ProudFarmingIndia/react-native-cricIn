import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Bottom Action
|--------------------------------------------------------------------------
|
| disabled/loading matter here specifically because this button triggers
| an async API call (createMatchApi) - without a disabled state, a quick
| double-tap while the request is in flight could create the same match
| twice.
*/

export default function BottomAction({ onContinue, disabled = false, label = "Continue" }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onContinue}
        disabled={disabled}
      >
        {disabled ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.text}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: COLORS.surfaceContainerLowest,

    padding: 16,

    borderTopWidth: 1,

    borderTopColor: COLORS.outlineVariant,
  },

  button: {
    height: 54,

    borderRadius: 12,

    backgroundColor: COLORS.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  text: {
    color: COLORS.onPrimary,

    fontSize: 16,

    fontWeight: "700",
  },
});