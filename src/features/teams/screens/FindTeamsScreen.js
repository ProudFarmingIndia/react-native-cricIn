import React, {
  useState,
} from "react";

import {
  ScrollView,
  View,
} from "react-native";

import TeamSearchBar from "../components/TeamSearchBar";
import TeamFilterChips from "../components/TeamFilterChips";
import TeamCard from "../components/TeamCard";

export default function FindTeamsScreen({
  navigation,
}) {
  const [search, setSearch] =
    useState("");

  const [selectedFilter,
    setSelectedFilter] =
    useState("Nearby");

  const teams = [
    {
      id: "1",

      name:
        "Mumbai Titans",

      captain:
        "Rahul",

      strength: 8.2,

      location:
        "Mumbai",

      banner:
        "https://picsum.photos/500/300",
    },

    {
      id: "2",

      name:
        "Delhi Dynamos",

      captain:
        "Vikram",

      strength: 8.5,

      location:
        "Delhi",

      banner:
        "https://picsum.photos/501/300",
    },

    {
      id: "3",

      name:
        "Pune Hawks",

      captain:
        "Sameer",

      strength: 8.0,

      location:
        "Pune",

      banner:
        "https://picsum.photos/502/300",
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <TeamSearchBar
        value={search}
        onChangeText={
          setSearch
        }
      />

      <View
        style={{
          marginBottom: 16,
        }}
      >
        <TeamFilterChips
          selected={
            selectedFilter
          }
          setSelected={
            setSelectedFilter
          }
        />
      </View>

      {teams.map(team => (
        <TeamCard
          key={team.id}
          team={team}
          navigation={
            navigation
          }
        />
      ))}
    </ScrollView>
  );
}