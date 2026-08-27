import React from "react";

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { COLORS } from "../../constants/colors";

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        isDisabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color="#FFFFFF"
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,

    height: 52,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 20,
  },

  disabledButton: {
    opacity: 0.55,
  },

  text: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "700",
  },
});