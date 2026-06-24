import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import CreateTeamScreen
from "../../../features/teams/screens/CreateTeamScreen";

const Stack =
  createNativeStackNavigator();

export default function TeamStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="CreateTeamScreen"
        component={CreateTeamScreen}
      />
    </Stack.Navigator>
  );
}