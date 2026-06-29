import React from "react";

import {
  ScrollView,
  View,
} from "react-native";

import TeamHeroCard from "../components/TeamHeroCard";
import LeadershipCard from "../components/LeadershipCard";
import SquadListCard from "../components/SquadListCard";

import PrimaryButton from "../../../components/Button/PrimaryButton";

export default function TeamPreviewScreen({
  route,
  navigation,
}) {
  const {
    teamData,
    players,
  } = route.params;

  const captain =
    players.find(
      (p) =>
        p.isCaptain
    );

  const viceCaptain =
    players.find(
      (p) =>
        p.isViceCaptain
    );

  const handleCreateTeam =
    async () => {
      navigation.navigate(
        "TeamDetailsScreen"
      );
    };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <TeamHeroCard
        teamData={teamData}
        players={players}
      />

      <LeadershipCard
        title="Captain"
        player={captain}
        type="C"
      />

      {viceCaptain && (
        <LeadershipCard
          title="Vice Captain"
          player={
            viceCaptain
          }
          type="VC"
        />
      )}

      <SquadListCard
        players={players}
      />

      <View
        style={{
          height: 20,
        }}
      />

      <PrimaryButton
        title="Edit Team"
        onPress={() =>
          navigation.goBack()
        }
      />

      <View
        style={{
          height: 12,
        }}
      />

      <PrimaryButton
        title="Finalize & Create Team"
        onPress={
          handleCreateTeam
        }
      />

      <View
        style={{
          height: 40,
        }}
      />
    </ScrollView>
  );
}