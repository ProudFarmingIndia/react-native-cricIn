/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| InviteTeamsScreen.js
|
| Description:
| The organizer searches for teams and invites them. Same search
| mechanics as InvitePlayerScreen - three characters minimum, 400ms
| debounce - because it is the same job and a second set of rules for it
| would only be a second set of bugs.
|
| WHY THE INVITED LIST IS ON THIS SCREEN
| Invites are slow. A captain answers tomorrow, or next week, or not at
| all. An organizer coming back to this screen three days later needs to
| see who has answered before they search for anyone new, otherwise the
| obvious move is to invite the same team twice and wonder why nothing
| happens. So the roster sits above the search box: accepted teams first,
| then the ones still waiting, then the ones who said no.
|
| The server rejects a duplicate invite anyway, but an error message is a
| worse answer than a list that already told them.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import SearchInput from "../../search/components/SearchInput";
import SearchSkeleton from "../../search/components/SearchSkeleton";
import EmptySearchState from "../../search/components/EmptySearchState";

import useSearch from "../../search/hooks/useSearch";

import {
  getTournamentApi,
  inviteTeamApi,
  cancelInviteApi,
  removeTeamApi,
} from "../services/tournament.service";

/*
| Hoisted out of the component body. Defined inside render, every keystroke
| in the search box would give React a brand new component type and it
| would throw the row away and rebuild it - which is the same
| no-unstable-nested-components problem the live stream screens hit.
*/

const STATUS_PILL = {
  accepted: { label: "IN", bg: "#E2EDE0", fg: COLORS.primary },
  invited: { label: "WAITING", bg: "#FFF3E0", fg: COLORS.secondary },
  requested: { label: "REQUESTED", bg: "#FFF3E0", fg: COLORS.secondary },
  declined: { label: "DECLINED", bg: "#FEE2E2", fg: COLORS.error },
};

const TeamRow = ({ team, status, busy, actionIcon, actionTint, onAction }) => {
  const pill = STATUS_PILL[status];

  return (
    <View style={styles.row}>
      <View style={styles.rowAvatar}>
        <Ionicons name="shield" size={20} color={COLORS.onPrimary} />
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {team.teamName || team.name || "Team"}
        </Text>

        {!!(team.city || team.homeGround) && (
          <Text style={styles.rowSub} numberOfLines={1}>
            {team.city || team.homeGround}
          </Text>
        )}
      </View>

      {!!pill && (
        <View style={[styles.pill, { backgroundColor: pill.bg }]}>
          <Text style={[styles.pillText, { color: pill.fg }]}>{pill.label}</Text>
        </View>
      )}

      {!!onAction && (
        <TouchableOpacity
          style={styles.rowAction}
          activeOpacity={0.8}
          disabled={busy}
          onPress={onAction}
        >
          {busy ? (
            <ActivityIndicator size="small" color={actionTint} />
          ) : (
            <Ionicons name={actionIcon} size={22} color={actionTint} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function InviteTeamsScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { tournamentId } = route.params || {};

  const { teams: results, loading: searching, searchTeams, clearSearchResults } =
    useSearch();

  const [tournament, setTournament] = useState(null);

  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");

  const [searched, setSearched] = useState(false);

  /* Which team id currently has a request in flight, so only its row spins. */

  const [busyId, setBusyId] = useState(null);

  const searchTimeout = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load = useCallback(async () => {
    try {
      setTournament(await getTournamentApi(tournamentId));
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Tournament load nahi hua.",
      );
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    load();

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);

      clearSearchResults();
    };
  }, [load, clearSearchResults]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const onSearch = useCallback(
    (text) => {
      setKeyword(text);

      if (searchTimeout.current) clearTimeout(searchTimeout.current);

      if (text.trim().length < 3) {
        setSearched(false);

        clearSearchResults();

        return;
      }

      searchTimeout.current = setTimeout(async () => {
        setSearched(true);

        await searchTeams(text.trim());
      }, 400);
    },
    [searchTeams, clearSearchResults],
  );

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  const invite = async (team) => {
    Keyboard.dismiss();

    const teamId = team._id || team.teamId;

    setBusyId(teamId);

    try {
      await inviteTeamApi(tournamentId, teamId);

      await load();

      Alert.alert(
        "Invite bhej diya",
        `${team.teamName || "Team"} ke captain ko notification chala gaya hai.`,
      );
    } catch (err) {
      Alert.alert(
        "Invite nahi gaya",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const cancel = (team) => {
    Alert.alert(
      "Invite cancel karein?",
      `${team.teamName} ka invite hata diya jayega.`,
      [
        { text: "Rehne do", style: "cancel" },
        {
          text: "Cancel invite",
          style: "destructive",
          onPress: async () => {
            setBusyId(team.teamId);

            try {
              await cancelInviteApi(tournamentId, team.teamId);

              await load();
            } catch (err) {
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Cancel nahi hua.",
              );
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  /*
  | Removing an accepted team is a different act from cancelling an invite -
  | that side has already committed - so it asks in stronger words and the
  | server refuses outright once fixtures exist.
  */

  const remove = (team) => {
    Alert.alert(
      "Team hatayein?",
      `${team.teamName} tournament se bahar ho jayegi.`,
      [
        { text: "Rehne do", style: "cancel" },
        {
          text: "Hatao",
          style: "destructive",
          onPress: async () => {
            setBusyId(team.teamId);

            try {
              await removeTeamApi(tournamentId, team.teamId);

              await load();
            } catch (err) {
              Alert.alert(
                "Nahi hata",
                err?.response?.data?.message ||
                  "Fixtures ban chuke hain to withdraw use karo.",
              );
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Derived
  |--------------------------------------------------------------------------
  */

  const accepted = tournament?.teams || [];

  const pending = tournament?.pendingTeams || [];

  /* Every id already spoken for, so search results can say so inline. */

  const takenIds = new Set([
    ...accepted.map((t) => String(t.teamId)),
    ...pending.map((t) => String(t.teamId)),
  ]);

  const maxTeams = tournament?.numberOfTeams || 0;

  const full = maxTeams > 0 && accepted.length >= maxTeams;

  const locked = !!tournament?.fixturesGeneratedAt;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Counter ───────────────────────────────────────────────── */}

        <View style={styles.counter}>
          <View>
            <Text style={styles.counterValue}>
              {accepted.length}
              <Text style={styles.counterOf}> / {maxTeams || "?"}</Text>
            </Text>

            <Text style={styles.counterLabel}>TEAMS CONFIRMED</Text>
          </View>

          {pending.filter((t) => t.status !== "declined").length > 0 && (
            <View style={styles.counterPending}>
              <Ionicons name="time-outline" size={14} color={COLORS.secondary} />

              <Text style={styles.counterPendingText}>
                {pending.filter((t) => t.status !== "declined").length} waiting
              </Text>
            </View>
          )}
        </View>

        {locked && (
          <View style={styles.notice}>
            <Ionicons name="lock-closed" size={15} color={COLORS.secondary} />

            <Text style={styles.noticeText}>
              Fixtures ban chuke hain. Ab teams add ya remove nahi ho sakti.
            </Text>
          </View>
        )}

        {full && !locked && (
          <View style={styles.notice}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={COLORS.primary}
            />

            <Text style={styles.noticeText}>
              Saari teams aa gayi. Ab fixtures generate kar sakte ho.
            </Text>
          </View>
        )}

        {/* ── Search ────────────────────────────────────────────────── */}

        {!locked && (
          <>
            <Text style={styles.sectionTitle}>TEAM DHOONDHO</Text>

            <SearchInput
              value={keyword}
              placeholder="Team ka naam likho"
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="search"
              onChangeText={onSearch}
            />

            {searching && <SearchSkeleton />}

            {!searching && searched && results.length === 0 && (
              <EmptySearchState
                title="Koi team nahi mili"
                description="Poora naam try karo, ya team ke captain se CricIn par team banwao."
              />
            )}

            {!searching &&
              results.map((team) => {
                const id = String(team._id || team.teamId);

                const already = takenIds.has(id);

                return (
                  <TeamRow
                    key={id}
                    team={team}
                    status={already ? "invited" : null}
                    busy={busyId === id}
                    actionIcon={
                      already ? "checkmark-circle" : "add-circle-outline"
                    }
                    actionTint={already ? COLORS.outline : COLORS.primary}
                    onAction={already ? null : () => invite(team)}
                  />
                );
              })}
          </>
        )}

        {/* ── Confirmed ─────────────────────────────────────────────── */}

        {accepted.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>CONFIRMED</Text>

            {accepted.map((team) => (
              <TeamRow
                key={String(team.teamId)}
                team={team}
                status="accepted"
                busy={busyId === team.teamId}
                actionIcon="close-circle-outline"
                actionTint={COLORS.error}
                onAction={locked ? null : () => remove(team)}
              />
            ))}
          </>
        )}

        {/* ── Pending ───────────────────────────────────────────────── */}

        {pending.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>JAWAB KA INTEZAAR</Text>

            {pending.map((team) => (
              <TeamRow
                key={String(team.teamId)}
                team={team}
                status={team.status}
                busy={busyId === team.teamId}
                actionIcon="close-circle-outline"
                actionTint={COLORS.outline}
                onAction={locked ? null : () => cancel(team)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* ── Done ────────────────────────────────────────────────────── */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneBtn}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  scroll: { flex: 1 },

  content: { padding: 16, paddingBottom: 32 },

  /* ── Counter ──────────────────────────────────────────────────── */

  counter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },

  counterValue: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.primary,
  },

  counterOf: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.outline,
  },

  counterLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },

  counterPending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF3E0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  counterPendingText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  /* ── Notice ───────────────────────────────────────────────────── */

  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Row ──────────────────────────────────────────────────────── */

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 9,
  },

  rowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  rowInfo: { flex: 1, marginLeft: 11 },

  rowTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  rowSub: {
    marginTop: 2,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  pill: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 6,
  },

  pillText: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  rowAction: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Footer ───────────────────────────────────────────────────── */

  footer: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  doneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  doneText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },
});
