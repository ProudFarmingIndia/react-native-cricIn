/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| LiveStreamingListScreen.js
|
| Description:
| Every match with a camera on it right now, plus - above them - anything
| this user has been asked to film.
|
| WHY THE ASSIGNMENTS SIT AT THE TOP OF THIS SCREEN
| Somebody asked to film a match is usually in NEITHER squad. Every other
| feed in the app filters by team membership, so that match appears
| nowhere for them - they get the notification and then have no way back
| to it. This list is the way back.
|
| OPEN TO EVERYONE, DELIBERATELY
| Any logged-in user sees every streamed match here, not only matches
| involving teams they follow. Followers get the NOTIFICATION; everyone
| gets to WATCH. Gating the list would kill the one loop that grows this
| feature - a stranger watches, then follows the team, then gets told
| about the next match.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import LiveStreamCard from "../components/LiveStreamCard";

import {
  getLiveStreamingFeedApi,
  getMyBroadcastAssignmentsApi,
} from "../services/liveStream.service";

import { ANGLE_LABEL } from "../constants/streamConstants";

/*
| The "you are filming this" row. Deliberately loud - it is a job
| somebody has been given, with a ground to get to, not another fixture
| to browse.
*/

/*
| Hoisted for the same reason RootNavigator's header is: an inline
| `ItemSeparatorComponent={() => <View />}` is a new component type on
| every render, so React tears down and rebuilds every separator in the
| list instead of reusing them. It is also what the
| no-unstable-nested-components lint rule flags.
*/

const Separator = () => <View style={styles.gap} />;

const AssignmentRow = ({ item, onOpen }) => {
  const pending = item.needsResponse || item.assignmentStatus === "pending";

  /*
  | The fixture lives under `match` in this payload, not at the top level -
  | see getMyAssignments in liveStream.service.ts. Reading item.teamA here
  | would render "Team A vs Team B" on every row and look like missing
  | data rather than a wrong path.
  */

  const fixture = item.match || {};

  return (
    <TouchableOpacity
      style={[styles.assignCard, pending && styles.assignCardPending]}
      activeOpacity={0.85}
      onPress={() => onOpen(item)}
    >
      <View style={styles.assignTop}>
        <Ionicons
          name={pending ? "mail-unread-outline" : "videocam-outline"}
          size={17}
          color={pending ? COLORS.secondary : COLORS.primary}
        />

        <Text
          style={[styles.assignLabel, pending && styles.assignLabelPending]}
        >
          {pending ? "INVITE — NEEDS YOUR ANSWER" : "YOU ARE FILMING"}
        </Text>
      </View>

      <Text style={styles.assignFixture} numberOfLines={2}>
        {fixture.teamA?.teamName || fixture.title || "Untitled match"}
        {fixture.teamB?.teamName
          ? `  vs  ${fixture.teamB.teamName}`
          : ""}
      </Text>

      <Text style={styles.assignMeta}>
        {ANGLE_LABEL[item.angle] || item.angle} camera
        {fixture.venue ? ` · ${fixture.venue}` : ""}
      </Text>

      <View style={styles.assignAction}>
        <Text style={styles.assignActionText}>
          {pending ? "OPEN INVITE" : "OPEN SETUP"}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
};

export default function LiveStreamingListScreen() {
  const navigation = useNavigation();

  const [matches, setMatches] = useState([]);

  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      /*
      | Both in one pass. allSettled rather than all: a user with no
      | assignments is the normal case, and one failing call must not
      | leave the whole screen empty.
      */

      const [feed, mine] = await Promise.allSettled([
        getLiveStreamingFeedApi(),
        getMyBroadcastAssignmentsApi(),
      ]);

      setMatches(
        feed.status === "fulfilled" && Array.isArray(feed.value)
          ? feed.value
          : [],
      );

      setAssignments(
        mine.status === "fulfilled" && Array.isArray(mine.value)
          ? mine.value
          : [],
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load]),
  );

  const openWatch = (match) =>
    navigation.navigate("WatchLiveScreen", { matchId: match._id });

  /*
  | A pending invite goes to the notification-style accept screen; an
  | accepted one goes straight to the key. Sending a pending invite to
  | the setup screen would show "can't get the key", which is true but
  | reads as a bug.
  */

  const openAssignment = (item) =>
    navigation.navigate(
      item.assignmentStatus === "pending"
        ? "BroadcastInviteScreen"
        : "BroadcastSetupScreen",
      { matchId: item.matchId, angle: item.angle },
    );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={matches}
      keyExtractor={(item) => String(item._id)}
      renderItem={({ item }) => (
        <LiveStreamCard match={item} onPress={openWatch} />
      )}
      ItemSeparatorComponent={Separator}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);

            load(true);
          }}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      ListHeaderComponent={
        assignments.length > 0 ? (
          <View style={styles.assignSection}>
            <Text style={styles.sectionLabel}>YOUR CAMERA DUTY</Text>

            {assignments.map((item) => (
              <AssignmentRow
                key={`${item.matchId}-${item.angle}`}
                item={item}
                onOpen={openAssignment}
              />
            ))}

            <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
              LIVE RIGHT NOW
            </Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons
            name="videocam-off-outline"
            size={30}
            color={COLORS.outline}
          />

          <Text style={styles.emptyTitle}>Abhi koi match live nahi hai</Text>

          <Text style={styles.emptyBody}>
            Jab kisi match par camera chalu hoga, wo yahan dikhega. Apna
            match stream karna ho toh match kholo aur "Go Live" dabao.
          </Text>
        </View>
      }
    />
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
    flexGrow: 1,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  gap: {
    height: 12,
  },

  sectionLabel: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  sectionLabelSpaced: {
    marginTop: 20,
  },

  assignSection: {
    marginBottom: 2,
  },

  assignCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 10,
  },

  assignCardPending: {
    borderLeftColor: COLORS.secondaryContainer,
    backgroundColor: "#fffdf8",
  },

  assignTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  assignLabel: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.primary,
  },

  assignLabelPending: {
    color: COLORS.secondary,
  },

  assignFixture: {
    marginTop: 8,
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  assignMeta: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  assignAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 11,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  assignActionText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: COLORS.primary,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 8,
  },

  emptyTitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  emptyBody: {
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },
});