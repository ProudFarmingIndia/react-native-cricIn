import React from "react";
import { View, Text } from "react-native";
import { SectionCard, InputField, SelectField } from "./FormComponents";
import { COLORS } from "../../../constants/colors";

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export default function PersonalInfoSection({
  profile,
  isEditMode,
  updateField,
}) {
  if (isEditMode) {
    return (
      <SectionCard icon="👤" title="Personal Info">
        <InputField
          label="Full Name"
          value={profile.fullName}
          onChangeText={(t) => updateField("fullName", t)}
          placeholder="Enter your full name"
        />

        <InputField
          label="Date of Birth"
          value={profile.dateOfBirth}
          onChangeText={(t) => updateField("dateOfBirth", t)}
          placeholder="YYYY-MM-DD"
        />

        <InputField
          label="Bio"
          value={profile.bio}
          onChangeText={(t) => updateField("bio", t)}
          placeholder="Tell us about your cricketing journey..."
          multiline
        />

        <SelectField
          label="Gender"
          value={profile.gender}
          options={GENDER_OPTIONS}
          onSelect={(v) => updateField("gender", v)}
        />

        <InputField
          label="City"
          value={profile.city}
          onChangeText={(t) => updateField("city", t)}
          placeholder="City"
        />

        <InputField
          label="State"
          value={profile.state}
          onChangeText={(t) => updateField("state", t)}
          placeholder="State"
        />

        <InputField
          label="Country"
          value={profile.country}
          onChangeText={(t) => updateField("country", t)}
          placeholder="Country"
        />
      </SectionCard>
    );
  }

  // View mode
  return (
    <SectionCard icon="👤" title="Personal Info">
      {[
        ["Full Name", profile.fullName],
        ["Date of Birth", profile.dateOfBirth],
        ["Gender", profile.gender],
        ["City", profile.city],
        ["State", profile.state],
        ["Country", profile.country],
      ].map(([label, val]) =>
        val ? (
          <InfoRow key={label} label={label} value={val} />
        ) : null
      )}
      {profile.bio ? (
        <View style={{ marginTop: 8 }}>
          <Text style={rowStyles.label}>Bio</Text>
          <Text style={rowStyles.bio}>{profile.bio}</Text>
        </View>
      ) : null}
    </SectionCard>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

import { StyleSheet } from "react-native";
const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },
  value: {
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "right",
  },
  bio: {
    fontSize: 14,
    color: COLORS.onSurface,
    lineHeight: 20,
    marginTop: 4,
  },
});
