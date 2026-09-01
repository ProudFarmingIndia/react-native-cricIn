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
import { getMatchByIdApi } from "../services/matches.services";
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

  /*
  |--------------------------------------------------------------------------
  | Retirement (Law 25.4)
  |--------------------------------------------------------------------------
  |
  | A batter leaving the crease, which is what this sheet is for - so it
  | lives here rather than behind a control of its own.
  |
  | RETIRED HURT is not a dismissal. No wicket falls, the innings is not a
  | batter shorter, and the player may come back when the next wicket does.
  | Because the server stores it with isWicket false, he stays in this
  | sheet's own incoming-batter list for the rest of the innings - so
  | "resuming" needs no extra screen anywhere: he is simply there to pick
  | again next time.
  |
  | RETIRED OUT is a dismissal. It costs a wicket, no bowler is credited,
  | and he does not return.
  |
  | Both let the scorer choose WHICH batter walks off, because it is as
  | often the non-striker.
  */

  { key: "retiredHurt", label: "Retired Hurt", needsFielder: false, allowBatsmanChoice: true, creditsBowler: false, isRetirement: true },
  { key: "retiredOut", label: "Retired Out", needsFielder: false, allowBatsmanChoice: true, creditsBowler: false, isRetirement: true },
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

    /*
    | Everyone already out in this innings. Without it the "new batsman"
    | list offers players who have been dismissed - see availableNewBatsmen.
    */
    dismissedPlayerIds = [],
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

    // No batter required when there is nobody left to send in.
    if (!isLastWicket && !newBatsmanId) return false;

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

      /*
      | isWicket and isLegalDelivery are sent the same way for a retirement
      | as for a dismissal, and the SERVER decides what they really mean -
      | a retired-hurt row ends up with no wicket and no ball counted.
      |
      | That is on purpose. The rule about whether a wicket falls is a rule
      | of cricket, and every other rule of cricket in this app is enforced
      | on the server precisely so a client cannot get one wrong. Deciding
      | it here would put it in two places and let them disagree.
      */

      isLegalDelivery: true,
    };

    try {
      const result = await addBall(payload);
      if (!result || !result.success) {
        setSubmitting(false);
        Alert.alert("Failed", result?.error || "Could not record that.");
        return;
      }

      /*
      | A call to updateMatchApi({ addPlayerToInnings: ... }) used to sit
      | here. No such field exists anywhere in the backend, and updateMatch
      | strips anything outside its allow-list, so it was a no-op whose
      | failure was only console.warn'd. Removed rather than left to look
      | like it does something.
      */

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

  /*
  | Who can walk in: anyone in the batting XI who is not the batter going
  | out and not the one still at the other end.
  |
  | dismissedIds is what was missing. The filter only excluded the current
  | three, so at nine down the list still offered all nine players who were
  | ALREADY out - and since a new batter was mandatory, the scorer had to
  | nominate a dismissed player to record the final wicket, which was then
  | written to the crease of a finished innings.
  */

  const dismissedIds = useMemo(
    () => new Set((dismissedPlayerIds || []).map((id) => String(id))),
    [dismissedPlayerIds],
  );

  const availableNewBatsmen = battingPlayers.filter((p) => {
    const id = String(p._id || p.id);

    return (
      id !== String(outBatsmanId) &&
      id !== String(strikerId) &&
      id !== String(nonStrikerId) &&
      !dismissedIds.has(id)
    );
  });

  /*
  | The last wicket. With nobody left to come in, the innings ends on this
  | delivery - so a new batter is not required, and asking for one is what
  | made the tenth wicket unrecordable.
  */

  const isLastWicket = availableNewBatsmen.length === 0;

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
                <Text style={styles.label}>
                  {isLastWicket ? "New Batsman (none left)" : "New Batsman"}
                </Text>
                <View style={styles.fieldSection}>
                  {isLastWicket ? (
                    <Text style={styles.lastWicketNote}>
                      This is the last wicket - the innings ends here.
                    </Text>
                  ) : (
                    renderAdaptiveList(
                      availableNewBatsmen,
                      newBatsmanId,
                      setNewBatsmanId,
                    )
                  )}
                </View>
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

  lastWicketNote: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    paddingVertical: 8,
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