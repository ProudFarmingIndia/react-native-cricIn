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

import useScoring from "../../scoring/hooks/useScoring";

import { COLORS } from "../../../constants/colors";

const ballLabel = (ball) => {
  if (ball.isWicket) return "W";
  if (ball.extraType === "wide") return "wd";
  if (ball.extraType === "noBall") return "nb";
  if (ball.extraType === "bye") return `${ball.runs}b`;
  if (ball.extraType === "legBye") return `${ball.runs}lb`;
  return String(ball.runs ?? 0);
};

export default function OverSummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    score = 0,
    wickets = 0,
    overs = "0.0",
    currentRunRate = "0.00",
    target,
    requiredRunRate,
    overBalls = [],
    striker,
    nonStriker,
    bowler,
    inningsId,
    bowlingPool = [],
    lastBowlerId,
    maxOversPerBowler = 4,
    oversBowledBy = {},
  } = route.params || {};

  const { setNextBowler, loading, loadInnings } = useScoring();

  const [pendingBowlerId, setPendingBowlerId] = useState(null);

  const runsThisOver = overBalls.reduce(
    (sum, b) => sum + (b.teamRuns ?? b.runs ?? 0),
    0,
  );

  const wicketsThisOver = overBalls.filter((b) => b.isWicket).length;

  /*
  | Who can bowl next: anyone but the bowler who just finished, and anyone
  | under the per-bowler over limit.
  |
  | The `|| 1` floor matters. In a short match maxOversPerBowler could
  | arrive as 0 (Math.floor(4 / 5)), which excluded EVERY bowler - the list
  | came back empty, no bowler could be chosen, and with this screen now
  | un-dismissible that would be a dead end rather than an annoyance.
  */

  const overLimit = Math.max(1, maxOversPerBowler || 1);

  const eligibleBowlers = bowlingPool.filter((p) => {
    const id = p._id;

    if (String(id) === String(lastBowlerId)) return false;

    const oversBowled = (oversBowledBy[id] || 0) / 6;

    return oversBowled < overLimit;
  });

  /*
  | If the limit somehow rules everyone out, offer the whole pool minus the
  | previous bowler rather than an empty list. A scorer who cannot pick a
  | bowler cannot continue the match, and that is worse than a bowler
  | exceeding a quota the app invented.
  */

  const selectableBowlers =
    eligibleBowlers.length > 0
      ? eligibleBowlers
      : bowlingPool.filter((p) => String(p._id) !== String(lastBowlerId));

  const handleConfirmBowler = async () => {
    console.log("[OverSummary] handleConfirmBowler", { inningsId, pendingBowlerId });
    if (!inningsId) {
      Alert.alert("Missing innings", "Innings ID not provided. Please retry.");
      return;
    }
    if (!pendingBowlerId) {
      Alert.alert("Select bowler", "Please select the next bowler.");
      return;
    }

    try {
      const result = await setNextBowler(inningsId, pendingBowlerId);
      console.log("[OverSummary] setNextBowler result", result);

      // handle possible wrapper shapes
      if (!result) {
        throw new Error("No response from setNextBowler");
      }
      if (result.success === false || result.error) {
        throw new Error(result.error || "Failed to set next bowler");
      }

      /*
      | Refresh, then go back.
      |
      | `loadInnings` was destructured from useScoring but the hook never
      | returned it, so this was always undefined and the typeof guard made
      | the refresh a silent no-op. It only appeared to work because going
      | back re-focuses LiveScoringScreen, whose focus effect fetches. The
      | hook exports it now and it is awaited, so the new bowler is on
      | screen the moment the scorer lands back on the pad.
      */

      if (typeof loadInnings === "function") {
        await loadInnings(inningsId);
      }

      navigation.goBack();
    } catch (err) {
      console.error("[OverSummary] setNextBowler error", err);
      Alert.alert("Failed", err?.message || "Could not set the next bowler.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Over Completed</Text>

        <Text style={styles.subHeading}>End of Over {overs}</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.score}>
            {score}/{wickets}{" "}
            <Text style={styles.overs}>({overs})</Text>
          </Text>

          <View style={styles.row}>
            <View style={styles.rateBox}>
              <Text style={styles.label}>Run Rate</Text>
              <Text style={styles.value}>{currentRunRate}</Text>
            </View>

            {target != null && requiredRunRate != null && (
              <View style={styles.rateBox}>
                <Text style={styles.label}>Req Rate</Text>
                <Text style={[styles.value, styles.reqRateValue]}>
                  {requiredRunRate}
                </Text>
              </View>
            )}

            {target != null && (
              <View style={styles.rateBox}>
                <Text style={styles.label}>Need</Text>
                <Text style={styles.value}>{Math.max(0, target - score)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Runs In Over</Text>

          <Text style={styles.bigNumber}>{runsThisOver}</Text>

          <View style={styles.ballRow}>
            {overBalls.map((ball, index) => (
              <View
                key={ball._id || index}
                style={[
                  styles.ball,
                  ball.isWicket && styles.ballWicket,
                  ball.extraType === "wide" && styles.ballExtra,
                  ball.extraType === "noBall" && styles.ballExtra,
                ]}
              >
                <Text
                  style={[
                    styles.ballText,
                    ball.isWicket && styles.ballTextWicket,
                  ]}
                >
                  {ballLabel(ball)}
                </Text>
              </View>
            ))}
          </View>

          {wicketsThisOver > 0 && (
            <Text style={styles.wicketNote}>
              {wicketsThisOver} wicket{wicketsThisOver > 1 ? "s" : ""} this over
            </Text>
          )}
        </View>

        {(striker || nonStriker) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>At The Crease</Text>

            {striker && (
              <View style={styles.playerRow}>
                <Text style={styles.playerName}>{striker.playerName} *</Text>
                <Text style={styles.playerFigures}>
                  {striker.runs} ({striker.balls})
                </Text>
              </View>
            )}

            {nonStriker && (
              <View style={styles.playerRow}>
                <Text style={styles.playerName}>{nonStriker.playerName}</Text>
                <Text style={styles.playerFigures}>
                  {nonStriker.runs} ({nonStriker.balls})
                </Text>
              </View>
            )}
          </View>
        )}

        {bowler && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bowler This Over</Text>

            <View style={styles.playerRow}>
              <Text style={styles.playerName}>{bowler.playerName}</Text>
              <Text style={styles.playerFigures}>
                {bowler.overs}-{bowler.maidens ?? 0}-{bowler.runs}-{bowler.wickets}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select New Bowler</Text>

          {selectableBowlers.length === 0 ? (
            <Text style={styles.emptyBowlerText}>
              No eligible bowlers available (all at quota or only one bowler).
            </Text>
          ) : (
            selectableBowlers.map((player) => {
              const id = player._id;
              const oversBowled = (oversBowledBy[id] || 0) / 6;
              const selected = pendingBowlerId === id;

              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.bowlerRow,
                    selected && styles.bowlerRowSelected,
                  ]}
                  onPress={() => setPendingBowlerId(id)}
                >
                  <Text style={styles.playerName}>{player.playerName}</Text>
                  <Text style={styles.playerFigures}>
                    {oversBowled.toFixed(1)} ov
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.button,
          (!pendingBowlerId || loading) && styles.buttonDisabled,
        ]}
        disabled={!pendingBowlerId || loading}
        onPress={handleConfirmBowler}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Start Next Over →</Text>
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
    paddingBottom: 120,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
  },

  subHeading: {
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
    marginBottom: 16,
    marginTop: 4,
  },

  scoreCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  score: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  overs: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    fontWeight: "400",
  },

  row: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "center",
  },

  rateBox: {
    alignItems: "center",
    marginHorizontal: 12,
  },

  label: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  value: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginTop: 2,
  },

  reqRateValue: {
    color: COLORS.error,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  bigNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.secondary,
    textAlign: "center",
  },

  ballRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },

  ball: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  ballWicket: {
    backgroundColor: COLORS.error,
  },

  ballExtra: {
    backgroundColor: COLORS.secondary,
  },

  ballText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 11,
  },

  ballTextWicket: {
    color: COLORS.onError,
  },

  wicketNote: {
    textAlign: "center",
    color: COLORS.error,
    fontWeight: "600",
    marginTop: 10,
    fontSize: 13,
  },

  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  playerName: {
    fontWeight: "600",
    color: COLORS.onSurface,
    fontSize: 15,
  },

  playerFigures: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },

  bowlerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: 8,
  },

  bowlerRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceContainer,
  },

  emptyBowlerText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
  },

  button: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
});