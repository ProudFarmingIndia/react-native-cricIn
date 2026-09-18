import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainNavigator from "./MainNavigator";
import TeamStackNavigator from "./teams/TeamStackNavigator";
import SearchScreen from "../../features/search/screens/SearchScreen";

/*
| Notifications sit at the ROOT, not inside the Home stack.
|
| headerConstant enables the bell on ProfileScreen and ShopScreen too, but
| NotificationScreen was only registered in HomeStackNavigator - so tapping
| the bell from the Profile or Shop tab could not resolve the route. At the
| root it is reachable from anywhere.
*/
import NotificationScreen from "../../features/notifications/screens/NotificationScreen";
import NotificationDetailScreen from "../../features/notifications/screens/NotificationDetailScreen";
import FollowListScreen from "../../features/follows/screens/FollowListScreen";

/*
| Live Scoring lives at the root because the sidebar opens it from any tab,
| and it pushes into QuickScoreFlow (also a root route) rather than into a
| tab's stack.
*/

import LiveScoringListScreen from "../../features/matches/screens/LiveScoringListScreen";

/*
| QuickScoreFlow lives at the ROOT, not inside the Matches tab.
|
| It used to be the Matches tab's second route, which meant starting a
| Quick Score from Home pushed onto that tab. Tapping "Matches" afterwards
| restored the tab's own top screen - Quick Score, not the Matches list -
| so the bottom bar appeared broken.
|
| At the root it is a modal-style flow above the tab bar: it opens only
| when the user starts it, it covers the tabs while scoring (which is what
| you want for a full-screen scoring session), and the five tabs stay five
| fixed destinations. Backing out of the flow returns to whichever tab the
| user was on when they started it.
*/

import QuickScoreStackNavigator from "./matches/QuickScoreStackNavigator";
import NavigationHeader from "../../components/common/NavigationHeader";

/*
|--------------------------------------------------------------------------
| Live Streaming
|--------------------------------------------------------------------------
|
| All five live-stream screens live at the ROOT, for the same reason
| NotificationScreen does: they are opened from everywhere.
|
|   WatchLiveScreen      - Home, the Matches tab, MatchDetailsScreen, a
|                          notification, and the scorer's own panel
|   GoLiveScreen         - the sidebar, MatchDetailsScreen, the scoring pad
|   AssignBroadcaster    - GoLiveScreen
|   BroadcastInvite      - a notification, and the streaming list
|   BroadcastSetup       - after accepting an invite
|
| Putting them inside any one tab's stack would mean opening a stream from
| Home pushes onto that tab - the exact bug QuickScoreFlow was moved up
| here to fix. It would also make "watch" from a notification unresolvable
| from four of the five tabs.
|
*/

import WatchLiveScreen from "../../features/liveStream/screens/WatchLiveScreen";
import GoLiveScreen from "../../features/liveStream/screens/GoLiveScreen";
import AssignBroadcasterScreen from "../../features/liveStream/screens/AssignBroadcasterScreen";
import BroadcastInviteScreen from "../../features/liveStream/screens/BroadcastInviteScreen";
import BroadcastSetupScreen from "../../features/liveStream/screens/BroadcastSetupScreen";
import LiveStreamingListScreen from "../../features/liveStream/screens/LiveStreamingListScreen";

/*
|--------------------------------------------------------------------------
| Tournaments
|--------------------------------------------------------------------------
|
| At the ROOT, same reasoning as live streaming. A tournament is reached
| from the home feed, the Matches tab, the sidebar, a search result and a
| notification - five entry points in four different stacks. Registered
| inside any one tab it would push onto that tab from wherever it was
| opened, which is the QuickScoreFlow bug again.
|
|   TournamentListScreen    - sidebar, home "see all", Matches tab
|   CreateTournamentScreen  - sidebar, the list's empty state and FAB
|   TournamentDetailScreen  - everywhere a tournament is named
|   ManageTournamentScreen  - the detail screen, organizer only
|   InviteTeamsScreen       - the manage screen
|   TournamentInviteScreen  - a captain's notification, the detail strip
|   TournamentSquadScreen   - the detail screen, captain only
|
| Fixtures inside a tournament are ordinary Matches, so they still open
| through QuickScoreFlow where MatchDetailsScreen lives.
|
*/

import TournamentListScreen from "../../features/tournaments/screens/TournamentListScreen";
import CreateTournamentScreen from "../../features/tournaments/screens/CreateTournamentScreen";
import TournamentDetailScreen from "../../features/tournaments/screens/TournamentDetailScreen";
import ManageTournamentScreen from "../../features/tournaments/screens/ManageTournamentScreen";
import InviteTeamsScreen from "../../features/tournaments/screens/InviteTeamsScreen";
import TournamentInviteScreen from "../../features/tournaments/screens/TournamentInviteScreen";
import TournamentSquadScreen from "../../features/tournaments/screens/TournamentSquadScreen";

/*
|--------------------------------------------------------------------------
| Series
|--------------------------------------------------------------------------
|
| At the root for the same reason as tournaments, and reached from the
| same five places.
|
| There is no SeriesInviteScreen. A tournament invite gets its own screen
| because a captain is being asked to commit six weekends to an event with
| twenty other teams, and they need the format, the playoff shape, the
| grounds and the prize ladder in front of them first.
|
| A series invite is "these two teams, three matches, T20" - and every one
| of those facts is already in the hero and the Details card of
| SeriesDetailScreen. So the notification opens the series itself, with an
| accept strip at the top. One screen fewer, and the captain sees more.
|
*/

import SeriesListScreen from "../../features/series/screens/SeriesListScreen";
import CreateSeriesScreen from "../../features/series/screens/CreateSeriesScreen";
import SeriesDetailScreen from "../../features/series/screens/SeriesDetailScreen";
import ManageSeriesScreen from "../../features/series/screens/ManageSeriesScreen";

const Stack = createNativeStackNavigator();

/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
|
| Defined ONCE, at module scope - not inline in each screen's options.
|
| Written inline, `header: ({ route }) => <NavigationHeader route={route} />`
| is a brand-new component type on every single render of RootNavigator.
| React compares types, sees a different one, and throws away the old
| subtree instead of updating it - so the header unmounts and remounts,
| losing any state it holds (the unread badge count, an animation
| mid-flight) every time anything above it re-renders.
|
| Nine screens were doing it, which is what the lint run flagged. Four of
| them predate live streaming; the other five copied the same pattern.
|
| Hoisting it makes the function identity stable, so React reuses the
| header. This is also exactly what QuickScoreStackNavigator and
| MatchesStackNavigator already do - now all three navigators match.
|
*/

const renderHeader = ({ route }) => <NavigationHeader route={route} />;

/*
| The options object is shared too. Same reasoning one level up: a fresh
| object literal per screen per render gives the navigator a new options
| reference every time and makes it re-evaluate all of them.
*/

const WITH_HEADER = {
  headerShown: true,
  header: renderHeader,
};

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainNavigator}
      />

      <Stack.Screen
        name="TeamStack"
        component={TeamStackNavigator}
      />

      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
      />

      <Stack.Screen
        name="QuickScoreFlow"
        component={QuickScoreStackNavigator}
      />

      <Stack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={WITH_HEADER}
      />

      {/*
      | Followers / Following lists. At the root because they are opened
      | from a player profile, a team preview and the sidebar - all of
      | which live in different stacks.
      */}
      <Stack.Screen
        name="LiveScoringListScreen"
        component={LiveScoringListScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="FollowListScreen"
        component={FollowListScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="NotificationDetailScreen"
        component={NotificationDetailScreen}
        options={WITH_HEADER}
      />

      {/* ── Live Streaming ────────────────────────────────────────── */}

      {/*
      | The player gets NO app header. It draws its own black stage with
      | the video and the score overlay, and a light green bar bolted
      | above that looks like a rendering mistake. The back gesture and
      | the Android hardware back button both still work.
      */}
      <Stack.Screen
        name="WatchLiveScreen"
        component={WatchLiveScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="LiveStreamingListScreen"
        component={LiveStreamingListScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="GoLiveScreen"
        component={GoLiveScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="AssignBroadcasterScreen"
        component={AssignBroadcasterScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="BroadcastInviteScreen"
        component={BroadcastInviteScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="BroadcastSetupScreen"
        component={BroadcastSetupScreen}
        options={WITH_HEADER}
      />

      {/* ── Tournaments ───────────────────────────────────────────── */}

      <Stack.Screen
        name="TournamentListScreen"
        component={TournamentListScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="CreateTournamentScreen"
        component={CreateTournamentScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="TournamentDetailScreen"
        component={TournamentDetailScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="ManageTournamentScreen"
        component={ManageTournamentScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="InviteTeamsScreen"
        component={InviteTeamsScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="TournamentInviteScreen"
        component={TournamentInviteScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="TournamentSquadScreen"
        component={TournamentSquadScreen}
        options={WITH_HEADER}
      />

      {/* ── Series ────────────────────────────────────────────────── */}

      <Stack.Screen
        name="SeriesListScreen"
        component={SeriesListScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="CreateSeriesScreen"
        component={CreateSeriesScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="SeriesDetailScreen"
        component={SeriesDetailScreen}
        options={WITH_HEADER}
      />

      <Stack.Screen
        name="ManageSeriesScreen"
        component={ManageSeriesScreen}
        options={WITH_HEADER}
      />
    </Stack.Navigator>
  );
}