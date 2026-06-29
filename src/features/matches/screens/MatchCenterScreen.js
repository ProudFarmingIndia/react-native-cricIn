import React, { useState } from "react";

import {
  SafeAreaView,
  View,
} from "react-native";

import MatchHeroCard from "../../../components/matches/MatchCenterScreen/MatchHeroCard";
import WinProbabilityCard from "../../../components/matches/MatchCenterScreen/WinProbabilityCard";
import AnalyticsTabs from "../../../components/matches/MatchCenterScreen/AnalyticsTabs";

import SummaryTab from "../../../components/matches/MatchCenterScreen/SummaryTab";
import WagonWheelTab from "../../../components/matches/MatchCenterScreen/WagonWheelTab";
import PartnershipTab from "../../../components/matches/MatchCenterScreen/PartnershipTab";
import WormGraphTab from "../../../components/matches/MatchCenterScreen/WormGraphTab";
import InsightsTab from "../../../components/matches/MatchCenterScreen/InsightsTab";

export default function MatchCenterScreen() {
  const [activeTab, setActiveTab] =
    useState("summary");

  const renderContent = () => {
    switch (activeTab) {
      case "summary":
        return <SummaryTab />;

      case "wagon":
        return <WagonWheelTab />;

      case "partnership":
        return <PartnershipTab />;

      case "worm":
        return <WormGraphTab />;

      case "insights":
        return <InsightsTab />;

      default:
        return <SummaryTab />;
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1 }}
    >
      <MatchHeroCard />

      <WinProbabilityCard />

      <AnalyticsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <View
        style={{
          flex: 1,
        }}
      >
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}