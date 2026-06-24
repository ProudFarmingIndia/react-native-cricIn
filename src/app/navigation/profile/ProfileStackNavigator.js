import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppHeader from "../../../components/common/AppHeader";

import ProfileScreen from "../../../features/profile/screens/ProfileScreen";

import EditProfileScreen from "../../../features/profile/screens/EditProfileScreen";

import CreateTeamScreen from "../../../features/teams/screens/CreateTeamScreen";

import AddPlayerScreen from "../../../features/teams/screens/AddPlayerScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          header: () => <AppHeader title="Profile" showBack={false} />,
        }}
      />

      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{
          header: () => <AppHeader title="Edit Profile" showBack />,
        }}
      />

      <Stack.Screen
        name="CreateTeamScreen"
        component={CreateTeamScreen}
        options={{
          header: () => <AppHeader title="Create Team" showBack />,
        }}
      />

      <Stack.Screen
        name="AddPlayerScreen"
        component={AddPlayerScreen}
        options={{
          header: () => <AppHeader title="Add Player" showBack />,
        }}
      />
    </Stack.Navigator>
  );
}
