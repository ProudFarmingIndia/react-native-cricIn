import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import {
  getLiveMatchesApi,
  getUpcomingMatchesApi,
} from "../../matches/services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/
const formatMatchDate = (dateStr) => {
  if (!dateStr) return "Date TBD";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatMatchTime = (dateStr) => {
  if (!dateStr) return "Time TBD";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Time TBD";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/*
|--------------------------------------------------------------------------
| HomeScreen
|--------------------------------------------------------------------------
|
| "Your Matches" section:
|   1. Live matches — with current innings score
|   2. Upcoming matches — horizontal slider showing ALL upcoming matches,
|      each card with match number, name, teams, date + time + PIN row
|
*/
export default function HomeScreen() {
  const navigation = useNavigation();

  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      const [live, upcoming] = await Promise.all([
        getLiveMatchesApi(),
        getUpcomingMatchesApi(),
      ]);

      setLiveMatches(Array.isArray(live) ? live : []);
      setUpcomingMatches(Array.isArray(upcoming) ? upcoming : []); // all upcoming, no cap
    } catch (err) {
      console.error("[HomeScreen] Failed to load matches:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const openLiveMatch = (match) => {
    const inn = match.currentInnings;

    navigation.navigate("Matches", {
      screen: "QuickScoreFlow",
      params: {
        screen: "LiveScoringScreen",
        params: {
          matchId: match._id,
          inningsId: inn?.inningsId,
          battingSquad: inn?.battingSquad || [],
          bowlingSquad: inn?.bowlingSquad || [],
          target: inn?.target,
        },
      },
    });
  };

  const openUpcomingMatch = (matchId) => {
    navigation.navigate("Matches", {
      screen: "QuickScoreFlow",
      params: { screen: "MatchDetailsScreen", params: { matchId } },
    });
  };

  const totalAttention =
    liveMatches.length +
    upcomingMatches.filter((m) => m.confirmationStatus === "pending").length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── Profile Status ──────────────────────────────────── */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("Profile", { screen: "EditProfileScreen" })
          }
        >
          <View style={styles.profileTop}>
            <View>
              <Text style={styles.sectionLabel}>PROFILE STATUS</Text>
              <Text style={styles.title}>Almost there, Champ!</Text>
            </View>

            <Text style={styles.progressText}>75%</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.description}>
            Complete your profile to unlock advanced scout analytics.
          </Text>
        </TouchableOpacity>

        {/* ── Your Matches Header ──────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Matches</Text>

          {totalAttention > 0 && (
            <View style={styles.attentionBadge}>
              <View style={styles.attentionDot} />
              <Text style={styles.attentionText}>{totalAttention} ACTIVE</Text>
            </View>
          )}
        </View>

        {/* ── Live Matches ─────────────────────────────────────── */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loadingIndicator}
          />
        ) : liveMatches.length > 0 ? (
          <>
            <View style={styles.subsectionHeader}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>LIVE NOW</Text>
              </View>
            </View>

            {liveMatches.map((match) => {
              const inn = match.currentInnings;

              return (
                <TouchableOpacity
                  key={match._id}
                  style={[styles.card, styles.liveCard]}
                  onPress={() => openLiveMatch(match)}
                >
                  <View style={styles.matchMeta}>
                    <Text style={styles.matchTypeLabel}>{match.matchType}</Text>
                  </View>

                  <View style={styles.teamsRow}>
                    <Text style={styles.teamNameBold} numberOfLines={1}>
                      {match.teamA?.teamName ?? "Team A"}
                    </Text>

                    <Text style={styles.vsText}>vs</Text>

                    <Text style={styles.teamNameBold} numberOfLines={1}>
                      {match.teamB?.teamName ?? "Team B"}
                    </Text>
                  </View>

                  {inn && (
                    <View style={styles.scoreRow}>
                      <Text style={styles.liveScore}>
                        {inn.runs}/{inn.wickets}
                      </Text>

                      <Text style={styles.liveOvers}>
                        ({inn.overs} ov) • RR {inn.runRate}
                      </Text>
                    </View>
                  )}

                  <View style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>SCORE NOW →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        ) : null}

        {/* ── Upcoming Matches (horizontal slider) ─────────────── */}
        {!loading && upcomingMatches.length > 0 && (
          <>
            <View style={styles.subsectionHeader}>
              <Text style={styles.subsectionLabel}>UPCOMING</Text>

              <TouchableOpacity onPress={() => navigation.navigate("Matches")}>
                <Text style={styles.seeAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingSlider}
            >
              {upcomingMatches.map((match, index) => (
                <TouchableOpacity
                  key={match._id}
                  style={[styles.upcomingCard, styles.card]}
                  onPress={() => openUpcomingMatch(match._id)}
                >
                  {/* Match number + type */}
                  <View style={styles.upcomingTop}>
                    <View style={styles.matchNumberBadge}>
                      <Text style={styles.matchNumberText}>
                        MATCH {index + 1}
                      </Text>
                    </View>

                    <Text style={styles.matchTypeLabel}>{match.matchType}</Text>
                  </View>

                  {match.matchTitle ? (
                    <Text style={styles.matchName} numberOfLines={1}>
                      {match.matchTitle}
                    </Text>
                  ) : null}

                  <View style={styles.teamsRow}>
                    <Text style={styles.teamNameBold} numberOfLines={1}>
                      {match.teamA?.teamName ?? "Team A"}
                    </Text>

                    <Text style={styles.vsText}>vs</Text>

                    <Text style={styles.teamNameBold} numberOfLines={1}>
                      {match.teamB?.teamName ?? "Team B"}
                    </Text>
                  </View>

                  {/* Date + time + PIN */}
                  <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeItem}>
                      <MaterialIcons
                        name="event"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text style={styles.dateTimeText}>
                        {formatMatchDate(
                          match.scheduledStartTime || match.startTime,
                        )}
                      </Text>
                    </View>

                    <View style={styles.dateTimeItem}>
                      <MaterialIcons
                        name="schedule"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text style={styles.dateTimeText}>
                        {formatMatchTime(
                          match.scheduledStartTime || match.startTime,
                        )}
                      </Text>
                    </View>
                  </View>

                  {match.canManage && match.matchPin ? (
                    <View style={styles.pinChip}>
                      <MaterialIcons
                        name="lock"
                        size={14}
                        color={COLORS.secondary}
                      />
                      <Text style={styles.pinChipText}>
                        PIN {match.matchPin}
                      </Text>
                    </View>
                  ) : null}

                  {match.venueName ? (
                    <View style={styles.dateTimeItem}>
                      <MaterialIcons
                        name="place"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text style={styles.dateTimeText} numberOfLines={1}>
                        {match.venueName}
                      </Text>
                    </View>
                  ) : null}

                  {match.confirmationStatus === "pending" && (
                    <View style={styles.pendingBanner}>
                      <Text style={styles.pendingText}>
                        ⏳ Awaiting confirmation
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Empty state if no matches at all ─────────────────── */}
        {!loading &&
          liveMatches.length === 0 &&
          upcomingMatches.length === 0 && (
            <View style={[styles.card, styles.emptyMatchCard]}>
              <MaterialIcons
                name="sports-cricket"
                size={28}
                color={COLORS.outline}
              />
              <Text style={styles.emptyMatchText}>
                No active or upcoming matches.{"\n"}Create one or accept a
                challenge!
              </Text>
            </View>
          )}

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, styles.quickActionsTitle]}>
          Quick Actions
        </Text>

        <View style={styles.quickGrid}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Matches", { screen: "QuickScoreFlow" })
            }
            style={styles.quickCard}
          >
            <View style={styles.quickIcon}>
              <MaterialIcons
                name="edit-note"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.quickText}>QUICK SCORE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("TeamStack", { screen: "CreateTeamScreen" })
            }
            style={styles.quickCard}
          >
            <View style={styles.quickIcon}>
              <MaterialIcons name="groups" size={22} color={COLORS.primary} />
            </View>

            <Text style={styles.quickText}>CREATE TEAM</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  loadingIndicator: {
    marginBottom: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  profileTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "700",
    letterSpacing: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 4,
  },

  progressText: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primary,
  },

  progressBar: {
    height: 10,
    backgroundColor: "#e8ece4",
    borderRadius: 50,
    marginTop: 18,
    overflow: "hidden",
  },

  progressFill: {
    width: "75%",
    height: "100%",
    backgroundColor: COLORS.primary,
  },

  description: {
    marginTop: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },

  // ── Section headers ───────────────────────────────────────────────────

  sectionHeader: {
    marginTop: 22,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  quickActionsTitle: {
    marginTop: 22,
    marginHorizontal: 16,
  },

  attentionBadge: {
    flexDirection: "row",
    alignItems: "center",
  },

  attentionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: 5,
  },

  attentionText: {
    color: COLORS.error,
    fontWeight: "700",
    fontSize: 11,
  },

  subsectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },

  subsectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },

  seeAll: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 11,
  },

  // ── Live ──────────────────────────────────────────────────────────────

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "18",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
    alignSelf: "flex-start",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },

  livePillText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.error,
    letterSpacing: 0.5,
  },

  liveCard: {
    borderTopWidth: 4,
    borderTopColor: COLORS.error,
  },

  // ── Upcoming (horizontal slider) ──────────────────────────────────────

  upcomingSlider: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 12,
  },

  upcomingCard: {
    width: 300,
    marginHorizontal: 0,
    marginTop: 0,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },

  upcomingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  matchNumberBadge: {
    backgroundColor: "#e8f0e8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  matchNumberText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  matchName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },

  matchTypeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },

  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
    flexWrap: "wrap",
  },

  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },

  dateTimeText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "600",
  },

  pinChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff8ef",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },

  pinChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.secondary,
    letterSpacing: 1,
  },

  pendingBanner: {
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },

  pendingText: {
    fontSize: 12,
    color: "#ef6c00",
    fontWeight: "600",
  },

  // ── Shared match card ─────────────────────────────────────────────────

  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  teamNameBold: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },

  vsText: {
    color: COLORS.textLight,
    fontWeight: "700",
    fontSize: 12,
    paddingHorizontal: 10,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
    gap: 8,
  },

  liveScore: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
  },

  liveOvers: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Empty ─────────────────────────────────────────────────────────────

  emptyMatchCard: {
    alignItems: "center",
    paddingVertical: 24,
  },

  emptyMatchText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Quick Actions ─────────────────────────────────────────────────────

  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 14,
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#dff1df",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  quickText: {
    fontWeight: "700",
    color: COLORS.text,
    fontSize: 12,
  },
});
