import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NavigationHeader from "../../../components/common/NavigationHeader";
import MatchesScreen from "../../../features/matches/screens/MatchesScreen";

/*
| QuickScoreScreen, TeamSelectionScreen and SquadSelectionScreen were
| imported here but never registered - they belong to QuickScoreFlow, which
| owns them. Dead imports on a tab's root stack are not free: Metro still
| resolves and bundles the whole subtree behind them.
|
| This stack is the Matches tab's root and holds exactly one screen. That
| is deliberate - tapping the Matches tab must always land on MatchesScreen.
*/

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
