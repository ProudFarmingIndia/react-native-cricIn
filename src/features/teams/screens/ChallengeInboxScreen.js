import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import ChallengeTabs from "../components/ChallengeTabs";
import ChallengeCard from "../components/ChallengeCard";
import EmptyChallengeState from "../components/EmptyChallengeState";

import useTeam from "../hooks/useTeam";

import {
  getChallengesForTeamApi,
  acceptChallengeApi,
  rejectChallengeApi,
  cancelChallengeApi,
} from "../../matchChallenges/services/matchChallenges.services";

import { getMatchByIdApi } from "../../matches/services/matches.services";

/*
|--------------------------------------------------------------------------
| Rejection Reasons (must match backend enum)
|--------------------------------------------------------------------------
*/

const REJECTION_REASONS = [
  { key: "CANNOT_TRAVEL", label: "Can't travel" },
  { key: "DATE_CONFLICT", label: "Date conflict" },
  { key: "FORMAT_MISMATCH", label: "Format mismatch" },
  { key: "PLAYER_SHORTAGE", label: "Player shortage" },
  { key: "GROUND_UNAVAILABLE", label: "Ground unavailable" },
  { key: "Other", label: "Other" },
];

/*
|--------------------------------------------------------------------------
| Format a raw challenge into the shape ChallengeCard expects
|--------------------------------------------------------------------------
*/

const formatChallenge = (challenge, direction) => {
  const opponent =
    direction === "received"
      ? challenge.challengerTeamId
      : challenge.challengedTeamId;

  const dateObj = challenge.proposedDate
    ? new Date(challenge.proposedDate)
    : null;

  return {
    id: challenge._id,
    raw: challenge,
    opponent,
    teamName: opponent?.teamName || opponent?.name || "Unknown Team",
    format: challenge.matchType || "T20",
    date: dateObj ? dateObj.toDateString() : "TBD",
    time: challenge.proposedTime || "TBD",
    venue: challenge.venueName || "Venue TBD",
    status: challenge.status,
  };
};

export default function ChallengeInboxScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { myTeams = [], getMyTeams } = useTeam();

  const [teamId, setTeamId] = useState(route.params?.teamId || null);
  const [activeTab, setActiveTab] = useState("received");

  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Resolve which team's inbox to show
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    getMyTeams();
  }, [getMyTeams]);

  useEffect(() => {
    if (!teamId && myTeams.length === 1) {
      setTeamId(myTeams[0]._id);
    }
  }, [myTeams, teamId]);

  /*
  |--------------------------------------------------------------------------
  | Load challenges
  |--------------------------------------------------------------------------
  */

  const loadChallenges = useCallback(async () => {
    if (!teamId) return;

    try {
      setLoading(true);

      const [receivedData, sentData] = await Promise.all([
        getChallengesForTeamApi(teamId, "received"),
        getChallengesForTeamApi(teamId, "sent"),
      ]);

      setReceived(
        (receivedData || []).map((c) => formatChallenge(c, "received")),
      );
      setSent((sentData || []).map((c) => formatChallenge(c, "sent")));
    } catch (error) {
      Alert.alert(
        "Could Not Load Challenges",
        error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Accept -> match is created server-side -> enter squad selection
  |--------------------------------------------------------------------------
  */

  const handleAccept = async (item) => {
    try {
      setLoading(true);

      const challenge = await acceptChallengeApi(item.id);

      const matchId = challenge?.matchId?._id || challenge?.matchId;

      if (!matchId) {
        throw new Error("Match was not created for this challenge.");
      }

      // Deep-fetch the match so teamA/teamB include their players.
      const match = await getMatchByIdApi(matchId);

      await loadChallenges();

      navigation.navigate("Matches", {
        screen: "QuickScoreFlow",
        params: {
          screen: "SquadSelectionScreen",
          params: {
            matchId: match?._id || matchId,
            teamA: match?.teamA,
            teamB: match?.teamB,
          },
        },
      });
    } catch (error) {
      Alert.alert(
        "Could Not Accept",
        error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reject (reason required)
  |--------------------------------------------------------------------------
  */

  const submitReject = async (challengeId, reason) => {
    try {
      setLoading(true);
      await rejectChallengeApi(challengeId, { reason, message: "" });
      await loadChallenges();
    } catch (error) {
      Alert.alert(
        "Could Not Decline",
        error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (item) => {
    Alert.alert(
      "Decline Challenge",
      "Select a reason for declining:",
      [
        ...REJECTION_REASONS.map((reason) => ({
          text: reason.label,
          onPress: () => submitReject(item.id, reason.key),
        })),
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Withdraw a sent challenge
  |--------------------------------------------------------------------------
  */

  const handleWithdraw = (item) => {
    Alert.alert("Withdraw Challenge", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Withdraw",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await cancelChallengeApi(item.id);
            await loadChallenges();
          } catch (error) {
            Alert.alert(
              "Could Not Withdraw",
              error?.response?.data?.message ||
                error?.message ||
                "Please try again.",
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Modify / Counter-Proposal
  |--------------------------------------------------------------------------
  |
  | Opens the challenge form in EDIT mode, pre-filled with the existing
  | challenge. On save it calls modifyChallengeApi, which updates the
  | SAME challenge (no new match) and notifies the other team.
  |
  */

  const handleModify = (item) => {
    navigation.navigate("ChallengeMatchScreen", {
      team: item.opponent,
      challenge: item.raw,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Team picker (only when no teamId is resolvable)
  |--------------------------------------------------------------------------
  */

  if (!teamId) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pickerTitle}>Select a team</Text>

          {myTeams.length === 0 ? (
            <EmptyChallengeState />
          ) : (
            myTeams.map((team) => (
              <TouchableOpacity
                key={team._id}
                style={styles.teamOption}
                onPress={() => setTeamId(team._id)}
              >
                <Text style={styles.teamOptionText}>
                  {team.teamName || team.name || "Team"}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  const activeList = activeTab === "received" ? received : sent;

  return (
    <View style={styles.container}>
      <ChallengeTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        receivedCount={received.length}
      />

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0B7A0B" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeList.length === 0 && <EmptyChallengeState />}

          {activeList.map((item) => (
            <ChallengeCard
              key={item.id}
              challenge={item}
              type={activeTab}
              onAccept={() => handleAccept(item)}
              onReject={() => handleReject(item)}
              onWithdraw={() => handleWithdraw(item)}
              onModify={() => handleModify(item)}
            />
          ))}
        </ScrollView>
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

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },

  teamOption: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  teamOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0B7A0B",
  },
});