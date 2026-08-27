import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import HomeStackNavigator from "./home/HomeStackNavigator";
import MatchNavigator from "./matches/MatchNavigator";
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

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
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

      <Tab.Screen name="Matches" component={MatchNavigator} />

      <Tab.Screen name="Grounds" component={GroundsStackNavigator} />

      <Tab.Screen name="Shop" component={ShopStackNavigator} />

      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
