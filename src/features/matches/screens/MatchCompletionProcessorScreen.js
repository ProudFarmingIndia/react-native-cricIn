import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import { COLORS } from "../../../constants/colors";

const STEPS = [
  "Processing Statistics",
  "Updating Rankings",
  "Syncing Match History",
  "Generating Scorecard",
];

/*
|--------------------------------------------------------------------------
| MatchCompletionProcessorScreen
|--------------------------------------------------------------------------
|
| Expects via route.params: matchId (required).
|
| ⚠ Batch 5 Bug Fix:
|   Previously `navigation.replace("MatchCenterScreen")` was called
|   without passing `matchId`. MatchCenterScreen reads matchId from
|   route.params, so it would silently fail to load any data.
|
|   Fix: read matchId from route.params and forward it in the replace call.
|
| UI: shows an animated step-through of processing stages over 5 seconds
|   (purely cosmetic — the actual stats update happens async on the
|   backend, triggered by updateMatchResult). After the countdown,
|   navigates to MatchCenterScreen with the matchId.
|
*/

export default function MatchCompletionProcessorScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // ⚠ Batch 5 fix: read matchId from params
  const { matchId } = route.params || {};

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < STEPS.length - 1 ? prev + 1 : prev,
      );
    }, 1000);

    const timeout = setTimeout(() => {
      /*
       * ⚠ Batch 5 fix: forward matchId so MatchCenterScreen can load data.
       * If matchId is somehow missing, MatchCenterScreen will show its own
       * empty/error state gracefully.
       */
      navigation.replace("MatchCenterScreen", { matchId });
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigation, matchId]);

  return (
    <View style={styles.container}>
      {/* ── Icon ─────────────────────────────────────────────── */}

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🏏</Text>
      </View>

      {/* ── Title ────────────────────────────────────────────── */}

      <Text style={styles.title}>Match Completed!</Text>

      <Text style={styles.subTitle}>Finalizing match analytics...</Text>

      {/* ── Loader ───────────────────────────────────────────── */}

      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={styles.loader}
      />

      {/* ── Steps ────────────────────────────────────────────── */}

      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <View key={step} style={styles.stepRow}>
              <View
                style={[
                  styles.statusDot,
                  isDone && styles.statusDotDone,
                  isCurrent && styles.statusDotActive,
                ]}
              />

              <Text
                style={[
                  styles.stepText,
                  isDone && styles.stepTextDone,
                  isCurrent && styles.stepTextActive,
                ]}
              >
                {step}
              </Text>

              {isDone && <Text style={styles.checkmark}> ✓</Text>}
            </View>
          );
        })}
      </View>

      <Text style={styles.footer}>Redirecting to Match Center...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + "18",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  icon: {
    fontSize: 48,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
  },

  subTitle: {
    marginTop: 8,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    fontSize: 14,
  },

  loader: {
    marginVertical: 28,
  },

  stepsContainer: {
    width: "100%",
    marginBottom: 30,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.outlineVariant,
    marginRight: 12,
  },

  statusDotActive: {
    backgroundColor: COLORS.primary,
  },

  statusDotDone: {
    backgroundColor: "#2e7d32",
  },

  stepText: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },

  stepTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  stepTextDone: {
    color: "#2e7d32",
    fontWeight: "600",
  },

  checkmark: {
    color: "#2e7d32",
    fontWeight: "700",
    fontSize: 14,
  },

  footer: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontStyle: "italic",
  },
});