import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MatchInfoSection from "../components/MatchInfoSection";
import TeamSelectionSection from "../components/TeamSelectionSection";
import MatchSpecificationSection from "../components/MatchSpecificationSection";
import GroundSelectionSection from "../components/GroundSelectionSection";
import BottomAction from "../components/BottomAction";
import { sendChallengeApi } from "../../matchChallenges/services/matchChallenges.services";
import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Quick Score Screen
|--------------------------------------------------------------------------
|
| First screen of the Quick Score flow. It now owns match creation and
| splits into two modes:
|
|   • Quick Match     — no match name / tournament. User picks a start
|                       time (today, within 24 hours) and goes straight
|                       to squad selection → toss → lineup → live scoring.
|   • Scheduled Match — requires a match name, date and time, creates the
|                       match as "upcoming", sends a challenge notification
|                       to the opposing captain, and returns to the Matches
|                       list where it appears as "pending".
|
| Team selection happens here via TeamSelectionSection, so creation also
| happens here (no double-entry through TeamSelectionScreen).
*/

const MATCH_MODES = [
  {
    value: "quick",
    label: "Quick Match",
    icon: "flash",
    description: "Start scoring right away",
  },
  {
    value: "scheduled",
    label: "Scheduled Match",
    icon: "calendar",
    description: "Plan for a later date",
  },
];

// "2026-08-23" for today
const todayString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function QuickScoreScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  /*
  | The opening mode is chosen by whoever navigated here, so one screen can
  | serve two entry points that mean different things:
  |
  |   Home > Quick Score   -> "quick"      (no params, the default)
  |   Sidebar > Add Match  -> "scheduled"
  |
  | Read once as the initial state rather than synced to the param, so the
  | toggle stays the user's to change after the screen opens.
  */

  const [mode, setMode] = useState(
    route.params?.mode === "scheduled" ? "scheduled" : "quick",
  );

  const [matchData, setMatchData] = useState({
    matchName: "",
    tournament: "",
    teamA: null,
    teamB: null,
    matchType: "T20",
    overs: 20,
    ballType: "Leather",
    pitchType: "Turf",
    matchDate: "",
    matchTime: "",
    ground: "",
    umpire1: "",
    umpire2: "",
    scorer: "",
  });

  const [creating, setCreating] = useState(false);

  const updateField = (field, value) => {
    setMatchData((prev) => ({ ...prev, [field]: value }));
  };

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  |
  | Quick Match requires a start time. Scheduled Match additionally
  | requires a match name and a date.
  */

  const validateMatch = () => {
    if (mode === "scheduled" && !matchData.matchName.trim()) {
      Alert.alert("Missing Info", "Please enter a match name.");
      return false;
    }

    if (!matchData.teamA) {
      Alert.alert("Missing Info", "Please select Team A.");
      return false;
    }

    if (!matchData.teamB) {
      Alert.alert("Missing Info", "Please select Team B.");
      return false;
    }

    if (matchData.teamA._id === matchData.teamB._id) {
      Alert.alert("Invalid Selection", "Team A and Team B must be different.");
      return false;
    }

    if (!matchData.matchTime.trim()) {
      Alert.alert("Missing Info", "Please pick a start time.");
      return false;
    }

    if (mode === "scheduled" && !matchData.matchDate.trim()) {
      Alert.alert("Missing Info", "Please pick a match date.");
      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | Combine Date + Time Into A Real Date
  |--------------------------------------------------------------------------
  |
  | Quick Match uses today's date + the picked time (within 24 hours).
  | Scheduled Match uses the picked date + time. Invalid input returns
  | null so the backend simply stores no scheduled time rather than
  | erroring.
  */

  const buildScheduledStartTime = () => {
    if (!matchData.matchTime) return null;

    const dateStr = mode === "scheduled" ? matchData.matchDate : todayString();
    const combined = `${dateStr}T${matchData.matchTime}:00`;

    const parsed = new Date(combined);

    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  };

  const handleContinue = async () => {
    if (!validateMatch()) return;

    try {
      setCreating(true);

      await sendChallengeApi({
        challengerTeamId: matchData.teamA._id,
        challengedTeamId: matchData.teamB._id,
        proposedDate: buildScheduledStartTime(),
        proposedTime: matchData.matchTime || "",
        venueName: matchData.ground || "",
        matchType: matchData.matchType,
        overs: matchData.overs,
        matchTitle: matchData.matchName,
        tournament: matchData.tournament || "",
        ballType: matchData.ballType,
        pitchType: matchData.pitchType,
        umpire1: matchData.umpire1 || "",
        umpire2: matchData.umpire2 || "",
        scorer: matchData.scorer || "",
      });

      // Redirect straight to Home after a successful send
      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert(
        "Failed",
        error.response?.data?.message || "Could not send the challenge.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* ── Mode Selector ─────────────────────────────────────── */}
        <View style={styles.modeRow}>
          {MATCH_MODES.map((item) => {
            const active = mode === item.value;

            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.modeCard, active && styles.modeCardActive]}
                onPress={() => setMode(item.value)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={active ? COLORS.onPrimary : COLORS.primary}
                />

                <Text
                  style={[styles.modeLabel, active && styles.modeLabelActive]}
                >
                  {item.label}
                </Text>

                <Text
                  style={[styles.modeDesc, active && styles.modeDescActive]}
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Match Name + Tournament only for Scheduled Match */}
        {mode === "scheduled" && (
          <MatchInfoSection matchData={matchData} updateField={updateField} />
        )}

        <TeamSelectionSection matchData={matchData} updateField={updateField} />

        <MatchSpecificationSection
          matchData={matchData}
          updateField={updateField}
          mode={mode}
        />

        <GroundSelectionSection
          matchData={matchData}
          updateField={updateField}
        />
      </ScrollView>

      <BottomAction
        onContinue={handleContinue}
        disabled={creating}
        label={mode === "scheduled" ? "Schedule Match" : "Continue"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },

  modeRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  modeCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 14,
    alignItems: "center",
    marginHorizontal: 4,
  },

  modeCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  modeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginTop: 6,
  },

  modeLabelActive: {
    color: COLORS.onPrimary,
  },

  modeDesc: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    textAlign: "center",
  },

  modeDescActive: {
    color: COLORS.onPrimary,
  },
});