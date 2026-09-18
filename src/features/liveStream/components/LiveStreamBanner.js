/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| LiveStreamBanner.js
|
| Description:
| The one strip that connects the existing match screens to live
| streaming. Dropped into MatchDetailsScreen and into the scoring pad.
|
| WHY A SELF-CONTAINED COMPONENT
| MatchDetailsScreen is 2,400 lines and LiveScoringScreen is 1,700. A
| streaming section threaded through either of them would mean new state,
| new effects and new imports in a file that is already carrying a lot -
| and every future change to streaming would mean editing a scoring
| screen. This fetches its own data, renders nothing at all when there is
| nothing to say, and is a one-line insertion at each call site.
|
| WHAT IT SHOWS, AND TO WHOM
|   Live, anyone            -> WATCH LIVE
|   Not live, scorer        -> GO LIVE / MANAGE CAMERAS
|   Not live, anyone else   -> nothing
|
| That last case matters. A follower looking at a match nobody is filming
| should see the screen they already know, not a dead "no stream" box on
| every match in the app.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback } from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import useLiveStream from "../hooks/useLiveStream";

/*
|--------------------------------------------------------------------------
| Spacing
|--------------------------------------------------------------------------
|
| `flush` exists because the two screens this drops into pad their content
| differently, and one component cannot assume either:
|
|   MatchDetailsScreen  scrollContent has NO horizontal padding. Its cards
|                       each carry marginHorizontal: 16 themselves, so the
|                       banner must too. This is the default.
|
|   LiveScoringScreen   scrollContent already has padding: 16. A banner
|                       adding its own 16 sits at 32 - visibly narrower
|                       than every card around it, which is exactly the
|                       "width theek nahi lag rahi" problem.
|
| So: flush drops the banner's own horizontal margin and lets the parent's
| padding set the width. The top margin shrinks too, because a padded
| parent has already opened a gap above.
|
*/

export default function LiveStreamBanner({ matchId, flush = false }) {
  const navigation = useNavigation();

  /*
  | Polling is off. This sits on a screen the user is reading, not
  | watching - a request every eight seconds under a scorecard is a lot of
  | traffic for a badge. It refreshes on focus, and the socket in
  | useLiveStream still pushes real changes through.
  */

  const { isLive, angles, control, loading, reload, viewerCount } =
    useLiveStream(matchId, { poll: false });

  useFocusEffect(
    useCallback(() => {
      reload(true);
    }, [reload]),
  );

  /*
  |--------------------------------------------------------------------------
  | Who Is A Manager
  |--------------------------------------------------------------------------
  |
  | ONLY the server's answer. There used to be a `canManage` prop as well,
  | passed from MatchDetailsScreen as match.canManage and hardcoded true on
  | the scoring pad - and that was the bug: match.canManage means "manages
  | either team", so BOTH captains got "Manage cameras", and the scoring
  | pad showed it to anyone who reached it.
  |
  | `control` is only present when the server has decided this user owns
  | this match's cameras (the scorer, or the creator before scoring
  | starts). Trusting it alone means the panel a user sees and the actions
  | they can perform are the same question, answered once, on the server.
  |
  */

  const manager = !!control;

  if (loading) return null;

  /*
  | Nothing to say: no camera on this match and this person could not set
  | one up anyway.
  */

  if (!isLive && !manager) return null;

  const liveCount = angles.filter((a) => a.live).length;

  if (isLive) {
    return (
      <TouchableOpacity
        style={[styles.banner, styles.bannerLive, flush && styles.flush]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("WatchLiveScreen", { matchId })}
      >
        <View style={styles.iconWrapLive}>
          <Ionicons name="play" size={15} color="#ffffff" />
        </View>

        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <View style={styles.liveDot} />
            <Text style={styles.titleLive}>LIVE ON CAMERA</Text>
          </View>

          <Text style={styles.subtitle}>
            {liveCount > 1
              ? `${liveCount} angles · switch anytime`
              : "Watch with the live score overlay"}
            {viewerCount > 0 ? ` · ${viewerCount} watching` : ""}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={COLORS.error} />
      </TouchableOpacity>
    );
  }

  /*
  | Manager, nothing live. "Go Live" when no camera exists yet, "Manage"
  | when they are set up but not broadcasting - the second one is where a
  | scorer goes to find out WHY, which is the question they will actually
  | have.
  */

  const configured = angles.length > 0;

  return (
    <TouchableOpacity
      style={[styles.banner, flush && styles.flush]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate("GoLiveScreen", { matchId })}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="videocam-outline" size={16} color={COLORS.primary} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>
          {configured ? "Manage cameras" : "Go live"}
        </Text>

        <Text style={styles.subtitle}>
          {configured
            ? "Camera set hai par live nahi — dekho kya rok raha hai"
            : "Is match ko do angle se live stream karo"}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  bannerLive: {
    borderColor: COLORS.error,
    borderLeftWidth: 4,
  },

  /*
  | Applied last, so it wins over `banner`. The parent's own padding
  | supplies the width; the banner just fills it.
  */

  flush: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 12,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceContainer,
  },

  iconWrapLive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
  },

  textBlock: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },

  titleLive: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.error,
  },

  title: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },
});