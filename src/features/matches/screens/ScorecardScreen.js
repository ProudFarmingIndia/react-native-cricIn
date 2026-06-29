import React, { useState } from "react";

import { View, SafeAreaView } from "react-native";

import MatchSummaryCard from "../../../components/matches/ScoreCardScreen/MatchSummaryCard";

import ScorecardTabs from "../../../components/matches/ScoreCardScreen/ScorecardTabs";

import BattingTab from "../../../components/matches/ScoreCardScreen/BattingTab";

import BowlingTab from "../../../components/matches/ScoreCardScreen/BowlingTab";

import FOWTab from "../../../components/matches/ScoreCardScreen/FOWTab";

import PartnershipsTab from "../../../components/matches/ScoreCardScreen/PartnershipsTab";

import InfoTab from "../../../components/matches/ScoreCardScreen/InfoTab";

export default function ScorecardScreen() {
  const [activeTab, setActiveTab] = useState("batting");

  const renderTab = () => {
    switch (activeTab) {
      case "batting":
        return <BattingTab />;

      case "bowling":
        return <BowlingTab />;

      case "fow":
        return <FOWTab />;

      case "partnerships":
        return <PartnershipsTab />;

      case "info":
        return <InfoTab />;

      default:
        return <BattingTab />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MatchSummaryCard />

      <ScorecardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {renderTab()}
    </SafeAreaView>
  );
}
