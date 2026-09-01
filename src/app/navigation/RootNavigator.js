import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainNavigator from "./MainNavigator";
import TeamStackNavigator from "./teams/TeamStackNavigator";
import SearchScreen from "../../features/search/screens/SearchScreen";

/*
| Notifications sit at the ROOT, not inside the Home stack.
|
| headerConstant enables the bell on ProfileScreen and ShopScreen too, but
| NotificationScreen was only registered in HomeStackNavigator - so tapping
| the bell from the Profile or Shop tab could not resolve the route. At the
| root it is reachable from anywhere.
*/
import NotificationScreen from "../../features/notifications/screens/NotificationScreen";
import NotificationDetailScreen from "../../features/notifications/screens/NotificationDetailScreen";
import FollowListScreen from "../../features/follows/screens/FollowListScreen";

/*
| Live Scoring lives at the root because the sidebar opens it from any tab,
| and it pushes into QuickScoreFlow (also a root route) rather than into a
| tab's stack.
*/

import LiveScoringListScreen from "../../features/matches/screens/LiveScoringListScreen";

/*
| QuickScoreFlow lives at the ROOT, not inside the Matches tab.
|
| It used to be the Matches tab's second route, which meant starting a
| Quick Score from Home pushed onto that tab. Tapping "Matches" afterwards
| restored the tab's own top screen - Quick Score, not the Matches list -
| so the bottom bar appeared broken.
|
| At the root it is a modal-style flow above the tab bar: it opens only
| when the user starts it, it covers the tabs while scoring (which is what
| you want for a full-screen scoring session), and the five tabs stay five
| fixed destinations. Backing out of the flow returns to whichever tab the
| user was on when they started it.
*/

import QuickScoreStackNavigator from "./matches/QuickScoreStackNavigator";
import NavigationHeader from "../../components/common/NavigationHeader";

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

      <Stack.Screen
        name="QuickScoreFlow"
        component={QuickScoreStackNavigator}
      />

      <Stack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={{
          headerShown: true,
          header: ({ route }) => <NavigationHeader route={route} />,
        }}
      />

      {/*
      | Followers / Following lists. At the root because they are opened
      | from a player profile, a team preview and the sidebar - all of
      | which live in different stacks.
      */}
      <Stack.Screen
        name="LiveScoringListScreen"
        component={LiveScoringListScreen}
        options={{
          headerShown: true,
          header: ({ route }) => <NavigationHeader route={route} />,
        }}
      />

      <Stack.Screen
        name="FollowListScreen"
        component={FollowListScreen}
        options={{
          headerShown: true,
          header: ({ route }) => <NavigationHeader route={route} />,
        }}
      />

      <Stack.Screen
        name="NotificationDetailScreen"
        component={NotificationDetailScreen}
        options={{
          headerShown: true,
          header: ({ route }) => <NavigationHeader route={route} />,
        }}
      />
    </Stack.Navigator>
  );
}