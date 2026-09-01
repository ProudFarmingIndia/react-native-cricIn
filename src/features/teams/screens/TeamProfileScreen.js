import React, { useState } from "react";

import {
  ScrollView,
  StyleSheet,
} from "react-native";

import TeamProfileHero from "../components/TeamProfileHero";
import TeamStatsCards from "../components/TeamStatsCards";
import TeamProfileTabs from "../components/TeamProfileTabs";
import SquadTab from "../components/SquadTab";
import TeamMatchesTab from "../components/TeamMatchesTab";
import TeamStatsTab from "../components/TeamStatsTab";

export default function TeamProfileScreen({
  navigation,
  route,
}) {
  const [activeTab, setActiveTab] =
    useState("squad");

  const team = {
    id: "1",
    name: "Mumbai Titans",
    city: "Mumbai",
    state: "MH",
    type: "Pro Team",

    stats: {
      matches: 48,
      winRate: 72,
      strength: 8.2,
    },
  };

  const players = [
    {
      id: 1,
      name: "Rahul",
      role: "All Rounder",
      isCaptain: true,
    },
    {
      id: 2,
      name: "Ishaan V",
      role: "Wicket Keeper",
      isViceCaptain: true,
    },
    {
      id: 3,
      name: "Sameer Khan",
      role: "Fast Bowler",
    },
    {
      id: 4,
      name: "Arnav Singh",
      role: "Leg Spinner",
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
    >
      <TeamProfileHero
        team={team}
        navigation={navigation}
      />

      <TeamStatsCards
        stats={team.stats}
      />

      <TeamProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "squad" && (
        <SquadTab
          players={players}
          navigation={navigation}
        />
      )}

      {activeTab === "matches" && (
        <TeamMatchesTab />
      )}

      {activeTab === "stats" && (
        <TeamStatsTab />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
});