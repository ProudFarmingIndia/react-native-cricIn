import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { useSelector } from "react-redux";

import Ionicons from "@expo/vector-icons/Ionicons";

import TeamBadge from "../../../components/matches/TeamBadge";

import { getLiveMatchesApi } from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Live Scoring
|--------------------------------------------------------------------------
|
| Every match currently in progress that this user can score, reached from
| the sidebar.
|
| The sidebar's "Live Scoring" item used to just open the Matches tab,
| which is the same place the bottom bar goes - so the item did nothing
| distinct. This is the screen it was always implying: the matches you are
| scoring right now, one tap from the scoring pad.
|
| MATCHES YOU SCORE vs MATCHES YOU FOLLOW
| The feed returns live matches for every team you manage, which is not the
| same set as the ones you are scoring. Those you actually score are listed
| first and get the SCORE NOW button; the rest are still shown, because a
| captain watching their team's match wants to open it too - they just get
| "View" instead, and tapping them opens the match rather than the pad.
|
*/

export default function LiveScoringListScreen() {
  const navigation = useNavigation();

  const authUser = useSelector((state) => state.auth.user);

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await getLiveMatchesApi();

      setMatches(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Could not load live matches.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /*
  | Reloaded on focus rather than on mount: a scorer coming back from the
  | scoring pad needs the score on this list to be current, and a match
  | that just finished should drop off it.
  */

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const canScore = (match) => {
    const me = String(authUser?._id || "");

    if (!me) {
      return false;
    }

    return (
      String(match.scorerUserId || "") === me ||
      String(match.inviteSenderUserId || "") === me ||
      String(match.userId || "") === me
    );
  };

  const openMatch = (match) => {
    const inn = match.currentInnings;

    if (canScore(match) && inn?.inningsId) {
      navigation.navigate("QuickScoreFlow", {
        screen: "LiveScoringScreen",
        params: {
          matchId: match._id,
          inningsId: inn.inningsId,
          battingSquad: inn.battingSquad || [],
          bowlingSquad: inn.bowlingSquad || [],
          target: inn.target,
        },
      });

      return;
    }

    /*
    | No innings yet, or not the scorer - the match details screen is the
    | right landing place. Sending someone to the scoring pad for a match
    | they cannot score would just show them a dead screen.
    */

    navigation.navigate("QuickScoreFlow", {
      screen: "MatchDetailsScreen",
      params: { matchId: match._id },
    });
  };

  const renderItem = ({ item }) => {
    const inn = item.currentInnings;

    const scorer = canScore(item);

    const battingId = String(inn?.battingTeamId || "");

    const isTeamABatting =
      !!battingId && String(item.teamA?._id) === battingId;

    const isTeamBBatting =
      !!battingId && String(item.teamB?._id) === battingId;

    const scoreBlock = inn ? (
      <View style={styles.scoreWrap}>
        <Text style={styles.score}>
          {inn.runs}/{inn.wickets}
        </Text>

        <Text style={styles.overs}>{inn.overs} ov</Text>
      </View>
    ) : null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => openMatch(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>

          <Text style={styles.format}>{item.matchType}</Text>
        </View>

        <View style={styles.sideRow}>
          <TeamBadge team={item.teamA} size={34} />

          <Text
            style={[styles.sideName, isTeamABatting && styles.sideNameBatting]}
            numberOfLines={1}
          >
            {item.teamA?.teamName || "Team A"}
          </Text>

          {isTeamABatting ? scoreBlock : null}
        </View>

        <View style={styles.sideRow}>
          <TeamBadge team={item.teamB} size={34} />

          <Text
            style={[styles.sideName, isTeamBBatting && styles.sideNameBatting]}
            numberOfLines={1}
          >
            {item.teamB?.teamName || "Team B"}
          </Text>

          {isTeamBBatting ? scoreBlock : null}
        </View>

        {/* Score is shown unattributed when the batting side is unknown. */}
        {!!inn && !isTeamABatting && !isTeamBBatting && (
          <View style={styles.neutralScore}>
            <Text style={styles.score}>
              {inn.runs}/{inn.wickets}
            </Text>

            <Text style={styles.neutralOvers}>({inn.overs} ov)</Text>
          </View>
        )}

        {!inn && (
          <Text style={styles.awaiting}>Waiting for the first ball</Text>
        )}

        <View style={[styles.action, !scorer && styles.actionSecondary]}>
          <Text
            style={[
              styles.actionText,
              !scorer && styles.actionTextSecondary,
            ]}
          >
            {scorer ? "SCORE NOW →" : "VIEW MATCH →"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.stateBlock}>
      <View style={styles.stateIcon}>
        <Ionicons name="radio-outline" size={26} color={COLORS.primary} />
      </View>

      <Text style={styles.stateTitle}>Nothing live right now</Text>

      <Text style={styles.stateText}>
        Matches you are scoring appear here while they are in progress. Start
        one from Quick Score or from a scheduled match.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.stateBlock}>
          <View style={[styles.stateIcon, styles.stateIconError]}>
            <Ionicons
              name="cloud-offline-outline"
              size={26}
              color={COLORS.error}
            />
          </View>

          <Text style={styles.stateTitle}>Couldn't load live matches</Text>

          <Text style={styles.stateText}>{error}</Text>

          <TouchableOpacity style={styles.retry} onPress={() => load()}>
            <Ionicons name="refresh" size={15} color={COLORS.onPrimary} />

            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          matches.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  centered: {
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  listEmpty: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderTopWidth: 4,
    borderTopColor: COLORS.error,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  liveRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: 5,
  },

  liveText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: COLORS.error,
  },

  format: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },

  sideRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },

  sideName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  sideNameBatting: {
    fontWeight: "800",
    color: COLORS.primary,
  },

  scoreWrap: {
    alignItems: "flex-end",
  },

  score: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },

  overs: {
    fontSize: 10.5,
    color: COLORS.onSurfaceVariant,
  },

  neutralScore: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },

  neutralOvers: {
    marginLeft: 8,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  awaiting: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: "italic",
    color: COLORS.onSurfaceVariant,
  },

  action: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },

  actionSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  actionText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: COLORS.onPrimary,
  },

  actionTextSecondary: {
    color: COLORS.onSurfaceVariant,
  },

  stateBlock: {
    alignItems: "center",
    marginTop: 56,
    paddingHorizontal: 32,
  },

  stateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  stateIconError: {
    backgroundColor: COLORS.errorContainer,
  },

  stateTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  stateText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  retry: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
  },

  retryText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onPrimary,
  },
});
