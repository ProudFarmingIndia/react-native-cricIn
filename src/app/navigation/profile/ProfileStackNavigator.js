import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NavigationHeader from "../../../components/common/NavigationHeader";
import ProfileScreen from "../../../features/profile/screens/ProfileScreen";
import EditProfileScreen from "../../../features/profile/screens/EditProfileScreen";
import CreateTeamScreen from "../../../features/teams/screens/CreateTeamScreen";
import AddPlayerScreen from "../../../features/teams/screens/AddPlayerScreen";

const Stack = createNativeStackNavigator();

const renderHeader = ({ route }) => {
  return <NavigationHeader route={route} />;
};

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: renderHeader,
      }}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
      />

      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
      />

      <Stack.Screen
        name="CreateTeamScreen"
        component={CreateTeamScreen}
      />

      <Stack.Screen
        name="AddPlayerScreen"
        component={AddPlayerScreen}
      />
    </Stack.Navigator>
  );
}
