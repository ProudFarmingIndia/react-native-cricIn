import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SectionCard, InputField, SelectField, SegmentedToggle } from "./FormComponents";
import { COLORS } from "../../../constants/colors";

const PLAYER_ROLE_OPTIONS = [
  { label: "Batsman", value: "batsman" },
  { label: "Bowler", value: "bowler" },
  { label: "All-Rounder", value: "all-rounder" },
  { label: "Wicket Keeper", value: "wicket-keeper" },
];

const BATTING_STYLE_OPTIONS = [
  { label: "Right Hand", value: "right-hand" },
  { label: "Left Hand", value: "left-hand" },
];

const BOWLING_STYLE_OPTIONS = [
  { label: "Right-arm Off Break", value: "right-arm-off-break" },
  { label: "Leg Break", value: "leg-break" },
  { label: "Right-arm Fast", value: "right-arm-fast" },
  { label: "Left-arm Fast", value: "left-arm-fast" },
];

const PLAYER_TYPE_OPTIONS = [
  { label: "Professional", value: "professional" },
  { label: "Amateur", value: "amateur" },
];

export default function CricketInfoSection({
  profile,
  isEditMode,
  updateField,
}) {
  if (isEditMode) {
    return (
      <SectionCard icon="🏏" title="Cricket Specifications">
        <SelectField
          label="Player Role"
          value={profile.playerRole}
          options={PLAYER_ROLE_OPTIONS}
          onSelect={(v) => updateField("playerRole", v)}
        />

        <SegmentedToggle
          label="Player Type"
          value={profile.playerType || "professional"}
          options={PLAYER_TYPE_OPTIONS}
          onSelect={(v) => updateField("playerType", v)}
        />

        <SelectField
          label="Batting Style"
          value={profile.battingStyle}
          options={BATTING_STYLE_OPTIONS}
          onSelect={(v) => updateField("battingStyle", v)}
        />

        <SelectField
          label="Bowling Style"
          value={profile.bowlingStyle}
          options={BOWLING_STYLE_OPTIONS}
          onSelect={(v) => updateField("bowlingStyle", v)}
        />

        <InputField
          label="Jersey Number"
          value={profile.jerseyNumber?.toString()}
          onChangeText={(t) => updateField("jerseyNumber", t)}
          placeholder="e.g. 18"
          keyboardType="numeric"
        />
      </SectionCard>
    );
  }

  // View mode
  return (
    <SectionCard icon="🏏" title="Cricket Specifications">
      {[
        ["Player Role", profile.playerRole],
        ["Player Type", profile.playerType],
        ["Batting Style", profile.battingStyle],
        ["Bowling Style", profile.bowlingStyle],
        ["Jersey Number", profile.jerseyNumber?.toString()],
      ].map(([label, val]) =>
        val ? <InfoRow key={label} label={label} value={val} /> : null
      )}
    </SectionCard>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
