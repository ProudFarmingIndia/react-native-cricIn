import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NavigationHeader from "../../../components/common/NavigationHeader";
import GroundsScreen from "../../../features/grounds/screens/GroundsScreen";

const Stack = createNativeStackNavigator();

const renderHeader = ({ route }) => {
  return <NavigationHeader route={route} />;
};

export default function GroundsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: renderHeader,
      }}
    >
      <Stack.Screen
        name="GroundsScreen"
        component={GroundsScreen}
      />
    </Stack.Navigator>
  );
}