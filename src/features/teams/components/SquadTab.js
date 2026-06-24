import React from "react";

import TeamPlayerCard from "./TeamPlayerCard";

export default function SquadTab({
  players,
  navigation,
}) {
  return players.map(player => (
    <TeamPlayerCard
      key={player.id}
      player={player}
      navigation={navigation}
    />
  ));
}