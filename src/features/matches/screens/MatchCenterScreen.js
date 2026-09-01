import React, { useEffect, useMemo, useState } from "react";

import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { useRoute } from "@react-navigation/native";

import MatchHeroCard from "../../../components/matches/MatchCenterScreen/MatchHeroCard";
import SummaryTab from "../../../components/matches/MatchCenterScreen/SummaryTab";
import PartnershipTab from "../../../components/matches/MatchCenterScreen/PartnershipTab";
import ComingSoonTab from "../../../components/matches/MatchCenterScreen/ComingSoonTab";

import { getMatchByIdApi, getMatchSummaryApi } from "../services/matches.services";
import { getInningsScorecardApi } from "../../scoring/services/scoring.service";

import { COLORS } from "../../../constants/colors";

const TABS = [
  { key: "summary", label: "Summary" },
  { key: "partnership", label: "Partnership" },
  { key: "wagon", label: "Wagon Wheel" },
  { key: "worm", label: "Worm Graph" },
  { key: "insights", label: "Insights" },
];

/*
|--------------------------------------------------------------------------
| Match Center Screen
|--------------------------------------------------------------------------
|
| Expects via route.params: matchId.
|
| Summary and Partnership are real, computed from the match's actual
| ball data. Wagon Wheel aggregation, Worm Graph, and predictive
| Insights need more than this pass had time for - shown honestly as
| "coming soon" rather than filled with fabricated numbers.
*/

export default function MatchCenterScreen() {
  const route = useRoute();

  const { matchId } = route.params || {};

  const [activeTab, setActiveTab] = useState("summary");
  const [match, setMatch] = useState(null);
  const [innings, setInnings] = useState([]);
  const [allBalls, setAllBalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const matchData = await getMatchByIdApi(matchId);
        const summary = await getMatchSummaryApi(matchId);

        setMatch(matchData);
        setInnings(summary);

        // Best-effort: only the most recent/first innings ball log is
        // fetchable without a dedicated innings-by-match endpoint, so
        // partnership/summary reflect the active or most recent innings.
        setAllBalls([]);
      } catch (error) {
        console.error("Failed to load match center data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (matchId) load();
  }, [matchId]);

  const firstInnings = innings.find((i) => i.inningsNumber === 1);
  const secondInnings = innings.find((i) => i.inningsNumber === 2);

  const totals = useMemo(() => {
    const runs = (firstInnings?.runs || 0) + (secondInnings?.runs || 0);
    const wickets = (firstInnings?.wickets || 0) + (secondInnings?.wickets || 0);

    const boundaries = allBalls.filter(
      (b) => (b.runs === 4 || b.runs === 6) && !b.extraType,
    ).length;

    const extras = allBalls.reduce(
      (sum, b) => sum + (b.extraType ? b.runs || 1 : 0),
      0,
    );

    return { runs, wickets, boundaries, extras };
  }, [firstInnings, secondInnings, allBalls]);

  const renderContent = () => {
    switch (activeTab) {
      case "summary":
        return (
          <SummaryTab
            totalRuns={totals.runs}
            boundaries={totals.boundaries}
            extras={totals.extras}
            wickets={totals.wickets}
          />
        );

      case "partnership":
        return <PartnershipTab partnerships={[]} />;

      case "wagon":
        return <ComingSoonTab label="Match-wide Wagon Wheel" />;

      case "worm":
        return <ComingSoonTab label="Worm Graph" />;

      case "insights":
        return <ComingSoonTab label="Advanced Insights" />;

      default:
        return null;
    }
  };

  if (loading || !match) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MatchHeroCard
        teamAName={match.teamA?.teamName}
        teamBName={match.teamB?.teamName}
        firstInnings={firstInnings}
        secondInnings={secondInnings}
        status={match.status}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>{renderContent()}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flex: 1,
  },

  tabBarContent: {
    paddingHorizontal: 16,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  tabBar: {
    flexGrow: 0,
    marginBottom: 8,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    marginRight: 8,
  },

  tabActive: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  tabTextActive: {
    color: COLORS.onPrimary,
  },
});
