import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NavigationHeader from "../../../components/common/NavigationHeader";
import CreateTeamScreen from "../../../features/teams/screens/CreateTeamScreen";
import EditTeamScreen from "../../../features/teams/screens/EditTeamScreen";
import ManageViceCaptainScreen from "../../../features/teams/screens/ManageViceCaptainScreen";
import TeamAvailabilityScreen from "../../../features/teams/screens/TeamAvailabilityScreen";
import PlayerProfileScreen from "../../../features/profile/screens/PlayerProfileScreen";
import AddPlayerScreen from "../../../features/teams/screens/AddPlayerScreen";
import InvitePlayerScreen from "../../../features/teams/screens/InvitePlayerScreen";
import AddLocalPlayerScreen from "../../../features/teams/screens/AddLocalPlayerScreen";
import TeamPreviewScreen from "../../../features/teams/screens/TeamPreviewScreen";
import ChallengeInboxScreen from "../../../features/teams/screens/ChallengeInboxScreen";
import ChallengeMatchScreen from "../../../features/teams/screens/ChallengeMatchScreen";
import FindTeamsScreen from "../../../features/teams/screens/FindTeamsScreen";
import TeamProfileScreen from "../../../features/teams/screens/TeamProfileScreen";

/*
| TeamDetailsScreen is also registered in ProfileStackNavigator. It is
| registered here too so that opening a team from a player's Teams tab is
| a push inside THIS stack - Back then returns to the player profile.
| Routing it through the Profile tab instead would yank the user out of
| the team flow and leave a confusing back stack.
*/
import TeamDetailsScreen from "../../../features/teams/screens/TeamDetailsScreen";

const Stack = createNativeStackNavigator();

const renderHeader = ({ route }) => <NavigationHeader route={route} />;

export default function TeamStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: renderHeader,
      }}
    >
      <Stack.Screen name="CreateTeamScreen" component={CreateTeamScreen} />
      <Stack.Screen name="EditTeamScreen" component={EditTeamScreen} />
      <Stack.Screen name="ManageViceCaptainScreen" component={ManageViceCaptainScreen} />
      <Stack.Screen name="TeamAvailabilityScreen" component={TeamAvailabilityScreen} />
      <Stack.Screen name="PlayerProfileScreen" component={PlayerProfileScreen} />
      <Stack.Screen name="AddPlayerScreen" component={AddPlayerScreen} />
      <Stack.Screen name="InvitePlayerScreen" component={InvitePlayerScreen} />

      <Stack.Screen
        name="AddLocalPlayerScreen"
        component={AddLocalPlayerScreen}
      />
      <Stack.Screen name="TeamPreviewScreen" component={TeamPreviewScreen} />
      <Stack.Screen name="TeamDetailsScreen" component={TeamDetailsScreen} />
      <Stack.Screen name="TeamProfileScreen" component={TeamProfileScreen} />
      <Stack.Screen name="FindTeamsScreen" component={FindTeamsScreen} />
      <Stack.Screen
        name="ChallengeMatchScreen"
        component={ChallengeMatchScreen}
      />
      <Stack.Screen
        name="ChallengeInboxScreen"
        component={ChallengeInboxScreen}
      />
    </Stack.Navigator>
  );
}