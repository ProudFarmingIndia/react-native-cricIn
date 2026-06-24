import React, {
  useState,
} from "react";

import {
  View,
  ScrollView,
} from "react-native";

import ChallengeTabs from "../components/ChallengeTabs";
import ChallengeCard from "../components/ChallengeCard";
import EmptyChallengeState from "../components/EmptyChallengeState";

export default function ChallengeInboxScreen() {
  const [activeTab, setActiveTab] =
    useState("received");

  const [receivedChallenges,
    setReceivedChallenges] =
    useState([
      {
        id: "1",
        teamName:
          "Green Valley Strikers",

        format: "T20",

        date:
          "14 Oct 2025",

        time:
          "02:00 PM",

        venue:
          "Riverside Sports Complex",

        status:
          "Pending",
      },

      {
        id: "2",
        teamName:
          "Oceanic XI",

        format:
          "T10",

        date:
          "15 Oct 2025",

        time:
          "09:30 AM",

        venue:
          "Central Turf Grounds",

        status:
          "Pending",
      },
    ]);

  const [sentChallenges,
    setSentChallenges] =
    useState([
      {
        id: "3",

        teamName:
          "Highland Warriors",

        format:
          "ODI",

        date:
          "19 Oct 2025",

        time:
          "10:00 AM",

        venue:
          "Valley View Ground",

        status:
          "Awaiting",
      },
    ]);

  const acceptChallenge =
    challengeId => {
      console.log(
        "Accepted",
        challengeId
      );
    };

  const rejectChallenge =
    challengeId => {
      console.log(
        "Rejected",
        challengeId
      );
    };

  const withdrawChallenge =
    challengeId => {
      setSentChallenges(
        prev =>
          prev.filter(
            item =>
              item.id !==
              challengeId
          )
      );
    };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ChallengeTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        receivedCount={
          receivedChallenges.length
        }
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
        }}
      >
        {activeTab ===
          "received" &&
          receivedChallenges.map(
            challenge => (
              <ChallengeCard
                key={
                  challenge.id
                }
                challenge={
                  challenge
                }
                type="received"
                onAccept={() =>
                  acceptChallenge(
                    challenge.id
                  )
                }
                onReject={() =>
                  rejectChallenge(
                    challenge.id
                  )
                }
              />
            )
          )}

        {activeTab ===
          "sent" &&
          sentChallenges.map(
            challenge => (
              <ChallengeCard
                key={
                  challenge.id
                }
                challenge={
                  challenge
                }
                type="sent"
                onWithdraw={() =>
                  withdrawChallenge(
                    challenge.id
                  )
                }
              />
            )
          )}

        {activeTab ===
          "sent" &&
          sentChallenges.length ===
            0 && (
            <EmptyChallengeState />
          )}
      </ScrollView>
    </View>
  );
}