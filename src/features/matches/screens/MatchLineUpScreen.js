import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import { createInningsApi } from "../../scoring/services/scoring.service";
import { startMatchApi } from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Match Line-Up Screen (Opening Pair + Bowler Selection)
|--------------------------------------------------------------------------
|
| Expects via route.params: matchId, battingTeam, bowlingTeam (each with
| a .squad array of the selected Playing XI, from TossScreen).
|
| NOTHING FROM THE SETUP HAS BEEN SAVED YET. Squad Selection and Toss
| carry their choices forward in params rather than writing them, so this
| screen holds the entire setup and hands it to startMatch with the PIN.
|
| On the correct PIN the server writes the squads, the toss and the live
| status in one operation, and only then is the first Innings created with
| the chosen openers. A wrong PIN writes nothing at all, so the opposing
| captain starting later gets a genuinely clean slate.
*/

export default function MatchLineupScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  /*
  | The setup arrives in params rather than from the Match record, because
  | none of it has been saved yet - Squad Selection and Toss deliberately
  | write nothing. It is handed to startMatch below, behind the PIN.
  */

  const {
    matchId,
    battingTeam,
    bowlingTeam,
    teamASquad = [],
    teamBSquad = [],
    tossWinner,
    tossDecision,
  } = route.params || {};

  const battingSquad = battingTeam?.squad || [];
  const bowlingSquad = bowlingTeam?.squad || [];

  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [openingBowler, setOpeningBowler] = useState(null);
  const [starting, setStarting] = useState(false);

  // const [showPinModal, setShowPinModal] = useState(false);
  // const [pin, setPin] = useState("");
  // const [pinError, setPinError] = useState("");
  // const [pendingInnings, setPendingInnings] = useState(null);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

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
    } else if (!nonStriker) {
      setNonStriker(player);
    } else {
      Alert.alert("Both openers already selected. Tap one to change it.");
    }
  };

  const handleStartScoring = async () => {
    if (!striker) {
      Alert.alert("Select Striker");
      return;
    }
    if (!nonStriker) {
      Alert.alert("Select Non-Striker");
      return;
    }
    if (!openingBowler) {
      Alert.alert("Select Opening Bowler");
      return;
    }

    // Open the PIN modal FIRST. Nothing is created until the opponent's
    // PIN is confirmed, so a cancel or wrong PIN leaves no orphaned innings.
    setPin("");
    setPinError("");
    setShowPinModal(true);
  };

  const handleConfirmPin = async () => {
    if (!pin || pin.length !== 4) {
      setPinError("Enter the 4-digit match PIN.");
      return;
    }

    try {
      setStarting(true);

      /*
      | 1) THE PIN FIRST.
      |
      | This was the other way round, and the comment claimed it was
      | deliberate. It is the wrong order: a mistyped PIN - the most common
      | thing that happens on this screen - left a real innings behind in
      | the database for a match that never started.
      |
      | Nothing is written until the opponent's PIN is accepted.
      */

      await startMatchApi(matchId, pin, {
        teamASquad,
        teamBSquad,
        tossWinner,
        tossDecision,
      });

      /*
      | 2) Then the innings, with THIS captain's openers.
      |
      | Safe to call after: startMatch is idempotent for a match that is
      | already live, and createInnings updates the openers on an innings
      | that has not been bowled at yet rather than returning somebody
      | else's abandoned lineup.
      */

      const innings = await createInningsApi({
        matchId,
        battingTeam: battingTeam._id,
        bowlingTeam: bowlingTeam._id,
        inningsNumber: 1,
        currentStrikerId: striker._id,
        currentNonStrikerId: nonStriker._id,
        currentBowlerId: openingBowler._id,
      });

      setShowPinModal(false);
      navigation.replace("LiveScoringScreen", {
        matchId,
        inningsId: innings._id,
        battingSquad,
        bowlingSquad,
      });
    } catch (error) {
      /*
      | The server's message is the useful one - it names the team whose
      | PIN was wrong, or says the innings could not be opened. "Incorrect
      | PIN" is only the fallback.
      */
      setPinError(
        error.response?.data?.message ||
          error.message ||
          "Could not start the match. Try again.",
      );
    } finally {
      setStarting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Match Setup</Text>

        <View style={styles.tossCard}>
          <Text style={styles.tossText}>
            {battingTeam?.teamName} to bat first
          </Text>

          <Text style={styles.tossSubtext}>vs {bowlingTeam?.teamName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Select Openers</Text>

          <View style={styles.slotRow}>
            <View style={styles.slot}>
              <Text style={styles.slotLabel}>STRIKER</Text>
              <Text style={styles.slotValue}>
                {striker?.playerName || "Not Selected"}
              </Text>
            </View>

            <View style={styles.slot}>
              <Text style={styles.slotLabel}>NON-STRIKER</Text>
              <Text style={styles.slotValue}>
                {nonStriker?.playerName || "Not Selected"}
              </Text>
            </View>
          </View>

          <Text style={styles.subheading}>Available Batters</Text>

          {battingSquad.map((player) => {
            const isSelected =
              striker?._id === player._id || nonStriker?._id === player._id;

            return (
              <TouchableOpacity
                key={player._id}
                style={[
                  styles.playerCard,
                  isSelected && styles.playerCardSelected,
                ]}
                onPress={() => handleSelectBatter(player)}
              >
                <Text style={styles.playerName}>{player.playerName}</Text>

                {isSelected && (
                  <Text style={styles.playerTag}>
                    {striker?._id === player._id ? "Striker" : "Non-Striker"}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Select Opening Bowler</Text>

          <Text style={styles.selectedText}>
            {openingBowler?.playerName || "Not Selected"}
          </Text>

          {bowlingSquad.map((player) => (
            <TouchableOpacity
              key={player._id}
              style={[
                styles.playerCard,
                openingBowler?._id === player._id && styles.playerCardSelected,
              ]}
              onPress={() => setOpeningBowler(player)}
            >
              <Text style={styles.playerName}>{player.playerName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={handleStartScoring}
        disabled={starting}
      >
        {starting ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Start Scoring</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Match PIN</Text>
            <Text style={styles.modalSubtitle}>
              Ask the opposing captain for the 4-digit match PIN to confirm and
              start live scoring.
            </Text>

            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={(t) => {
                setPin(t.replace(/[^0-9]/g, "").slice(0, 4));
                setPinError("");
              }}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="••••"
              placeholderTextColor={COLORS.outline}
              autoFocus
            />

            {!!pinError && <Text style={styles.pinError}>{pinError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowPinModal(false)}
                disabled={starting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleConfirmPin}
                disabled={starting}
              >
                {starting ? (
                  <ActivityIndicator size="small" color={COLORS.onPrimary} />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm & Start</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  tossCard: {
    backgroundColor: COLORS.primaryContainer,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  tossText: {
    color: COLORS.onPrimaryContainer,
    fontWeight: "700",
  },

  tossSubtext: {
    color: COLORS.onPrimaryContainer,
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
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 12,
  },

  slotRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  slot: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 10,
    marginRight: 8,
  },

  slotLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  slotValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
    marginTop: 4,
  },

  subheading: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },

  playerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  playerCardSelected: {
    backgroundColor: COLORS.surfaceContainer,
  },

  playerName: {
    color: COLORS.onSurface,
    fontWeight: "600",
  },

  playerTag: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  selectedText: {
    marginBottom: 12,
    fontWeight: "600",
    color: COLORS.onSurface,
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

  buttonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 16,
  },

  // ── PIN Modal ──────────────────────────────────────────────────────────

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  pinInput: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 12,
    textAlign: "center",
    color: COLORS.onSurface,
  },
  pinError: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 20,
  },
  modalCancel: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  modalCancelText: {
    color: COLORS.onSurface,
    fontWeight: "700",
  },
  modalConfirm: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  cancelText: {
    color: COLORS.onSurface,
    fontWeight: "700",
  },

  confirmButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonDisabled: {
    opacity: 0.5,
  },

  confirmText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },
});
