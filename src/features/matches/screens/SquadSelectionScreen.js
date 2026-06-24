import React, { useState } from "react";

import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import SquadTeamSection from "../../../components/matches/SquadSelectionScreen/SquadTeamSection";
import SquadProgressBar from "../../../components/matches/SquadSelectionScreen/SquadProgressBar";

import { COLORS } from "../../../constants/colors";

const PLAYERS = [
  {
    _id: "1",
    name: "Virat Kohli",
    role: "Batter",
    batting: "RHB",
    bowling: "RAM",
  },
  {
    _id: "2",
    name: "Rohit Sharma",
    role: "Batter",
    batting: "RHB",
    bowling: "-",
  },
  {
    _id: "3",
    name: "Hardik Pandya",
    role: "All Rounder",
    batting: "RHB",
    bowling: "RAM",
  },
  {
    _id: "4",
    name: "Jasprit Bumrah",
    role: "Bowler",
    batting: "RHB",
    bowling: "RF",
  },
];

export default function SquadSelectionScreen() {
  const navigation = useNavigation();

  const [teamA, setTeamA] =
    useState([]);

  const [teamB, setTeamB] =
    useState([]);

  const [captainA, setCaptainA] =
    useState(null);

  const [viceCaptainA,
    setViceCaptainA] =
    useState(null);

  const [captainB, setCaptainB] =
    useState(null);

  const [viceCaptainB,
    setViceCaptainB] =
    useState(null);

  const togglePlayer = (
    player,
    team,
    setter
  ) => {
    setter((prev) => {
      const exists = prev.find(
        (p) =>
          p._id === player._id
      );

      if (exists) {
        return prev.filter(
          (p) =>
            p._id !== player._id
        );
      }

      if (prev.length >= 11) {
        Alert.alert(
          "Maximum 11 players allowed"
        );

        return prev;
      }

      return [...prev, player];
    });
  };

  const handleContinue = () => {
    if (
      teamA.length !== 11 ||
      teamB.length !== 11
    ) {
      Alert.alert(
        "Both teams must have 11 players"
      );

      return;
    }

    navigation.navigate(
      "TossScreen"
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 160,
        }}
      >
        <SquadTeamSection
          teamLabel="TEAM A"
          teamName="Green Valley CC"
          players={PLAYERS}
          selectedPlayers={teamA}
          captain={captainA}
          viceCaptain={
            viceCaptainA
          }
          searchText=""
          onSearch={() => {}}
          onSelectPlayer={(
            player
          ) =>
            togglePlayer(
              player,
              teamA,
              setTeamA
            )
          }
          onSetCaptain={
            setCaptainA
          }
          onSetViceCaptain={
            setViceCaptainA
          }
        />

        <SquadTeamSection
          teamLabel="TEAM B"
          teamName="Desert Heat XI"
          players={PLAYERS}
          selectedPlayers={teamB}
          captain={captainB}
          viceCaptain={
            viceCaptainB
          }
          searchText=""
          onSearch={() => {}}
          onSelectPlayer={(
            player
          ) =>
            togglePlayer(
              player,
              teamB,
              setTeamB
            )
          }
          onSetCaptain={
            setCaptainB
          }
          onSetViceCaptain={
            setViceCaptainB
          }
        />
      </ScrollView>

      <SquadProgressBar
        selectedCount={
          teamA.length +
          teamB.length
        }
        onContinue={
          handleContinue
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },
  });