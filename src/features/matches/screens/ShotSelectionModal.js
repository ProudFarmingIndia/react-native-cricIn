import React, { useState } from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

const SHOTS = [
  { key: "Straight Drive", icon: "arrow-up" },
  { key: "Cover Drive", icon: "arrow-up-outline" },
  { key: "Pull Shot", icon: "arrow-down-outline" },
  { key: "Hook Shot", icon: "arrow-up-outline" },
  { key: "Cut Shot", icon: "cut-outline" },
  { key: "Sweep", icon: "brush-outline" },
  { key: "Reverse Sweep", icon: "return-up-back-outline" },
  { key: "Flick", icon: "trending-up-outline" },
  { key: "Lofted Drive", icon: "arrow-up-circle-outline" },
  { key: "Defensive", icon: "shield-outline" },
];

export default function ShotSelectionModal() {
  const navigation = useNavigation();

  const route = useRoute();

  const { matchId, inningsId, runs, batsmanId, bowlerId } = route.params;

  const [shotType, setShotType] = useState(null);

  const handleContinue = () => {
    console.log("[ShotSelection] handleContinue", { shotType, runs, inningsId });
    navigation.navigate("WagonWheelModal", {
      matchId,
      inningsId,
      runs,
      batsmanId,
      bowlerId,
      shotType,
    });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Shot Selection</Text>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>What shot was played for {runs} run{runs !== 1 ? "s" : ""}?</Text>

        <View style={styles.grid}>
          {SHOTS.map((shot) => (
            <TouchableOpacity
              key={shot.key}
              style={[styles.card, shotType === shot.key && styles.cardSelected]}
              activeOpacity={0.75}
              onPress={() => setShotType(shot.key)}
            >
              <Ionicons
                name={shot.icon}
                size={22}
                color={shotType === shot.key ? COLORS.primary : COLORS.onSurfaceVariant}
              />

              <Text
                style={[
                  styles.cardText,
                  shotType === shot.key && styles.cardTextSelected,
                ]}
              >
                {shot.key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate("WagonWheelModal", {
              matchId, inningsId, runs, batsmanId, bowlerId, shotType: null,
            })}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.continueButton, !shotType && styles.continueButtonDisabled]}
            disabled={!shotType}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modal: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    color: COLORS.onSurfaceVariant,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    marginBottom: 10,
  },

  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceContainer,
  },

  cardText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
    textAlign: "center",
    marginTop: 6,
  },

  cardTextSelected: {
    color: COLORS.primary,
  },

  footer: {
    flexDirection: "row",
    marginTop: 12,
  },

  skipButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 8,
  },

  skipText: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "700",
  },

  continueButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  continueButtonDisabled: {
    opacity: 0.5,
  },

  continueText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },
});