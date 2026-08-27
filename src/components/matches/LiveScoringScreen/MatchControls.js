import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function MatchControls({ onUndo, onTransfer, canUndo = true }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.button, !canUndo && styles.buttonDisabled]}
        activeOpacity={0.75}
        disabled={!canUndo}
        onPress={onUndo}
      >
        <Ionicons name="arrow-undo" size={16} color={COLORS.onSurfaceVariant} />
        <Text style={styles.buttonText}>Undo Last Ball</Text>
      </TouchableOpacity>

      {onTransfer && (
        <TouchableOpacity
          style={[styles.button, styles.transferButton]}
          activeOpacity={0.75}
          onPress={onTransfer}
        >
          <Ionicons name="swap-horizontal" size={16} color={COLORS.onSurfaceVariant} />
          <Text style={styles.buttonText}>Transfer Scoring</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },

  button: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  transferButton: {
    borderColor: COLORS.primary,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    marginLeft: 6,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },
});