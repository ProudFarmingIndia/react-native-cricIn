import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NavigationHeader from "../../../components/common/NavigationHeader";

/* Player side */
import GroundsScreen from "../../../features/grounds/screens/GroundsScreen";
import GroundDetailScreen from "../../../features/grounds/screens/GroundDetailScreen";
import GroundSlotPickerScreen from "../../../features/grounds/screens/GroundSlotPickerScreen";
import BookGroundScreen from "../../../features/grounds/screens/BookGroundScreen";
import MyBookingsScreen from "../../../features/grounds/screens/MyBookingsScreen";
import BookingDetailScreen from "../../../features/grounds/screens/BookingDetailScreen";
import RateGroundScreen from "../../../features/grounds/screens/RateGroundScreen";
import GroundReviewsScreen from "../../../features/grounds/screens/GroundReviewsScreen";

/* Owner side */
import OwnerDashboardScreen from "../../../features/grounds/screens/OwnerDashboardScreen";
import MyGroundsScreen from "../../../features/grounds/screens/MyGroundsScreen";
import GroundFormScreen from "../../../features/grounds/screens/GroundFormScreen";
import GroundUnitsScreen from "../../../features/grounds/screens/GroundUnitsScreen";
import UnitFormScreen from "../../../features/grounds/screens/UnitFormScreen";
import GroundPoliciesScreen from "../../../features/grounds/screens/GroundPoliciesScreen";
import OwnerBookingsScreen from "../../../features/grounds/screens/OwnerBookingsScreen";
import OwnerCalendarScreen from "../../../features/grounds/screens/OwnerCalendarScreen";
import OwnerEarningsScreen from "../../../features/grounds/screens/OwnerEarningsScreen";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| File:
| GroundsStackNavigator.js
|
| Description:
| The Grounds tab. Both sides of the feature live in one stack.
|
| WHY THE OWNER SCREENS ARE NOT A SEPARATE NAVIGATOR
|
| Because the same person is usually both. A club captain who also runs the
| ground behind his house moves between "find me a ground for Sunday" and
| "who wants my pitch on Sunday" several times a week, and a separate
| navigator would mean a tab switch or a root-level swap every time.
|
| One stack also means the shared screens are shared for real:
| BookingDetailScreen is the same route for the team and the owner - it
| renders from the `actions` object the server sends, so there is one screen
| and one set of rules rather than two that drift.
|
| WHY GroundsScreen STAYS THE ROOT FOR EVERYONE
|
| Even for an owner. The tab is called Grounds and it should show grounds; the
| owner dashboard is one tap away from it, and a player who lists their first
| ground does not suddenly want the tab to mean something else. The switch is
| a button on the discovery screen, shown only to somebody who actually owns
| one.
|
| WHERE THE HEADER TITLES COME FROM
|
| NOT from `options.title` below. NavigationHeader looks the route name up in
| HEADER_CONFIG (src/constants/headerConstant.js) and reads the title, back
| arrow and bell from there. A route missing from that map shows its own route
| name as the heading - "GroundSlotPickerScreen" across the top of the slot
| picker.
|
| So every route added here needs an entry there too. The `title` options
| below are kept because they are what the navigator itself uses for its
| back-button label and for anything reading the route options, but the
| visible heading is HEADER_CONFIG's.
|
|--------------------------------------------------------------------------
*/

const Stack = createNativeStackNavigator();

const renderHeader = ({ route }) => <NavigationHeader route={route} />;

export default function GroundsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: renderHeader }}>
      {/*
      |--------------------------------------------------------------------
      | Player
      |--------------------------------------------------------------------
      */}

      <Stack.Screen
        name="GroundsScreen"
        component={GroundsScreen}
        options={{ title: "Grounds" }}
      />

      <Stack.Screen
        name="GroundDetailScreen"
        component={GroundDetailScreen}
        options={{ title: "Ground" }}
      />

      <Stack.Screen
        name="GroundSlotPickerScreen"
        component={GroundSlotPickerScreen}
        options={{ title: "Slot chuno" }}
      />

      <Stack.Screen
        name="BookGroundScreen"
        component={BookGroundScreen}
        options={{ title: "Booking details" }}
      />

      <Stack.Screen
        name="MyBookingsScreen"
        component={MyBookingsScreen}
        options={{ title: "Meri bookings" }}
      />

      {/*
      | Shared between both sides - see the note at the top. The screen reads
      | `isOwner` and `actions` off the response rather than being told which
      | it is by the route.
      */}
      <Stack.Screen
        name="BookingDetailScreen"
        component={BookingDetailScreen}
        options={{ title: "Booking" }}
      />

      <Stack.Screen
        name="RateGroundScreen"
        component={RateGroundScreen}
        options={{ title: "Ground ko rate karo" }}
      />

      <Stack.Screen
        name="GroundReviewsScreen"
        component={GroundReviewsScreen}
        options={{ title: "Reviews" }}
      />

      {/*
      |--------------------------------------------------------------------
      | Owner
      |--------------------------------------------------------------------
      */}

      <Stack.Screen
        name="OwnerDashboardScreen"
        component={OwnerDashboardScreen}
        options={{ title: "Ground owner" }}
      />

      <Stack.Screen
        name="MyGroundsScreen"
        component={MyGroundsScreen}
        options={{ title: "Mere grounds" }}
      />

      <Stack.Screen
        name="GroundFormScreen"
        component={GroundFormScreen}
        options={{ title: "Ground details" }}
      />

      <Stack.Screen
        name="GroundUnitsScreen"
        component={GroundUnitsScreen}
        options={{ title: "Pitches aur nets" }}
      />

      <Stack.Screen
        name="UnitFormScreen"
        component={UnitFormScreen}
        options={{ title: "Timing aur rate" }}
      />

      <Stack.Screen
        name="GroundPoliciesScreen"
        component={GroundPoliciesScreen}
        options={{ title: "Booking ke rules" }}
      />

      <Stack.Screen
        name="OwnerBookingsScreen"
        component={OwnerBookingsScreen}
        options={{ title: "Bookings" }}
      />

      <Stack.Screen
        name="OwnerCalendarScreen"
        component={OwnerCalendarScreen}
        options={{ title: "Calendar" }}
      />

      <Stack.Screen
        name="OwnerEarningsScreen"
        component={OwnerEarningsScreen}
        options={{ title: "Earnings" }}
      />
    </Stack.Navigator>
  );
}
