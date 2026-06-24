import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MatchesScreen from "../../../features/matches/screens/MatchesScreen";

import QuickScoreScreen from "../../../features/matches/screens/QuickScoreScreen";

import TeamSelectionScreen from "../../../features/matches/screens/TeamSelectionScreen";

import SquadSelectionScreen from "../../../features/matches/screens/SquadSelectionScreen";

const Stack = createNativeStackNavigator();

export default function MatchesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="MatchesScreen"
    >
      <Stack.Screen name="MatchesScreen" component={MatchesScreen} />
    </Stack.Navigator>
  );
}
