/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Series
|
| File:
| SeriesDetailScreen.js
|
| Description:
| One series, one screen, whether you are the organizer, a captain playing
| in it, or somebody who just found it.
|
| WHAT IS THE SAME FOR EVERYONE
| Overview, Fixtures, Awards, Stats and Highlights. All of it. A series is
| a public event and hiding its result from people who did not play would
| be pointless.
|
| WHAT IS NOT
| The Settings tab, which is the organizer's control panel and appears for
| nobody else. Not because the numbers in it are secret, but because every
| control in it WRITES - publish, invite, generate, assign a scorer,
| cancel - and a wall of buttons that will all be refused is worse than no
| tab at all.
|
| The opponent captain gets one extra thing: the accept strip, which is
| the only decision anybody other than the organizer makes in a series.
|
| THERE IS NO POINTS TABLE TAB
| Two teams. The scoreline in the hero is the whole answer, and a two-row
| table with one meaningful column would be a worse way to show one
| number than showing the number.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import useSeries from "../hooks/useSeries";

import Scoreline from "../components/Scoreline";

import FixtureList from "../../tournaments/components/FixtureList";
import AwardsList from "../../tournaments/components/AwardsList";
import StatBoards from "../../tournaments/components/StatBoards";
import PlayerPickerModal from "../../tournaments/components/PlayerPickerModal";
import { PrizeBanner } from "../../tournaments/components/PrizeList";

import HighlightsFeed from "../../highlights/components/HighlightsFeed";

import {
  setSeriesAwardWinnerApi,
  respondToSeriesInviteApi,
} from "../services/series.service";

import {
  SERIES_STATUS_META,
  OPPONENT_STATUS_META,
} from "../constants/seriesConstants";

/*
| Module scope. Defined inside the component, switching tabs would give
| React a new component type for these and remount the whole page instead
| of re-rendering it.
*/

const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={COLORS.onSurfaceVariant} />

      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

const formatDate = (v) => {
  if (!v) return null;

  const d = new Date(v);

  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

export default function SeriesDetailScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { seriesId } = route.params || {};

  const {
    series,
    scoreline,
    fixtures,
    stats,
    awards,
    loading,
    reload,
    loadSection,
    isOrganizer,
    myInvite,
    isFinished,
  } = useSeries(seriesId);

  const [tab, setTab] = useState("Overview");

  const [refreshing, setRefreshing] = useState(false);

  const [picking, setPicking] = useState(null);

  const [savingWinner, setSavingWinner] = useState(false);

  const [answering, setAnswering] = useState(false);

  const [highlightMatchId, setHighlightMatchId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      reload(true);
    }, [reload]),
  );

  const tabs = useMemo(
    () =>
      [
        "Overview",
        "Fixtures",
        "Awards",
        "Stats",
        "Highlights",
        isOrganizer ? "Settings" : null,
      ].filter(Boolean),
    [isOrganizer],
  );

  /*
  | Each tab fetches the first time it is shown. Driven by the tab value
  | rather than by the press handler, so a screen that OPENS on a tab
  | still loads it.
  */

  useEffect(() => {
    if (tab === "Fixtures" || tab === "Highlights") loadSection("fixtures");

    if (tab === "Stats") loadSection("stats");

    if (tab === "Awards") loadSection("awards");

    if (tab === "Settings") reload(true);
  }, [tab, loadSection, reload]);

  /*
  | The Overview needs fixtures too - the dot strip under the scoreline is
  | drawn from them. Loaded here rather than only on the Fixtures tab,
  | because most people never leave Overview and would see an empty strip.
  */

  useEffect(() => {
    loadSection("fixtures");
  }, [loadSection]);

  const playedMatches = useMemo(() => {
    const all = (fixtures || []).flatMap((round) => round.matches || []);

    return all
      .filter((m) => m.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.startTime || 0).getTime() -
          new Date(a.startTime || 0).getTime(),
      );
  }, [fixtures]);

  useEffect(() => {
    if (!highlightMatchId && playedMatches.length) {
      setHighlightMatchId(String(playedMatches[0]._id));
    }
  }, [playedMatches, highlightMatchId]);

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  const openMatch = (match) =>
    /*
    | Through QuickScoreFlow because that is where MatchDetailsScreen is
    | registered - see RootNavigator. Naming it directly from a root
    | screen does not resolve.
    */
    navigation.navigate("QuickScoreFlow", {
      screen: "MatchDetailsScreen",
      params: { matchId: match._id },
    });

  const answer = async (accept) => {
    setAnswering(true);

    try {
      await respondToSeriesInviteApi(seriesId, accept);

      await reload(true);

      Alert.alert(
        accept ? "Accept ho gaya" : "Reject ho gaya",
        accept
          ? "Ab organiser fixtures banayega. Schedule aate hi notification aa jayegi."
          : "Organiser ko bata diya gaya hai.",
      );
    } catch (err) {
      Alert.alert(
        "Nahi hua",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setAnswering(false);
    }
  };

  const saveWinner = async (playerId, name) => {
    setSavingWinner(true);

    try {
      await setSeriesAwardWinnerApi(seriesId, picking.metric, playerId);

      setPicking(null);

      await loadSection("awards", true);

      if (playerId) {
        Alert.alert("Winner set ho gaya", `${name} ko "${picking.label}" mila.`);
      }
    } catch (err) {
      Alert.alert(
        "Set nahi hua",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setSavingWinner(false);
    }
  };

  const clearWinner = async (award) => {
    Alert.alert(
      "App par chhod dein?",
      `"${award.label}" ka winner phir se apne aap decide hoga.`,
      [
        { text: "Rehne do", style: "cancel" },
        {
          text: "Haan",
          onPress: async () => {
            try {
              await setSeriesAwardWinnerApi(seriesId, award.metric, null);

              await loadSection("awards", true);
            } catch (err) {
              Alert.alert("Error", err?.response?.data?.message || "Nahi hua.");
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

  if (loading && !series) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!series) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={COLORS.outline} />

        <Text style={styles.emptyText}>Series nahi mila.</Text>
      </View>
    );
  }

  const status = SERIES_STATUS_META[series.status] || SERIES_STATUS_META.draft;

  const opponentMeta = OPPONENT_STATUS_META[series.opponentStatus];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);

            await reload(true);

            setRefreshing(false);
          }}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* ── Hero ──────────────────────────────────────────────────── */}

      <View style={styles.hero}>
        {series.bannerImage ? (
          <Image
            source={{ uri: series.bannerImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : null}

        {series.bannerImage ? <View style={styles.scrim} /> : null}

        <View style={styles.heroTop}>
          <View style={[styles.pill, { backgroundColor: status.bg }]}>
            <Text style={[styles.pillText, { color: status.fg }]}>
              {status.label}
            </Text>
          </View>

          <Text style={styles.heroLength}>
            {series.totalMatches} MATCH {series.matchType}
          </Text>
        </View>

        <View>
          <Text style={styles.heroName} numberOfLines={2}>
            {series.seriesName}
          </Text>

          <View style={styles.heroPrize}>
            <PrizeBanner prizes={series.prizes} prizePool={series.prizePool} />
          </View>
        </View>
      </View>

      {/* ── Opponent captain's invite strip ───────────────────────── */}

      {!!myInvite && (
        <View style={styles.inviteStrip}>
          <View style={styles.inviteHead}>
            <Ionicons
              name="mail-unread-outline"
              size={18}
              color={COLORS.secondary}
            />

            <View style={styles.inviteText}>
              <Text style={styles.inviteTitle}>
                {myInvite.teamName} ko series challenge mila hai
              </Text>

              <Text style={styles.inviteBody}>
                {series.totalMatches} match, {series.matchType}, {series.overs}{" "}
                overs. Accept karne par organiser fixtures bana dega.
              </Text>
            </View>
          </View>

          <View style={styles.inviteActions}>
            <TouchableOpacity
              style={styles.rejectBtn}
              activeOpacity={0.85}
              disabled={answering}
              onPress={() => answer(false)}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              activeOpacity={0.85}
              disabled={answering}
              onPress={() => answer(true)}
            >
              {answering ? (
                <ActivityIndicator size="small" color={COLORS.onPrimary} />
              ) : (
                <Text style={styles.acceptText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────── */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
      >
        {tabs.map((name) => (
          <TouchableOpacity
            key={name}
            style={[styles.tab, tab === name && styles.tabOn]}
            activeOpacity={0.85}
            onPress={() => setTab(name)}
          >
            <Text style={[styles.tabText, tab === name && styles.tabTextOn]}>
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.body}>
        {/* ── Overview ───────────────────────────────────────────── */}

        {tab === "Overview" && (
          <>
            <Scoreline scoreline={scoreline} fixtures={fixtures} />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>DETAILS</Text>

              <InfoRow
                icon="person-outline"
                label="Organiser"
                value={series.userId?.name}
              />

              <InfoRow
                icon="shield-outline"
                label="Opponent"
                value={
                  series.teamB?.teamName ||
                  (series.opponentStatus === "pending"
                    ? "Invite bheja hua hai"
                    : "Abhi tay nahi")
                }
              />

              <InfoRow
                icon="baseball-outline"
                label="Format"
                value={`${series.matchType} · ${series.overs} overs · ${series.ballType}`}
              />

              <InfoRow
                icon="calendar-outline"
                label="Dates"
                value={
                  formatDate(series.startDate)
                    ? `${formatDate(series.startDate)}${
                        formatDate(series.endDate)
                          ? ` – ${formatDate(series.endDate)}`
                          : ""
                      }`
                    : null
                }
              />

              <InfoRow
                icon="location-outline"
                label="Grounds"
                value={(series.grounds || []).map((g) => g.name).join(", ")}
              />

              <InfoRow
                icon="business-outline"
                label="Shehar"
                value={series.city}
              />
            </View>

            {!!opponentMeta && series.opponentStatus !== "accepted" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>OPPONENT</Text>

                <Text style={[styles.statusLine, { color: opponentMeta.fg }]}>
                  {opponentMeta.label}
                </Text>
              </View>
            )}

            {!!series.description && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>RULES & DETAILS</Text>

                <Text style={styles.description}>{series.description}</Text>
              </View>
            )}
          </>
        )}

        {/* ── Fixtures ───────────────────────────────────────────── */}

        {/*
        | The server returns a series' fixtures in the SAME round-grouped
        | shape a tournament's use, so this is the tournament's own
        | FixtureList with no branch and no series-specific copy of it.
        */}

        {tab === "Fixtures" && (
          <FixtureList
            rounds={fixtures}
            onPressMatch={openMatch}
            canManage={isOrganizer}
            onEditFixture={(match) =>
              navigation.navigate("ManageSeriesScreen", {
                seriesId,
                editFixtureId: match._id,
              })
            }
          />
        )}

        {/* ── Awards ─────────────────────────────────────────────── */}

        {tab === "Awards" && (
          <AwardsList
            awards={awards.awards}
            prizes={awards.prizes}
            canManage={isOrganizer}
            finished={isFinished}
            onPick={setPicking}
            onClear={clearWinner}
          />
        )}

        {/* ── Stats ──────────────────────────────────────────────── */}

        {tab === "Stats" && (
          <StatBoards
            boards={stats?.boards || {}}
            emptyText="Abhi koi match complete nahi hua. Pehla match khatam hote hi yahan stats aa jayenge."
          />
        )}

        {/* ── Highlights ─────────────────────────────────────────── */}

        {tab === "Highlights" && (
          <>
            {playedMatches.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.emptyText}>
                  Abhi koi match complete nahi hua.
                </Text>
              </View>
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.matchChips}
                >
                  {playedMatches.map((m) => {
                    const active = String(m._id) === String(highlightMatchId);

                    return (
                      <TouchableOpacity
                        key={String(m._id)}
                        style={[styles.matchChip, active && styles.matchChipOn]}
                        activeOpacity={0.85}
                        onPress={() => setHighlightMatchId(String(m._id))}
                      >
                        <Text
                          style={[
                            styles.matchChipText,
                            active && styles.matchChipTextOn,
                          ]}
                          numberOfLines={1}
                        >
                          {m.seriesMatchNumber
                            ? `Match ${m.seriesMatchNumber}`
                            : m.matchTitle}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {!!highlightMatchId && (
                  <HighlightsFeed matchId={highlightMatchId} nested />
                )}
              </>
            )}
          </>
        )}

        {/* ── Settings ───────────────────────────────────────────── */}

        {tab === "Settings" && isOrganizer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ORGANISER CONTROLS</Text>

            <Text style={styles.settingsIntro}>
              Publish, opponent, fixtures, scorer aur cancel — sab manage
              screen par hai.
            </Text>

            {[
              {
                icon: "options-outline",
                label: "Manage series",
                hint: "Publish, opponent invite, fixtures, scorer",
                go: () => navigation.navigate("ManageSeriesScreen", { seriesId }),
              },
              {
                icon: "create-outline",
                label: "Series details edit karo",
                hint: "Naam, dates, grounds, prizes, awards",
                go: () => navigation.navigate("CreateSeriesScreen", { seriesId }),
              },
            ].map((row) => (
              <TouchableOpacity
                key={row.label}
                style={styles.settingsRow}
                activeOpacity={0.85}
                onPress={row.go}
              >
                <View style={styles.settingsIcon}>
                  <Ionicons name={row.icon} size={17} color={COLORS.primary} />
                </View>

                <View style={styles.settingsText}>
                  <Text style={styles.settingsLabel}>{row.label}</Text>

                  <Text style={styles.settingsHint}>{row.hint}</Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.outline}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <PlayerPickerModal
        visible={!!picking}
        award={picking}
        leaderboards={awards.leaderboards}
        saving={savingWinner}
        onSelect={saveWinner}
        onClose={() => setPicking(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  content: { paddingBottom: 50 },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: 26,
    gap: 10,
  },

  /* ── Hero ─────────────────────────────────────────────────────── */

  hero: {
    height: 152,
    backgroundColor: COLORS.primary,
    padding: 14,
    justifyContent: "space-between",
  },

  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  pillText: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  heroLength: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.85)",
  },

  heroName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
  },

  heroPrize: { marginTop: 8 },

  /* ── Invite strip ─────────────────────────────────────────────── */

  inviteStrip: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: "#FFF3E0",
    borderRadius: 14,
    padding: 13,
  },

  inviteHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  inviteText: { flex: 1 },

  inviteTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.onSurface,
  },

  inviteBody: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  inviteActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
  },

  rejectBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    paddingVertical: 11,
    alignItems: "center",
  },

  rejectText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.error,
  },

  acceptBtn: {
    flex: 1.4,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  acceptText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  /* ── Tabs ─────────────────────────────────────────────────────── */

  tabScroll: { marginTop: 14 },

  tabRow: { paddingHorizontal: 16, gap: 8 },

  tab: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  tabOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  tabText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  tabTextOn: { color: COLORS.onPrimary },

  body: { padding: 16 },

  /* ── Cards ────────────────────────────────────────────────────── */

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 14,
    marginTop: 14,
  },

  cardTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  infoLabel: {
    width: 78,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  statusLine: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  /* ── Highlights picker ────────────────────────────────────────── */

  matchChips: { gap: 8, paddingBottom: 12 },

  matchChip: {
    maxWidth: 200,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  matchChipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  matchChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  matchChipTextOn: { color: COLORS.onPrimary },

  /* ── Settings ─────────────────────────────────────────────────── */

  settingsIntro: {
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2EDE0",
    alignItems: "center",
    justifyContent: "center",
  },

  settingsText: { flex: 1 },

  settingsLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  settingsHint: {
    marginTop: 2,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },
});
