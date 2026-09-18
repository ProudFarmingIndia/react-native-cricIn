/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| BroadcastInviteScreen.js
|
| Description:
| "You've been asked to film this match." Accept or decline.
|
| WHY THIS IS A SCREEN AND NOT JUST TWO BUTTONS ON A NOTIFICATION
| The person invited is often in neither squad and may not know the match
| at all - a friend, a cousin, somebody's brother with a good phone. Two
| buttons on a notification row gives them a fixture name and nothing
| else to decide with. This screen tells them what they are agreeing to:
| which match, which camera, where, when, and what the job actually
| involves.
|
| ACCEPTING IS WHAT ISSUES THE KEY. Until it happens the invite grants
| nothing - the server refuses to hand out a stream key on a pending
| assignment. That is deliberate: an invite sent to the wrong person must
| be inert, not merely reversible.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  getMyBroadcastAssignmentsApi,
  respondToBroadcastApi,
} from "../services/liveStream.service";

import { ANGLE_LABEL, ANGLE_HINT, ANGLE_ICON } from "../constants/streamConstants";

const formatWhen = (value) => {
  if (!value) return null;

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function BroadcastInviteScreen() {
  const route = useRoute();

  const navigation = useNavigation();

  const { matchId, angle } = route.params || {};

  const [assignment, setAssignment] = useState(null);

  const [loading, setLoading] = useState(true);

  const [answering, setAnswering] = useState(null);

  /*
  | Read from the assignments list rather than a per-invite endpoint.
  | It is the same data, it is already the list this user is allowed to
  | see, and it means an invite that has been revoked while they walked
  | over simply is not there - which this screen then says plainly
  | instead of showing an Accept button that will fail.
  */

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const list = await getMyBroadcastAssignmentsApi();

      const found = list.find(
        (a) =>
          String(a.matchId) === String(matchId) &&
          (!angle || a.angle === angle),
      );

      setAssignment(found || null);
    } catch {
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  }, [matchId, angle]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const respond = async (accept) => {
    setAnswering(accept ? "accept" : "decline");

    try {
      await respondToBroadcastApi(matchId, assignment.angle, accept);

      if (accept) {
        /*
        | replace, not navigate. Going "back" to an invite that has just
        | been accepted is a screen offering a decision that no longer
        | exists.
        */

        navigation.replace("BroadcastSetupScreen", {
          matchId,
          angle: assignment.angle,
        });

        return;
      }

      Alert.alert(
        "Declined",
        "Scorer ko bata diya gaya hai. Wo kisi aur ko camera de denge.",
      );

      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Failed",
        err?.response?.data?.message || "Could not send your answer.",
      );
    } finally {
      setAnswering(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="close-circle-outline"
          size={30}
          color={COLORS.onSurfaceVariant}
        />

        <Text style={styles.emptyTitle}>This invite is no longer active</Text>

        <Text style={styles.emptyBody}>
          Ho sakta hai scorer ne ye camera kisi aur ko de diya ho, ya match
          khatam ho gaya ho.
        </Text>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.ghostText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fixture = assignment.match || {};

  const when = formatWhen(fixture.startTime);

  const already = assignment.assignmentStatus === "accepted";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <View style={styles.badge}>
          <Ionicons
            name={ANGLE_ICON[assignment.angle] || "videocam-outline"}
            size={16}
            color={COLORS.onPrimary}
          />

          <Text style={styles.badgeText}>
            {(ANGLE_LABEL[assignment.angle] || assignment.angle).toUpperCase()}{" "}
            CAMERA
          </Text>
        </View>

        <Text style={styles.heading}>You've been asked to film this match</Text>

        <Text style={styles.fixture} numberOfLines={2}>
          {fixture.teamA?.teamName || fixture.title || "Untitled match"}
          {fixture.teamB?.teamName ? `  vs  ${fixture.teamB.teamName}` : ""}
        </Text>

        {!!fixture.venue && (
          <View style={styles.metaLine}>
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.metaText}>{fixture.venue}</Text>
          </View>
        )}

        {!!when && (
          <View style={styles.metaLine}>
            <Ionicons
              name="time-outline"
              size={14}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.metaText}>{when}</Text>
          </View>
        )}

        <Text style={styles.angleHint}>{ANGLE_HINT[assignment.angle]}</Text>
      </View>

      {/* ── What the job is ────────────────────────────────────────── */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>WHAT THIS INVOLVES</Text>

        <Text style={styles.bullet}>
          • Ek free app (Larix Broadcaster) install karni hogi — CricIn
          khud encode nahi karta.
        </Text>

        <Text style={styles.bullet}>
          • Phone landscape mein, tripod par. Match jitni der chalega,
          utni der.
        </Text>

        <Text style={styles.bullet}>
          • Accept karte hi tumhe apni stream key milegi. Wo sirf tumhare
          liye hai.
        </Text>

        <Text style={styles.bullet}>
          • Scorer kabhi bhi camera kisi aur ko de sakta hai — tab tumhari
          key apne aap band ho jayegi.
        </Text>
      </View>

      {already ? (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() =>
            navigation.replace("BroadcastSetupScreen", {
              matchId,
              angle: assignment.angle,
            })
          }
        >
          <Text style={styles.acceptText}>Open my stream key</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => respond(true)}
            disabled={!!answering}
            activeOpacity={0.85}
          >
            {answering === "accept" ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <Text style={styles.acceptText}>Accept & get my key</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => respond(false)}
            disabled={!!answering}
            activeOpacity={0.85}
          >
            {answering === "decline" ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Text style={styles.declineText}>Can't do it</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 16,
    paddingBottom: 44,
    gap: 12,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 8,
    backgroundColor: COLORS.background,
  },

  emptyTitle: {
    marginTop: 6,
    fontSize: 15.5,
    fontWeight: "800",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.onPrimary,
  },

  heading: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.onSurface,
    lineHeight: 24,
  },

  fixture: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  metaText: {
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },

  angleHint: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    fontSize: 12,
    fontStyle: "italic",
    color: COLORS.onSurfaceVariant,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  bullet: {
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORS.onSurface,
    marginBottom: 7,
  },

  actions: {
    gap: 10,
  },

  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  acceptText: {
    color: COLORS.onPrimary,
    fontWeight: "800",
    fontSize: 14,
  },

  declineButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  declineText: {
    color: COLORS.error,
    fontWeight: "700",
    fontSize: 13.5,
  },

  ghostButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },

  ghostText: {
    color: COLORS.onSurface,
    fontWeight: "700",
  },
});