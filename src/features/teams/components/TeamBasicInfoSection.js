import React from "react";

import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Team Information - name and short name
|--------------------------------------------------------------------------
|
| `errors` is { teamName, shortName }, each an empty string or the message
| to show under that field. `checking` draws a small spinner while the
| availability request is in flight.
|
| Both are optional, so this component still renders correctly anywhere it
| is used without them.
|
| THE ERROR GOES UNDER THE FIELD IT BELONGS TO
|
| Not in an Alert on submit, which is what the screen used to do: the user
| filled in the whole form, tapped Continue, and got a modal naming a field
| they then had to scroll back to find. An inline message sits next to the
| thing that is wrong and updates as they fix it.
*/

export default function TeamBasicInfoSection({
  teamData,
  updateField,
  errors = {},
  checking = false,
  onBlurField,
}) {
  const nameError = errors.teamName || "";
  const shortError = errors.shortName || "";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Information</Text>

        {/* Sits in the header rather than under a field: the request covers
            both names, so pinning it to one of them would be a lie. */}
        {checking ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : null}
      </View>

      {/* Team Name */}

      <View style={styles.field}>
        <Text style={styles.label}>
          Team Name<Text style={styles.required}> *</Text>
        </Text>

        <TextInput
          placeholder="Delhi Warriors"
          placeholderTextColor="#9CA3AF"
          value={teamData.teamName}
          onChangeText={(text) => updateField("teamName", text)}
          /*
          | Checked when the user LEAVES the field, not while typing.
          | "De", "Del", "Delh" are not names anyone is trying to use, and
          | an error that appears and vanishes mid-word reads as a bug.
          */
          onBlur={() => onBlurField?.("teamName")}
          style={[styles.input, !!nameError && styles.inputError]}
          maxLength={50}
        />

        {!!nameError && (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {nameError}
          </Text>
        )}
      </View>

      {/* Short Name */}

      <View style={styles.field}>
        <Text style={styles.label}>
          Short Name<Text style={styles.required}> *</Text>
        </Text>

        <TextInput
          placeholder="DW"
          placeholderTextColor="#9CA3AF"
          value={teamData.shortName}
          onChangeText={(text) => updateField("shortName", text.toUpperCase())}
          onBlur={() => onBlurField?.("shortName")}
          style={[styles.input, !!shortError && styles.inputError]}
          maxLength={5}
          autoCapitalize="characters"
        />

        {shortError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {shortError}
          </Text>
        ) : (
          <Text style={styles.helper}>Used on scorecards</Text>
        )}
      </View>
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

  header: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 20,
  },

  title: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.primary,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,

    fontWeight: "600",

    color: "#374151",

    marginBottom: 8,
  },

  required: {
    color: COLORS.error,
  },

  input: {
    height: 52,

    borderWidth: 1,

    borderColor: "#E5E7EB",

    borderRadius: 14,

    paddingHorizontal: 16,

    fontSize: 16,

    color: "#111827",

    backgroundColor: "#FFFFFF",
  },

  inputError: {
    borderColor: COLORS.error,

    /* A tint as well as the border - a 1px red outline alone is easy to
       miss on a bright screen outdoors. */
    backgroundColor: COLORS.errorContainer,
  },

  error: {
    marginTop: 6,

    fontSize: 12,

    fontWeight: "600",

    color: COLORS.error,
  },

  helper: {
    marginTop: 6,

    fontSize: 12,

    color: "#9CA3AF",
  },
});
