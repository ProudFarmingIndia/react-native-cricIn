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

        <InputField
          label="City"
          placeholder="City"
          value={city || ""}
          onChangeText={(text) => updateField("city", text)}
        />

        <InputField
          label="State"
          placeholder="State"
          value={state || ""}
          onChangeText={(text) => updateField("state", text)}
        />

        <InputField
          label="Country"
          placeholder="Country"
          value={country || ""}
          onChangeText={(text) => updateField("country", text)}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard icon="👤" title="Personal Information">
      <InfoRow label="Player Name" value={playerName || ""} />

      <InfoRow label="Date of Birth" value={dob || ""} />

      <InfoRow label="Gender" value={gender || ""} />

      <InfoRow label="City" value={city || ""} />

      <InfoRow label="State" value={state || ""} />

      <InfoRow label="Country" value={country || ""} />

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
