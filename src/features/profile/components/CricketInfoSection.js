import React from "react";
import {
  SectionCard,
  InputField,
  SelectField,
} from "./../../../components/common/FormComponents";
import InfoRow from "../../../cards/InfoRow";
import playerTypes from "../../../constants/dropdowns/playerTypes";
import battingStyles from "../../../constants/dropdowns/battingStyles";
import bowlingStyles from "../../../constants/dropdowns/bowlingStyles";

export default function CricketInfoSection({
  profile = {},
  isEditMode,
  updateField,
}) {
  if (isEditMode) {
    return (
      <SectionCard
        icon="🏏"
        title="Cricket Information"
      >
        <SelectField
          label="Player Type"
          value={profile.playerType}
          options={playerTypes}
          placeholder="Select Player Type"
          onSelect={(value) =>
            updateField(
              "playerType",
              value
            )
          }
        />

        <SelectField
          label="Batting Style"
          value={profile.battingStyle}
          options={battingStyles}
          placeholder="Select Batting Style"
          onSelect={(value) =>
            updateField(
              "battingStyle",
              value
            )
          }
        />

        <SelectField
          label="Bowling Style"
          value={profile.bowlingStyle}
          options={bowlingStyles}
          placeholder="Select Bowling Style"
          onSelect={(value) =>
            updateField(
              "bowlingStyle",
              value
            )
          }
        />

        <InputField
          label="Jersey Number"
          keyboardType="number-pad"
          value={
            profile.jerseyNumber?.toString() ||
            ""
          }
          placeholder="07"
          onChangeText={(text) =>
            updateField(
              "jerseyNumber",
              text.replace(
                /[^0-9]/g,
                ""
              )
            )
          }
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon="🏏"
      title="Cricket Information"
    >
      <InfoRow
        label="Player Type"
        value={profile.playerType}
      />

      <InfoRow
        label="Batting Style"
        value={profile.battingStyle}
      />

      <InfoRow
        label="Bowling Style"
        value={profile.bowlingStyle}
      />

      <InfoRow
        label="Jersey Number"
        value={profile.jerseyNumber}
      />
    </SectionCard>
  );
}