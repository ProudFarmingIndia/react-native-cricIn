import React, { useEffect, useState, useCallback } from "react";

import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";

import { useRoute, useNavigation } from "@react-navigation/native";

import MatchSummaryCard from "../../../components/matches/ScoreCardScreen/MatchSummaryCard";
import ScorecardTabs from "../../../components/matches/ScoreCardScreen/ScorecardTabs";
import BattingTab from "../../../components/matches/ScoreCardScreen/BattingTab";
import BowlingTab from "../../../components/matches/ScoreCardScreen/BowlingTab";
import FOWTab from "../../../components/matches/ScoreCardScreen/FOWTab";
import PartnershipsTab from "../../../components/matches/ScoreCardScreen/PartnershipsTab";
import InfoTab from "../../../components/matches/ScoreCardScreen/InfoTab";

import {
  getMatchByIdApi,
  getScorecardByInningsApi,
  getPartnershipsApi,
} from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| ScorecardScreen
|--------------------------------------------------------------------------
|
| Expects via route.params: matchId (required).
|
| Data architecture:
|   getScorecardByInningsApi  →  per-innings batting, bowling, FOW with
|                                accurate dismissal info and running FOW
|                                totals (Batch 5 backend endpoint).
|   getPartnershipsApi        →  batting partnerships from ball-by-ball.
|   getMatchByIdApi           →  match meta for InfoTab (venue, toss, etc.)
|
| Innings switcher:
|   If the match has 2 innings, two pill buttons appear above the tabs
|   so the user can toggle between "1st Innings" and "2nd Innings".
|   All tabs (batting, bowling, fow) reflect the selected innings.
|   PartnershipsTab and InfoTab are match-level (not innings-specific).
|
*/

export default function ScorecardScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { matchId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [match, setMatch] = useState(null);
  const [inningsData, setInningsData] = useState([]); // array of per-innings objects
  const [partnerships, setPartnerships] = useState([]);

  const [activeInnings, setActiveInnings] = useState(0); // index into inningsData
  const [activeTab, setActiveTab] = useState("batting");

  /*
  |--------------------------------------------------------------------------
  | Load All Data
  |--------------------------------------------------------------------------
  */
  const load = useCallback(async () => {
    if (!matchId) return;

    setLoading(true);
    setError(null);

    try {
      const [matchDoc, scorecard, parts] = await Promise.all([
        getMatchByIdApi(matchId),
        getScorecardByInningsApi(matchId),
        getPartnershipsApi(matchId),
      ]);

      setMatch(matchDoc);
      setInningsData(Array.isArray(scorecard) ? scorecard : []);
      setPartnerships(Array.isArray(parts) ? parts : []);
      setActiveInnings(0);
    } catch (err) {
      console.error("[ScorecardScreen] load failed:", err);
      setError("Failed to load scorecard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Derived Data for Current Innings
  |--------------------------------------------------------------------------
  */
  const currentInnings = inningsData[activeInnings] ?? null;

  const partnershipsForCurrentInnings = partnerships.filter(
    (p) => p.inningsId === currentInnings?.inningsId,
  );

  /*
  |--------------------------------------------------------------------------
  | Render Tab Content
  |--------------------------------------------------------------------------
  */
  const renderTab = () => {
    switch (activeTab) {
      case "batting":
        return <BattingTab batting={currentInnings?.batting ?? []} />;

      case "bowling":
        return <BowlingTab bowling={currentInnings?.bowling ?? []} />;

      case "fow":
        return <FOWTab fow={currentInnings?.fow ?? []} />;

      case "partnerships":
        return <PartnershipsTab partnerships={partnershipsForCurrentInnings} />;

      case "info":
        return <InfoTab match={match} />;

      default:
        return <BattingTab batting={currentInnings?.batting ?? []} />;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading / Error States
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading scorecard...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={load} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Match Summary Hero Card ─────────────────────────── */}

        <MatchSummaryCard match={match} inningsData={inningsData} />

        {/* ── Innings Switcher (only shown if 2 innings exist) ── */}

        {inningsData.length > 1 && (
          <View style={styles.inningsSwitcher}>
            {inningsData.map((inn, idx) => (
              <TouchableOpacity
                key={inn.inningsId}
                style={[
                  styles.inningsPill,
                  activeInnings === idx && styles.inningsPillActive,
                ]}
                onPress={() => {
                  setActiveInnings(idx);
                  // Reset to batting tab when switching innings
                  if (activeTab !== "partnerships" && activeTab !== "info") {
                    setActiveTab("batting");
                  }
                }}
              >
                <Text
                  style={[
                    styles.inningsPillText,
                    activeInnings === idx && styles.inningsPillTextActive,
                  ]}
                >
                  {inn.inningsNumber === 1 ? "1st Innings" : "2nd Innings"}
                </Text>

                <Text
                  style={[
                    styles.inningsPillScore,
                    activeInnings === idx && styles.inningsPillTextActive,
                  ]}
                >
                  {inn.battingTeamName} {inn.summary.runs}/{inn.summary.wickets}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Tab Bar ──────────────────────────────────────────── */}

        <ScorecardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* ── Tab Content ──────────────────────────────────────── */}

        {renderTab()}
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
    paddingBottom: 40,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },

  errorText: {
    color: COLORS.error,
    textAlign: "center",
    marginBottom: 16,
    fontSize: 15,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Innings Switcher ─────────────────────────────────────────

  inningsSwitcher: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },

  inningsPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  inningsPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  inningsPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginBottom: 3,
  },

  inningsPillScore: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  inningsPillTextActive: {
    color: "#fff",
  },
});
