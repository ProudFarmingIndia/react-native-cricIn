import React from "react";

import {
  View,
} from "react-native";

import TeamPlayerCard from "./TeamPlayerCard";

export default function TeamPlayersTab({
  players,
}) {
  return (
    <View>
      {players.map(
        player => (
          <TeamPlayerCard
            key={
              player.id
            }
            player={
              player
            }
          />
        )
      )}
    </View>
  );
}