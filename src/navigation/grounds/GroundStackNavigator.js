import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import GroundListScreen from "../../screens/grounds/GroundListScreen";
import GroundDetailScreen from "../../screens/grounds/GroundDetailsScreen";

const Stack = createNativeStackNavigator();

export default function GroundStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="GroundList"
        component={GroundListScreen}
      />

      <Stack.Screen
        name="GroundDetail"
        component={GroundDetailScreen}
      />
    </Stack.Navigator>
  );
}