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

import Ionicons from "@expo/vector-icons/Ionicons";

import { useNavigation, useRoute } from "@react-navigation/native";

import { updateMatchApi } from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Toss Screen
|--------------------------------------------------------------------------
|
| Expects via route.params: matchId, teamA, teamB (with .squad already
| set from SquadSelectionScreen).
|
| Persists tossWinner/tossDecision to the Match record, then forwards
| the batting/bowling team split to the opening-pair/bowler screen.
*/

export default function TossScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { matchId, teamA, teamB } = route.params || {};

  const [call, setCall] = useState("Heads");
  const [coinSide, setCoinSide] = useState(null);
  const [tossWinnerId, setTossWinnerId] = useState(null);
  const [electedTo, setElectedTo] = useState(null);
  const [saving, setSaving] = useState(false);

  const teams = [teamA, teamB].filter(Boolean);

  const handleFlipCoin = () => {
    const result = Math.random() > 0.5 ? "Heads" : "Tails";
    setCoinSide(result);
  };

  const handleContinue = async () => {
    if (!tossWinnerId) {
      Alert.alert("Please select the toss winner");
      return;
    }

    if (!electedTo) {
      Alert.alert("Please select Bat or Bowl");
      return;
    }

    const tossWinnerTeam = teams.find((t) => t._id === tossWinnerId);
    const tossLoserTeam = teams.find((t) => t._id !== tossWinnerId);

    const battingTeam = electedTo === "Bat" ? tossWinnerTeam : tossLoserTeam;
    const bowlingTeam = electedTo === "Bat" ? tossLoserTeam : tossWinnerTeam;

    try {
      setSaving(true);

      await updateMatchApi(matchId, {
        tossWinner: tossWinnerId,
        tossDecision: electedTo,
      });

      navigation.navigate("MatchLineUpScreen", {
        matchId,
        battingTeam,
        bowlingTeam,
      });
    } catch (error) {
      Alert.alert(
        "Failed",
        error.response?.data?.message || "Could not save the toss result.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.coinCard}>
          <Text style={styles.sectionTitle}>Coin Toss</Text>

          <View style={styles.row}>
            {["Heads", "Tails"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.choiceButton, call === item && styles.selectedChoice]}
                onPress={() => setCall(item)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    call === item && styles.selectedChoiceText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Ionicons
            name="disc-outline"
            size={64}
            color={COLORS.secondaryContainer}
            style={styles.coinIcon}
          />

          {coinSide && (
            <Text style={styles.coinResultText}>
              Result: {coinSide} {coinSide === call ? "🎉" : ""}
            </Text>
          )}

          <TouchableOpacity style={styles.flipButton} onPress={handleFlipCoin}>
            <Ionicons name="refresh" size={20} color={COLORS.onPrimary} />
            <Text style={styles.flipText}>Flip Coin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Toss Winner</Text>

          {teams.map((team) => (
            <TouchableOpacity
              key={team._id}
              style={[
                styles.teamCard,
                tossWinnerId === team._id && styles.selectedCard,
              ]}
              onPress={() => setTossWinnerId(team._id)}
            >
              <Text style={styles.teamName}>{team.teamName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Elected To</Text>

          <View style={styles.row}>
            {["Bat", "Bowl"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.actionCard,
                  electedTo === item && styles.selectedCard,
                ]}
                onPress={() => setElectedTo(item)}
              >
                <Text style={styles.actionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {tossWinnerId && electedTo && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Toss Result</Text>

            <Text style={styles.summaryText}>
              {teams.find((t) => t._id === tossWinnerId)?.teamName} won the
              toss and elected to {electedTo.toLowerCase()} first.
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.continueText}>Continue To Playing XI</Text>
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

  coinIcon: {
    alignSelf: "center",
    marginVertical: 12,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  coinCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 12,
    alignSelf: "flex-start",
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
  },

  choiceButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    marginHorizontal: 6,
  },

  selectedChoice: {
    backgroundColor: COLORS.primary,
  },

  choiceText: {
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  selectedChoiceText: {
    color: COLORS.onPrimary,
  },

  coinResultText: {
    textAlign: "center",
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 8,
  },

  flipButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  flipText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    marginLeft: 8,
  },

  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: 8,
  },

  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceContainer,
  },

  teamName: {
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  actionCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    marginHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  actionText: {
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  summaryCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 16,
    padding: 16,
  },

  summaryTitle: {
    color: COLORS.onPrimaryContainer,
    fontWeight: "700",
    marginBottom: 6,
  },

  summaryText: {
    color: COLORS.onPrimaryContainer,
  },

  continueButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  continueText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
});