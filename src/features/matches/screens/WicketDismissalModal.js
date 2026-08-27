import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import useScoring from "../../scoring/hooks/useScoring";
import { COLORS } from "../../../constants/colors";

const normalizePlayer = (p) =>
  p?.player && typeof p.player === "object" ? p.player : p;

const DISMISSAL_TYPES = [
  { key: "bowled", label: "Bowled" },
  { key: "caught", label: "Caught" },
  { key: "lbw", label: "LBW" },
  { key: "runOut", label: "Run Out" },
  { key: "stumped", label: "Stumped" },
  { key: "hitWicket", label: "Hit Wicket" },
];

// Dismissal types that require a fielder to be credited
const NEEDS_FIELDER = ["caught", "runOut", "stumped"];

export default function WicketDismissalModal() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    matchId,
    inningsId,
    strikerId,
    nonStrikerId,
    bowlerId,
    battingSquad = [],
    bowlingSquad = [],
  } = route.params || {};

  const { addBall } = useScoring();

  const [dismissalType, setDismissalType] = useState(null);
  const [outBatsmanId, setOutBatsmanId] = useState(null);
  const [fielderId, setFielderId] = useState(null);
  const [newBatsmanId, setNewBatsmanId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // The batsman who is out. Defaults to the striker, but for run-out the
  // scorer can pick either striker or non-striker.
  const battingPlayers = useMemo(
    () => battingSquad.map(normalizePlayer),
    [battingSquad],
  );
  const fieldingPlayers = useMemo(
    () => bowlingSquad.map(normalizePlayer),
    [bowlingSquad],
  );

  const striker = battingPlayers.find(
    (p) => (p._id || p.id) === strikerId,
  );
  const nonStriker = battingPlayers.find(
    (p) => (p._id || p.id) === nonStrikerId,
  );

  const handleSelectDismissal = (key) => {
    setDismissalType(key);
    // Reset dependent fields when the type changes
    setFielderId(null);
    // For run-out, allow choosing striker or non-striker; default to striker
    setOutBatsmanId(key === "runOut" ? strikerId : strikerId);
  };

  const handleConfirm = async () => {
    if (!dismissalType) {
      Alert.alert("Select dismissal", "Please choose a dismissal type.");
      return;
    }
    if (!outBatsmanId) {
      Alert.alert("Select batsman", "Please choose which batsman is out.");
      return;
    }
    if (NEEDS_FIELDER.includes(dismissalType) && !fielderId) {
      Alert.alert("Select fielder", "Please choose the fielder involved.");
      return;
    }
    if (!newBatsmanId) {
      Alert.alert("Select new batsman", "Please choose the incoming batsman.");
      return;
    }

    setSubmitting(true);

    const payload = {
      matchId,
      inningsId,
      strikerId,
      nonStrikerId,
      bowlerId,
      isWicket: true,
      wicketType: dismissalType,
      dismissedPlayerId: outBatsmanId,
      fielderId: NEEDS_FIELDER.includes(dismissalType) ? fielderId : null,
      nextBatsmanId: newBatsmanId,
      // Run out is not credited to the bowler
      bowlerCredit: dismissalType !== "runOut",
      runs: 0,
      isLegalDelivery: true,
    };

    const result = await addBall(payload);
    setSubmitting(false);

    if (result.success) {
      // Pop back to LiveScoringScreen and hand off the result so afterBall
      // runs the over-complete / all-out / target checks.
      navigation.navigate("LiveScoringScreen", {
        matchId,
        inningsId,
        __ballResult: result,
      });
    } else {
      Alert.alert("Failed", result.error || "Could not record the wicket.");
    }
  };

  const renderPlayerChip = (player, selectedId, onPress) => {
    if (!player) return null;
    const id = player._id || player.id;
    const selected = selectedId === id;
    return (
      <TouchableOpacity
        key={id}
        style={[styles.chip, selected && styles.chipSelected]}
        onPress={() => onPress(id)}
      >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {player.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Dismissal</Text>

          {/* 1. Dismissal type */}
          <Text style={styles.label}>Dismissal Type</Text>
          <View style={styles.chipRow}>
            {DISMISSAL_TYPES.map((d) => (
              <TouchableOpacity
                key={d.key}
                style={[
                  styles.chip,
                  dismissalType === d.key && styles.chipSelected,
                ]}
                onPress={() => handleSelectDismissal(d.key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    dismissalType === d.key && styles.chipTextSelected,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 2. Out batsman (striker / non-striker) */}
          {dismissalType && (
            <>
              <Text style={styles.label}>Out Batsman</Text>
              <View style={styles.chipRow}>
                {renderPlayerChip(striker, outBatsmanId, setOutBatsmanId)}
                {renderPlayerChip(nonStriker, outBatsmanId, setOutBatsmanId)}
              </View>
            </>
          )}

          {/* 3. Fielder (only for caught / run out / stumped) */}
          {dismissalType && NEEDS_FIELDER.includes(dismissalType) && (
            <>
              <Text style={styles.label}>Fielder</Text>
              <ScrollView style={styles.fielderList}>
                {fieldingPlayers.map((p) =>
                  renderPlayerChip(p, fielderId, setFielderId),
                )}
              </ScrollView>
            </>
          )}

          {/* 4. New batsman */}
          {dismissalType && (
            <>
              <Text style={styles.label}>New Batsman</Text>
              <ScrollView style={styles.fielderList}>
                {battingPlayers
                  .filter(
                    (p) =>
                      (p._id || p.id) !== outBatsmanId &&
                      (p._id || p.id) !== strikerId &&
                      (p._id || p.id) !== nonStrikerId,
                  )
                  .map((p) => renderPlayerChip(p, newBatsmanId, setNewBatsmanId))}
              </ScrollView>
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnConfirm]}
              onPress={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnConfirmText}>Confirm Wicket</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "85%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 14,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: "#333",
    fontSize: 14,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  fielderList: {
    maxHeight: 160,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnCancel: {
    backgroundColor: "#eee",
    marginRight: 10,
  },
  btnCancelText: {
    color: "#333",
    fontWeight: "600",
  },
  btnConfirm: {
    backgroundColor: COLORS.primary,
  },
  btnConfirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});