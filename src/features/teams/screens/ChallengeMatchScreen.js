import React, {
  useState,
} from "react";

import {
  View,
  ScrollView,
} from "react-native";

import PrimaryButton from "../../../components/Button/PrimaryButton";

import ChallengeHeroCard from "../components/ChallengeHeroCard";
import MatchDetailsForm from "../components/MatchDetailsForm";
import OversSelector from "../components/OversSelector";
import ChallengeInfoCard from "../components/ChallengeInfoCard";

export default function ChallengeMatchScreen({
  navigation,
  route,
}) {
  const { team } =
    route.params;

  const [challengeData,
    setChallengeData] =
    useState({
      date: "",

      time: "",

      venue: "",

      matchType:
        "T20 Professional",

      overs: 20,
    });

  const updateField = (
    key,
    value
  ) => {
    setChallengeData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSendChallenge =
    () => {
      navigation.navigate(
        "MatchRequestSentScreen",
        {
          team,
          challengeData,
        }
      );
    };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
        }}
      >
        <ChallengeHeroCard
          opponentTeam={team}
        />

        <MatchDetailsForm
          challengeData={
            challengeData
          }
          updateField={
            updateField
          }
        />

        <OversSelector
          overs={
            challengeData.overs
          }
          onChange={value =>
            updateField(
              "overs",
              value
            )
          }
        />

        <ChallengeInfoCard />
      </ScrollView>

      <PrimaryButton
        title="Send Challenge Request"
        onPress={
          handleSendChallenge
        }
      />
    </View>
  );
}