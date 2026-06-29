import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NavigationHeader from "../../../components/common/NavigationHeader";
import CreateTeamScreen from "../../../features/teams/screens/CreateTeamScreen";

const Stack = createNativeStackNavigator();

export default function TeamStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ route }) => <NavigationHeader route={route} />,
      }}
    >
      <Stack.Screen name="CreateTeamScreen" component={CreateTeamScreen} />
    </Stack.Navigator>
  );
}
