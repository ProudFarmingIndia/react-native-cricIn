import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ShopListScreen from "../../screens/shops/ShopListScreen";
import ShopDetailsScreen from "../../screens/shops/ShopDetailsScreen";

const Stack = createNativeStackNavigator();

export default function ShopStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ShopList"
        component={ShopListScreen}
      />

      <Stack.Screen
        name="ShopDetails"
        component={ShopDetailsScreen}
      />
    </Stack.Navigator>
  );
}