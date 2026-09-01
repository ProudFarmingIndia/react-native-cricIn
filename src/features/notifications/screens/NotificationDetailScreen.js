import React, { useCallback, useEffect, useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";

import { useRoute, useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { getTeamByIdApi } from "../../teams/services/team.service";
import { getChallengeByIdApi } from "../../matchChallenges/services/matchChallenges.services";
import { getMatchByIdApi } from "../../matches/services/matches.services";

import { NOTIFICATION_TYPES } from "../constants/notificationTypes";
import { formatDateTime } from "../../../utils/timeAgo";
import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Notification Detail Screen
|--------------------------------------------------------------------------
|
| A notification card is deliberately terse - a line of text, like a push
| notification. This is where the actual subject lives: WHO sent it, WHAT
| they sent, and the accept/reject decision in full context.
|
| Every notification's `data` carries the ids needed to resolve its
| subject (teamId, challengeId, matchId...), and `actorId` arrives from
| the API populated with { fullName, profileImage }. So the sender is
| always available, and the subject is one fetch away.
|
| Expects via route.params: notification (the full object from the list).
|
*/

const relatedFetchers = {
  team: (id) => getTeamByIdApi(id),
  challenge: (id) => getChallengeByIdApi(id),
  match: (id) => getMatchByIdApi(id),
};

export default function NotificationDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { notification, onAccept, onReject } = route.params || {};

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const data = notification?.data || {};

  const actor = notification?.actorId;

  /*
  |--------------------------------------------------------------------------
  | Resolve The Subject
  |--------------------------------------------------------------------------
  |
  | A challenge carries the full proposed fixture, so it is preferred over
  | the bare team when both ids are present. Match beats team for the same
  | reason.
  |
  */

  const load = useCallback(async () => {
    setLoading(true);

    try {
      if (data.challengeId) {
        const challenge = await relatedFetchers.challenge(data.challengeId);
        setSubject({ kind: "challenge", value: challenge });
        return;
      }

      if (data.matchId) {
        const match = await relatedFetchers.match(data.matchId);
        setSubject({ kind: "match", value: match });
        return;
      }

      if (data.teamId) {
        const team = await relatedFetchers.team(data.teamId);
        setSubject({ kind: "team", value: team });
        return;
      }

      setSubject(null);
    } catch (error) {
      console.error("Failed to load notification subject:", error);
      setSubject(null);
    } finally {
      setLoading(false);
    }
  }, [data.challengeId, data.matchId, data.teamId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!notification) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.emptyText}>This notification is unavailable.</Text>
      </SafeAreaView>
    );
  }

  const isPending = notification.status === "PENDING";

  const canAct = isPending && (onAccept || onReject);

  const runAction = async (action) => {
    if (!action || acting) return;

    setActing(true);

    try {
      await action(notification);

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || error?.message || "Please try again.",
      );
    } finally {
      setActing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ---------------------------------------------------------- */}
        {/* Headline */}
        {/* ---------------------------------------------------------- */}

        <View style={styles.card}>
          <Text style={styles.title}>{notification.title}</Text>

          <Text style={styles.message}>{notification.message}</Text>

          <Text style={styles.timestamp}>
            {formatDateTime(notification.createdAt)}
          </Text>

          {!!notification.status && (
            <View style={[styles.statusChip, statusStyle(notification.status)]}>
              <Text
                style={[
                  styles.statusChipText,
                  statusTextStyle(notification.status),
                ]}
              >
                {notification.status}
              </Text>
            </View>
          )}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* Sender */}
        {/* ---------------------------------------------------------- */}

        {!!actor && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>From</Text>

            <View style={styles.actorRow}>
              <Image
                source={{
                  uri:
                    actor?.profileImage?.url ||
                    actor?.profileImage ||
                    "https://placehold.co/100",
                }}
                style={styles.actorAvatar}
              />

              <View style={styles.actorBody}>
                <Text style={styles.actorName}>
                  {actor?.fullName || "CricIn user"}
                </Text>

                <Text style={styles.actorMeta}>Sent this notification</Text>
              </View>
            </View>
          </View>
        )}

        {/* ---------------------------------------------------------- */}
        {/* Subject */}
        {/* ---------------------------------------------------------- */}

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <SubjectCard
            subject={subject}
            data={data}
            onOpenTeam={(teamId) =>
              navigation.navigate("TeamStack", {
                screen: "TeamDetailsScreen",
                params: { teamId },
              })
            }
          />
        )}

        {/* ---------------------------------------------------------- */}
        {/* Actions */}
        {/* ---------------------------------------------------------- */}

        {canAct && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.rejectButton, acting && styles.disabled]}
              disabled={acting}
              activeOpacity={0.85}
              onPress={() => runAction(onReject)}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptButton, acting && styles.disabled]}
              disabled={acting}
              activeOpacity={0.85}
              onPress={() => runAction(onAccept)}
            >
              {acting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.acceptText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!!notification.status && !isPending && (
          <Text style={styles.resolvedNote}>
            You already responded to this.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------- */
/* Subject card                                                          */
/* -------------------------------------------------------------------- */

function SubjectCard({ subject, data, onOpenTeam }) {
  if (!subject?.value) {
    // MATCH_PIN_SHARED is the one case where data carries the whole story.
    if (data?.pin) {
      return (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Match PIN</Text>
          <Text style={styles.pin}>{data.pin}</Text>
          <Text style={styles.actorMeta}>
            The scorer needs this to start scoring.
          </Text>
        </View>
      );
    }

    return null;
  }

  if (subject.kind === "team") {
    const team = subject.value;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onOpenTeam(team._id)}
      >
        <Text style={styles.sectionLabel}>Team</Text>

        <View style={styles.actorRow}>
          <Image
            source={{ uri: team?.logo?.url || "https://placehold.co/100" }}
            style={styles.teamLogo}
          />

          <View style={styles.actorBody}>
            <Text style={styles.actorName}>{team?.teamName}</Text>

            <Text style={styles.actorMeta}>
              {[team?.teamType, team?.city].filter(Boolean).join(" · ")}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.outline}
          />
        </View>

        <View style={styles.factGrid}>
          <Fact label="Squad" value={team?.players?.length ?? 0} />
          <Fact
            label="Captain"
            value={team?.captainId?.playerName || "Not set"}
          />
          <Fact
            label="Vice-Captain"
            value={team?.viceCaptainId?.playerName || "Not set"}
          />
        </View>
      </TouchableOpacity>
    );
  }

  if (subject.kind === "challenge") {
    const challenge = subject.value;

    return (
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Match Challenge</Text>

        <Text style={styles.fixture}>
          {challenge?.challengerTeamId?.teamName || "Team"}
          {"  vs  "}
          {challenge?.challengedTeamId?.teamName || "Team"}
        </Text>

        <View style={styles.factGrid}>
          <Fact
            label="Date"
            value={
              challenge?.proposedDate
                ? new Date(challenge.proposedDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "To be decided"
            }
          />
          <Fact label="Time" value={challenge?.proposedTime || "TBD"} />
          <Fact label="Format" value={challenge?.matchType || "T20"} />
          <Fact label="Overs" value={challenge?.overs ?? "-"} />
          <Fact label="Ball" value={challenge?.ballType || "-"} />
          <Fact label="Pitch" value={challenge?.pitchType || "-"} />
          <Fact
            label="Venue"
            value={challenge?.venueName || "Not specified"}
            wide
          />
        </View>

        {!!challenge?.message && (
          <View style={styles.quote}>
            <Text style={styles.quoteText}>“{challenge.message}”</Text>
          </View>
        )}
      </View>
    );
  }

  const match = subject.value;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Match</Text>

      <Text style={styles.fixture}>
        {match?.teamA?.teamName || "Team A"}
        {"  vs  "}
        {match?.teamB?.teamName || "Team B"}
      </Text>

      <View style={styles.factGrid}>
        <Fact label="Title" value={match?.matchTitle || "-"} wide />
        <Fact
          label="Date"
          value={
            match?.startTime
              ? new Date(match.startTime).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "TBD"
          }
        />
        <Fact label="Format" value={match?.matchType || "-"} />
        <Fact label="Overs" value={match?.overs ?? "-"} />
        <Fact label="Status" value={match?.status || "-"} />
        <Fact label="Venue" value={match?.venueName || "Not specified"} wide />
      </View>

      {!!match?.matchPin && (
        <>
          <Text style={styles.sectionLabel}>Your Match PIN</Text>
          <Text style={styles.pin}>{match.matchPin}</Text>
        </>
      )}
    </View>
  );
}

function Fact({ label, value, wide = false }) {
  return (
    <View style={[styles.fact, wide && styles.factWide]}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={2}>
        {String(value)}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------- */
/* Status chip colours                                                   */
/* -------------------------------------------------------------------- */

const statusStyle = (status) => {
  if (status === "ACCEPTED") return styles.chipAccepted;
  if (status === "REJECTED") return styles.chipRejected;
  if (status === "PENDING") return styles.chipPending;
  return styles.chipNeutral;
};

const statusTextStyle = (status) => {
  if (status === "ACCEPTED") return styles.chipAcceptedText;
  if (status === "REJECTED") return styles.chipRejectedText;
  if (status === "PENDING") return styles.chipPendingText;
  return styles.chipNeutralText;
};

/* -------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  content: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 16,
    marginBottom: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  message: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.onSurfaceVariant,
  },

  timestamp: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.outline,
  },

  statusChip: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusChipText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  chipPending: { backgroundColor: "#FEF3C7" },
  chipPendingText: { color: "#92400E" },
  chipAccepted: { backgroundColor: "#DCFCE7" },
  chipAcceptedText: { color: "#15803D" },
  chipRejected: { backgroundColor: "#FEE2E2" },
  chipRejectedText: { color: "#DC2626" },
  chipNeutral: { backgroundColor: COLORS.surfaceContainerHighest },
  chipNeutralText: { color: COLORS.onSurfaceVariant },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  actorRow: { flexDirection: "row", alignItems: "center", gap: 12 },

  actorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surfaceContainerHighest,
  },

  teamLogo: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerHighest,
  },

  actorBody: { flex: 1 },

  actorName: { fontSize: 16, fontWeight: "700", color: COLORS.onSurface },

  actorMeta: { marginTop: 3, fontSize: 12, color: COLORS.onSurfaceVariant },

  fixture: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 14,
  },

  factGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 12,
  },

  fact: { minWidth: "28%", flexGrow: 1 },

  factWide: { minWidth: "100%" },

  factLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  factValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  quote: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  quoteText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
    color: COLORS.onSurface,
  },

  pin: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 8,
    color: COLORS.primary,
    marginBottom: 8,
  },

  actionRow: { flexDirection: "row", gap: 12, marginTop: 6 },

  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  acceptText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  rejectText: { color: COLORS.error, fontWeight: "700", fontSize: 15 },

  disabled: { opacity: 0.6 },

  resolvedNote: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },

  emptyText: { fontSize: 15, color: COLORS.onSurfaceVariant },
});
