import React, { useCallback, useState } from "react";

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

import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";

import { useSelector } from "react-redux";

import {
  getMatchByIdApi,
  confirmMatchApi,
  rejectMatchConfirmationApi,
  deleteMatchApi,
} from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Match Approval Screen
|--------------------------------------------------------------------------
|
| Opened by either the match creator or the opposing captain, from the
| "AWAITING CONFIRMATION" (partial) list on Home, or by tapping the
| challenge notification. The notification itself deliberately carries no
| match detail - this screen is where that detail actually lives: teams,
| ground, format, and the chosen Playing XI for both sides via the same
| GET /matches/:id endpoint used everywhere else (now populated with
| squad names). No live score/scorecard is shown - the match hasn't
| started, so none exists yet.
|
| Role-aware actions while the match is pending:
|   • Creator (match.userId === auth user)  → "Delete Match"
|   • Opposing captain (confirmationRequiredFrom) → "Reject" / "Accept"
|
| Expects via route.params: matchId.
*/

export default function MatchApprovalScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { matchId } = route.params || {};

  const authUser = useSelector((state) => state.auth.user);

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadMatch = useCallback(async () => {
    if (!matchId) return;

    try {
      const data = await getMatchByIdApi(matchId);
      setMatch(data);
    } catch (error) {
      Alert.alert(
        "Failed",
        error.response?.data?.message || "Could not load this match.",
      );
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useFocusEffect(
    useCallback(() => {
      loadMatch();
    }, [loadMatch]),
  );

  const handleAccept = async () => {
    try {
      setAccepting(true);
      const updated = await confirmMatchApi(matchId);
      setMatch(updated);

      Alert.alert(
        "Match Approved",
        `Match PIN: ${updated.matchPin}\n\nShare this PIN with the scorer — they'll need it to start scoring.`,
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("Home", { screen: "HomeScreen" }),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Failed",
        error.response?.data?.message || "Could not approve this match.",
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      "Decline Match",
      "Are you sure you want to decline this match?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              setRejecting(true);
              await rejectMatchConfirmationApi(matchId);

              Alert.alert("Match Declined", "The scorer has been notified.", [
                {
                  text: "OK",
                  onPress: () =>
                    navigation.navigate("Home", { screen: "HomeScreen" }),
                },
              ]);
            } catch (error) {
              Alert.alert(
                "Failed",
                error.response?.data?.message ||
                  "Could not decline this match.",
              );
            } finally {
              setRejecting(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert("Delete Match", "Delete this match? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteMatchApi(matchId);

            Alert.alert("Match Deleted", "The match has been removed.", [
              {
                text: "OK",
                onPress: () =>
                  navigation.navigate("Home", { screen: "HomeScreen" }),
              },
            ]);
          } catch (error) {
            Alert.alert(
              "Failed",
              error.response?.data?.message || "Could not delete this match.",
            );
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const renderSquad = (title, squad = []) => (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {squad.length === 0 ? (
        <Text style={styles.emptyText}>No playing XI set yet.</Text>
      ) : (
        squad.map((player) => (
          <View key={player._id} style={styles.playerRow}>
            <Text style={styles.playerName}>{player.playerName}</Text>
            {!!player.playerType && (
              <Text style={styles.playerType}>{player.playerType}</Text>
            )}
          </View>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isPending = match?.confirmationStatus === "pending";

  const isCreator =
    match && authUser && String(match.userId) === String(authUser._id);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollViewCss}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTeams}>
            {match?.teamA?.teamName} vs {match?.teamB?.teamName}
          </Text>

          <Text style={styles.heroSubtext}>
            {match?.matchType} • {match?.overs} Overs • {match?.ballType} Ball
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Match Info</Text>

          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={18}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.rowText}>
              {match?.venueName || "Venue not specified"}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons
              name="cricket-outline"
              size={18}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.rowText}>
              {match?.tossWinner
                ? `${match.tossWinner.teamName} won the toss, elected to ${match.tossDecision?.toLowerCase()}`
                : "Toss not recorded"}
            </Text>
          </View>
        </View>

        {renderSquad(
          `${match?.teamA?.teamName || "Team A"} - Playing XI`,
          match?.teamASquad,
        )}

        {renderSquad(
          `${match?.teamB?.teamName || "Team B"} - Playing XI`,
          match?.teamBSquad,
        )}

        {match?.confirmationStatus === "confirmed" &&
          match?.matchPin &&
          !isCreator && (
            <View style={styles.pinCard}>
              <Text style={styles.pinLabel}>MATCH PIN</Text>
              <Text style={styles.pinValue}>{match.matchPin}</Text>
              <Text style={styles.pinHint}>
                Share this PIN with the scorer to approve the match.
              </Text>
            </View>
          )}
      </ScrollView>

      {isPending && !isCreator && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleReject}
            disabled={accepting || rejecting}
          >
            {rejecting ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Text style={styles.rejectText}>Reject</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}
            disabled={accepting || rejecting}
          >
            {accepting ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <Text style={styles.acceptText}>Accept</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isPending && isCreator && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Text style={styles.deleteText}>Delete Match</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 140,
  },

  heroCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  heroTeams: {
    color: COLORS.onPrimaryContainer,
    fontWeight: "700",
    fontSize: 18,
  },

  heroSubtext: {
    color: COLORS.onPrimaryContainer,
    marginTop: 4,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    alignItems: "center",
    marginBottom: 10,
  },

  rowText: {
    marginLeft: 8,
    color: COLORS.onSurface,
    flex: 1,
  },

  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  playerName: {
    color: COLORS.onSurface,
    fontWeight: "600",
  },

  playerType: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "700",
  },

  emptyText: {
    color: COLORS.onSurfaceVariant,
  },

  bottomActions: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    flexDirection: "row",
  },

  rejectButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  rejectText: {
    color: COLORS.error,
    fontWeight: "700",
  },

  acceptButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  acceptText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },

  deleteButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    color: COLORS.error,
    fontWeight: "700",
  },

  pinCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    alignItems: "center",
  },

  pinLabel: {
    color: COLORS.onPrimaryContainer,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },

  pinValue: {
    color: COLORS.onPrimaryContainer,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 8,
    marginVertical: 6,
  },

  pinHint: {
    color: COLORS.onPrimaryContainer,
    fontSize: 12,
    textAlign: "center",
  },
});
