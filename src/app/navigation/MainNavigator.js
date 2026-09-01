import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StackActions } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import HomeStackNavigator from "./home/HomeStackNavigator";
/*
| The Matches tab now points straight at MatchesStackNavigator.
|
| It used to point at MatchNavigator, a wrapper stack holding MatchesStack
| and QuickScoreFlow. QuickScoreFlow has moved to RootNavigator, so that
| wrapper had one child left and was pure indirection - matches/
| MatchNavigator.js is now unused and can be deleted.
*/

import MatchesStackNavigator from "./matches/MatchesStackNavigator";
import GroundsStackNavigator from "./grounds/GroundsStackNavigator";
import ShopStackNavigator from "./shop/ShopStackNavigator";
import ProfileStackNavigator from "./profile/ProfileStackNavigator";

import { COLORS } from "../../constants/colors";

const Tab = createBottomTabNavigator();

const getTabBarIcon = (routeName, focused, color) => {
  const iconMap = {
    Home: focused ? "home" : "home-outline",
    Matches: focused ? "trophy" : "trophy-outline",
    Grounds: focused ? "location" : "location-outline",
    Shop: focused ? "bag" : "bag-outline",
    Profile: focused ? "person" : "person-outline",
  };

  return (
    <Ionicons
      name={iconMap[routeName] || "ellipse-outline"}
      size={22}
      color={color}
    />
  );
};

/*
|--------------------------------------------------------------------------
| Tab Press Always Lands On The Tab's Root Screen
|--------------------------------------------------------------------------
|
| Each tab owns a stack, and a tab remembers where it was left. That is the
| default and usually what you want, but the bottom bar here is meant to be
| five fixed destinations: Home -> HomeScreen, Matches -> MatchesScreen,
| Grounds -> GroundsScreen, Shop -> ShopScreen, Profile -> ProfileScreen.
| Every tap returns that tab to its first screen.
|
| This is the second half of a two-part fix. The first half was structural:
| QuickScoreFlow used to be a route INSIDE the Matches tab, so starting a
| Quick Score from Home pushed onto that tab and tapping "Matches"
| afterwards restored Quick Score instead of the match list. That flow now
| lives on RootNavigator, above the tab bar.
|
| This listener covers everything else, because tabs still go deep on their
| own: the Profile tab pushes EditProfileScreen and TeamDetailsScreen, and
| without it, leaving Profile mid-edit and coming back would drop you into
| the edit form rather than the profile.
|
| WHY RECURSIVE
| Tabs nest to different depths, and a tab's root stack can itself contain
| nested navigators. Popping only the outermost level would leave an inner
| stack parked wherever it was, so the walk below resets every nested level
| that is not already at its root.
|
| WHY NO preventDefault()
| The listener fires for the tab you are ALREADY on and for one you are
| switching to. Calling e.preventDefault() would reset the stack but cancel
| the tab switch, so tapping "Matches" from Home would silently do nothing.
| Dispatching popToTop and letting the default action run afterwards
| handles both cases: the stack resets, then the tab switches, and it lands
| on the root screen.
|
| A dispatch is targeted at a specific navigator by key, so this never
| touches any tab other than the one that was pressed.
|
*/

const resetNavigatorToRoot = (navigation, navigatorState) => {
  if (!navigatorState) {
    return;
  }

  /*
  | A route's nested state can be a PARTIAL state during rehydration - it
  | describes where the navigator should go but has no key yet, because
  | that navigator has not mounted. There is nothing to dispatch to, and
  | nothing to reset either: an unmounted stack has no history.
  */

  const { key, index, routes } = navigatorState;

  if (Array.isArray(routes)) {
    const focusedRoute = routes[index ?? 0];

    // Depth first, so inner stacks are reset before their parent unmounts.
    resetNavigatorToRoot(navigation, focusedRoute?.state);
  }

  if (key && (index ?? 0) > 0) {
    navigation.dispatch({
      ...StackActions.popToTop(),
      target: key,
    });
  }
};

const handleTabPress = (navigation, event) => {
  const tabState = navigation.getState();

  /*
  | event.target is the key of the tab route that was pressed - not the
  | focused one. Matching on it is what keeps this correct when you tap a
  | tab you are not currently on.
  */

  const pressedTab = tabState?.routes?.find(
    (route) => route.key === event?.target,
  );

  resetNavigatorToRoot(navigation, pressedTab?.state);
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenListeners={({ navigation }) => ({
        tabPress: (event) => handleTabPress(navigation, event),
      })}
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          height: 75,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "rgba(255,255,255,0.95)",
          borderTopColor: COLORS.outlineVariant,
        },

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.onSurfaceVariant,

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },

        tabBarIcon: ({ focused, color }) =>
          getTabBarIcon(route.name, focused, color),
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />

      <Tab.Screen name="Matches" component={MatchesStackNavigator} />

      <Tab.Screen name="Grounds" component={GroundsStackNavigator} />

      <Tab.Screen name="Shop" component={ShopStackNavigator} />

      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
