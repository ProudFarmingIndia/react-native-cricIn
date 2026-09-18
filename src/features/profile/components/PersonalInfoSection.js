import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  SectionCard,
  InputField,
  SelectField,
} from "./../../../components/common/FormComponents";
import InfoRow from "../../../cards/InfoRow";
import { COLORS } from "../../../constants/colors";
import DatePickerField from "../../../components/common/DatePickerField";
import LocationPicker from "../../../components/common/LocationPicker";
import { formatLocation } from "../../../constants/geo";

const GENDER_OPTIONS = [
  {
    label: "Male",
    value: "Male",
  },
  {
    label: "Female",
    value: "Female",
  },
  {
    label: "Other",
    value: "Other",
  },
];

export default function PersonalInfoSection({
  profile = {},
  isEditMode = false,
  updateField,
}) {
  // Safe destructuring with defaults in case profile is null/undefined
  const {
    playerName = "",
    bio = "",
    dob = "",
    gender = "",
    city = "",
    state = "",
    country = "",
  } = profile || {};

  if (isEditMode) {
    return (
      <SectionCard icon="👤" title="Personal Information">
        <InputField
          label="Player Name"
          placeholder="Enter Player Name"
          value={playerName || ""}
          onChangeText={(text) => updateField("playerName", text)}
        />

        <InputField
          label="Bio"
          placeholder="Tell everyone about yourself..."
          value={bio || ""}
          multiline
          onChangeText={(text) => updateField("bio", text)}
        />

        <DatePickerField
          label="Date of Birth"
          value={dob || ""}
          onChange={(date) => updateField("dob", date)}
        />

        <SelectField
          label="Gender"
          value={gender || ""}
          options={GENDER_OPTIONS}
          onSelect={(value) => updateField("gender", value)}
        />

        {/*
          | Country / State / City, cascading. Replaces three free-text
          | inputs that let "India" sit alongside "New South Wales", and
          | that spelled the same state four different ways across users -
          | which would have made city-wise and state-wise player rankings
          | group on typos. Same component as the Create Team screen.
        */}
        <LocationPicker
          value={{ country, state, city }}
          onChange={(location) => {
            /*
            | All three written every time: changing the country clears the
            | state and city, and those clears must reach the profile state
            | or the stale values are still in the payload on save.
            */
            updateField("country", location.country);
            updateField("state", location.state);
            updateField("city", location.city);
          }}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard icon="👤" title="Personal Information">
      <InfoRow label="Player Name" value={playerName || ""} />

      <InfoRow label="Date of Birth" value={dob || ""} />

      <InfoRow label="Gender" value={gender || ""} />

      {/*
        | One row instead of three. The stored values are ISO codes now
        | ("IN", "UP"), so they have to be resolved to names for display -
        | printing the raw code would show the user "UP".
      */}
      <InfoRow
        label="Location"
        value={formatLocation({ country, state, city })}
      />

      {!!bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bioLabel}>Bio</Text>

          <Text style={styles.bio}>{bio}</Text>
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  bioContainer: {
    marginTop: 16,
  },

  bioLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  bio: {
    marginTop: 8,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    fontSize: 14,
  },
});
