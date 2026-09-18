/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| GoLiveScreen.js
|
| Description:
| The scorer's control panel for one match's cameras.
|
| WHAT IT HAS TO ANSWER, IN THIS ORDER
|   1. Are both cameras live right now?
|   2. If one is not - why, and what do I press?
|   3. Take this camera off this person and give it to that one.
|
| The scorer is recording every ball while reading this. So the panel does
| not show two status fields and leave them to work out what it means:
| "assigned but not accepted" and "accepted but not connected" look
| identical from a status enum and need completely different things done
| about them. The server derives a single `state` per angle and the exact
| next action, and this screen renders that.
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
  RefreshControl,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import useLiveStream from "../hooks/useLiveStream";

import {
  createStreamApi,
  stopStreamApi,
  resumeStreamApi,
  keepStreamAliveApi,
  assignBroadcasterApi,
  deleteStreamApi,
} from "../services/liveStream.service";

import {
  ANGLES,
  ANGLE_LABEL,
  ANGLE_HINT,
  ANGLE_ICON,
} from "../constants/streamConstants";

/*
| One line per server state.
|
| THESE KEYS ARE A CONTRACT. They must match angleState() in
| liveStream.service.ts exactly - "no_assignee", not "unassigned";
| "awaiting_response", not "awaiting_accept". A key that does not match
| falls through to the raw status string, which is how a scorer ends up
| reading "disconnected" in the middle of a match instead of being told
| what to do about it.
|
| The server also sends the next ACTION in plain Hindi (needsAttention
| below). This map is only the one-word state next to the camera name.
*/

const STATE_COPY = {
  live: { text: "Live on air", tone: "good" },
  reconnecting: { text: "Signal dropped — coming back", tone: "warn" },
  awaiting_response: { text: "Invite sent, not accepted yet", tone: "warn" },
  declined: { text: "They declined", tone: "bad" },
  ready: { text: "Accepted — not connected yet", tone: "warn" },
  no_assignee: { text: "Nobody assigned", tone: "bad" },
  stopped: { text: "Stopped by you", tone: "bad" },
  ended: { text: "Ended", tone: "bad" },
};

export default function GoLiveScreen() {
  const route = useRoute();

  const navigation = useNavigation();

  const { matchId } = route.params || {};

  const { data, loading, angles, control, match, reload, viewerCount } =
    useLiveStream(matchId);

  const [busyAngle, setBusyAngle] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload(true);
    }, [reload]),
  );

  const run = async (angle, fn, failMessage) => {
    setBusyAngle(angle);

    try {
      await fn();

      await reload(true);
    } catch (err) {
      Alert.alert(
        "Failed",
        err?.response?.data?.message || failMessage,
      );
    } finally {
      setBusyAngle(null);
    }
  };

  const handleCreate = (angle) =>
    run(
      angle,
      () => createStreamApi(matchId, angle),
      "Could not set up this camera.",
    );

  const handleStop = (angle) => {
    Alert.alert(
      "Stop this camera?",
      `${ANGLE_LABEL[angle]} camera band ho jayega. Baad mein dobara chalu kar sakte ho.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: () =>
            run(
              angle,
              () => stopStreamApi(matchId, angle),
              "Could not stop the stream.",
            ),
        },
      ],
    );
  };

  const handleResume = (angle) =>
    run(
      angle,
      () => resumeStreamApi(matchId, angle),
      "Could not resume the stream.",
    );

  const handleKeepAlive = (angle) =>
    run(
      angle,
      () => keepStreamAliveApi(matchId, angle),
      "Could not extend the stream.",
    );

  /*
  | Clearing the assignment ROTATES the Mux key on the server, which is
  | the only thing that actually stops the person who already copied it
  | into their broadcaster app. Worth spelling out in the confirmation -
  | a scorer who thinks "remove" only hides a name will not realise the
  | wrong person can still broadcast.
  */

  const handleRevoke = (angle, name) => {
    Alert.alert(
      "Remove broadcaster?",
      `${name || "Is bande"} ka access hat jayega aur unki purani key turant band ho jayegi. Phir kisi aur ko de sakte ho.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            run(
              angle,
              () => assignBroadcasterApi(matchId, angle, null),
              "Could not remove the broadcaster.",
            ),
        },
      ],
    );
  };

  const handleDelete = (angle) => {
    Alert.alert(
      "Delete this camera?",
      "Stream Mux se bhi delete ho jayegi. Dobara set up karni padegi.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            run(
              angle,
              () => deleteStreamApi(matchId, angle),
              "Could not delete the stream.",
            ),
        },
      ],
    );
  };

  const openAssign = (angle, existing) =>
    navigation.navigate("AssignBroadcasterScreen", {
      matchId,
      angle,
      currentName: existing?.assignedName || null,
    });

  const onRefresh = async () => {
    setRefreshing(true);

    await reload(true);

    setRefreshing(false);
  };

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  /*
  | Nobody but the scorer / creator gets a control block from the server.
  | Rather than render a broken panel, say so and offer the viewer screen -
  | which is what this person actually wanted.
  */

  if (!control) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="lock-closed-outline"
          size={30}
          color={COLORS.onSurfaceVariant}
        />

        <Text style={styles.deniedTitle}>Only the scorer can manage this</Text>

        <Text style={styles.deniedBody}>
          Cameras is match ke scorer ya creator hi control kar sakte hain.
        </Text>

        <TouchableOpacity
          style={styles.deniedButton}
          onPress={() =>
            navigation.replace("WatchLiveScreen", { matchId })
          }
        >
          <Text style={styles.deniedButtonText}>Watch instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const configured = new Set(angles.map((a) => a.angle));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* ── Summary ────────────────────────────────────────────────── */}

      <View
        style={[
          styles.summaryCard,
          control.bothLive && styles.summaryCardGood,
        ]}
      >
        <View style={styles.summaryTop}>
          <View
            style={[
              styles.summaryDot,
              control.anglesLive > 0 && styles.summaryDotLive,
            ]}
          />

          <Text style={styles.summaryCount}>
            {control.anglesLive} / {control.anglesConfigured || 2} LIVE
          </Text>

          <View style={styles.flex} />

          {control.anglesLive > 0 && (
            <View style={styles.viewerPill}>
              <Ionicons name="eye-outline" size={13} color={COLORS.primary} />
              <Text style={styles.viewerText}>{viewerCount}</Text>
            </View>
          )}
        </View>

        <Text style={styles.summaryText}>{control.summary}</Text>

        {!!match && (
          <Text style={styles.summaryFixture} numberOfLines={1}>
            {(match.teamA?.teamName || "Team A") +
              " vs " +
              (match.teamB?.teamName || "Team B")}
          </Text>
        )}
      </View>

      {/* ── Each angle ─────────────────────────────────────────────── */}

      {ANGLES.map((angleName) => {
        const a = angles.find((x) => x.angle === angleName);

        const busy = busyAngle === angleName;

        /*
        | An angle that was never created is a real, common state - most
        | matches film from one camera. It gets a set-up card rather than
        | being hidden, so adding the second angle mid-match is one tap.
        */

        if (!configured.has(angleName) || !a) {
          return (
            <View key={angleName} style={styles.angleCard}>
              <View style={styles.angleHead}>
                <Ionicons
                  name={ANGLE_ICON[angleName]}
                  size={19}
                  color={COLORS.onSurfaceVariant}
                />

                <View style={styles.angleHeadText}>
                  <Text style={styles.angleName}>
                    {ANGLE_LABEL[angleName]}
                  </Text>
                  <Text style={styles.angleHint}>
                    {ANGLE_HINT[angleName]}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleCreate(angleName)}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator size="small" color={COLORS.onPrimary} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Set up this camera
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }

        const copy = STATE_COPY[a.state] || {
          text: a.status,
          tone: "warn",
        };

        return (
          <View
            key={angleName}
            style={[styles.angleCard, a.live && styles.angleCardLive]}
          >
            <View style={styles.angleHead}>
              <Ionicons
                name={ANGLE_ICON[angleName]}
                size={19}
                color={a.live ? COLORS.error : COLORS.onSurfaceVariant}
              />

              <View style={styles.angleHeadText}>
                <Text style={styles.angleName}>{ANGLE_LABEL[angleName]}</Text>

                <Text
                  style={[
                    styles.angleState,
                    copy.tone === "good" && styles.stateGood,
                    copy.tone === "bad" && styles.stateBad,
                  ]}
                >
                  {copy.text}
                </Text>
              </View>

              {a.live && !!a.uptimeSeconds && (
                <View style={styles.uptimePill}>
                  <Text style={styles.uptimeText}>
                    {Math.floor(a.uptimeSeconds / 60)}m
                  </Text>
                </View>
              )}
            </View>

            {/* Who is holding it */}

            <View style={styles.assigneeRow}>
              <Ionicons
                name="person-circle-outline"
                size={17}
                color={COLORS.onSurfaceVariant}
              />

              <Text style={styles.assigneeName} numberOfLines={1}>
                {a.assignedName || "Not assigned"}
              </Text>

              <TouchableOpacity
                onPress={() => openAssign(angleName, a)}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  {a.assignedTo ? "Change" : "Assign"}
                </Text>
              </TouchableOpacity>

              {!!a.assignedTo && (
                <TouchableOpacity
                  onPress={() => handleRevoke(angleName, a.assignedName)}
                  style={styles.linkButton}
                >
                  <Text style={[styles.linkText, styles.linkDanger]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Controls */}

            <View style={styles.controlRow}>
              {a.live ? (
                <>
                  <TouchableOpacity
                    style={[styles.smallButton, styles.smallDanger]}
                    onPress={() => handleStop(angleName)}
                    disabled={busy}
                  >
                    <Text style={styles.smallDangerText}>Stop</Text>
                  </TouchableOpacity>

                  {/*
                  | The rain button. Without it a 30-minute shower looks
                  | exactly like a phone left in a bag, and the server
                  | ends a stream everyone was coming back to.
                  */}

                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => handleKeepAlive(angleName)}
                    disabled={busy}
                  >
                    <Text style={styles.smallButtonText}>
                      Still going (+30m)
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.smallButton, styles.smallPrimary]}
                    onPress={() => handleResume(angleName)}
                    disabled={busy}
                  >
                    <Text style={styles.smallPrimaryText}>Re-open</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => handleDelete(angleName)}
                    disabled={busy}
                  >
                    <Text style={styles.smallButtonText}>Delete</Text>
                  </TouchableOpacity>
                </>
              )}

              {busy && (
                <ActivityIndicator size="small" color={COLORS.primary} />
              )}
            </View>
          </View>
        );
      })}

      {/* ── What needs doing ───────────────────────────────────────── */}

      {Array.isArray(control.needsAttention) &&
        control.needsAttention.length > 0 && (
          <View style={styles.attentionCard}>
            <Text style={styles.attentionTitle}>NEEDS ATTENTION</Text>

            {control.needsAttention.map((item) => (
              <View key={item.angle} style={styles.attentionRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={15}
                  color={COLORS.secondary}
                />

                <Text style={styles.attentionText}>
                  <Text style={styles.attentionAngle}>
                    {ANGLE_LABEL[item.angle]}:{" "}
                  </Text>
                  {item.action}
                </Text>
              </View>
            ))}
          </View>
        )}

      <TouchableOpacity
        style={styles.watchButton}
        onPress={() => navigation.navigate("WatchLiveScreen", { matchId })}
        activeOpacity={0.85}
      >
        <Ionicons name="play-circle-outline" size={18} color={COLORS.primary} />
        <Text style={styles.watchButtonText}>See what viewers see</Text>
      </TouchableOpacity>
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
    backgroundColor: COLORS.background,
    padding: 28,
    gap: 8,
  },

  flex: { flex: 1 },

  deniedTitle: {
    marginTop: 6,
    fontSize: 15.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  deniedBody: {
    fontSize: 13,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
  },

  deniedButton: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },

  deniedButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },

  /* ── Summary ──────────────────────────────────────────────────── */

  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.outline,
  },

  summaryCardGood: {
    borderLeftColor: COLORS.error,
  },

  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.outline,
  },

  summaryDotLive: {
    backgroundColor: COLORS.error,
  },

  summaryCount: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurface,
  },

  viewerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  viewerText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },

  summaryText: {
    marginTop: 8,
    fontSize: 13.5,
    lineHeight: 19,
    color: COLORS.onSurface,
  },

  summaryFixture: {
    marginTop: 6,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Angle card ───────────────────────────────────────────────── */

  angleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },

  angleCardLive: {
    borderColor: COLORS.error,
  },

  angleHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  angleHeadText: {
    flex: 1,
  },

  angleName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  angleHint: {
    marginTop: 2,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  angleState: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  stateGood: {
    color: COLORS.error,
  },

  stateBad: {
    color: COLORS.onSurfaceVariant,
  },

  uptimePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: COLORS.surfaceContainer,
  },

  uptimeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  assigneeName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  linkButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  linkText: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: COLORS.primary,
  },

  linkDanger: {
    color: COLORS.error,
  },

  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  smallButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  smallPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  smallPrimaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onPrimary,
  },

  smallDanger: {
    borderColor: COLORS.error,
  },

  smallDangerText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.error,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 13,
  },

  /* ── Attention ────────────────────────────────────────────────── */

  attentionCard: {
    backgroundColor: "#fff8ef",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.secondaryContainer + "55",
    gap: 8,
  },

  attentionTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.secondary,
  },

  attentionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  attentionText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.onSurface,
  },

  attentionAngle: {
    fontWeight: "800",
  },

  watchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  watchButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
});