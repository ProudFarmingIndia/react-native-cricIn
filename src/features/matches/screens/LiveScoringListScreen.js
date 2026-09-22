import React, { useCallback, useRef, useState } from "react";

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

import Ionicons from "@expo/vector-icons/Ionicons";

import { getLiveMatchesApi } from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Matches
|
| File:
| LiveScoringListScreen.js
|
| Description:
| Which match do you want to score? Reached from the sidebar's "Live
| Scoring".
|
| WHAT THIS FILE USED TO BE
|
| A byte-for-byte copy of LiveScoringScreen. Somebody duplicated the scoring
| pad, named the copy "List", wired the sidebar to it and never wrote the
| list. So tapping Live Scoring opened a SECOND scoring pad - with no
| matchId and no inningsId, because the sidebar has no match to pass.
|
| That screen resolves its innings from params, and failing that from the
| match, and failing that from the innings' own matchId. With no params at
| all every one of those roads starts nowhere, which is exactly what the
| logs showed:
|
|     [LiveScoring] loadInnings called {"inningsId": null}
|     [LiveScoring] loadInnings called {"inningsId": null}
|     ... forever
|
| ...and on screen, "Still loading this match's innings. Try again in a
| second." The second never came, because nothing was loading.
|
| WHY A LIST IS THE RIGHT ANSWER AND NOT JUST A BUG FIX
|
| A scorer can have two matches live at once - an organizer running two
| tournament fixtures on neighbouring grounds is the ordinary case, not the
| edge case. One sidebar item cannot open two matches, so it has to ask.
|
| With exactly one match in progress it does not ask: it goes straight
| through, which is what the sidebar item was always trying to do. The list
| only appears when there is a genuine choice to make, or when there is
| nothing to score and the honest answer is "nothing is live".
|
*/

const ballsToOvers = (innings) => {
  if (!innings) return "";

  /* The server already formats this; the fallback is for older payloads. */
  if (innings.overs) return `${innings.overs} ov`;

  return "";
};

export default function LiveScoringListScreen() {
  const navigation = useNavigation();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /*
  | The straight-through jump happens at most once per visit. Without the
  | guard, coming BACK from the scoring pad would immediately bounce the
  | scorer into it again and Back would be unusable.
  */
  const jumped = useRef(false);

  /* ── Where a card goes ─────────────────────────────────────────────── */

  const openScoring = useCallback(
    (match, replace = false) => {
      const inn = match.currentInnings;

      /*
      | Between innings there IS no current innings, so the scoring pad has
      | nothing to record. The innings break is the real destination, and
      | the server flags it rather than leaving the client to infer it from
      | a null.
      */

      if (match.awaitingSecondInnings && match.completedInnings) {
        const brk = match.completedInnings;

        navigation.navigate("QuickScoreFlow", {
          screen: "InningsSummaryScreen",
          params: {
            matchId: match._id,
            inningsId: String(brk.inningsId),
            battingSquad: [],
            bowlingSquad: [],
            battingTeamId: brk.battingTeamId,
            bowlingTeamId: brk.bowlingTeamId,
          },
        });

        return;
      }

      /*
      | Every id the pad needs, handed over up front. This is the difference
      | between this screen and the sidebar's old direct jump: the sidebar
      | knew no match, so it could pass nothing.
      */

      const go = replace ? navigation.replace : navigation.navigate;

      go.call(navigation, "QuickScoreFlow", {
        screen: "LiveScoringScreen",
        params: {
          matchId: match._id,
          inningsId: inn?.inningsId,
          battingSquad: inn?.battingSquad || [],
          bowlingSquad: inn?.bowlingSquad || [],
          target: inn?.target,
        },
      });
    },
    [navigation],
  );

  /* ── Load ──────────────────────────────────────────────────────────── */

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);

      setError(null);

      try {
        const data = await getLiveMatchesApi();
        const list = Array.isArray(data) ? data : [];

        setMatches(list);

        /*
        | One match, one scorer, no question worth asking. `replace` so the
        | list does not sit in the back stack - backing out of scoring should
        | return to wherever the sidebar was opened from, not to a list with
        | a single row on it.
        */

        const mine = list.filter((m) => m.isScorer);

        if (mine.length === 1 && !jumped.current) {
          jumped.current = true;
          openScoring(mine[0], true);
        }
      } catch (e) {
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "Live matches load nahi huye.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [openScoring],
  );

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load]),
  );

  /* ── Card ──────────────────────────────────────────────────────────── */

  const renderItem = ({ item }) => {
    const inn = item.currentInnings;
    const first = item.firstInnings;

    const battingIsA =
      inn && String(inn.battingTeamId) === String(item.teamA?._id);

    const teamAName = item.teamA?.teamName || "Team A";
    const teamBName = item.teamB?.teamName || "Team B";

    const score = inn ? `${inn.runs}/${inn.wickets}` : null;

    const chasing = inn?.target != null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => openScoring(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>LIVE</Text>

          {item.matchTitle ? (
            <Text style={styles.matchTitle} numberOfLines={1}>
              {item.matchTitle}
            </Text>
          ) : null}
        </View>

        {/*
        | Both sides with their own score against their own name. A live card
        | that shows one total floating between two team names makes the
        | scorer work out which side is batting - at the one moment they are
        | least able to spare the attention.
        */}

        <View style={styles.side}>
          <Text
            style={[styles.sideName, battingIsA && styles.sideNameOn]}
            numberOfLines={1}
          >
            {teamAName}
          </Text>

          <Text style={styles.sideScore}>
            {battingIsA
              ? `${score} · ${ballsToOvers(inn)}`
              : first && String(first.battingTeamId) === String(item.teamA?._id)
                ? `${first.runs}/${first.wickets}`
                : "—"}
          </Text>
        </View>

        <View style={styles.side}>
          <Text
            style={[styles.sideName, !battingIsA && inn && styles.sideNameOn]}
            numberOfLines={1}
          >
            {teamBName}
          </Text>

          <Text style={styles.sideScore}>
            {!battingIsA && inn
              ? `${score} · ${ballsToOvers(inn)}`
              : first && String(first.battingTeamId) === String(item.teamB?._id)
                ? `${first.runs}/${first.wickets}`
                : "—"}
          </Text>
        </View>

        <View style={styles.cardFoot}>
          {item.awaitingSecondInnings ? (
            <Text style={styles.stateText}>Innings break</Text>
          ) : chasing ? (
            <Text style={styles.stateText}>
              Target {inn.target}
            </Text>
          ) : (
            <Text style={styles.stateText}>1st innings</Text>
          )}

          {item.isScorer ? (
            <View style={styles.action}>
              <Ionicons name="radio" size={14} color={COLORS.onPrimary} />

              <Text style={styles.actionText}>
                {item.awaitingSecondInnings ? "Innings break" : "Resume scoring"}
              </Text>
            </View>
          ) : (
            <View style={[styles.action, styles.actionGhost]}>
              <Text style={[styles.actionText, styles.actionTextGhost]}>
                View match
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /* ── Render ────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const mine = matches.filter((m) => m.isScorer);
  const others = matches.filter((m) => !m.isScorer);

  /* Scorable matches first - this screen exists for those. */
  const ordered = [...mine, ...others];

  return (
    <View style={styles.container}>
      {mine.length > 1 && (
        <View style={styles.banner}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color={COLORS.secondary}
          />

          <Text style={styles.bannerText}>
            Tum {mine.length} matches score kar rahe ho. Jisme ball daalni hai
            usko chuno.
          </Text>
        </View>
      )}

      <FlatList
        data={ordered}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          ordered.length === 0 && styles.listEmpty,
        ]}
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={error ? "cloud-offline-outline" : "radio-outline"}
                size={26}
                color={error ? COLORS.error : COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {error ? "Load nahi hua" : "Abhi koi match live nahi hai"}
            </Text>

            <Text style={styles.emptyBody}>
              {error ||
                "Jo match tum score karte ho wo yahan tab aayega jab wo start ho jaye. Match start karne ke liye uske details screen par jao."}
            </Text>

            <TouchableOpacity
              style={styles.retry}
              onPress={() => load()}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={15} color={COLORS.onPrimary} />

              <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: COLORS.secondaryContainer,
  },

  bannerText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },

  list: { padding: 16, paddingBottom: 60 },

  listEmpty: { flexGrow: 1 },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 14,
    marginBottom: 14,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },

  liveText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: COLORS.error,
  },

  matchTitle: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    textAlign: "right",
  },

  side: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 4,
  },

  sideName: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  /* The side actually batting, so the score has an owner. */
  sideNameOn: {
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  sideScore: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
    fontVariant: ["tabular-nums"],
  },

  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  stateText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },

  actionGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  actionText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  actionTextGhost: { color: COLORS.onSurfaceVariant },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 9,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  emptyTitle: {
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

  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 14,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
  },

  retryText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },
});
