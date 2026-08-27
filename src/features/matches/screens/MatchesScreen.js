import React, { useState } from "react";
import { SafeAreaView, StyleSheet, StatusBar, View } from "react-native";
import MatchesHeader from "../../../components/matches/MatchesHeader";
import MatchesTopTabs from "../../../components/matches/MatchesTopTabs";
import MatchesTab from "../../../components/tabs/MatchesTab";
import TournamentTab from "../../../components/tabs/TournamentTab";
import TeamsTab from "../../../components/tabs/TeamsTab";
import StatsTab from "../../../components/tabs/StatsTab";
import HighlightsTab from "../../../components/tabs/HighlightsTab";
import { COLORS } from "../../../constants/colors";

export default function MatchListScreen() {
  const [activeTab, setActiveTab] = useState("Matches");

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

      <MatchesHeader />

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
