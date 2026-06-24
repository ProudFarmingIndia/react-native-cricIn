import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import ShopScreen
from "../../../features/shop/screens/ShopScreen";

const Stack =
  createNativeStackNavigator();

export default function ShopStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ShopScreen"
        component={ShopScreen}
      />
    </Stack.Navigator>
  );
}