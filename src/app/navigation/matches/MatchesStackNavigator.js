import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NavigationHeader from "../../../components/common/NavigationHeader";
import MatchesScreen from "../../../features/matches/screens/MatchesScreen";
import QuickScoreScreen from "../../../features/matches/screens/QuickScoreScreen";
import TeamSelectionScreen from "../../../features/matches/screens/TeamSelectionScreen";
import SquadSelectionScreen from "../../../features/matches/screens/SquadSelectionScreen";

const Stack = createNativeStackNavigator();

const renderHeader = ({ route }) => {
  return <NavigationHeader route={route} />;
};

export default function MatchesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: renderHeader,
      }}
      initialRouteName="MatchesScreen"
    >
      <Stack.Screen name="MatchesScreen" component={MatchesScreen} />
    </Stack.Navigator>
  );
}
