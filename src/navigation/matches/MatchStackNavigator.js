import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MatchListScreen from "../../screens/matches/MatchListScreen";

import QuickScoreScreen from "../../screens/matches/QuickScoreScreen";

import SquadSelectForMatch from "../../screens/matches/SquadSelectForMatch";

import TossScreen from "../../screens/matches/TossScreen";

import MatchLineUpScreen from "../../screens/matches/MatchLineUpScreen";

import LiveScoringScreen from "../../screens/matches/LiveScoringScreen";

import ShotSelectionScreen from "../../screens/matches/ShotSelectionScreen";

import InningsSummaryScreen from "../../screens/matches/InningsSummaryScreen";

import MatchCenterScreen from "../../screens/matches/MatchCenterScreen";

import MatchResultScreen from "../../screens/matches/MatchResultScreen";

import CreateTeamScreen from "../../screens/matches/CreateTeamScreen";

const Stack = createNativeStackNavigator();

export default function MatchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MatchListScreen"
        component={MatchListScreen}
      />

      <Stack.Screen
        name="QuickScoreScreen"
        component={QuickScoreScreen}
      />

      <Stack.Screen
        name="SquadSelectForMatch"
        component={SquadSelectForMatch}
      />

      <Stack.Screen
        name="TossScreen"
        component={TossScreen}
      />

      <Stack.Screen
        name="MatchLineUpScreen"
        component={MatchLineUpScreen}
      />

      <Stack.Screen
        name="LiveScoringScreen"
        component={LiveScoringScreen}
      />

      <Stack.Screen
        name="ShotSelectionScreen"
        component={ShotSelectionScreen}
      />

      <Stack.Screen
        name="InningsSummaryScreen"
        component={InningsSummaryScreen}
      />

      <Stack.Screen
        name="MatchCenterScreen"
        component={MatchCenterScreen}
      />

      <Stack.Screen
        name="MatchResultScreen"
        component={MatchResultScreen}
      />

      <Stack.Screen
        name="CreateTeamScreen"
        component={CreateTeamScreen}
      />
    </Stack.Navigator>
  );
}