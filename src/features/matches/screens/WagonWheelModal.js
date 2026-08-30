import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import useScoring from "../../scoring/hooks/useScoring";

import { setPendingBallResult } from "../utils/ballHandoff";

import { COLORS } from "../../../constants/colors";

/*
| The handoff lives in utils/ballHandoff.js now - see the note there for why
| route params could not carry it. Re-exported so any older import of
| consumePendingBallResult from this file still resolves.
*/

export { consumePendingBallResult } from "../utils/ballHandoff";

const FIELD_SIZE = Math.min(300, Dimensions.get("window").width - 80);
const CENTER = FIELD_SIZE / 2;
const DOT_SIZE = 18;

const REGIONS = [
  { max: 22.5, name: "Long On" },
  { max: 67.5, name: "Mid Wicket" },
  { max: 112.5, name: "Square Leg" },
  { max: 157.5, name: "Fine Leg" },
  { max: 202.5, name: "Third Man" },
  { max: 247.5, name: "Point" },
  { max: 292.5, name: "Cover" },
  { max: 337.5, name: "Long Off" },
  { max: 360.01, name: "Long On" },
];

const getRegionName = (angle) => {
  const region = REGIONS.find((r) => angle <= r.max);
  return region ? region.name : "Long On";
};

export default function WagonWheelModal() {
  const navigation = useNavigation();

  const route = useRoute();

  const { matchId: routeMatchId, inningsId: routeInningsId, runs, batsmanId, bowlerId, shotType } =
  route.params || {};
const matchId = routeMatchId;
const inningsId = routeInningsId;

  /*
  | ballLoading, not loading: `loading` is shared by every scoring thunk in
  | the app, so an unrelated request in flight made Confirm silently refuse
  | to submit - no alert, no navigation, no ball recorded.
  */

  const { addBall, ballLoading } = useScoring();

  const [point, setPoint] = useState(null);
  const [selection, setSelection] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  console.log("[WagonWheel] mounted with params", {
    matchId,
    inningsId,
    runs,
    batsmanId,
    bowlerId,
    shotType,
  });

  const handleFieldPress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    const dx = locationX - CENTER;
    const dy = locationY - CENTER;

    const rawDistance = Math.sqrt(dx * dx + dy * dy) / CENTER;
    const distance = Math.min(1, Number(rawDistance.toFixed(2)));

    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    angle = Math.round(angle);

    console.log("[WagonWheel] handleFieldPress", { locationX, locationY, angle, distance });

    setPoint({ x: locationX, y: locationY });
    setSelection({ angle, distance, region: getRegionName(angle) });
  };

  const handleReset = () => {
    console.log("[WagonWheel] handleReset");
    setPoint(null);
    setSelection(null);
  };

  const handleConfirm = async () => {
    console.log("[WagonWheel] handleConfirm START", {
      submitting,
      ballLoading,
      selection,
      runs,
      inningsId,
    });

    if (submitting || ballLoading) return;

    setSubmitting(true);

    try {
      /*
      | NO Promise.race timeout here any more.
      |
      | The race rejected at 15 seconds but could not cancel the request, so
      | on a slow connection the server still recorded the ball at ~16s
      | while the scorer read "Request timed out - try again". Tapping
      | Confirm again recorded the SAME delivery twice; not tapping it meant
      | the late result was pushed into Redux with afterBall never running,
      | so the over-complete, all-out and target checks were skipped for
      | that ball entirely.
      |
      | A write that may have succeeded must not be presented as a failure.
      | The request is allowed to finish and its real answer is used.
      */

      const result = await addBall({
        matchId,
        inningsId,
        batsmanId,
        bowlerId,
        runs,
        shotType: shotType || "",
        /*
        | region travels with the angle. It is already computed here for the
        | on-screen label, and sending it means the server writes the zone
        | name that was actually shown to the scorer - rather than
        | re-deriving it later from the angle and risking a different answer
        | if the zone boundaries are ever adjusted.
        */
        wagonWheel: {
          angle: selection?.angle ?? null,
          distance: selection?.distance ?? null,
          region: selection?.region || "",
        },
      });

      console.log("[WagonWheel] addBall RESULT", result);

      if (!result?.success) {
        Alert.alert("Failed", result?.error || "Could not record that ball.");
        return;
      }

      /*
      | The result goes through the handoff module and the navigation
      | carries NO params, so LiveScoringScreen's battingSquad, bowlingSquad
      | and target survive - see utils/ballHandoff.js.
      |
      | Navigating by name (rather than goBack) also pops ShotSelectionModal
      | underneath, so it does not reappear.
      */

      setPendingBallResult(result);

      navigation.navigate("LiveScoringScreen");
    } catch (err) {
  const eText = err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
  console.log("[WagonWheel] handleConfirm ERROR", eText);
  Alert.alert("Failed", eText || "Could not record that ball.");
} finally {
  setSubmitting(false);
}
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Ball Direction</Text>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View
          style={styles.field}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleFieldPress}
        >
          <Text style={[styles.zoneLabel, styles.zoneLabelTop]}>LONG ON</Text>
          <Text style={[styles.zoneLabel, styles.zoneLabelBottom]}>THIRD MAN</Text>
          <Text style={[styles.zoneLabel, styles.zoneLabelLeft]}>COVER</Text>
          <Text style={[styles.zoneLabel, styles.zoneLabelRight]}>SQ. LEG</Text>

          <View style={styles.pitch} />

          {point && (
            <View
              style={[
                styles.dot,
                {
                  left: point.x - DOT_SIZE / 2,
                  top: point.y - DOT_SIZE / 2,
                },
              ]}
            />
          )}
        </View>

        <View style={styles.selectionCard}>
          <Text style={styles.selectionLabel}>CURRENT SELECTION</Text>

          <Text style={styles.selectionValue}>
            {selection ? selection.region : "Tap the field to set direction"}
          </Text>

          {selection && (
            <View style={styles.angleRow}>
              <Ionicons name="compass-outline" size={14} color={COLORS.secondary} />
              <Text style={styles.angleText}>{selection.angle}° Angle</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>

          {/*
          | Confirm stays disabled until the field has been tapped.
          |
          | It used to submit with selection === null, writing an empty
          | region - so a ball whose direction was never chosen looked
          | identical to one that had been recorded properly, and the
          | commentary had nothing to say about where it went.
          */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selection && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={ballLoading || submitting || !selection}
          >
            {ballLoading || submitting ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <>
                <Text style={styles.confirmText}>
                  {selection ? "Confirm Direction" : "Tap the field first"}
                </Text>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.onPrimary} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },

  modal: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },

  field: {
    width: FIELD_SIZE,
    height: FIELD_SIZE,
    borderRadius: FIELD_SIZE / 2,
    backgroundColor: COLORS.primaryContainer,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.outlineVariant,
  },

  pitch: {
    width: FIELD_SIZE * 0.12,
    height: FIELD_SIZE * 0.32,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 4,
  },

  zoneLabel: {
    position: "absolute",
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.onPrimaryContainer,
  },

  zoneLabelTop: {
    top: 4,
    left: CENTER - 30,
  },

  zoneLabelBottom: {
    bottom: 4,
    left: CENTER - 34,
  },

  zoneLabelLeft: {
    top: CENTER - 8,
    left: 2,
  },

  zoneLabelRight: {
    top: CENTER - 8,
    right: 2,
  },

  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLORS.secondaryContainer,
    borderWidth: 2,
    borderColor: COLORS.onPrimary,
  },

  selectionCard: {
    marginTop: 20,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    padding: 16,
  },

  selectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },

  selectionValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 4,
  },

  angleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  angleText: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  resetButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  resetText: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "700",
  },

  confirmButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  confirmButtonDisabled: {
    opacity: 0.5,
  },

  confirmText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    marginRight: 8,
  },
});