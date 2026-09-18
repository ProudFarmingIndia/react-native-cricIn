/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Series
|
| File:
| ManageSeriesScreen.js
|
| Description:
| Everything only the organizer can do, in the order they do it: publish
| it, find an opponent, generate the schedule, then run it.
|
| WHY THE OPPONENT SEARCH IS ON THIS SCREEN AND NOT ITS OWN
| A tournament invites up to thirty-two teams, so searching and inviting
| is a job with its own screen. A series invites ONE team, once. Sending
| the organizer to a separate screen to make one choice, and back again,
| is a round trip for a single tap.
|
| THE ONE IRREVERSIBLE ACTION
| "Fixtures banao" writes the whole schedule and freezes the shape - the
| number of matches, the overs, the format. So it asks first and says what
| it is about to create.
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
  Keyboard,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import DatePickerField from "../../../components/common/DatePickerField";

import { COLORS } from "../../../constants/colors";

import FixtureList from "../../tournaments/components/FixtureList";

import useSearch from "../../search/hooks/useSearch";

import {
  SERIES_STATUS_META,
  OPPONENT_STATUS_META,
} from "../constants/seriesConstants";

import {
  getSeriesApi,
  getSeriesFixturesApi,
  setSeriesVisibilityApi,
  inviteOpponentApi,
  generateSeriesFixturesApi,
  updateSeriesFixtureApi,
  assignSeriesScorerApi,
  cancelSeriesApi,
} from "../services/series.service";

/*
| All at module scope - a new component type on every toggle flip would
| tear down and rebuild the whole page instead of re-rendering it.
*/

const Card = ({ icon, title, subtitle, children, tone }) => (
  <View style={styles.card}>
    <View style={styles.cardHead}>
      <View style={[styles.cardIcon, tone === "danger" && styles.cardIconDanger]}>
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

const TeamRow = ({ name, subtitle, busy, icon, tint, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    activeOpacity={onPress ? 0.85 : 1}
    disabled={!onPress || busy}
    onPress={onPress}
  >
    <View style={styles.rowAvatar}>
      <Ionicons name="shield" size={18} color={COLORS.onPrimary} />
    </View>

    <View style={styles.rowInfo}>
      <Text style={styles.rowTitle} numberOfLines={1}>
        {name}
      </Text>

      {!!subtitle && (
        <Text style={styles.rowSub} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>

    {busy ? (
      <ActivityIndicator size="small" color={COLORS.primary} />
    ) : (
      !!icon && <Ionicons name={icon} size={22} color={tint || COLORS.primary} />
    )}
  </TouchableOpacity>
);

export default function ManageSeriesScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { seriesId } = route.params || {};

  const [series, setSeries] = useState(null);

  const [rounds, setRounds] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [busy, setBusy] = useState(null);

  const [editing, setEditing] = useState(null);

  const [scorerFor, setScorerFor] = useState(null);

  const [keyword, setKeyword] = useState("");

  const [scorerKeyword, setScorerKeyword] = useState("");

  const teamTimeout = useRef(null);

  const scorerTimeout = useRef(null);

  const {
    teams: teamResults,
    players,
    loading: searching,
    searchTeams,
    searchPlayers,
    clearSearchResults,
  } = useSearch();

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load = useCallback(async () => {
    try {
      const [detail, fixtures] = await Promise.all([
        getSeriesApi(seriesId),
        getSeriesFixturesApi(seriesId).catch(() => []),
      ]);

      setSeries(detail);

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
  }, [seriesId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(
    () => () => {
      if (teamTimeout.current) clearTimeout(teamTimeout.current);

      if (scorerTimeout.current) clearTimeout(scorerTimeout.current);
    },
    [],
  );

  /*
  |--------------------------------------------------------------------------
  | Visibility
  |--------------------------------------------------------------------------
  */

  const togglePublish = async (value) => {
    setBusy("publish");

    /* Optimistic - a switch that lags behind the thumb feels broken. */
    setSeries((prev) => ({ ...prev, isPublished: value }));

    try {
      const updated = await setSeriesVisibilityApi(seriesId, value);

      setSeries((prev) => ({ ...prev, ...updated }));
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
  | Opponent
  |--------------------------------------------------------------------------
  */

  const onSearchTeam = (text) => {
    setKeyword(text);

    if (teamTimeout.current) clearTimeout(teamTimeout.current);

    if (text.trim().length < 3) {
      clearSearchResults();

      return;
    }

    teamTimeout.current = setTimeout(() => searchTeams(text.trim()), 400);
  };

  const invite = async (team) => {
    Keyboard.dismiss();

    const teamId = String(team._id || team.teamId);

    setBusy(teamId);

    try {
      await inviteOpponentApi(seriesId, teamId);

      setKeyword("");

      clearSearchResults();

      await load();

      Alert.alert(
        "Challenge bhej diya",
        `${team.teamName} ke captain ko notification chala gaya hai.`,
      );
    } catch (err) {
      Alert.alert(
        "Invite nahi gaya",
        err?.response?.data?.message || "Dobara try karo.",
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
    Alert.alert(
      "Fixtures banayein?",
      `${series?.totalMatches} match schedule ho jayenge. Iske baad match count, overs aur format nahi badal sakte — sirf har match ki date aur ground.`,
      [
        { text: "Abhi nahi", style: "cancel" },
        {
          text: "Banao",
          onPress: async () => {
            setBusy("generate");

            try {
              const result = await generateSeriesFixturesApi(seriesId);

              await load();

              Alert.alert(
                "Schedule taiyaar",
                `${result?.generated ?? ""} match ban gaye. Dono captains ko notification chala gaya hai.`,
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
      title: match.seriesMatchNumber
        ? `Match ${match.seriesMatchNumber}`
        : match.matchTitle || "Fixture",
      startTime: match.startTime || null,
      venueName: match.venueName || "",
      groundId: match.groundId || null,
    });
  };

  /*
  | If the detail screen sent us here to edit one fixture, open it as soon
  | as the fixtures arrive. Guarded on `editing` so a refresh does not
  | reopen the sheet after the organizer has closed it.
  */

  useEffect(() => {
    const wanted = route.params?.editFixtureId;

    if (!wanted || editing) return;

    const all = rounds.flatMap((r) => r.matches || []);

    const match = all.find((m) => String(m._id) === String(wanted));

    if (match) {
      openEditor(match);

      navigation.setParams({ editFixtureId: undefined });
    }
  }, [rounds, route.params?.editFixtureId, editing, navigation]);

  const saveFixture = async () => {
    setBusy("fixture");

    try {
      await updateSeriesFixtureApi(seriesId, editing.matchId, {
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
    setScorerKeyword(text);

    if (scorerTimeout.current) clearTimeout(scorerTimeout.current);

    if (text.trim().length < 3) {
      clearSearchResults();

      return;
    }

    scorerTimeout.current = setTimeout(() => searchPlayers(text.trim()), 400);
  };

  const assignScorer = async (userId, name) => {
    setBusy("scorer");

    try {
      await assignSeriesScorerApi(seriesId, scorerFor.matchId, userId);

      setScorerFor(null);

      setScorerKeyword("");

      clearSearchResults();

      await load();

      Alert.alert(
        userId ? "Scorer set ho gaya" : "Scoring wapas tumhare paas",
        userId
          ? `${name} ab is match ko score karega. Purane scorer ke rights khatam.`
          : "Ab ye match tum khud score karoge.",
      );
    } catch (err) {
      Alert.alert("Nahi hua", err?.response?.data?.message || "Dobara try karo.");
    } finally {
      setBusy(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cancel
  |--------------------------------------------------------------------------
  */

  const cancelSeries = () => {
    Alert.alert(
      "Series cancel karein?",
      "Opponent ko notification jayega aur bache hue match cancel ho jayenge. Khele hue match jaise hain waise rahenge.",
      [
        { text: "Nahi", style: "cancel" },
        {
          text: "Cancel karo",
          style: "destructive",
          onPress: async () => {
            setBusy("cancel");

            try {
              await cancelSeriesApi(seriesId);

              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err?.response?.data?.message || "Nahi hua.");
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

  if (!series) {
    return (
      <View style={styles.center}>
        <Text style={styles.cardSubtitle}>Series nahi mila.</Text>
      </View>
    );
  }

  const status = SERIES_STATUS_META[series.status] || SERIES_STATUS_META.draft;

  const opponentMeta = OPPONENT_STATUS_META[series.opponentStatus];

  const locked = !!series.fixturesGeneratedAt;

  const hasOpponent = series.opponentStatus === "accepted";

  const grounds = series.grounds || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
            {series.seriesName}
          </Text>

          <View style={styles.heroMeta}>
            <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.fg }]}>
                {status.label}
              </Text>
            </View>

            <Text style={styles.heroDot}>·</Text>

            <Text style={styles.heroMetaText}>
              {series.totalMatches} match {series.matchType}
            </Text>

            <Text style={styles.heroDot}>·</Text>

            <Text style={styles.heroMetaText}>
              {series.teamAWins ?? 0}-{series.teamBWins ?? 0}
            </Text>
          </View>
        </View>

        {/* ── Visibility ────────────────────────────────────────────── */}

        <Card
          icon="eye-outline"
          title="Visibility"
          subtitle="Publish karne par sab users ko dikhega."
        >
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleLabel}>Publish series</Text>

              <Text style={styles.toggleHint}>
                {series.isPublished
                  ? "Sab users ko home aur Matches tab mein dikh raha hai."
                  : "Abhi sirf tumhe dikh raha hai. Publish se pehle kam se kam ek ground zaroori hai."}
              </Text>
            </View>

            <Switch
              value={!!series.isPublished}
              disabled={busy === "publish" || series.status === "cancelled"}
              onValueChange={togglePublish}
              trackColor={{
                false: COLORS.outlineVariant,
                true: COLORS.onPrimaryContainer,
              }}
              thumbColor={
                series.isPublished ? COLORS.primary : COLORS.surfaceContainerHighest
              }
            />
          </View>
        </Card>

        {/* ── Opponent ──────────────────────────────────────────────── */}

        <Card
          icon="people-outline"
          title="Opponent"
          subtitle={
            hasOpponent
              ? "Opponent confirm ho chuka hai."
              : "Ek team ko challenge bhejo. Notification uske captain ko jayegi."
          }
        >
          <TeamRow
            name={series.teamA?.teamName || "Tumhari team"}
            subtitle="Tumhari team"
          />

          {series.teamB ? (
            <TeamRow
              name={series.teamB.teamName}
              subtitle={opponentMeta?.label}
              icon={hasOpponent ? "checkmark-circle" : "time-outline"}
              tint={hasOpponent ? COLORS.primary : COLORS.secondary}
            />
          ) : (
            <Text style={styles.emptyLine}>Abhi koi opponent nahi.</Text>
          )}

          {/*
          | The search stays available while the invite is pending or
          | declined, because changing your mind about an opponent is a
          | normal thing to do and the server treats a fresh invite as a
          | replacement. It closes once they accept, or once fixtures
          | exist - both of those make the opponent final.
          */}

          {!locked && !hasOpponent && (
            <>
              <Text style={styles.searchTitle}>TEAM DHOONDHO</Text>

              <TextInput
                style={styles.input}
                value={keyword}
                placeholder="Team ka naam likho"
                placeholderTextColor={COLORS.outline}
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={onSearchTeam}
              />

              {searching && (
                <ActivityIndicator style={styles.spin} color={COLORS.primary} />
              )}

              {!searching &&
                (teamResults || [])
                  .filter(
                    (t) =>
                      String(t._id) !== String(series.teamA?._id ?? series.teamA),
                  )
                  .map((t) => (
                    <TeamRow
                      key={String(t._id)}
                      name={t.teamName}
                      subtitle={t.city || t.homeGround}
                      busy={busy === String(t._id)}
                      icon="send"
                      onPress={() => invite(t)}
                    />
                  ))}

              {!searching &&
                keyword.trim().length >= 3 &&
                (teamResults || []).length === 0 && (
                  <Text style={styles.emptyLine}>
                    Koi team nahi mili. Poora naam try karo.
                  </Text>
                )}
            </>
          )}
        </Card>

        {/* ── Fixtures ──────────────────────────────────────────────── */}

        <Card
          icon="calendar-outline"
          title="Fixtures"
          subtitle={
            locked
              ? "Har match ki date aur ground badal sakte ho."
              : "Opponent ke accept karne ke baad schedule ban sakta hai."
          }
        >
          {!locked && (
            <ActionButton
              icon="flash-outline"
              label={`${series.totalMatches} match ka schedule banao`}
              tone="primary"
              disabled={!hasOpponent}
              busy={busy === "generate"}
              onPress={generate}
            />
          )}

          {locked && (
            <FixtureList
              rounds={rounds}
              canManage
              onPressMatch={(m) =>
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

        {series.status !== "cancelled" && series.status !== "completed" && (
          <Card
            icon="warning-outline"
            title="Series cancel"
            subtitle="Khele hue match jaise hain waise rahenge."
            tone="danger"
          >
            <ActionButton
              icon="close-circle-outline"
              label="Cancel series"
              tone="danger"
              busy={busy === "cancel"}
              onPress={cancelSeries}
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

            <ScrollView style={styles.sheetScroll} keyboardShouldPersistTaps="handled">
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
              | A free-text venue as well as the list, because a ground
              | gets changed at two days' notice to somewhere that was
              | never in the series' list.
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
                  setScorerFor({
                    matchId: editing.matchId,
                    title: editing.title,
                  });

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
              value={scorerKeyword}
              placeholder="Naam ya mobile se dhoondo"
              placeholderTextColor={COLORS.outline}
              autoCapitalize="words"
              autoCorrect={false}
              onChangeText={onSearchScorer}
            />

            <ScrollView style={styles.sheetScroll} keyboardShouldPersistTaps="handled">
              {searching && (
                <ActivityIndicator style={styles.spin} color={COLORS.primary} />
              )}

              {!searching &&
                (players || [])
                  .filter((p) => p.userId?._id || p.userId)
                  .map((p) => (
                    <TouchableOpacity
                      key={String(p._id)}
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
                          <Text style={styles.scorerPhone}>{p.userId.phone}</Text>
                        )}
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={19}
                        color={COLORS.outline}
                      />
                    </TouchableOpacity>
                  ))}

              {!searching &&
                scorerKeyword.trim().length >= 3 &&
                (players || []).length === 0 && (
                  <Text style={styles.emptyLine}>Koi CricIn user nahi mila.</Text>
                )}
            </ScrollView>

            <TouchableOpacity
              style={styles.sheetGhost}
              activeOpacity={0.85}
              disabled={busy === "scorer"}
              onPress={() => assignScorer(null)}
            >
              <Text style={styles.sheetGhostText}>Main khud score karunga</Text>
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

  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12 },

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

  /* ── Rows ─────────────────────────────────────────────────────── */

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 9,
  },

  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  rowInfo: { flex: 1, marginLeft: 11 },

  rowTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  rowSub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: COLORS.onSurfaceVariant,
  },

  emptyLine: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  searchTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },

  spin: { marginVertical: 18 },

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
