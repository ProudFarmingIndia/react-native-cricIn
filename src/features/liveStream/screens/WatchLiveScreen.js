/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| WatchLiveScreen.js
|
| Description:
| The viewer's screen: the video, the angle switch, the broadcast score
| overlay, and - when there is no picture - an honest card instead of a
| black box.
|
| WHY expo-video AND NOT react-native-video
| expo-video ships inside Expo Go, so this runs today without a dev build.
| It also exposes `currentLiveTimestamp`, which is the wall-clock stamp
| Mux writes into the HLS manifest - the anchor the whole overlay depends
| on. react-native-video would need a custom dev build AND would not give
| us that number.
|
| WHY THE PLAYER IS NOT UNMOUNTED WHEN SWITCHING ANGLES
| Both angles are the same match from two phones. Tearing the player down
| and rebuilding it costs a full HLS handshake - three or four seconds of
| black screen every switch. `replaceAsync` swaps the source inside the
| same player, which is close to instant.
|
|--------------------------------------------------------------------------
*/

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { VideoView, useVideoPlayer } from "expo-video";

import { COLORS } from "../../../constants/colors";

import useLiveStream from "../hooks/useLiveStream";
import useOverlayState from "../hooks/useOverlayState";

import LiveScoreOverlay from "../components/LiveScoreOverlay";
import StreamFallback from "../components/StreamFallback";

import {
  getPlaybackTokenApi,
  leaveStreamApi,
} from "../services/liveStream.service";

import {
  ANGLE_LABEL,
  ANGLE_HINT,
  ANGLE_ICON,
} from "../constants/streamConstants";

export default function WatchLiveScreen() {
  const route = useRoute();

  const navigation = useNavigation();

  const { matchId, angle: initialAngle } = route.params || {};

  const {
    loading,
    reason,
    message,
    match,
    angles,
    isLive,
    reload,
    viewerCount,
  } = useLiveStream(matchId);

  /*
  | Which camera is on screen. Defaults to whatever the caller asked for,
  | then to the first LIVE angle, then to the first configured one - so
  | opening the screen never lands on a dead camera when a live one
  | exists.
  */

  const [activeAngle, setActiveAngle] = useState(initialAngle || null);

  useEffect(() => {
    if (activeAngle) return;

    if (!angles.length) return;

    const live = angles.find((a) => a.live);

    setActiveAngle((live || angles[0]).angle);
  }, [angles, activeAngle]);

  const current = useMemo(
    () => angles.find((a) => a.angle === activeAngle) || null,
    [angles, activeAngle],
  );

  /*
  |--------------------------------------------------------------------------
  | Playback URL
  |--------------------------------------------------------------------------
  |
  | On a signed stream the .m3u8 alone plays NOTHING - it needs a token
  | this backend mints per viewer. So the URL always comes from the token
  | endpoint rather than from the list response, even when the stream
  | happens to be public (in which case the endpoint returns the bare URL
  | and there is one code path instead of two).
  |
  | This is also where the concurrent-viewer cap can refuse us. A 429 here
  | is a real, explainable state - "too many people watching" - and gets
  | its own message rather than a silent black player.
  |
  */

  const [sourceUrl, setSourceUrl] = useState(null);

  const [tokenError, setTokenError] = useState(null);

  const [preparing, setPreparing] = useState(false);

  const refreshTimer = useRef(null);

  const fetchSource = useCallback(async () => {
    if (!matchId || !activeAngle) return;

    setPreparing(true);

    try {
      const data = await getPlaybackTokenApi(matchId, activeAngle);

      setSourceUrl(data?.playbackUrl || null);

      setTokenError(null);

      /*
      | Refresh at ~80% of the token's life. Waiting for it to expire
      | means the player stalls first and recovers second, which the
      | viewer sees; refreshing early is invisible.
      */

      if (refreshTimer.current) clearTimeout(refreshTimer.current);

      if (data?.expiresInSeconds) {
        refreshTimer.current = setTimeout(
          fetchSource,
          data.expiresInSeconds * 800,
        );
      }
    } catch (err) {
      setSourceUrl(null);

      setTokenError(
        err?.response?.data?.message ||
          "Video shuru nahi ho paayi. Thodi der baad try karo.",
      );
    } finally {
      setPreparing(false);
    }
  }, [matchId, activeAngle]);

  useEffect(() => {
    /*
    | Only ask for a token once there is something to watch. Requesting
    | one for an idle stream would hold a viewer slot on a match with no
    | picture.
    */

    if (current?.live) {
      fetchSource();
    } else {
      setSourceUrl(null);
    }

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [current?.live, current?.angle, fetchSource]);

  /*
  | Frees the viewer slot on the way out instead of letting the lease run
  | its full length. Fire-and-forget: the lease expires on its own, so a
  | failure here costs nothing.
  */

  useEffect(
    () => () => {
      if (matchId) leaveStreamApi(matchId);
    },
    [matchId],
  );

  /*
  |--------------------------------------------------------------------------
  | Player
  |--------------------------------------------------------------------------
  */

  const player = useVideoPlayer(null, (p) => {
    p.loop = false;

    p.staysActiveInBackground = false;
  });

  useEffect(() => {
    if (!player) return;

    if (!sourceUrl) return;

    /*
    | Swap the source in place rather than remounting - see the header
    | note. replaceAsync is the expo-video API for this; the catch is
    | required because it rejects if the player is torn down mid-swap
    | (leaving the screen during a switch).
    */

    const swap = async () => {
      try {
        await player.replaceAsync({ uri: sourceUrl });

        player.play();
      } catch {
        /* player gone - nothing to do */
      }
    };

    swap();
  }, [player, sourceUrl]);

  /*
  |--------------------------------------------------------------------------
  | Overlay
  |--------------------------------------------------------------------------
  |
  | The overlay is fed the VIDEO's clock, never the device's. See
  | useOverlayState for why that distinction is the whole feature.
  |
  */

  const { state, card, setVideoTime } = useOverlayState(matchId, {
    enabled: !!current?.live,
  });

  useEffect(() => {
    if (!player) return undefined;

    /*
    | timeUpdate fires a few times a second while playing.
    | currentLiveTimestamp is Mux's EXT-X-PROGRAM-DATE-TIME for the frame
    | on screen - which is exactly the moment the overlay must describe.
    |
    | It is null for the first second or two and on a non-live asset; the
    | hook has a fallback for that, so this simply does not report.
    */

    const sub = player.addListener("timeUpdate", (event) => {
      if (event?.currentLiveTimestamp) {
        setVideoTime(event.currentLiveTimestamp);
      }
    });

    return () => sub?.remove?.();
  }, [player, setVideoTime]);

  /*
  |--------------------------------------------------------------------------
  | Navigation out
  |--------------------------------------------------------------------------
  |
  | Both of these go through QuickScoreFlow because that is where
  | MatchDetailsScreen lives - see RootNavigator. Navigating to
  | "MatchDetailsScreen" directly from here would not resolve.
  |
  */

  const openScorecard = () =>
    navigation.navigate("QuickScoreFlow", {
      screen: "MatchDetailsScreen",
      params: { matchId, initialTab: "Scorecard" },
    });

  const openMatch = () =>
    navigation.navigate("QuickScoreFlow", {
      screen: "MatchDetailsScreen",
      params: { matchId },
    });

  if (loading && !angles.length) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const showVideo = !!current?.live && !!sourceUrl && !tokenError;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1410" />

      {/* ── Video / fallback ──────────────────────────────────────── */}

      <View style={styles.stage}>
        {showVideo ? (
          <>
            <VideoView
              style={styles.video}
              player={player}
              nativeControls
              contentFit="contain"
              allowsFullscreen
              allowsPictureInPicture={false}
            />

            {preparing && (
              <View style={styles.stageSpinner} pointerEvents="none">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            )}

            <LiveScoreOverlay state={state} card={card} />
          </>
        ) : (
          <StreamFallback
            reason={tokenError ? "no_stream" : reason}
            message={tokenError || message}
            match={match}
            onRetry={() => {
              reload();

              if (current?.live) fetchSource();
            }}
            retrying={loading || preparing}
            onOpenScore={openScorecard}
          />
        )}
      </View>

      <ScrollView
        style={styles.below}
        contentContainerStyle={styles.belowContent}
      >
        {/* ── Angle switch ───────────────────────────────────────── */}

        {angles.length > 0 && (
          <View style={styles.angleSection}>
            <View style={styles.angleHeader}>
              <Text style={styles.angleTitle}>CAMERA</Text>

              {isLive && (
                <View style={styles.viewerPill}>
                  <Ionicons
                    name="eye-outline"
                    size={12}
                    color={COLORS.onSurfaceVariant}
                  />
                  <Text style={styles.viewerText}>{viewerCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.angleRow}>
              {angles.map((a) => {
                const active = a.angle === activeAngle;

                return (
                  <TouchableOpacity
                    key={a.angle}
                    style={[
                      styles.angleCard,
                      active && styles.angleCardActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setActiveAngle(a.angle)}
                  >
                    <View style={styles.angleCardTop}>
                      <Ionicons
                        name={ANGLE_ICON[a.angle] || "videocam-outline"}
                        size={17}
                        color={active ? COLORS.onPrimary : COLORS.primary}
                      />

                      {/*
                      | The dot is the honest bit: an angle that is
                      | configured but not broadcasting is still tappable,
                      | and tapping it should tell you why there is no
                      | picture rather than look broken.
                      */}

                      <View
                        style={[
                          styles.angleDot,
                          a.live
                            ? styles.angleDotLive
                            : styles.angleDotOffline,
                        ]}
                      />
                    </View>

                    <Text
                      style={[
                        styles.angleLabel,
                        active && styles.angleLabelActive,
                      ]}
                    >
                      {ANGLE_LABEL[a.angle] || a.angle}
                    </Text>

                    <Text
                      style={[
                        styles.angleHint,
                        active && styles.angleHintActive,
                      ]}
                      numberOfLines={2}
                    >
                      {a.live ? ANGLE_HINT[a.angle] : "Offline"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Match ──────────────────────────────────────────────── */}

        {!!match && (
          <TouchableOpacity
            style={styles.matchCard}
            activeOpacity={0.85}
            onPress={openMatch}
          >
            <Text style={styles.matchFixture} numberOfLines={2}>
              {(match.teamA?.teamName || "Team A") +
                "  vs  " +
                (match.teamB?.teamName || "Team B")}
            </Text>

            {!!match.venue && (
              <View style={styles.matchMetaLine}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={COLORS.onSurfaceVariant}
                />
                <Text style={styles.matchMeta} numberOfLines={1}>
                  {match.venue}
                </Text>
              </View>
            )}

            <View style={styles.matchActionRow}>
              <Text style={styles.matchAction}>OPEN MATCH CENTRE</Text>
              <Ionicons
                name="chevron-forward"
                size={15}
                color={COLORS.primary}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* ── Commentary ─────────────────────────────────────────── */}

        {Array.isArray(state?.commentary) && state.commentary.length > 0 && (
          <View style={styles.commentaryCard}>
            <Text style={styles.commentaryTitle}>COMMENTARY</Text>

            {state.commentary.map((line, index) => (
              <View
                key={`${line.over}-${index}`}
                style={styles.commentaryRow}
              >
                <Text style={styles.commentaryOver}>{line.over}</Text>
                <Text style={styles.commentaryText}>{line.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  /*
  | 16:9, which is what a phone shooting landscape produces. Fixed by
  | aspect ratio rather than by height so it is right on every screen
  | size.
  */

  stage: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#0f1410",
    justifyContent: "flex-end",
  },

  video: {
    ...StyleSheet.absoluteFillObject,
  },

  stageSpinner: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  below: {
    flex: 1,
  },

  belowContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },

  /* ── Angles ───────────────────────────────────────────────────── */

  angleSection: {
    gap: 8,
  },

  angleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  angleTitle: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
  },

  viewerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  viewerText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  angleRow: {
    flexDirection: "row",
    gap: 10,
  },

  angleCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
  },

  angleCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  angleCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  angleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  angleDotLive: {
    backgroundColor: COLORS.error,
  },

  angleDotOffline: {
    backgroundColor: COLORS.outline,
  },

  angleLabel: {
    marginTop: 9,
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  angleLabelActive: {
    color: COLORS.onPrimary,
  },

  angleHint: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 14,
    color: COLORS.onSurfaceVariant,
  },

  angleHintActive: {
    color: "rgba(255,255,255,0.75)",
  },

  /* ── Match card ───────────────────────────────────────────────── */

  matchCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  matchFixture: {
    fontSize: 15.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  matchMetaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 7,
  },

  matchMeta: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  matchActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  matchAction: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: COLORS.primary,
  },

  /* ── Commentary ───────────────────────────────────────────────── */

  commentaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  commentaryTitle: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  commentaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  commentaryOver: {
    width: 34,
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.primary,
  },

  commentaryText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.onSurface,
  },
});