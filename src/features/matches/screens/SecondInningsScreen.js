import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import { createInningsApi } from "../../scoring/services/scoring.service";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Second Innings Screen — Opening Pair + Bowler For The Chase
|--------------------------------------------------------------------------
|
| Expects via route.params:
|   matchId, battingTeamSquad, bowlingTeamSquad
|   battingTeamId, bowlingTeamId    - team IDs (already swapped by
|                                      InningsSummaryScreen)
|   target                          - runs needed to win
|
| On confirm, calls createInningsApi (backend is idempotent — duplicate
| calls return the existing innings safely). Then replaces the stack
| entry with LiveScoringScreen so the back button cannot loop back here.
*/

export default function SecondInningsScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    matchId,
    battingTeamSquad = [],
    bowlingTeamSquad = [],
    battingTeamId,
    bowlingTeamId,
    target,
  } = route.params || {};

  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [openingBowler, setOpeningBowler] = useState(null);
  const [starting, setStarting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Batter Selection
  |--------------------------------------------------------------------------
  |
  | Tap once  → assign to striker slot (if empty) or non-striker slot
  | Tap again on same player → deselect
  | Both slots full → show alert with proper title
  */

  const handleSelectBatter = (player) => {
    if (striker?._id === player._id) {
      setStriker(null);
      return;
    }

    if (nonStriker?._id === player._id) {
      setNonStriker(null);
      return;
    }

    if (!striker) {
      setStriker(player);
      return;
    }

    if (!nonStriker) {
      setNonStriker(player);
      return;
    }

    // FIX: Alert.alert requires a title as its first argument
    Alert.alert("Both Openers Selected", "Tap a selected opener to change them.");
  };

  /*
  |--------------------------------------------------------------------------
  | Start Chase
  |--------------------------------------------------------------------------
  */

  const handleStartChase = async () => {
    if (!striker || !nonStriker) {
      Alert.alert("Openers Required", "Please select both opening batters.");
      return;
    }

    if (!openingBowler) {
      Alert.alert("Bowler Required", "Please select the opening bowler.");
      return;
    }

    try {
      setStarting(true);

      const innings = await createInningsApi({
        matchId,
        battingTeam: battingTeamId,
        bowlingTeam: bowlingTeamId,
        inningsNumber: 2,
        currentStrikerId: striker._id,
        currentNonStrikerId: nonStriker._id,
        currentBowlerId: openingBowler._id,
      });

      navigation.replace("LiveScoringScreen", {
        matchId,
        inningsId: innings._id,
        battingSquad: battingTeamSquad,
        bowlingSquad: bowlingTeamSquad,
        target,
      });
    } catch (error) {
      Alert.alert(
        "Failed",
        error.response?.data?.message ||
          "Could not start the second innings. Please try again.",
      );
    } finally {
      setStarting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Second Innings</Text>

        {target != null && (
          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>TARGET</Text>
            <Text style={styles.targetValue}>{target}</Text>
            <Text style={styles.targetSub}>runs to win</Text>
          </View>
        )}

        {/* ── Opening Batters ─────────────────────────────────────── */}

        <View style={styles.card}>
          <Text style={styles.title}>Select Opening Batters</Text>

          <View style={styles.slotRow}>
            <View style={[styles.slot, striker && styles.slotFilled]}>
              <Text style={styles.slotLabel}>STRIKER</Text>
              <Text style={styles.slotValue}>
                {striker?.playerName || "Not selected"}
              </Text>
            </View>

            <View style={[styles.slot, nonStriker && styles.slotFilled]}>
              <Text style={styles.slotLabel}>NON-STRIKER</Text>
              <Text style={styles.slotValue}>
                {nonStriker?.playerName || "Not selected"}
              </Text>
            </View>
          </View>

          {battingTeamSquad.map((player) => {
            const isSelected =
              striker?._id === player._id || nonStriker?._id === player._id;

            return (
              <TouchableOpacity
                key={player._id}
                style={[styles.playerCard, isSelected && styles.playerCardSelected]}
                onPress={() => handleSelectBatter(player)}
              >
                <Text
                  style={[
                    styles.playerName,
                    isSelected && styles.playerNameSelected,
                  ]}
                >
                  {player.playerName}
                </Text>

                {isSelected && (
                  <Text style={styles.selectedBadge}>
                    {striker?._id === player._id ? "Striker" : "Non-striker"}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Opening Bowler ───────────────────────────────────────── */}

        <View style={styles.card}>
          <Text style={styles.title}>Select Opening Bowler</Text>

          {bowlingTeamSquad.map((player) => (
            <TouchableOpacity
              key={player._id}
              style={[
                styles.playerCard,
                openingBowler?._id === player._id && styles.playerCardSelected,
              ]}
              onPress={() => setOpeningBowler(player)}
            >
              <Text
                style={[
                  styles.playerName,
                  openingBowler?._id === player._id && styles.playerNameSelected,
                ]}
              >
                {player.playerName}
              </Text>

              {openingBowler?._id === player._id && (
                <Text style={styles.selectedBadge}>Bowler</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.button,
          (!striker || !nonStriker || !openingBowler) && styles.buttonDisabled,
        ]}
        onPress={handleStartChase}
        disabled={starting}
      >
        {starting ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Start Chase</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 140,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 16,
  },

  targetCard: {
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },

  targetLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSecondaryContainer,
    letterSpacing: 0.8,
  },

  targetValue: {
    fontSize: 40,
    fontWeight: "700",
    color: COLORS.onSecondaryContainer,
    marginTop: 4,
  },

  targetSub: {
    fontSize: 12,
    color: COLORS.onSecondaryContainer,
    opacity: 0.75,
    marginTop: 2,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 14,
  },

  slotRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },

  slot: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 10,
    borderStyle: "dashed",
  },

  slotFilled: {
    borderStyle: "solid",
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceContainer,
  },

  slotLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.4,
  },

  slotValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
    marginTop: 4,
  },

  playerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  playerCardSelected: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 8,
    paddingHorizontal: 8,
  },

  playerName: {
    color: COLORS.onSurface,
    fontWeight: "600",
    fontSize: 15,
  },

  playerNameSelected: {
    color: COLORS.primary,
  },

  selectedBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
  },

  button: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
});