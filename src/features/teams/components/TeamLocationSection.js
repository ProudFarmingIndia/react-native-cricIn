import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

import LocationPicker from "../../../components/common/LocationPicker";

/*
|--------------------------------------------------------------------------
| Team Location
|--------------------------------------------------------------------------
|
| Three free-text inputs became one cascading picker. What that fixes:
|
|   TYPOS BECAME DATA. "Uttar Pradesh", "uttar pradesh", "UP" and "U.P."
|   were four different states as far as the database was concerned. City-
|   wise and state-wise rankings are group-by queries, and free text does
|   not group - so the rankings would have been quietly wrong, with nothing
|   to point at.
|
|   NOTHING TIED THE THREE TOGETHER. You could save country "India" with
|   state "New South Wales" and city "Tokyo" and the form was happy.
|
| Values are now ISO codes for country and state ("IN", "UP") and a name
| for the city, since cities have no ISO codes. src/constants/geo.js
| explains the storage choice; LocationPicker handles the cascade.
*/

export default function TeamLocationSection({ teamData, updateField }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Team Location</Text>

      <LocationPicker
        value={{
          country: teamData.country,
          state: teamData.state,
          city: teamData.city,
        }}
        /*
        | The picker hands back a whole normalised { country, state, city }.
        | All three are written every time - changing the country clears the
        | state and city, and those clears have to reach the form state or
        | the stale values are still in the payload on submit.
        */
        onChange={(location) => {
          updateField("country", location.country);
          updateField("state", location.state);
          updateField("city", location.city);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 20,

    marginBottom: 20,

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  title: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.primary,

    marginBottom: 20,
  },
});
