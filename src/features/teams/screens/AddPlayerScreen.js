import React, {
  useState,
} from "react";

import {
  View,
  ScrollView,
} from "react-native";

import TeamSummaryCard from "../components/TeamSummaryCard";
import AddPlayerActionCards from "../components/AddPlayerActionCards";
import PlayerSearchBar from "../components/PlayerSearchBar";
import PlayerCard from "../components/PlayerCard";
import ManualPlayerModal from "../components/ManualPlayerModal";
import PrimaryButton from "../../../components/Button/PrimaryButton";

export default function AddPlayersScreen({
  navigation,
  route,
}) {
  const { teamData } =
    route.params;

  const [searchText, setSearchText] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [players, setPlayers] =
    useState([
      {
        id: "captain",
        name:
          "Current User",
        role: "Captain",
        isCaptain: true,
        isViceCaptain: false,
      },
    ]);

  const addPlayer = (
    player
  ) => {
    setPlayers((prev) => [
      ...prev,
      {
        ...player,
        id:
          Date.now().toString(),
      },
    ]);
  };

  const makeVC = (
    playerId
  ) => {
    setPlayers((prev) =>
      prev.map((player) => ({
        ...player,

        isViceCaptain:
          player.id ===
          playerId,
      }))
    );
  };

  const removePlayer = (
    playerId
  ) => {
    setPlayers((prev) =>
      prev.filter(
        (player) =>
          player.id !==
          playerId
      )
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
        }}
      >
        <TeamSummaryCard
          teamData={teamData}
          players={players}
        />

        <AddPlayerActionCards
          onAddManual={() =>
            setShowModal(
              true
            )
          }
        />

        <PlayerSearchBar
          value={searchText}
          onChangeText={
            setSearchText
          }
        />

        {players.map(
          (player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onMakeVC={
                makeVC
              }
              onRemove={
                removePlayer
              }
            />
          )
        )}
      </ScrollView>

      <PrimaryButton
        title="Review Team Preview"
        onPress={() =>
          navigation.navigate(
            "TeamPreviewScreen",
            {
              teamData,
              players,
            }
          )
        }
      />

      <ManualPlayerModal
        visible={showModal}
        onClose={() =>
          setShowModal(
            false
          )
        }
        onAddPlayer={
          addPlayer
        }
      />
    </View>
  );
}