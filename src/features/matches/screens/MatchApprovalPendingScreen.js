import React, { useCallback, useRef, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import { getMatchByIdApi } from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Match Approval Pending Screen
|--------------------------------------------------------------------------
|
| Shown to the match creator right after MatchLineUpScreen when the
| opposing team is managed by someone else - the Innings already exists,
| but the match can't go live until that team's captain approves.
|
| Expects via route.params: matchId, inningsId, battingSquad, bowlingSquad.
|
| There's no real-time layer in this app yet (socket.service.js is a
| stub) - every other approval flow (invitations, vice-captain proposals,
| match challenges) relies on polling/refetch-on-focus instead, so this
| screen polls the match every few seconds while focused.
*/

const POLL_INTERVAL_MS = 4000;

export default function MatchApprovalPendingScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { matchId, inningsId, battingSquad = [], bowlingSquad = [] } =
    route.params || {};

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pollRef = useRef(null);

  const loadMatch = useCallback(
    async ({ silent = false } = {}) => {
      if (!matchId) return;

      if (!silent) setRefreshing(true);

      try {
        const data = await getMatchByIdApi(matchId);
        setMatch(data);

        if (data?.confirmationStatus === "confirmed") {
          navigation.replace("LiveScoringScreen", {
            matchId,
            inningsId,
            battingSquad,
            bowlingSquad,
          });
        }
      } catch (error) {
        // Silent - the poll will just retry on the next tick.
      } finally {
        setLoading(false);
        if (!silent) setRefreshing(false);
      }
    },
    [matchId, inningsId, battingSquad, bowlingSquad, navigation],
  );

  useFocusEffect(
    useCallback(() => {
      loadMatch();

      pollRef.current = setInterval(() => {
        loadMatch({ silent: true });
      }, POLL_INTERVAL_MS);

      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }, [loadMatch]),
  );

  const handleBackToHome = () => {
    navigation.navigate("Home", { screen: "HomeScreen" });
  };

  const opponentTeamName =
    match?.confirmationRequiredFrom &&
    (match?.teamA?._id === match.confirmationRequiredFrom
      ? match?.teamA?.teamName
      : match?.teamB?.teamName);

  const isRejected = match?.confirmationStatus === "rejected";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // contentContainerStyle={{ padding: 16 }}
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollViewCss} >
        <View style={styles.statusCard}>
          <Ionicons
            name={isRejected ? "close-circle" : "time-outline"}
            size={48}
            color={isRejected ? COLORS.error : COLORS.secondaryContainer}
          />

          <Text style={styles.statusTitle}>
            {isRejected ? "Match Declined" : "Match Scheduled"}
          </Text>

          <Text style={styles.statusSubtitle}>
            {isRejected
              ? `${opponentTeamName || "The other team"} declined to confirm this match. It won't go live.`
              : `Waiting for ${opponentTeamName || "the other team"}'s captain to approve before scoring can start.`}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Match Summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Teams</Text>
            <Text style={styles.value}>
              {match?.teamA?.teamName} vs {match?.teamB?.teamName}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Overs</Text>
            <Text style={styles.value}>{match?.overs}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Venue</Text>
            <Text style={styles.value}>{match?.venueName || "Not specified"}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        {!isRejected && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadMatch()}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.refreshText}>Check Status</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
          <Text style={styles.homeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  scrollViewCss: { 
    padding: 16,
    paddingBottom: 140 
  },

  statusCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  statusTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginTop: 12,
  },

  statusSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  label: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  value: {
    color: COLORS.onSurface,
    fontWeight: "700",
  },

  bottomActions: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
  },

  refreshButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  refreshText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  homeButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  homeText: {
    color: COLORS.onSurface,
    fontWeight: "700",
  },
});