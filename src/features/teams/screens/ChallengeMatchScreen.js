import React, { useEffect, useState } from "react";

import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import PrimaryButton from "../../../components/Button/PrimaryButton";

import ChallengeHeroCard from "../components/ChallengeHeroCard";
import MatchDetailsForm from "../components/MatchDetailsForm";
import OversSelector from "../components/OversSelector";
import ChallengeInfoCard from "../components/ChallengeInfoCard";

import useTeam from "../hooks/useTeam";
import { sendChallengeApi } from "../../matchChallenges/services/matchChallenges.services";

/*
|--------------------------------------------------------------------------
| Match Type Mapping
|--------------------------------------------------------------------------
|
| The UI offers descriptive labels ("T20 Professional") but the backend
| only accepts the strict enum T10 / T20 / ODI / Test. Map defensively
| and fall back to "T20".
|
*/

const mapMatchType = (value) => {
  if (!value) return "T20";
  const normalized = String(value).toUpperCase();
  if (normalized.includes("T10")) return "T10";
  if (normalized.includes("T20")) return "T20";
  if (normalized.includes("ODI")) return "ODI";
  if (normalized.includes("TEST")) return "Test";
  return "T20";
};

export default function ChallengeMatchScreen({ navigation, route }) {
  const { team } = route.params;

  const { myTeams = [], getMyTeams } = useTeam();

  const [challengeData, setChallengeData] = useState({
    date: "",
    time: "",
    venue: "",
    matchType: "T20 Professional",
    overs: 20,
  });

  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyTeams();
  }, [getMyTeams]);

  /*
  |--------------------------------------------------------------------------
  | Auto-select when the user manages exactly one team
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (myTeams.length === 1) {
      setSelectedTeamId(myTeams[0]._id);
    }
  }, [myTeams]);

  const updateField = (key, value) => {
    setChallengeData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSendChallenge = async () => {
    if (!team?._id) {
      Alert.alert("Error", "Opponent team is missing.");
      return;
    }

    if (myTeams.length === 0) {
      Alert.alert(
        "No Team Found",
        "You need to create or manage a team before sending a challenge.",
      );
      return;
    }

    const challengerTeamId = selectedTeamId || myTeams[0]?._id;

    if (!challengerTeamId) {
      Alert.alert("Select Team", "Please select which team is challenging.");
      return;
    }

    if (String(challengerTeamId) === String(team._id)) {
      Alert.alert("Invalid", "A team cannot challenge itself.");
      return;
    }

    try {
      setSubmitting(true);

      await sendChallengeApi({
        challengerTeamId,
        challengedTeamId: team._id,
        proposedDate: challengeData.date,
        proposedTime: challengeData.time,
        matchType: mapMatchType(challengeData.matchType),
        overs: Number(challengeData.overs) || 20,
        venueName: challengeData.venue,
      });

      Alert.alert(
        "Challenge Sent!",
        "The opponent team will be notified.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert(
        "Could Not Send Challenge",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ChallengeHeroCard opponentTeam={team} />

        {myTeams.length > 1 && (
          <View style={styles.pickerCard}>
            <Text style={styles.pickerLabel}>Challenge as</Text>

            {myTeams.map((myTeam) => {
              const isSelected =
                String(selectedTeamId) === String(myTeam._id);

              return (
                <TouchableOpacity
                  key={myTeam._id}
                  style={[
                    styles.pickerOption,
                    isSelected && styles.pickerOptionSelected,
                  ]}
                  onPress={() => setSelectedTeamId(myTeam._id)}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      isSelected && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {myTeam.teamName || myTeam.name || "Team"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <MatchDetailsForm
          challengeData={challengeData}
          updateField={updateField}
        />

        <OversSelector
          overs={challengeData.overs}
          onChange={(value) => updateField("overs", value)}
        />

        <ChallengeInfoCard />
      </ScrollView>

      {submitting ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1B5E20" />
        </View>
      ) : (
        <PrimaryButton
          title="Send Challenge Request"
          onPress={handleSendChallenge}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
  },

  pickerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  pickerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },

  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 8,
  },

  pickerOptionSelected: {
    borderColor: "#1B5E20",
    backgroundColor: "#E8F5E9",
  },

  pickerOptionText: {
    fontSize: 15,
    color: "#333",
  },

  pickerOptionTextSelected: {
    color: "#1B5E20",
    fontWeight: "700",
  },

  loaderContainer: {
    padding: 16,
    alignItems: "center",
  },
});
