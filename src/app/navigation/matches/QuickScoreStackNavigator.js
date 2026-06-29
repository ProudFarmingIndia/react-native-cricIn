import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NavigationHeader from "../../../components/common/NavigationHeader";

import QuickScoreScreen from "../../../features/matches/screens/QuickScoreScreen";
import TeamSelectionScreen from "../../../features/matches/screens/TeamSelectionScreen";
import SquadSelectionScreen from "../../../features/matches/screens/SquadSelectionScreen";
import TossScreen from "../../../features/matches/screens/TossScreen";
import PlayingXISelectionScreen from "../../../features/matches/screens/MatchLineUpScreen";
import LiveScoringScreen from "../../../features/matches/screens/LiveScoringScreen";
import OverSummaryScreen from "../../../features/matches/screens/OverSummaryScreen";
import InningsSummaryScreen from "../../../features/matches/screens/InningsSummaryScreen";
import SecondInningsScreen from "../../../features/matches/screens/SecondInningsScreen";
import MatchResultScreen from "../../../features/matches/screens/MatchResultScreen";
import MatchCenterScreen from "../../../features/matches/screens/MatchCenterScreen";
import ShotSelectionModal from "../../../features/matches/screens/ShotSelectionModal";
import WagonWheelModal from "../../../features/matches/screens/WagonWheelModal";
import WicketDismissalModal from "../../../features/matches/screens/WicketDismissalModal";

const Stack = createNativeStackNavigator();

const renderHeader = ({ route }) => {
  return <NavigationHeader route={route} />;
};

export default function QuickScoreStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: renderHeader,
      }}
    >
      {/* 1 */}
      <Stack.Screen
        name="QuickScoreScreen"
        component={QuickScoreScreen}
        // options={{
        //   header: () => <AppHeader title="Match Setup" showBack />,
        // }}
      />

      {/* 2 */}
      <Stack.Screen
        name="TeamSelectionScreen"
        component={TeamSelectionScreen}
        // options={{
        //   header: () => <AppHeader title="Select Teams" showBack />,
        // }}
      />

      {/* 3 */}
      <Stack.Screen
        name="SquadSelectionScreen"
        component={SquadSelectionScreen}
        // options={{
        //   header: () => <AppHeader title="Select Squad" showBack />,
        // }}
      />

      {/* 4 */}
      <Stack.Screen
        name="TossScreen"
        component={TossScreen}
        // options={{
        //   header: () => <AppHeader title="Toss Session" showBack />,
        // }}
      />

      {/* 5 */}
      <Stack.Screen
        name="PlayingXISelectionScreen"
        component={PlayingXISelectionScreen}
      />

      {/* 6 */}
      <Stack.Screen
        name="LiveScoringScreen"
        component={LiveScoringScreen}
        // options={{
        //   gestureEnabled: false,

        //   header: () => <AppHeader title="CricIn Live" showBack={false} />,
        // }}
      />

      {/* 7 */}
      <Stack.Screen
        name="OverSummaryScreen"
        component={OverSummaryScreen}
        // options={{
        //   header: () => <AppHeader title="Over Summary" showBack />,
        // }}
      />

      {/* 8 */}
      <Stack.Screen
        name="InningsSummaryScreen"
        component={InningsSummaryScreen}
        // options={{
        //   gestureEnabled: false,

        //   header: () => <AppHeader title="Innings Summary" showBack={false} />,
        // }}
      />

      {/* 9 */}
      <Stack.Screen
        name="SecondInningsScreen"
        component={SecondInningsScreen}
        // options={{
        //   gestureEnabled: false,

        //   header: () => <AppHeader title="Second Innings" showBack={false} />,
        // }}
      />

      {/* 10 */}
      <Stack.Screen
        name="MatchResultScreen"
        component={MatchResultScreen}
        // options={{
        //   gestureEnabled: false,

        //   header: () => <AppHeader title="Match Result" showBack={false} />,
        // }}
      />

      {/* 11 */}
      <Stack.Screen
        name="MatchCenterScreen"
        component={MatchCenterScreen}
        // options={{
        //   header: () => <AppHeader title="Match Center" showBack />,
        // }}
      />

      <Stack.Screen
        name="ShotSelectionModal"
        component={ShotSelectionModal}
        options={{
          presentation: "transparentModal",
          headerShown: false,
        }}
      />

      <Stack.Screen 
        name="WagonWheelModal"
        component={WagonWheelModal}
        options={{
          presentation: "transparentModal",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="WicketDismissalModal"
        component={WicketDismissalModal}
        options={{
          presentation: "transparentModal",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
