import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import useScoring from "../../scoring/hooks/useScoring";

import { setPendingBallResult } from "../utils/ballHandoff";
import { getMatchByIdApi, updateMatchApi } from "../services/matches.services";
import { COLORS } from "../../../constants/colors";

/* Helpers */
const normalizePlayer = (p) =>
  p?.player && typeof p.player === "object" ? p.player : p;

/* Dismissal definitions */
const DISMISSAL_TYPES = [
  { key: "bowled", label: "Bowled", needsFielder: false, allowBatsmanChoice: false, creditsBowler: true },
  { key: "lbw", label: "LBW", needsFielder: false, allowBatsmanChoice: false, creditsBowler: true },
  { key: "hitWicket", label: "Hit Wicket", needsFielder: false, allowBatsmanChoice: false, creditsBowler: true },
  { key: "caught", label: "Caught", needsFielder: true, allowBatsmanChoice: false, creditsBowler: true },
  { key: "stumped", label: "Stumped", needsFielder: true, allowBatsmanChoice: false, creditsBowler: true },
  { key: "runOut", label: "Run Out", needsFielder: true, allowBatsmanChoice: true, creditsBowler: false },
];

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

  // State
  const [dismissalKey, setDismissalKey] = useState(null);
  const [outBatsmanId, setOutBatsmanId] = useState(null);
  const [fielderId, setFielderId] = useState(null);
  const [newBatsmanId, setNewBatsmanId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [match, setMatch] = useState(null);

  // Normalize squads
  const battingPlayers = useMemo(() => (battingSquad || []).map(normalizePlayer), [battingSquad]);
  const fieldingPlayers = useMemo(() => (bowlingSquad || []).map(normalizePlayer), [bowlingSquad]);

  // UI sizes
  const { height: screenHeight } = Dimensions.get("window");
  const MODAL_MAX_HEIGHT = Math.floor(screenHeight * 0.86);
  const LIST_MAX_HEIGHT = Math.min(320, Math.floor(screenHeight * 0.34));

  // Dismissal helpers (memoized)
  const dismissalMeta = useCallback((key) => DISMISSAL_TYPES.find((d) => d.key === key) || {}, []);
  const needsFielder = useCallback((key) => dismissalMeta(key).needsFielder === true, [dismissalMeta]);
  const allowBatsmanChoice = useCallback((key) => dismissalMeta(key).allowBatsmanChoice === true, [dismissalMeta]);
  const creditsBowler = useCallback((key) => dismissalMeta(key).creditsBowler !== false, [dismissalMeta]);

  const playerDisplayName = (p) => p?.playerName || p?.name || "Unknown";

  const striker = battingPlayers.find((p) => String(p._id || p.id) === String(strikerId));
  const nonStriker = battingPlayers.find((p) => String(p._id || p.id) === String(nonStrikerId));

  // Load match (optional)
  useEffect(() => {
    let mounted = true;
    if (!matchId) return;
    getMatchByIdApi(matchId)
      .then((m) => { if (mounted) setMatch(m); })
      .catch(() => {})
      .finally(() => {});
    return () => { mounted = false; };
  }, [matchId]);

  // Reset dependent fields when dismissal changes
  useEffect(() => {
    setFielderId(null);
    setNewBatsmanId(null);

    if (!dismissalKey) {
      setOutBatsmanId(null);
      return;
    }

    if (allowBatsmanChoice(dismissalKey)) {
      setOutBatsmanId(null);
    } else {
      setOutBatsmanId(striker?._id || striker?.id || strikerId || null);
    }
  }, [dismissalKey, striker, strikerId, allowBatsmanChoice]);

  const isValid = () => {
    if (!dismissalKey) return false;
    if (!outBatsmanId) return false;
    if (needsFielder(dismissalKey) && !fielderId) return false;
    if (!newBatsmanId) return false;
    return true;
  };

  const handleConfirm = async () => {
    if (!isValid()) {
      Alert.alert("Incomplete", "Please complete all required fields.");
      return;
    }
    setSubmitting(true);

    const payload = {
      matchId,
      inningsId,
      batsmanId: strikerId,
      bowlerId,
      isWicket: true,
      wicketType: dismissalKey,
      dismissedPlayerId: outBatsmanId,
      fielderId: needsFielder(dismissalKey) ? fielderId : null,
      nextBatsmanId: newBatsmanId,
      bowlerCredit: creditsBowler(dismissalKey),
      runs: 0,
      isLegalDelivery: true,
    };

    try {
      const result = await addBall(payload);
      if (!result || !result.success) {
        setSubmitting(false);
        Alert.alert("Failed", result?.error || "Could not record the wicket.");
        return;
      }

      // Persist new batsman to match playing XI (safe convention)
      try {
        const battingTeamId = result?.data?.innings?.battingTeam || match?.teamA?._id || match?.teamB?._id || null;
        if (battingTeamId && match) {
          const patch = { addPlayerToInnings: { inningsId, playerId: newBatsmanId } };
          await updateMatchApi(matchId, patch);
        }
      } catch (e) {
        console.warn("Failed to persist new batsman:", e?.message || e);
      }

      setSubmitting(false);
      /*
      | Same handoff as the wagon wheel: no params on the navigation, so
      | LiveScoringScreen keeps the squads and target it was opened with.
      | Passing them here is what used to erase them.
      */

      setPendingBallResult(result);

      navigation.navigate("LiveScoringScreen");
    } catch (e) {
      setSubmitting(false);
      Alert.alert("Failed", e?.message || "Could not record the wicket.");
    }
  };

  // UI helpers
  const renderPlayerChip = (player, selectedId, onPress) => {
    if (!player) return null;
    const id = player._id || player.id;
    const selected = String(selectedId) === String(id);
    return (
      <TouchableOpacity key={id} style={[styles.chip, selected && styles.chipSelected]} onPress={() => onPress(id)}>
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{playerDisplayName(player)}</Text>
      </TouchableOpacity>
    );
  };

  const renderAdaptiveList = (items, selectedId, onPress) => {
    if (!items || items.length === 0) return <Text style={styles.emptyText}>No players available</Text>;
    if (items.length <= 6) return <View style={styles.chipRow}>{items.map((p) => renderPlayerChip(p, selectedId, onPress))}</View>;

    return (
      <ScrollView style={[styles.listScroll, { maxHeight: LIST_MAX_HEIGHT }]} showsVerticalScrollIndicator>
        <View style={styles.chipCol}>{items.map((p) => renderPlayerChip(p, selectedId, onPress))}</View>
      </ScrollView>
    );
  };

  const availableNewBatsmen = battingPlayers.filter(
    (p) =>
      String(p._id || p.id) !== String(outBatsmanId) &&
      String(p._id || p.id) !== String(strikerId) &&
      String(p._id || p.id) !== String(nonStrikerId),
  );

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { maxHeight: MODAL_MAX_HEIGHT }]}>
          <Text style={styles.title}>Record Wicket</Text>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
            <Text style={styles.label}>Dismissal Type</Text>
            <View style={styles.chipRow}>
              {DISMISSAL_TYPES.map((d) => (
                <TouchableOpacity key={d.key} style={[styles.chip, dismissalKey === d.key && styles.chipSelected]} onPress={() => setDismissalKey(d.key)}>
                  <Text style={[styles.chipText, dismissalKey === d.key && styles.chipTextSelected]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {dismissalKey && (
              <>
                <Text style={styles.label}>Out Batsman</Text>
                <View style={styles.fieldSection}>
                  {renderAdaptiveList(allowBatsmanChoice(dismissalKey) ? [striker, nonStriker].filter(Boolean) : [striker].filter(Boolean), outBatsmanId, setOutBatsmanId)}
                  {allowBatsmanChoice(dismissalKey) && <Text style={styles.hintText}>Select which batsman was run out.</Text>}
                </View>
              </>
            )}

            {dismissalKey && needsFielder(dismissalKey) && (
              <>
                <Text style={styles.label}>Fielder</Text>
                <View style={styles.fieldSection}>{renderAdaptiveList(fieldingPlayers, fielderId, setFielderId)}</View>
              </>
            )}

            {dismissalKey && (
              <>
                <Text style={styles.label}>New Batsman</Text>
                <View style={styles.fieldSection}>{renderAdaptiveList(availableNewBatsmen, newBatsmanId, setNewBatsmanId)}</View>
              </>
            )}

            <View style={styles.littleHeight} />
          </ScrollView>

          {/* Actions pinned below scroll area so always visible */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => navigation.goBack()} disabled={submitting}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnConfirm, (!isValid() || submitting) && styles.btnDisabled]} onPress={handleConfirm} disabled={!isValid() || submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnConfirmText}>Confirm Wicket</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* Stylesheet */
const styles = StyleSheet.create({
  /*
  | Referenced at the bottom of the scroll area but never defined, so the
  | spacer it was meant to be rendered as nothing - leaving the last field
  | flush against the pinned action buttons.
  */
  littleHeight: {
    height: 16,
  },


  littleHeigh: {
    height: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    overflow: "hidden",
  },
  content: {
    paddingBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
    alignSelf: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chipCol: {
    flexDirection: "column",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
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
  listScroll: {
    borderRadius: 8,
    marginBottom: 6,
  },
  fieldSection: {
    marginBottom: 8,
  },
  emptyText: {
    color: "#666",
  },
  hintText: {
    color: "#666",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 6,
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
  btnDisabled: {
    opacity: 0.6,
  },
});