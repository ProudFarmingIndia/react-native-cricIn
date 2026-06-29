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
  if (isEditMode) {
    return (
      <SectionCard icon="👤" title="Personal Information">
        <InputField
          label="Player Name"
          placeholder="Enter Player Name"
          value={profile.playerName}
          onChangeText={(text) => updateField("playerName", text)}
        />

        <InputField
          label="Bio"
          placeholder="Tell everyone about yourself..."
          value={profile.bio}
          multiline
          onChangeText={(text) => updateField("bio", text)}
        />

        <DatePickerField
          label="Date of Birth"
          value={profile.dob}
          onChange={(date) => updateField("dob", date)}
        />

        <SelectField
          label="Gender"
          value={profile.gender}
          options={GENDER_OPTIONS}
          onSelect={(value) => updateField("gender", value)}
        />

        <InputField
          label="City"
          placeholder="City"
          value={profile.city}
          onChangeText={(text) => updateField("city", text)}
        />

        <InputField
          label="State"
          placeholder="State"
          value={profile.state}
          onChangeText={(text) => updateField("state", text)}
        />

        <InputField
          label="Country"
          placeholder="Country"
          value={profile.country}
          onChangeText={(text) => updateField("country", text)}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard icon="👤" title="Personal Information">
      <InfoRow label="Player Name" value={profile.playerName} />

      <InfoRow label="Date of Birth" value={profile.dob} />

      <InfoRow label="Gender" value={profile.gender} />

      <InfoRow label="City" value={profile.city} />

      <InfoRow label="State" value={profile.state} />

      <InfoRow label="Country" value={profile.country} />

      {!!profile.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bioLabel}>Bio</Text>

          <Text style={styles.bio}>{profile.bio}</Text>
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
