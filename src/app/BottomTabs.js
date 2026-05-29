import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import HomeScreen from "../screens/home/HomeScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import MatchStackNavigator from "../navigation/matches/MatchStackNavigator";
import GroundStackNavigator from "../navigation/grounds/GroundStackNavigator";
import ShopStackNavigator from "../navigation/shop/ShopStackNavigator";

import { COLORS } from "../constants/colors";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
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

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Matches") {
            iconName = focused ? "trophy" : "trophy-outline";
          } else if (route.name === "Grounds") {
            iconName = focused ? "location" : "location-outline";
          } else if (route.name === "Shop") {
            iconName = focused ? "bag" : "bag-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen
   name="Matches"
   component={MatchStackNavigator}
/>

      <Tab.Screen name="Grounds" component={GroundStackNavigator} />

      <Tab.Screen name="Shop" component={ShopStackNavigator} />

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
