/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| ManageTournamentScreen.js
|
| Description:
| Everything only the organizer can do, on one screen, in the order they
| actually do it: publish it, fill it with teams, lock it, then run it.
|
| WHY IT IS ONE SCREEN AND NOT SIX
| An organizer's questions are always "what is left to do" and "what
| changed since yesterday". Split across six screens, answering either one
| means opening all six. Here the top of the screen is the state of the
| tournament and everything below it is a thing they can do about it.
|
| THE ONE IRREVERSIBLE ACTION
| "Lock teams and generate fixtures" writes the whole schedule and closes
| registration. After it, teams cannot be added or removed - only
| withdrawn, which is a different and messier thing. So it asks twice and
| tells the organizer exactly how many matches it is about to create.
|
| SCORER TRANSFER
| Scoring rights are a single field on the match. Handing them to somebody
| else moves that field, which ends the previous holder's rights in the
| same write - there is never a moment when two people can both score, and
| the organizer can always take it back.
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
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import DatePickerField from "../../../components/common/DatePickerField";

import { COLORS } from "../../../constants/colors";

import FixtureList from "../components/FixtureList";

import { STATUS_META } from "../constants/tournamentConstants";

import useSearch from "../../search/hooks/useSearch";

import {
  getTournamentApi,
  getFixturesApi,
  setVisibilityApi,
  respondJoinRequestApi,
  generateFixturesApi,
  updateFixtureApi,
  assignMatchScorerApi,
  cancelTournamentApi,
} from "../services/tournament.service";

/*
|--------------------------------------------------------------------------
| Presentational pieces
|--------------------------------------------------------------------------
|
| All at module scope. Defined inside the component, every toggle flip
| would give React new component types and it would tear down and rebuild
| the whole page instead of re-rendering it.
|
*/

const Card = ({ icon, title, subtitle, children, tone }) => (
  <View style={styles.card}>
    <View style={styles.cardHead}>
      <View
        style={[
          styles.cardIcon,
          tone === "danger" && styles.cardIconDanger,
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={tone === "danger" ? COLORS.error : COLORS.primary}
        />
      </View>

      <View style={styles.cardHeadText}>
        <Text style={styles.cardTitle}>{title}</Text>

        {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>
    </View>

    {children}
  </View>
);

const ToggleRow = ({ label, hint, value, disabled, onChange }) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleText}>
      <Text style={styles.toggleLabel}>{label}</Text>

      <Text style={styles.toggleHint}>{hint}</Text>
    </View>

    <Switch
      value={!!value}
      disabled={disabled}
      onValueChange={onChange}
      trackColor={{ false: COLORS.outlineVariant, true: COLORS.onPrimaryContainer }}
      thumbColor={value ? COLORS.primary : COLORS.surfaceContainerHighest}
    />
  </View>
);

const ActionButton = ({ icon, label, onPress, tone, disabled, busy }) => (
  <TouchableOpacity
    style={[
      styles.action,
      tone === "primary" && styles.actionPrimary,
      tone === "danger" && styles.actionDanger,
      disabled && styles.actionOff,
    ]}
    activeOpacity={0.85}
    disabled={disabled || busy}
    onPress={onPress}
  >
    {busy ? (
      <ActivityIndicator
        size="small"
        color={tone === "primary" ? COLORS.onPrimary : COLORS.primary}
      />
    ) : (
      <>
        <Ionicons
          name={icon}
          size={17}
          color={
            tone === "primary"
              ? COLORS.onPrimary
              : tone === "danger"
                ? COLORS.error
                : COLORS.primary
          }
        />

        <Text
          style={[
            styles.actionText,
            tone === "primary" && styles.actionTextPrimary,
            tone === "danger" && styles.actionTextDanger,
          ]}
        >
          {label}
        </Text>
      </>
    )}
  </TouchableOpacity>
);

const RequestRow = ({ team, busy, onApprove, onReject }) => (
  <View style={styles.reqRow}>
    <View style={styles.reqAvatar}>
      <Ionicons name="shield" size={17} color={COLORS.onPrimary} />
    </View>

    <Text style={styles.reqName} numberOfLines={1}>
      {team.teamName}
    </Text>

    {busy ? (
      <ActivityIndicator size="small" color={COLORS.primary} />
    ) : (
      <>
        <TouchableOpacity
          style={styles.reqReject}
          activeOpacity={0.8}
          onPress={onReject}
        >
          <Ionicons name="close" size={18} color={COLORS.error} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reqApprove}
          activeOpacity={0.8}
          onPress={onApprove}
        >
          <Ionicons name="checkmark" size={18} color={COLORS.onPrimary} />
        </TouchableOpacity>
      </>
    )}
  </View>
);

export default function ManageTournamentScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { tournamentId } = route.params || {};

  const [tournament, setTournament] = useState(null);

  const [rounds, setRounds] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [busy, setBusy] = useState(null);

  /* Fixture being edited, and the scorer picker's target match. */

  const [editing, setEditing] = useState(null);

  const [scorerFor, setScorerFor] = useState(null);

  const [keyword, setKeyword] = useState("");

  const searchTimeout = useRef(null);

  const { players, loading: searching, searchPlayers, clearSearchResults } =
    useSearch();

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load = useCallback(async () => {
    try {
      const [detail, fixtures] = await Promise.all([
        getTournamentApi(tournamentId),
        getFixturesApi(tournamentId).catch(() => []),
      ]);

      setTournament(detail);

      setRounds(fixtures || []);
    } catch (err) {
      Alert.alert(
        "Load nahi hua",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, [tournamentId]);

  /*
  | Refetched on focus because the organizer leaves for the invite screen,
  | adds four teams, and comes back - a stale count here is exactly the
  | number they came back to check.
  */

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(
    () => () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    },
    [],
  );

  /*
  |--------------------------------------------------------------------------
  | Visibility
  |--------------------------------------------------------------------------
  */

  const setVisibility = async (payload, key) => {
    setBusy(key);

    /* Optimistic - a switch that lags behind the thumb feels broken. */

    setTournament((prev) => ({ ...prev, ...payload }));

    try {
      const updated = await setVisibilityApi(tournamentId, payload);

      setTournament((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      await load();

      Alert.alert(
        "Change nahi hua",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setBusy(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Join requests
  |--------------------------------------------------------------------------
  */

  const respondJoin = async (teamId, approve) => {
    setBusy(teamId);

    try {
      await respondJoinRequestApi(tournamentId, teamId, approve);

      await load();
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Request handle nahi hui.",
      );
    } finally {
      setBusy(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Generate
  |--------------------------------------------------------------------------
  */

  const generate = () => {
    const teams = tournament?.teams?.length || 0;

    Alert.alert(
      "Fixtures generate karein?",
      `${teams} teams ke saath poora schedule ban jayega. Iske baad team add ya remove nahi kar sakte - sirf withdraw.`,
      [
        { text: "Abhi nahi", style: "cancel" },
        {
          text: "Generate karo",
          onPress: async () => {
            setBusy("generate");

            try {
              const result = await generateFixturesApi(tournamentId);

              await load();

              Alert.alert(
                "Schedule taiyaar",
                `${result?.generated ?? ""} matches ban gaye. Har match ki date aur ground yahin se edit kar sakte ho.`,
              );
            } catch (err) {
              Alert.alert(
                "Generate nahi hua",
                err?.response?.data?.message || "Dobara try karo.",
              );
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Fixture edit
  |--------------------------------------------------------------------------
  */

  const openEditor = (match) => {
    setEditing({
      matchId: match._id,
      title: match.matchTitle || match.tournamentRound?.label || "Fixture",
      startTime: match.startTime || null,
      venueName: match.venueName || "",
      groundId: match.groundId || null,
      scorerUserId: match.scorerUserId || null,
    });
  };

  const saveFixture = async () => {
    setBusy("fixture");

    try {
      await updateFixtureApi(tournamentId, editing.matchId, {
        startTime: editing.startTime,
        venueName: editing.venueName,
        groundId: editing.groundId,
      });

      setEditing(null);

      await load();
    } catch (err) {
      Alert.alert(
        "Save nahi hua",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setBusy(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Scorer
  |--------------------------------------------------------------------------
  */

  const onSearchScorer = (text) => {
    setKeyword(text);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.trim().length < 3) {
      clearSearchResults();

      return;
    }

    searchTimeout.current = setTimeout(() => {
      searchPlayers(text.trim());
    }, 400);
  };

  const assignScorer = async (userId, name) => {
    setBusy("scorer");

    try {
      await assignMatchScorerApi(tournamentId, scorerFor.matchId, userId);

      setScorerFor(null);

      setKeyword("");

      clearSearchResults();

      await load();

      Alert.alert(
        userId ? "Scorer set ho gaya" : "Scoring wapas tumhare paas",
        userId
          ? `${name} ab is match ko score karega. Purane scorer ke rights khatam.`
          : "Ab ye match tum khud score karoge.",
      );
    } catch (err) {
      Alert.alert(
        "Nahi hua",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setBusy(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cancel
  |--------------------------------------------------------------------------
  */

  const cancelTournament = () => {
    Alert.alert(
      "Tournament cancel karein?",
      "Saari teams ko notification jayega aur bache hue matches cancel ho jayenge. Ye wapas nahi ho sakta.",
      [
        { text: "Nahi", style: "cancel" },
        {
          text: "Cancel karo",
          style: "destructive",
          onPress: async () => {
            setBusy("cancel");

            try {
              await cancelTournamentApi(tournamentId);

              navigation.goBack();
            } catch (err) {
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Cancel nahi hua.",
              );
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.center}>
        <Text style={styles.cardSubtitle}>Tournament nahi mila.</Text>
      </View>
    );
  }

  const status = STATUS_META[tournament.status] || STATUS_META.draft;

  const teams = tournament.teams || [];

  const requests = (tournament.pendingTeams || []).filter(
    (t) => t.status === "requested",
  );

  const invited = (tournament.pendingTeams || []).filter(
    (t) => t.status === "invited",
  );

  const locked = !!tournament.fixturesGeneratedAt;

  const grounds = tournament.grounds || [];

  const minTeams = 3;

  const canGenerate = !locked && teams.length >= minTeams;

  const squadsPending = teams.filter((t) => !t.squadLocked).length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);

              load();
            }}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── State ─────────────────────────────────────────────────── */}

        <View style={styles.hero}>
          <Text style={styles.heroName} numberOfLines={2}>
            {tournament.tournamentName}
          </Text>

          <View style={styles.heroMeta}>
            <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.fg }]}>
                {status.label}
              </Text>
            </View>

            <Text style={styles.heroDot}>·</Text>

            <Text style={styles.heroMetaText}>
              {teams.length}/{tournament.numberOfTeams} teams
            </Text>

            <Text style={styles.heroDot}>·</Text>

            <Text style={styles.heroMetaText}>{tournament.format}</Text>
          </View>
        </View>

        {/* ── Visibility ────────────────────────────────────────────── */}

        <Card
          icon="eye-outline"
          title="Visibility"
          subtitle="Kaun dekh sakta hai, aur kaun apni team laa sakta hai."
        >
          <ToggleRow
            label="Publish tournament"
            hint={
              tournament.isPublished
                ? "Sab users ko home aur Matches tab mein dikh raha hai."
                : "Abhi sirf tumhe dikh raha hai. Publish karne se pehle kam se kam ek ground zaroori hai."
            }
            value={tournament.isPublished}
            disabled={busy === "publish" || tournament.status === "cancelled"}
            onChange={(v) => setVisibility({ isPublished: v }, "publish")}
          />

          <View style={styles.divider} />

          <ToggleRow
            label="Public participation"
            hint={
              tournament.publicParticipation
                ? "Koi bhi captain join request bhej sakta hai - approve tum karoge."
                : "Sirf tumhare bheje hue invites se teams aayengi."
            }
            value={tournament.publicParticipation}
            disabled={busy === "public" || locked}
            onChange={(v) => setVisibility({ publicParticipation: v }, "public")}
          />
        </Card>

        {/* ── Join requests ─────────────────────────────────────────── */}

        {requests.length > 0 && (
          <Card
            icon="hand-left-outline"
            title={`${requests.length} join request${requests.length > 1 ? "s" : ""}`}
            subtitle="Approve karne par team seedha tournament mein aa jayegi."
          >
            {requests.map((team) => (
              <RequestRow
                key={String(team.teamId)}
                team={team}
                busy={busy === team.teamId}
                onApprove={() => respondJoin(team.teamId, true)}
                onReject={() => respondJoin(team.teamId, false)}
              />
            ))}
          </Card>
        )}

        {/* ── Teams ─────────────────────────────────────────────────── */}

        <Card
          icon="people-outline"
          title="Teams"
          subtitle={
            locked
              ? "Teams lock ho chuki hain."
              : `${teams.length} confirmed${invited.length ? `, ${invited.length} ka jawab baaki` : ""}.`
          }
        >
          {teams.map((team) => (
            <View key={String(team.teamId)} style={styles.teamRow}>
              <Text style={styles.teamSeed}>{team.seed || "-"}</Text>

              <Text style={styles.teamName} numberOfLines={1}>
                {team.teamName}
              </Text>

              <Text
                style={[
                  styles.teamSquad,
                  team.squadLocked && styles.teamSquadOk,
                ]}
              >
                {team.squadLocked ? "SQUAD OK" : `${team.squadSize}/15`}
              </Text>
            </View>
          ))}

          {teams.length === 0 && (
            <Text style={styles.emptyLine}>
              Abhi koi team confirm nahi hui.
            </Text>
          )}

          {!locked && (
            <ActionButton
              icon="person-add-outline"
              label="Teams invite karo"
              onPress={() =>
                navigation.navigate("InviteTeamsScreen", { tournamentId })
              }
            />
          )}

          {squadsPending > 0 && locked && (
            <Text style={styles.emptyLine}>
              {squadsPending} team{squadsPending > 1 ? "s" : ""} ki squad abhi
              lock nahi hui.
            </Text>
          )}
        </Card>

        {/* ── Fixtures ──────────────────────────────────────────────── */}

        <Card
          icon="calendar-outline"
          title="Fixtures"
          subtitle={
            locked
              ? "Date aur ground har match ke liye badal sakte ho."
              : `Kam se kam ${minTeams} teams chahiye. Generate karne ke baad teams lock ho jayengi.`
          }
        >
          {!locked && (
            <ActionButton
              icon="flash-outline"
              label="Teams lock karo aur fixtures banao"
              tone="primary"
              disabled={!canGenerate}
              busy={busy === "generate"}
              onPress={generate}
            />
          )}

          {locked && (
            <FixtureList
              rounds={rounds}
              canManage
              onPressMatch={(m) =>
                /*
                | Through QuickScoreFlow because that is where
                | MatchDetailsScreen is registered - see RootNavigator.
                | Naming it directly from a root screen does not resolve.
                */
                navigation.navigate("QuickScoreFlow", {
                  screen: "MatchDetailsScreen",
                  params: { matchId: m._id },
                })
              }
              onEditFixture={openEditor}
            />
          )}
        </Card>

        {/* ── Danger ────────────────────────────────────────────────── */}

        {tournament.status !== "cancelled" &&
          tournament.status !== "completed" && (
            <Card
              icon="warning-outline"
              title="Tournament cancel"
              subtitle="Saari teams ko batana ho toh yahin se."
              tone="danger"
            >
              <ActionButton
                icon="close-circle-outline"
                label="Cancel tournament"
                tone="danger"
                busy={busy === "cancel"}
                onPress={cancelTournament}
              />
            </Card>
          )}
      </ScrollView>

      {/* ── Fixture editor ──────────────────────────────────────────── */}

      <Modal
        visible={!!editing}
        transparent
        animationType="slide"
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {editing?.title}
              </Text>

              <TouchableOpacity onPress={() => setEditing(null)}>
                <Ionicons name="close" size={22} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetScroll}
              keyboardShouldPersistTaps="handled"
            >
              <DatePickerField
                label="Match date"
                value={editing?.startTime}
                onChange={(iso) =>
                  setEditing((prev) => ({ ...prev, startTime: iso }))
                }
              />

              <Text style={styles.fieldLabel}>GROUND</Text>

              {grounds.map((g) => {
                const id = String(g.groundId || g.name);

                const active =
                  editing?.venueName === g.name ||
                  (!!g.groundId && editing?.groundId === g.groundId);

                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.groundRow, active && styles.groundRowOn]}
                    activeOpacity={0.85}
                    onPress={() =>
                      setEditing((prev) => ({
                        ...prev,
                        venueName: g.name,
                        groundId: g.groundId || null,
                      }))
                    }
                  >
                    <Ionicons
                      name={active ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={active ? COLORS.primary : COLORS.outline}
                    />

                    <View style={styles.groundText}>
                      <Text style={styles.groundName}>{g.name}</Text>

                      {!!g.address && (
                        <Text style={styles.groundAddr} numberOfLines={1}>
                          {g.address}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/*
              | A free-text venue as well as the list, because a ground gets
              | changed at two days' notice to somewhere that was never in
              | the tournament's list, and the alternative is the organizer
              | telling twenty players over WhatsApp instead.
              */}

              <Text style={styles.fieldLabel}>YA KOI AUR JAGAH</Text>

              <TextInput
                style={styles.input}
                value={editing?.venueName}
                placeholder="Ground ka naam"
                placeholderTextColor={COLORS.outline}
                onChangeText={(t) =>
                  setEditing((prev) => ({ ...prev, venueName: t, groundId: null }))
                }
              />

              <View style={styles.divider} />

              <ActionButton
                icon="person-outline"
                label="Is match ka scorer badlo"
                onPress={() => {
                  setScorerFor({ matchId: editing.matchId, title: editing.title });

                  setEditing(null);
                }}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.sheetSave}
              activeOpacity={0.85}
              disabled={busy === "fixture"}
              onPress={saveFixture}
            >
              {busy === "fixture" ? (
                <ActivityIndicator size="small" color={COLORS.onPrimary} />
              ) : (
                <Text style={styles.sheetSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Scorer picker ───────────────────────────────────────────── */}

      <Modal
        visible={!!scorerFor}
        transparent
        animationType="slide"
        onRequestClose={() => setScorerFor(null)}
      >
        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                Scorer - {scorerFor?.title}
              </Text>

              <TouchableOpacity onPress={() => setScorerFor(null)}>
                <Ionicons name="close" size={22} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetHint}>
              Jise dogo wo sirf isi match ko score kar payega. Purane scorer ke
              rights usi waqt khatam ho jayenge, aur tum kabhi bhi wapas le
              sakte ho.
            </Text>

            <TextInput
              style={styles.input}
              value={keyword}
              placeholder="Naam ya mobile se dhoondo"
              placeholderTextColor={COLORS.outline}
              autoCapitalize="words"
              autoCorrect={false}
              onChangeText={onSearchScorer}
            />

            <ScrollView
              style={styles.sheetScroll}
              keyboardShouldPersistTaps="handled"
            >
              {searching && (
                <ActivityIndicator
                  style={styles.searchSpin}
                  color={COLORS.primary}
                />
              )}

              {!searching &&
                players
                  .filter((p) => p.userId?._id || p.userId)
                  .map((p) => (
                    <TouchableOpacity
                      key={p._id}
                      style={styles.scorerRow}
                      activeOpacity={0.85}
                      onPress={() =>
                        assignScorer(
                          String(p.userId?._id || p.userId),
                          p.playerName,
                        )
                      }
                    >
                      <View style={styles.scorerAvatar}>
                        <Ionicons name="person" size={17} color={COLORS.onPrimary} />
                      </View>

                      <View style={styles.scorerInfo}>
                        <Text style={styles.scorerName}>{p.playerName}</Text>

                        {!!p.userId?.phone && (
                          <Text style={styles.scorerPhone}>
                            {p.userId.phone}
                          </Text>
                        )}
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={19}
                        color={COLORS.outline}
                      />
                    </TouchableOpacity>
                  ))}

              {!searching && keyword.trim().length >= 3 && players.length === 0 && (
                <Text style={styles.emptyLine}>
                  Koi CricIn user nahi mila.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.sheetGhost}
              activeOpacity={0.85}
              disabled={busy === "scorer"}
              onPress={() => assignScorer(null)}
            >
              <Text style={styles.sheetGhostText}>
                Main khud score karunga
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  content: { padding: 16, paddingBottom: 40 },

  /* ── Hero ─────────────────────────────────────────────────────── */

  hero: { marginBottom: 14 },

  heroName: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.onSurface,
  },

  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 7,
  },

  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
  },

  statusText: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  heroDot: { color: COLORS.outline, fontSize: 12 },

  heroMetaText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  /* ── Card ─────────────────────────────────────────────────────── */

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 14,
    marginBottom: 14,
  },

  cardHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },

  cardIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E2EDE0",
    alignItems: "center",
    justifyContent: "center",
  },

  cardIconDanger: { backgroundColor: COLORS.errorContainer },

  cardHeadText: { flex: 1 },

  cardTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.onSurface,
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16.5,
    color: COLORS.onSurfaceVariant,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 12,
  },

  /* ── Toggle ───────────────────────────────────────────────────── */

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  toggleText: { flex: 1 },

  toggleLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  toggleHint: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Action ───────────────────────────────────────────────────── */

  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    marginTop: 10,
  },

  actionPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  actionDanger: { borderColor: COLORS.error },

  actionOff: { borderColor: COLORS.outlineVariant, opacity: 0.55 },

  actionText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.primary,
  },

  actionTextPrimary: { color: COLORS.onPrimary },

  actionTextDanger: { color: COLORS.error },

  /* ── Requests ─────────────────────────────────────────────────── */

  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 8,
  },

  reqAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  reqName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  reqReject: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },

  reqApprove: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Teams ────────────────────────────────────────────────────── */

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },

  teamSeed: {
    width: 20,
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.outline,
  },

  teamName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  teamSquad: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
    color: COLORS.secondary,
  },

  teamSquadOk: { color: COLORS.primary },

  emptyLine: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Sheets ───────────────────────────────────────────────────── */

  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    maxHeight: "85%",
  },

  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  sheetTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.onSurface,
  },

  sheetHint: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: COLORS.onSurfaceVariant,
    marginBottom: 12,
  },

  sheetScroll: { maxHeight: 380 },

  sheetSave: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
  },

  sheetSaveText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  sheetGhost: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 12,
  },

  sheetGhostText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },

  /* ── Fields ───────────────────────────────────────────────────── */

  fieldLabel: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },

  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    color: COLORS.onSurface,
  },

  groundRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },

  groundRowOn: { borderColor: COLORS.primary, backgroundColor: "#F2F8F0" },

  groundText: { flex: 1 },

  groundName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  groundAddr: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Scorer ───────────────────────────────────────────────────── */

  searchSpin: { marginVertical: 20 },

  scorerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 9,
  },

  scorerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  scorerInfo: { flex: 1 },

  scorerName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  scorerPhone: {
    marginTop: 2,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },
});
