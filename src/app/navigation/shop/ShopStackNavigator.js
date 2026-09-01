import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NavigationHeader from "../../../components/common/NavigationHeader";
import ShopScreen from "../../../features/shop/screens/ShopScreen";

const Stack = createNativeStackNavigator();

const renderHeader = ({ route }) => {
  return <NavigationHeader route={route} />;
};

export default function ShopStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: renderHeader,
      }}
    >
      <Stack.Screen
        name="ShopScreen"
        component={ShopScreen}
      />
    </Stack.Navigator>
  );
}