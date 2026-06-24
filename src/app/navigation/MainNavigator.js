import React from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Ionicons from "@expo/vector-icons/Ionicons";

import HomeStackNavigator from "./home/HomeStackNavigator";

import MatchNavigator from "./matches/MatchNavigator";

import GroundsStackNavigator from "./grounds/GroundsStackNavigator";

import ShopStackNavigator from "./shop/ShopStackNavigator";

import ProfileStackNavigator from "./profile/ProfileStackNavigator";

import TeamStackNavigator from "./teams/TeamStackNavigator";

import { COLORS } from "../../constants/colors";

const Tab = createBottomTabNavigator();

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

        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;

            case "Matches":
              iconName = focused ? "trophy" : "trophy-outline";
              break;

            case "Grounds":
              iconName = focused ? "location" : "location-outline";
              break;

            case "Shop":
              iconName = focused ? "bag" : "bag-outline";
              break;

            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;

            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
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
