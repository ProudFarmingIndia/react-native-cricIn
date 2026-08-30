import React, { useState } from "react";
import { SafeAreaView, StyleSheet, StatusBar, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import MatchesTopTabs from "../../../components/matches/MatchesTopTabs";
import MatchesTab from "../../../components/tabs/MatchesTab";
import TournamentTab from "../../../components/tabs/TournamentTab";
import TeamsTab from "../../../components/tabs/TeamsTab";
import StatsTab from "../../../components/tabs/StatsTab";
import HighlightsTab from "../../../components/tabs/HighlightsTab";
import { COLORS } from "../../../constants/colors";

const TAB_NAMES = ["Matches", "Tournaments", "Teams", "Stats", "Highlights"];

export default function MatchListScreen() {
  const route = useRoute();

  /*
  | initialTab lets another screen open this one on a specific tab - the
  | sidebar's "Teams" item uses it. Validated against the real tab names so
  | a stale or misspelled value falls back to Matches rather than rendering
  | an empty screen.
  */

  const { initialTab } = route.params || {};

  const [activeTab, setActiveTab] = useState(
    TAB_NAMES.includes(initialTab) ? initialTab : "Matches",
  );

  const renderTab = () => {
    switch (activeTab) {
      case "Matches":
        return <MatchesTab />;

      case "Tournaments":
        return <TournamentTab />;

      case "Teams":
        return <TeamsTab />;

      case "Stats":
        return <StatsTab />;

      case "Highlights":
        return <HighlightsTab />;

      default:
        return <MatchesTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      {/*
      | MatchesHeader is gone - it was a SECOND header stacked under the
      | real one, so the screen showed "Matches" and then "Cricket Pro /
      | Live Scores & Tournaments" directly beneath it.
      |
      | Nothing was lost by removing it: its search, bell and avatar
      | buttons had no onPress handlers at all, so all three were
      | decorative. The working equivalents live in NavigationHeader, and
      | the bell is now switched on for this screen in headerConstant.
      */}

      <MatchesTopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <View style={styles.content}>{renderTab()}</View>
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
});
