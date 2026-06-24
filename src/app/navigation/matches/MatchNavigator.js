import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MatchesStackNavigator from "./MatchesStackNavigator";

import QuickScoreStackNavigator from "./QuickScoreStackNavigator";

const Stack = createNativeStackNavigator();

export default function MatchNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MatchesStack" component={MatchesStackNavigator} />

      <Stack.Screen
        name="QuickScoreFlow"
        component={QuickScoreStackNavigator}
      />
    </Stack.Navigator>
  );
}
