/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| TournamentDetailScreen.js
|
| Description:
| One tournament, one screen, whether you are the organizer, a captain
| playing in it, or somebody who just found it.
|
| WHAT IS THE SAME FOR EVERYONE
| Overview, Fixtures, Points Table, Teams, Awards, Stats and Highlights.
| All of it. A tournament is a public event and hiding its results from
| people who did not enter would be pointless - the fixtures are on a
| noticeboard at the ground anyway.
|
| WHAT IS NOT
| The Settings tab, which is the organizer's control panel and appears for
| nobody else. Not because the numbers in it are secret, but because every
| control in it WRITES - publish, generate fixtures, assign a scorer,
| cancel - and showing a wall of buttons that will all be refused is worse
| than not showing the tab.
|
| Captains and players get one extra thing: a strip at the top for the
| thing they still have to do (answer an invite, register a squad).
|
| Points Table is hidden entirely on a Knockout tournament rather than
| shown empty. There is no table in a knockout; an empty one just makes
| people wonder what is broken.
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
  Modal,
  Pressable,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import TeamBadge from "../../../components/matches/TeamBadge";

import useTournament from "../hooks/useTournament";

import PrizeList, { PrizeBanner } from "../components/PrizeList";
import PointsTable from "../components/PointsTable";
import FixtureList from "../components/FixtureList";
import AwardsList from "../components/AwardsList";
import StatBoards from "../components/StatBoards";
import PlayerPickerModal from "../components/PlayerPickerModal";

import HighlightsFeed from "../../highlights/components/HighlightsFeed";

import {
  setAwardWinnerApi,
  requestToJoinApi,
} from "../services/tournament.service";

import {
  STATUS_META,
  FORMAT_LABEL,
} from "../constants/tournamentConstants";

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

export default function TournamentDetailScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { tournamentId } = route.params || {};

  const {
    tournament,
    fixtures,
    table,
    stats,
    awards,
    loading,
    reload,
    loadSection,
    isOrganizer,
    myInvite,
    canRequestJoin,
    myJoinableTeams,
    myJoinRequests,
    showsTable,
    isFinished,
  } = useTournament(tournamentId);

  const [tab, setTab] = useState("Overview");

  const [refreshing, setRefreshing] = useState(false);

  /* The award whose winner the organizer is currently picking. */

  const [picking, setPicking] = useState(null);

  const [savingWinner, setSavingWinner] = useState(false);

  /* Which match's highlights are showing. */

  const [highlightMatchId, setHighlightMatchId] = useState(null);

  /*
  | The apply-with-a-team picker. A captain can hold several teams and
  | only they know which one is entering, so this is a deliberate choice
  | and not something the screen can default.
  */

  const [applyOpen, setApplyOpen] = useState(false);

  const [applyingTeamId, setApplyingTeamId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      reload(true);
    }, [reload]),
  );

  /*
  | Settings is LAST and organizer-only. Last because the tabs before it
  | are what everybody opens the screen for, and a control panel sitting
  | between "Teams" and "Stats" would put a destructive button one
  | mis-swipe from a scorecard.
  */

  const tabs = useMemo(
    () =>
      [
        "Overview",
        "Fixtures",
        showsTable ? "Points Table" : null,
        "Teams",
        "Awards",
        "Stats",
        "Highlights",
        isOrganizer ? "Settings" : null,
      ].filter(Boolean),
    [showsTable, isOrganizer],
  );

  /*
  | Each tab fetches the first time it is shown. Driven by the tab value
  | rather than by the press handler, so a screen that OPENS on a tab
  | still loads it - the bug MatchDetailsScreen once had.
  */

  useEffect(() => {
    if (tab === "Fixtures") loadSection("fixtures");

    if (tab === "Points Table") loadSection("table");

    if (tab === "Stats") loadSection("stats");

    if (tab === "Awards") loadSection("awards");

    /*
    | Highlights are the highlight reels of this tournament's matches, so
    | it reuses the fixture list to know which matches exist rather than
    | asking the server a second question.
    */
    if (tab === "Highlights") loadSection("fixtures");

    /*
    | Settings is a live control panel - it must never show a cached
    | "3 teams" while the organizer is looking at the fourth acceptance.
    | So it forces a reload rather than reading whatever is in state.
    */
    if (tab === "Settings") reload(true);
  }, [tab, loadSection, reload]);

  /*
  | Completed matches, newest first - the Highlights picker.
  |
  | `fixtures` arrives grouped by round, so it is flattened here rather
  | than asking the server for a second, differently-shaped list of the
  | same matches.
  */

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

  /*
  | Default to the most recent completed match, and only while nothing is
  | selected - re-running this on every fixture refresh would yank the
  | user back off whichever match they had chosen.
  */

  useEffect(() => {
    if (!highlightMatchId && playedMatches.length) {
      setHighlightMatchId(String(playedMatches[0]._id));
    }
  }, [playedMatches, highlightMatchId]);

  /*
  |--------------------------------------------------------------------------
  | Award winner
  |--------------------------------------------------------------------------
  |
  | `playerId: null` hands a computed award back to the counter. That is
  | the only way out of a wrong override - deleting the award and adding
  | it again would lose its amount and its label.
  */

  const saveWinner = async (playerId, name) => {
    setSavingWinner(true);

    try {
      await setAwardWinnerApi(tournamentId, picking.metric, playerId);

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
      `"${award.label}" ka winner phir se apne aap decide hoga - jo leaderboard mein sabse upar hoga.`,
      [
        { text: "Rehne do", style: "cancel" },
        {
          text: "Haan",
          onPress: async () => {
            try {
              await setAwardWinnerApi(tournamentId, award.metric, null);

              await loadSection("awards", true);
            } catch (err) {
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Nahi hua.",
              );
            }
          },
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Apply with a team
  |--------------------------------------------------------------------------
  |
  | A request, not an entry. The organizer approves it from their Manage
  | screen and only then is the team in - which is the whole point of
  | "public participation" being a separate switch from "published". An
  | open tournament that anybody could silently join would leave the
  | organizer discovering strangers in their draw.
  |
  | Only one request is sent at a time even though the picker lists several
  | teams, because entering two of your own sides into the same tournament
  | is almost always a mis-tap. The strip stays available afterwards for
  | the remaining teams, so it is still possible - just not accidental.
  |
  */

  const applyWithTeam = async (team) => {
    setApplyingTeamId(String(team.teamId));

    try {
      await requestToJoinApi(tournamentId, team.teamId);

      setApplyOpen(false);

      /*
      | Reload rather than patching state locally: the server decides
      | whether any joinable team is left, and after this one it may not
      | be. A local patch would leave the strip offering a team that is
      | now pending.
      */

      await reload(true);

      Alert.alert(
        "Request bhej di",
        `${team.teamName} ki request organizer ko chali gayi hai. Approve hone par team tournament mein aa jayegi.`,
      );
    } catch (err) {
      Alert.alert(
        "Request nahi gayi",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setApplyingTeamId(null);
    }
  };

  const openMatch = (match) =>
    navigation.navigate("QuickScoreFlow", {
      screen: "MatchDetailsScreen",
      params: { matchId: match._id },
    });

  if (loading && !tournament) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Ye tournament nahi mila.</Text>
      </View>
    );
  }

  const status = STATUS_META[tournament.status] || STATUS_META.published;

  const qualifying =
    tournament.format === "League+Knockout"
      ? tournament.playoffShape === "final_only"
        ? 2
        : 4
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);

            await reload(true);

            if (tab === "Fixtures") await loadSection("fixtures", true);

            if (tab === "Points Table") await loadSection("table", true);

            setRefreshing(false);
          }}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* ── Hero ──────────────────────────────────────────────────── */}

      <View style={styles.hero}>
        {tournament.bannerImage ? (
          <Image
            source={{ uri: tournament.bannerImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.scrim} />

        <View style={styles.heroTop}>
          <View style={[styles.pill, { backgroundColor: status.bg }]}>
            {tournament.status === "live" && <View style={styles.liveDot} />}
            <Text style={[styles.pillText, { color: status.fg }]}>
              {status.label}
            </Text>
          </View>

          {isOrganizer && (
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() =>
                navigation.navigate("ManageTournamentScreen", { tournamentId })
              }
            >
              <Ionicons name="settings-outline" size={14} color={COLORS.primary} />
              <Text style={styles.manageText}>Manage</Text>
            </TouchableOpacity>
          )}
        </View>

        <View>
          <Text style={styles.heroName} numberOfLines={2}>
            {tournament.tournamentName}
          </Text>

          <View style={styles.heroPrize}>
            <PrizeBanner
              prizes={tournament.prizes}
              prizePool={tournament.prizePool}
            />
          </View>
        </View>
      </View>

      {/* ── Captain's invite strip ────────────────────────────────── */}

      {!!myInvite && (
        <TouchableOpacity
          style={styles.inviteStrip}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("TournamentInviteScreen", {
              tournamentId,
              teamId: myInvite.teamId,
            })
          }
        >
          <Ionicons name="mail-unread-outline" size={18} color={COLORS.secondary} />

          <View style={styles.inviteText}>
            <Text style={styles.inviteTitle}>
              {myInvite.teamName} ko invite mila hai
            </Text>
            <Text style={styles.inviteBody}>
              Accept ya reject karne ke liye tap karo
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={COLORS.secondary} />
        </TouchableOpacity>
      )}

      {/* ── Captain's pending join requests ───────────────────────── */}

      {/*
      | Their own application, waiting on the organizer. Flat, not
      | tappable - there is genuinely nothing for them to do here, and a
      | chevron that leads nowhere is worse than no chevron.
      */}

      {(myJoinRequests || []).map((team) => (
        <View
          key={`req-${String(team.teamId)}`}
          style={[styles.inviteStrip, styles.pendingStrip]}
        >
          <Ionicons name="time-outline" size={18} color={COLORS.onSurfaceVariant} />

          <View style={styles.inviteText}>
            <Text style={styles.inviteTitle}>
              {team.teamName} ki request bheji hui hai
            </Text>

            <Text style={styles.inviteBody}>
              Organizer ke approve karne ka intezaar hai
            </Text>
          </View>
        </View>
      ))}

      {/* ── Apply with your team ──────────────────────────────────── */}

      {/*
      | `canRequestJoin` is the server's answer, not a guess made here. It
      | is already false when participation is invite-only, when fixtures
      | are out, when the tournament is full, for the organizer, and when
      | every team this person captains is already entered - so this strip
      | never offers something that will be refused.
      */}

      {canRequestJoin && (
        <TouchableOpacity
          style={[styles.inviteStrip, styles.applyStrip]}
          activeOpacity={0.85}
          onPress={() => setApplyOpen(true)}
        >
          <Ionicons name="add-circle-outline" size={19} color={COLORS.primary} />

          <View style={styles.inviteText}>
            <Text style={styles.inviteTitle}>
              Is tournament mein apni team daalo
            </Text>

            <Text style={styles.inviteBody}>
              {myJoinableTeams.length === 1
                ? `${myJoinableTeams[0].teamName} — request organizer ko jayegi`
                : `${myJoinableTeams.length} teams available — kaunsi bhejni hai chuno`}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      {/* ── Captain's squad strip ─────────────────────────────────── */}

      {/*
      | Shown only while the squad is still unlocked. Once it is locked
      | there is nothing left to do here and a permanent strip would just
      | be noise on every visit for the rest of the tournament.
      */}

      {(tournament.myTeams || [])
        .filter((team) => !team.squadLocked)
        .map((team) => (
          <TouchableOpacity
            key={String(team.teamId)}
            style={styles.inviteStrip}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("TournamentSquadScreen", {
                tournamentId,
                teamId: team.teamId,
                tournamentName: tournament.tournamentName,
              })
            }
          >
            <Ionicons name="people-outline" size={18} color={COLORS.secondary} />

            <View style={styles.inviteText}>
              <Text style={styles.inviteTitle}>
                {team.teamName} ki squad register karo
              </Text>

              <Text style={styles.inviteBody}>
                {team.squadSize
                  ? `${team.squadSize} players chune hain — 15 chahiye`
                  : "15 se 20 players is tournament ke liye"}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        ))}

      {/* ── Winner ────────────────────────────────────────────────── */}

      {tournament.status === "completed" && tournament.winnerTeam && (
        <View style={styles.winnerCard}>
          <Ionicons name="trophy" size={22} color={COLORS.secondary} />

          <View style={styles.winnerText}>
            <Text style={styles.winnerLabel}>CHAMPIONS</Text>
            <Text style={styles.winnerName}>
              {tournament.winnerTeam.teamName}
            </Text>
            {!!tournament.runnerUpTeam && (
              <Text style={styles.runnerUp}>
                Runner up: {tournament.runnerUpTeam.teamName}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────── */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.tabBody}>
        {/* ── Overview ───────────────────────────────────────────── */}

        {tab === "Overview" && (
          <>
            <View style={styles.card}>
              <InfoRow
                icon="trophy-outline"
                label="Format"
                value={FORMAT_LABEL[tournament.format] || tournament.format}
              />
              <InfoRow
                icon="people-outline"
                label="Teams"
                value={`${tournament.acceptedCount ?? 0} of ${tournament.maxTeams}`}
              />
              <InfoRow
                icon="baseball-outline"
                label="Overs"
                value={`${tournament.overs} overs · ${tournament.ballType} ball`}
              />
              <InfoRow
                icon="calendar-outline"
                label="Dates"
                value={
                  formatDate(tournament.startDate)
                    ? `${formatDate(tournament.startDate)}${
                        formatDate(tournament.endDate)
                          ? ` – ${formatDate(tournament.endDate)}`
                          : ""
                      }`
                    : null
                }
              />
              <InfoRow
                icon="location-outline"
                label="Venue"
                value={
                  tournament.grounds?.map((g) => g.name).join(", ") ||
                  tournament.city
                }
              />
              <InfoRow
                icon="person-outline"
                label="Organizer"
                value={tournament.userId?.name || tournament.userId?.phone}
              />
              {tournament.entryFee > 0 && (
                <InfoRow
                  icon="cash-outline"
                  label="Entry"
                  value={`₹${Number(tournament.entryFee).toLocaleString("en-IN")}`}
                />
              )}
            </View>

            <PrizeList
              prizes={tournament.prizes}
              prizePool={tournament.prizePool}
            />

            {/*
            | The points rules, in plain sight. If a team misses the
            | playoffs on NRR they should have known from day one how the
            | maths worked.
            */}
            {showsTable && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>POINTS SYSTEM</Text>

                <Text style={styles.ruleText}>
                  Win {tournament.pointsWin} · Tie {tournament.pointsTie} · No
                  result {tournament.pointsNoResult} · Loss{" "}
                  {tournament.pointsLoss}
                </Text>

                <Text style={styles.ruleHint}>
                  Barabar points par Net Run Rate se ranking hoti hai.
                  {qualifying
                    ? ` Top ${qualifying} teams playoff mein jayengi.`
                    : ""}
                </Text>
              </View>
            )}

            {!!tournament.description && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>RULES & DETAILS</Text>
                <Text style={styles.description}>{tournament.description}</Text>
              </View>
            )}
          </>
        )}

        {/* ── Fixtures ───────────────────────────────────────────── */}

        {tab === "Fixtures" && (
          <FixtureList
            rounds={fixtures}
            onPressMatch={openMatch}
            canManage={isOrganizer}
            onEditFixture={(match) =>
              navigation.navigate("ManageTournamentScreen", {
                tournamentId,
                editFixtureId: match._id,
              })
            }
          />
        )}

        {/* ── Points table ───────────────────────────────────────── */}

        {tab === "Points Table" && (
          <PointsTable
            rows={table}
            qualifyingTeams={qualifying}
            pointsRule={`Win ${tournament.pointsWin} · Tie ${tournament.pointsTie} · No result ${tournament.pointsNoResult} · Loss ${tournament.pointsLoss}.`}
          />
        )}

        {/* ── Teams ──────────────────────────────────────────────── */}

        {tab === "Teams" && (
          <View style={styles.card}>
            {(tournament.teams || []).length === 0 ? (
              <Text style={styles.emptyText}>
                Abhi koi team confirm nahi hui.
              </Text>
            ) : (
              (tournament.teams || []).map((team) => (
                <View key={String(team.teamId)} style={styles.teamRow}>
                  <View style={styles.seedBadge}>
                    <Text style={styles.seedText}>
                      {team.seed ? `T${team.seed}` : "—"}
                    </Text>
                  </View>

                  <TeamBadge team={team} size={32} />

                  <View style={styles.teamText}>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {team.teamName}
                    </Text>

                    <Text style={styles.teamMeta}>
                      {team.squadSize
                        ? `${team.squadSize} players${team.squadLocked ? " · locked" : ""}`
                        : "Squad register nahi hui"}
                    </Text>
                  </View>
                </View>
              ))
            )}

            {isOrganizer && (tournament.pendingTeams || []).length > 0 && (
              <>
                <Text style={[styles.cardTitle, styles.pendingTitle]}>
                  PENDING
                </Text>

                {tournament.pendingTeams.map((team) => (
                  <View key={String(team.teamId)} style={styles.teamRow}>
                    <TeamBadge team={team} size={28} />

                    <Text style={styles.teamName} numberOfLines={1}>
                      {team.teamName}
                    </Text>

                    <Text style={styles.pendingStatus}>
                      {team.status.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* ── Awards ─────────────────────────────────────────────── */}

        {/*
        | Open to everyone. The organizer additionally gets the pick and
        | clear controls, which is the only difference - AwardsList takes
        | canManage and draws two extra buttons per card.
        */}

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

        {/*
        | Every leaderboard, drawn from the SAME payload the awards read.
        | Two counters over the same deliveries would disagree eventually -
        | one credits a run out to the bowler, the other does not - and
        | then Most Wickets names somebody the stats tab has second.
        */}

        {tab === "Stats" && (
          <StatBoards
            boards={stats?.boards || {}}
            emptyText="Abhi koi match complete nahi hua. Pehla match khatam hote hi yahan stats aa jayenge."
          />
        )}

        {/* ── Highlights ─────────────────────────────────────────── */}

        {/*
        | Highlights are per match - they are moments, and a moment
        | belongs to a game. So this is a match picker plus one match's
        | feed, defaulting to the most recently completed one, which is
        | the one people arrive looking for.
        |
        | A tournament-wide reel would need the server to rank moments
        | across matches, which is a real feature and not this one.
        */}

        {tab === "Highlights" && (
          <>
            {playedMatches.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.emptyText}>
                  Abhi koi match complete nahi hua. Match khatam hote hi uske
                  highlights yahan aa jayenge.
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
                        style={[
                          styles.matchChip,
                          active && styles.matchChipOn,
                        ]}
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
                          {m.teamA?.teamName || "Team A"} v{" "}
                          {m.teamB?.teamName || "Team B"}
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

        {/*
        | Organizer only - see the note at the top of this file. It is not
        | a copy of ManageTournamentScreen, it is a doorway to it: this
        | screen is already long, and nesting a control panel with its own
        | modals inside a tab of a tab is how a "Cancel tournament" button
        | ends up one accidental swipe from a scorecard.
        */}

        {tab === "Settings" && isOrganizer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ORGANISER CONTROLS</Text>

            <Text style={styles.settingsIntro}>
              Publish, teams, fixtures, scorer aur cancel — sab manage screen
              par hai.
            </Text>

            {[
              {
                icon: "options-outline",
                label: "Manage tournament",
                hint: "Publish, public participation, join requests",
                go: () =>
                  navigation.navigate("ManageTournamentScreen", { tournamentId }),
              },
              {
                icon: "person-add-outline",
                label: "Teams invite karo",
                hint: `${tournament.teams?.length || 0} confirmed`,
                go: () =>
                  navigation.navigate("InviteTeamsScreen", { tournamentId }),
              },
              {
                icon: "create-outline",
                label: "Tournament details edit karo",
                hint: "Naam, dates, grounds, prizes, awards",
                go: () =>
                  navigation.navigate("CreateTournamentScreen", {
                    tournamentId,
                  }),
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

      {/* ── Which team are you entering ───────────────────────────── */}

      {/*
      | Kept inline rather than made a shared component: it is one list of
      | the user's own teams and it exists nowhere else in the app. The
      | backdrop closes it, but not while a request is in flight - tapping
      | away mid-request would leave the person unsure whether it was sent.
      */}

      <Modal
        visible={applyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !applyingTeamId && setApplyOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => !applyingTeamId && setApplyOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Kaunsi team bhejni hai?</Text>

            <Text style={styles.modalBody}>
              Request organizer ke paas jayegi. Approve karne par team
              "{tournament.tournamentName}" mein aa jayegi.
            </Text>

            <ScrollView style={styles.modalList} bounces={false}>
              {(myJoinableTeams || []).map((team) => {
                const busy = applyingTeamId === String(team.teamId);

                return (
                  <TouchableOpacity
                    key={String(team.teamId)}
                    style={[styles.teamRow, busy && styles.teamRowBusy]}
                    activeOpacity={0.85}
                    disabled={!!applyingTeamId}
                    onPress={() => applyWithTeam(team)}
                  >
                    <TeamBadge team={team} size={34} />

                    <Text style={styles.teamRowName} numberOfLines={1}>
                      {team.teamName}
                    </Text>

                    {busy ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={COLORS.onSurfaceVariant}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancel}
              disabled={!!applyingTeamId}
              onPress={() => setApplyOpen(false)}
            >
              <Text style={styles.modalCancelText}>Rehne do</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  content: { paddingBottom: 50 },

  /* ── Highlights picker ────────────────────────────────────────── */

  matchChips: {
    gap: 8,
    paddingBottom: 12,
  },

  matchChip: {
    maxWidth: 210,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  matchChipOn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

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

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: 26,
  },

  /* ── Hero ─────────────────────────────────────────────────────── */

  hero: {
    height: 168,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },

  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" },

  pillText: { fontSize: 9.5, fontWeight: "900", letterSpacing: 0.8 },

  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },

  manageText: { fontSize: 11.5, fontWeight: "800", color: COLORS.primary },

  heroName: {
    fontSize: 23,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
  },

  heroPrize: { flexDirection: "row" },

  /* ── Invite strip ─────────────────────────────────────────────── */

  inviteStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    margin: 16,
    marginBottom: 0,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: COLORS.secondaryContainer,
  },

  inviteText: { flex: 1 },

  inviteTitle: { fontSize: 14, fontWeight: "800", color: COLORS.onSurface },

  inviteBody: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Apply to join ────────────────────────────────────────────── */

  /*
  | Primary-tinted, not the invite strip's amber. An invite is somebody
  | asking you; this is you asking them - a different action, and it
  | should not look like a second invite sitting underneath the first.
  */

  applyStrip: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderColor: COLORS.primary,
  },

  pendingStrip: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: COLORS.outlineVariant,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 26,
  },

  modalTitle: { fontSize: 16.5, fontWeight: "800", color: COLORS.onSurface },

  modalBody: {
    marginTop: 5,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },

  /*
  | Capped height so a captain with a dozen teams gets a scrolling list
  | instead of a sheet taller than the screen with the Cancel button off
  | the bottom of it.
  */

  modalList: { marginTop: 14, maxHeight: 300 },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
    marginBottom: 9,
  },

  teamRowBusy: { borderColor: COLORS.primary },

  teamRowName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  modalCancel: { alignItems: "center", paddingVertical: 13, marginTop: 4 },

  modalCancelText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  /* ── Winner ───────────────────────────────────────────────────── */

  winnerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: COLORS.secondaryContainer,
  },

  winnerText: { flex: 1 },

  winnerLabel: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.secondary,
  },

  winnerName: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  runnerUp: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Tabs ─────────────────────────────────────────────────────── */

  tabBar: {
    marginTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
    flexGrow: 0,
  },

  tabBarContent: { paddingHorizontal: 16 },

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  tabActive: { borderBottomColor: COLORS.primary },

  tabText: { fontSize: 13.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  tabTextActive: { color: COLORS.primary, fontWeight: "800" },

  tabBody: { padding: 16, gap: 14 },

  /* ── Cards ────────────────────────────────────────────────────── */

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },

  cardTitle: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
    marginBottom: 11,
  },

  pendingTitle: { marginTop: 16 },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingVertical: 7,
  },

  infoLabel: {
    width: 74,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  infoValue: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  ruleText: { fontSize: 14, fontWeight: "700", color: COLORS.onSurface },

  ruleHint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  description: {
    fontSize: 13.5,
    lineHeight: 21,
    color: COLORS.onSurface,
  },

  /* ── Teams ────────────────────────────────────────────────────── */

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  seedBadge: {
    width: 32,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
  },

  seedText: { fontSize: 10.5, fontWeight: "900", color: COLORS.primary },

  teamText: { flex: 1 },

  teamName: { flex: 1, fontSize: 14, fontWeight: "700", color: COLORS.onSurface },

  teamMeta: {
    marginTop: 2,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  pendingStatus: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: COLORS.secondary,
  },

  /* ── Stats ────────────────────────────────────────────────────── */

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  statPos: {
    width: 20,
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  statName: { flex: 1, fontSize: 13.5, fontWeight: "700", color: COLORS.onSurface },

  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
    fontVariant: ["tabular-nums"],
  },

  statSub: {
    width: 62,
    textAlign: "right",
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    paddingVertical: 12,
  },
});
