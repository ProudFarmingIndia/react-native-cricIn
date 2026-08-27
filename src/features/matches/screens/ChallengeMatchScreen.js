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
import {
  sendChallengeApi,
  modifyChallengeApi,
} from "../../matchChallenges/services/matchChallenges.services";

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

/*
|--------------------------------------------------------------------------
| Convert a backend date (ISO) into a YYYY-MM-DD input value
|--------------------------------------------------------------------------
*/

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export default function ChallengeMatchScreen({ navigation, route }) {
  const { team, challenge } = route.params;

  // When a `challenge` is passed, this screen runs in EDIT mode and
  // updates the existing challenge (counter-proposal) instead of
  // sending a brand new one.
  const isEditing = !!challenge;

  const { myTeams = [], getMyTeams } = useTeam();

  const [challengeData, setChallengeData] = useState(() => {
    if (challenge) {
      return {
        date: toDateInput(challenge.proposedDate),
        time: challenge.proposedTime || "",
        venue: challenge.venueName || "",
        matchType: challenge.matchType || "T20",
        overs: challenge.overs || 20,
      };
    }
    return {
      date: "",
      time: "",
      venue: "",
      matchType: "T20 Professional",
      overs: 20,
    };
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

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  |
  | EDIT mode  -> modifyChallengeApi(challengeId, payload)
  |               (backend flips pendingResponseFrom to the other team
  |                and sends a "challenge modified" notification)
  | SEND mode  -> sendChallengeApi(payload)
  |
  */

  const handleSubmit = async () => {
    if (isEditing) {
      try {
        setSubmitting(true);

        await modifyChallengeApi(challenge._id, {
          proposedDate: challengeData.date,
          proposedTime: challengeData.time,
          matchType: mapMatchType(challengeData.matchType),
          overs: Number(challengeData.overs) || 20,
          venueName: challengeData.venue,
        });

        Alert.alert(
          "Challenge Updated",
          "The opponent team has been notified of your updated proposal.",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
      } catch (error) {
        Alert.alert(
          "Could Not Update Challenge",
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

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

        {!isEditing && myTeams.length > 1 && (
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
          title={isEditing ? "Update Challenge" : "Send Challenge Request"}
          onPress={handleSubmit}
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
    borderColor: "#0B7A0B",
    backgroundColor: "#E8F5E9",
  },

  pickerOptionText: {
    fontSize: 14,
    color: "#333",
  },

  pickerOptionTextSelected: {
    color: "#0B7A0B",
    fontWeight: "700",
  },

  loaderContainer: {
    padding: 20,
    alignItems: "center",
  },
});