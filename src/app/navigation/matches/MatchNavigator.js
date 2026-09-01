import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NavigationHeader from "../../../components/common/NavigationHeader";
import MatchesStackNavigator from "./MatchesStackNavigator";
import QuickScoreStackNavigator from "./QuickScoreStackNavigator";

const Stack = createNativeStackNavigator();

const renderHeader = ({ route }) => {
  return <NavigationHeader route={route} />;
};

export default function MatchNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: renderHeader,
      }}
    >
      <Stack.Screen
        name="MatchesStack"
        component={MatchesStackNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="QuickScoreFlow"
        component={QuickScoreStackNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
