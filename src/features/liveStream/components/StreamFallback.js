/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| StreamFallback.js
|
| Description:
| What fills the video's place when there is no picture.
|
| WHY THIS IS A REAL COMPONENT AND NOT A SPINNER
| Every state this renders is NORMAL - the camera has not connected yet,
| the phone lost signal for a moment, the match is over. A black player
| with a dead URL says "this app is broken" and the viewer leaves. The
| same moment with the fixture, the venue and one honest sentence says
| "you are in the right place, the picture is coming".
|
| So this always shows the match itself: both teams, the venue, the start
| time. The video is the thing that is missing; the match is not.
|
|--------------------------------------------------------------------------
*/

import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  FALLBACK_COPY,
  FALLBACK_TITLE,
  FALLBACK_ICON,
} from "../constants/streamConstants";

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

export default function StreamFallback({
  reason = "no_stream",
  message,
  match,
  onRetry,
  retrying = false,
  onOpenScore,
}) {
  /*
  | Server copy wins. This component's own map is the fallback for an
  | older server or a reason this build has not seen - a state we cannot
  | name still gets a sentence rather than an empty box.
  */

  const body = message || FALLBACK_COPY[reason] || FALLBACK_COPY.no_stream;

  const title = FALLBACK_TITLE[reason] || "No video";

  const icon = FALLBACK_ICON[reason] || "videocam-off-outline";

  const when = formatWhen(match?.startTime);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        {reason === "reconnecting" || reason === "waiting" ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name={icon} size={26} color={COLORS.onSurfaceVariant} />
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.body}>{body}</Text>

      {/* ── The match itself, so the screen is never empty ────────── */}

      {!!match && (
        <View style={styles.matchBlock}>
          <Text style={styles.fixture} numberOfLines={2}>
            {(match.teamA?.teamName || "Team A") +
              "  vs  " +
              (match.teamB?.teamName || "Team B")}
          </Text>

          {!!match.title && (
            <Text style={styles.matchTitle} numberOfLines={1}>
              {match.title}
            </Text>
          )}

          <View style={styles.metaRow}>
            {!!match.matchType && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{match.matchType}</Text>
              </View>
            )}

            {!!match.overs && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{match.overs} ov</Text>
              </View>
            )}
          </View>

          {!!match.venue && (
            <View style={styles.metaLine}>
              <Ionicons
                name="location-outline"
                size={13}
                color={COLORS.onSurfaceVariant}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {match.venue}
              </Text>
            </View>
          )}

          {!!when && (
            <View style={styles.metaLine}>
              <Ionicons
                name="time-outline"
                size={13}
                color={COLORS.onSurfaceVariant}
              />
              <Text style={styles.metaText}>{when}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {!!onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            disabled={retrying}
            activeOpacity={0.8}
          >
            {retrying ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <Text style={styles.retryText}>Check again</Text>
            )}
          </TouchableOpacity>
        )}

        {/*
        | The score is still there even when the camera is not. Offering
        | it here is the difference between "come back later" and
        | "here is the thing you actually came for".
        */}

        {!!onOpenScore && (
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={onOpenScore}
            activeOpacity={0.8}
          >
            <Text style={styles.ghostText}>Open scorecard</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: "#0f1410",
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },

  body: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: "rgba(255,255,255,0.72)",
  },

  matchBlock: {
    marginTop: 18,
    width: "100%",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
  },

  fixture: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },

  matchTitle: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  metaChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  metaChipText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#ffffff",
  },

  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },

  metaText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.66)",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    minWidth: 128,
    alignItems: "center",
  },

  retryText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 13,
  },

  ghostButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },

  ghostText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
});