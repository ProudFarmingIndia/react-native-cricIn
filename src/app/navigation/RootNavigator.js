import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainNavigator from "./MainNavigator";
import TeamStackNavigator from "./teams/TeamStackNavigator";
import SearchScreen from "../../features/search/screens/SearchScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainNavigator}
      />

      <Stack.Screen
        name="TeamStack"
        component={TeamStackNavigator}
      />

      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
      />
    </Stack.Navigator>
  );
}