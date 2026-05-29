import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
} from "react-native";
import MatchesHeader from "./components/MatchesHeader";
import MatchesTopTabs from "./components/MatchesTopTabs";
import MatchesTab from "./tabs/MatchesTab";
import TournamentTab from "./tabs/TournamentTab";
import TeamsTab from "./tabs/TeamsTab";
import StatsTab from "./tabs/StatsTab";
import HighlightsTab from "./tabs/HighlightsTab";
import { COLORS } from "../../constants/colors";

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
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
      />

      <MatchesHeader />

      <MatchesTopTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <View style={{ flex: 1 }}>
        {renderTab()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});