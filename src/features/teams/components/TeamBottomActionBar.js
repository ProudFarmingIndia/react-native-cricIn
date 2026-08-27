import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import PrimaryButton from "../../../components/Button/PrimaryButton";

export default function TeamBottomActionBar({
  title,
  onPress,
  loading = false,
  disabled = false,
  helperText = "",
}) {
  return (
    <View style={styles.container}>
      <PrimaryButton
        title={loading ? "Please wait..." : title}
        onPress={onPress}
        loading={loading}
        disabled={loading || disabled}
      />

      {!!helperText && (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",

    paddingHorizontal: 20,

    paddingTop: 14,

    paddingBottom: 28,

    borderTopWidth: 1,

    borderTopColor: "#EEEEEE",

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: -4,
    },

    elevation: 20,
  },

  helperText: {
    marginTop: 10,

    textAlign: "center",

    color: "#7A7A7A",

    fontSize: 13,
  },
});