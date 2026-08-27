import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";

import {
  getMatchByIdApi,
  getScorecardByInningsApi,
  resetMatchSetupApi,
} from "../services/matches.services";

/*
  |--------------------------------------------------------------------------
  | MatchDetailsScreen
  |--------------------------------------------------------------------------
  |
  | Fetches the real match via getMatchByIdApi and, for the Scorecard tab,
  | the real innings-by-innings figures via getScorecardByInningsApi.
  |
  | For captains (canManage) of an UPCOMING match, a "Start Match" button
  | is shown. Pressing it wipes any partial setup (squads / toss / lineup /
  | partial innings) via resetMatchSetupApi, then navigates to
  | SquadSelectionScreen -> TossScreen -> MatchLineUpScreen (where the
  | opponent PIN is asked before live scoring).
  |
  */

// ─── Colour tokens (from the original design system) ────────────────────────
const C = {
  primary: "#00490e",
  primaryContainer: "#0d631b",
  onPrimaryContainer: "#8bdd86",
  secondary: "#8f4e00",
  secondaryContainer: "#ff8f04",
  onSecondaryContainer: "#623300",
  surface: "#f7fbf1",
  surfaceContainer: "#ebefe5",
  surfaceContainerLow: "#f1f5eb",
  surfaceContainerHigh: "#e5eae0",
  surfaceContainerLowest: "#ffffff",
  surfaceVariant: "#e0e4da",
  onSurface: "#181d17",
  onSurfaceVariant: "#40493d",
  outlineVariant: "#bfcaba",
  outline: "#707a6c",
  error: "#ba1a1a",
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const formatDateTime = (isoString) => {
  if (!isoString) return "Not scheduled";

  return new Date(isoString).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusLabel = (match) => {
  if (!match) return "";
  if (match.status === "live") return "LIVE";
  if (match.status === "completed") return "COMPLETED";
  if (match.status === "cancelled") return "CANCELLED";
  return "UPCOMING";
};

// ─── Sub-components ──────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <View
    style={[
      styles.statusBadge,
      status === "LIVE" && styles.statusBadgeLive,
      status === "CANCELLED" && styles.statusBadgeCancelled,
    ]}
  >
    <Text style={styles.statusText}>{status}</Text>
  </View>
);

const TeamLogo = ({ team }) => (
  <View style={styles.logoWrap}>
    {team?.logo?.url ? (
      <Image
        source={{ uri: team.logo.url }}
        style={styles.teamLogo}
        resizeMode="contain"
      />
    ) : (
      <Text style={styles.logoFallbackText}>
        {(team?.shortName || team?.teamName || "?").slice(0, 2).toUpperCase()}
      </Text>
    )}
  </View>
);

const HeroCard = ({ match, canManage }) => (
  <View style={styles.heroCard}>
    <StatusBadge status={statusLabel(match)} />

    <View style={styles.teamsRow}>
      <View style={styles.teamCol}>
        <TeamLogo team={match.teamA} />
        <Text style={styles.teamName} numberOfLines={1}>
          {match.teamA?.teamName || "Team A"}
        </Text>
      </View>

      <View style={styles.vsCol}>
        <View style={styles.vsDivider} />
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.vsDivider} />
      </View>

      <View style={styles.teamCol}>
        <TeamLogo team={match.teamB} />
        <Text style={styles.teamName} numberOfLines={1}>
          {match.teamB?.teamName || "Team B"}
        </Text>
      </View>
    </View>

    <View style={styles.heroFooter}>
      <Text style={styles.heroFooterText}>
        {match.matchType} • {match.overs} Overs • {match.ballType} Ball
      </Text>
      {match.tournament ? (
        <Text style={styles.heroTournament}>{match.tournament}</Text>
      ) : null}

      {canManage && match.matchPin && (
        <View style={[styles.card, styles.pinCard]}>
          <Text style={styles.cardTitle}>Match PIN</Text>
          <Text style={styles.pinValue}>{match.matchPin}</Text>
          <Text style={styles.pinHint}>
            Share this PIN with the opposing captain. It is required to start
            live scoring.
          </Text>
        </View>
      )}
    </View>
  </View>
);

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      <Text style={styles.infoIcon}>{icon}</Text>
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const InfoTab = ({ match }) => (
  <View style={styles.tabContent}>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>ℹ️ General Information</Text>
      <View style={styles.infoList}>
        <InfoRow
          icon="📅"
          label="Date & Time"
          value={formatDateTime(match.scheduledStartTime || match.startTime)}
        />
        <InfoRow
          icon="📍"
          label="Venue"
          value={match.venueName || "Not specified"}
        />
        <InfoRow
          icon="🏏"
          label="Match Format"
          value={`${match.matchType} • ${match.overs} Overs (${match.pitchType} pitch)`}
        />
      </View>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle}>👥 Match Officials</Text>
      <View style={styles.officialsGrid}>
        <View style={styles.officialBox}>
          <Text style={styles.officialLabel}>UMPIRES</Text>
          <Text style={styles.officialName}>
            {match.umpire1 || "Not assigned"}
          </Text>
          {!!match.umpire2 && (
            <Text style={styles.officialName}>{match.umpire2}</Text>
          )}
        </View>
        <View style={styles.officialBox}>
          <Text style={styles.officialLabel}>SCORER</Text>
          <Text style={styles.officialName}>
            {match.scorer || "Not assigned"}
          </Text>
        </View>
      </View>
    </View>

    {match.canManage &&
      !match.isInviteSender &&
      match.status === "upcoming" && (
        <View style={[styles.card, styles.pendingCard]}>
          <Text style={styles.pendingText}>
            ⏳ Only the captain who sent the match invite can set up the squads,
            toss and line-up, and start live scoring.
          </Text>
        </View>
      )}
  </View>
);

const PlayerItem = ({ player, isLast }) => (
  <>
    <View style={styles.playerRow}>
      <View style={styles.playerLeft}>
        <View style={styles.playerAvatar}>
          <View style={styles.playerPhotoPlaceholder} />
        </View>
        <Text style={styles.playerName}>{player.playerName}</Text>
      </View>
      <Text style={styles.playerRole}>{player.playerType || ""}</Text>
    </View>
    {!isLast && <View style={styles.divider} />}
  </>
);

const SquadsTab = ({ match }) => {
  const [activeTeam, setActiveTeam] = useState("A");

  const teamAName = match.teamA?.teamName || "Team A";
  const teamBName = match.teamB?.teamName || "Team B";

  // Full roster of the selected team (all players), not just the playing XI.
  const players =
    activeTeam === "A"
      ? match.teamA?.players || []
      : match.teamB?.players || [];

  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <View style={styles.squadHeader}>
          <Text style={styles.cardTitle}>Team Players</Text>
          <View style={styles.teamToggle}>
            {[
              { key: "A", label: teamAName },
              { key: "B", label: teamBName },
            ].map((team) => (
              <TouchableOpacity
                key={team.key}
                style={[
                  styles.toggleBtn,
                  activeTeam === team.key && styles.toggleBtnActive,
                ]}
                onPress={() => setActiveTeam(team.key)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    activeTeam === team.key && styles.toggleBtnTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {team.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {players.length === 0 ? (
          <Text style={styles.emptyText}>No players in this team yet.</Text>
        ) : (
          players.map((p, i) => (
            <PlayerItem
              key={p._id}
              player={p}
              isLast={i === players.length - 1}
            />
          ))
        )}
      </View>
    </View>
  );
};

const InningsScorecard = ({ innings }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>
      Innings {innings.inningsNumber} — {innings.totalRuns}/{innings.wickets} (
      {innings.overs} ov)
    </Text>

    <Text style={styles.scorecardSubheading}>BATTING</Text>
    {innings.batting.length === 0 ? (
      <Text style={styles.emptyText}>No batting data yet.</Text>
    ) : (
      innings.batting.map((b) => (
        <View key={b.playerId} style={styles.scorecardRow}>
          <Text style={styles.scorecardPlayerName} numberOfLines={1}>
            {b.playerName}
          </Text>
          <Text style={styles.scorecardFigure}>
            {b.runs} ({b.balls}) SR {b.strikeRate}
          </Text>
        </View>
      ))
    )}

    <Text
      style={[styles.scorecardSubheading, styles.scorecardSubheadingSpaced]}
    >
      BOWLING
    </Text>
    {innings.bowling.length === 0 ? (
      <Text style={styles.emptyText}>No bowling data yet.</Text>
    ) : (
      innings.bowling.map((b) => (
        <View key={b.playerId} style={styles.scorecardRow}>
          <Text style={styles.scorecardPlayerName} numberOfLines={1}>
            {b.playerName}
          </Text>
          <Text style={styles.scorecardFigure}>
            {b.overs}-{b.runsConceded}-{b.wickets} Econ {b.economy}
          </Text>
        </View>
      ))
    )}
  </View>
);

const ScorecardTab = ({ match, scorecard, scorecardLoading }) => {
  if (match.status === "upcoming") {
    return (
      <View style={styles.tabContent}>
        <View style={[styles.card, styles.emptyStateCard]}>
          <Text style={styles.emptyStateIcon}>🏏</Text>
          <Text style={styles.emptyStateTitle}>Match Hasn't Started</Text>
          <Text style={styles.emptyStateBody}>
            The scorecard will appear here once scoring begins.
          </Text>
        </View>
      </View>
    );
  }

  if (scorecardLoading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator
          size="small"
          color={C.primary}
          style={styles.scorecardLoader}
        />
      </View>
    );
  }

  if (!scorecard || scorecard.length === 0) {
    return (
      <View style={styles.tabContent}>
        <View style={[styles.card, styles.emptyStateCard]}>
          <Text style={styles.emptyStateIcon}>📊</Text>
          <Text style={styles.emptyStateTitle}>No Scorecard Yet</Text>
          <Text style={styles.emptyStateBody}>
            Ball-by-ball figures will show up here once scoring starts.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {scorecard.map((innings) => (
        <InningsScorecard key={innings.inningsNumber} innings={innings} />
      ))}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const TABS = ["Info", "Squads", "Scorecard"];

export default function MatchDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { matchId } = route.params || {};

  const [activeTab, setActiveTab] = useState("Info");
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const [scorecard, setScorecard] = useState(null);
  const [scorecardLoading, setScorecardLoading] = useState(false);

  const loadMatch = useCallback(async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getMatchByIdApi(matchId);
      setMatch(data);
    } catch (error) {
      console.error("[MatchDetailsScreen] Failed to load match:", error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useFocusEffect(
    useCallback(() => {
      loadMatch();
    }, [loadMatch]),
  );

  const handleTabPress = async (tab) => {
    setActiveTab(tab);

    if (
      tab === "Scorecard" &&
      !scorecard &&
      match &&
      (match.status === "live" || match.status === "completed")
    ) {
      setScorecardLoading(true);

      try {
        const data = await getScorecardByInningsApi(matchId);
        setScorecard(data);
      } catch (error) {
        console.error("[MatchDetailsScreen] Failed to load scorecard:", error);
      } finally {
        setScorecardLoading(false);
      }
    }
  };

  const handleStartMatch = async () => {
    console.log("--- Start Match button pressed ---");
    if (!matchId) {
      console.log("--- NO matchId, aborting ---");
      return;
    }
    console.log("--- Start Match button pressed 2 ---");
    console.log("--- matchId:", matchId);

    // Guard: is the API function actually defined?
    if (typeof resetMatchSetupApi !== "function") {
      console.error(
        "--- resetMatchSetupApi is UNDEFINED! Check matches.services.js export ---",
      );
      Alert.alert(
        "Failed",
        "resetMatchSetupApi is not defined. Add it to matches.services.js.",
      );
      return;
    }
    console.log("--- resetMatchSetupApi is defined ---");

    try {
      console.log("--- Start Match button pressed 3 ---");
      setStarting(true);

      console.log("--- Calling resetMatchSetupApi(matchId) ---");
      const result = await resetMatchSetupApi(matchId);
      console.log("--- resetMatchSetupApi SUCCESS, result:", result);

      console.log("--- Navigating to SquadSelectionScreen ---");
      navigation.navigate("SquadSelectionScreen", {
        matchId,
        teamA: match.teamA,
        teamB: match.teamB,
      });
      console.log("--- navigation.navigate called ---");
    } catch (error) {
      console.log("--- Start Match button pressed 4 (CATCH) ---");
      console.log("--- error.name:", error?.name);
      console.log("--- error.message:", error?.message);
      console.log("--- error.response?.status:", error?.response?.status);
      console.log("--- error.response?.data:", error?.response?.data);
      console.log("--- full error:", error);
      Alert.alert(
        "Failed",
        error.response?.data?.message ||
          error.message ||
          "Could not start match setup.",
      );
    } finally {
      console.log("--- Start Match button pressed 5 ---");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={[styles.safe, styles.centered]}>
        <Text style={styles.emptyStateBody}>
          This match could not be found.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroCard match={match} canManage={match.canManage} />

        {match.isInviteSender && match.status === "upcoming" && (
          <TouchableOpacity
            style={[styles.startButton, starting && styles.startButtonDisabled]}
            onPress={handleStartMatch}
            disabled={starting}
          >
            {starting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.startButtonText}>Start Match</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                activeTab === tab && styles.tabItemActive,
              ]}
              onPress={() => handleTabPress(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "Info" && <InfoTab match={match} />}
        {activeTab === "Squads" && <SquadsTab match={match} />}
        {activeTab === "Scorecard" && (
          <ScorecardTab
            match={match}
            scorecard={scorecard}
            scorecardLoading={scorecardLoading}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface },
  centered: { alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Hero Card
  heroCard: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: C.surfaceVariant,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusBadge: {
    alignSelf: "flex-end",
    backgroundColor: C.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeLive: { backgroundColor: C.error },
  statusBadgeCancelled: { backgroundColor: C.outline },
  statusText: {
    color: C.onSecondaryContainer,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  teamCol: { flex: 1, alignItems: "center" },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  teamLogo: { width: 48, height: 48 },
  logoFallbackText: { fontSize: 18, fontWeight: "700", color: C.primary },
  teamName: {
    fontSize: 16,
    fontWeight: "700",
    color: C.onSurface,
    textAlign: "center",
  },
  vsCol: { alignItems: "center", paddingHorizontal: 12 },
  vsDivider: {
    width: 28,
    height: 1,
    backgroundColor: C.outlineVariant,
    marginVertical: 4,
  },
  vsText: {
    fontSize: 28,
    fontWeight: "800",
    color: `${C.primary}22`,
    letterSpacing: 1,
  },
  heroFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: `${C.surfaceVariant}80`,
    alignItems: "center",
  },
  heroFooterText: { fontSize: 13, color: C.onSurfaceVariant },
  heroTournament: {
    fontSize: 12,
    color: C.secondary,
    fontWeight: "700",
    marginTop: 4,
  },
  heroPinBadge: {
    marginTop: 10,
    backgroundColor: C.secondaryContainer,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroPinText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.onSecondaryContainer,
    letterSpacing: 1.5,
  },

  // Start Match Button
  startButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonDisabled: { opacity: 0.6 },
  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceVariant,
    marginTop: 20,
    backgroundColor: C.surface,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: C.primary },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: C.onSurfaceVariant,
  },
  tabTextActive: { color: C.primary },

  // Tab Content
  tabContent: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },

  // Card
  card: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: C.surfaceVariant,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.primary,
    marginBottom: 16,
  },

  pendingCard: { backgroundColor: "#fff8ef", borderColor: "#ffdca8" },
  pendingText: {
    color: "#8f4e00",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },

  // Info rows
  infoList: { gap: 16 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  infoIconWrap: {
    backgroundColor: C.surfaceContainer,
    padding: 8,
    borderRadius: 8,
  },
  infoIcon: { fontSize: 18 },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: C.onSurfaceVariant,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: { fontSize: 14, fontWeight: "600", color: C.onSurface },

  // Officials
  officialsGrid: { flexDirection: "row", gap: 12 },
  officialBox: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 12,
  },
  officialLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: C.onSurfaceVariant,
    marginBottom: 4,
  },
  officialName: { fontSize: 14, color: C.onSurface, marginTop: 2 },

  // Squads
  squadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  teamToggle: {
    flexDirection: "row",
    backgroundColor: C.surfaceContainer,
    borderRadius: 8,
    padding: 4,
    maxWidth: "60%",
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 120,
  },
  toggleBtnActive: {
    backgroundColor: C.surfaceContainerLowest,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  toggleBtnText: { fontSize: 12, fontWeight: "600", color: C.onSurfaceVariant },
  toggleBtnTextActive: { color: C.onSurface },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  playerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${C.primary}1a`,
    overflow: "hidden",
  },
  playerPhotoPlaceholder: { flex: 1, backgroundColor: C.surfaceContainerHigh },
  playerName: { fontSize: 14, fontWeight: "600", color: C.onSurface },
  playerRole: { fontSize: 13, color: C.onSurfaceVariant },
  divider: { height: 1, backgroundColor: `${C.surfaceVariant}80` },
  emptyText: {
    color: C.onSurfaceVariant,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },

  // Scorecard
  scorecardLoader: { marginTop: 20 },
  scorecardSubheading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: C.onSurfaceVariant,
    marginBottom: 8,
  },
  scorecardSubheadingSpaced: { marginTop: 12 },
  scorecardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${C.surfaceVariant}80`,
  },
  scorecardPlayerName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.onSurface,
    flex: 1,
    marginRight: 8,
  },
  scorecardFigure: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: "600",
  },

  // Empty States
  emptyStateCard: { alignItems: "center", paddingVertical: 40 },
  emptyStateIcon: { fontSize: 48, marginBottom: 12 },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.onSurface,
    marginBottom: 8,
  },
  emptyStateBody: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});
