import React, {
  useState,
} from "react";

import {
  ScrollView,
  View,
} from "react-native";

import TeamHeroSection from "../components/TeamHeroSection";
import TeamActionButtons from "../components/TeamActionButtons";
import TeamTabs from "../components/TeamTabs";
import TeamPlayersTab from "../components/TeamPlayersTab";
import TeamMatchesTab from "../components/TeamMatchesTab";
import TeamStatsTab from "../components/TeamStatsTab";

export default function TeamDetailsScreen({
  navigation,
}) {
  const [activeTab, setActiveTab] =
    useState("players");

  const team = {
    teamName: "Delhi Warriors",
    captain: "Gagan",
    viceCaptain: "Rahul",
    squadSize: 15,
    teamType: "PRO TEAM",
  };

  const players = [
    {
      id: 1,
      name: "Gagan",
      role: "All Rounder",
      captain: true,
    },
    {
      id: 2,
      name: "Rahul",
      role: "Wicket Keeper",
      viceCaptain: true,
    },
    {
      id: 3,
      name: "Arjun",
      role: "Fast Bowler",
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <TeamHeroSection
        team={team}
      />

      <TeamActionButtons
        navigation={navigation}
      />

      <TeamTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab ===
        "players" && (
        <TeamPlayersTab
          players={players}
        />
      )}

      {activeTab ===
        "matches" && (
        <TeamMatchesTab />
      )}

      {activeTab ===
        "stats" && (
        <TeamStatsTab />
      )}
    </ScrollView>
  );
}