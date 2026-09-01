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
  // Safe destructuring with defaults
  const {
    playerType = "",
    battingStyle = "",
    bowlingStyle = "",
    jerseyNumber = "",
  } = profile || {};

  if (isEditMode) {
    return (
      <SectionCard icon="🏏" title="Cricket Information">
        <SelectField
          label="Player Type"
          value={playerType || ""}
          options={playerTypes}
          placeholder="Select Player Type"
          onSelect={(value) => updateField("playerType", value)}
        />

        <SelectField
          label="Batting Style"
          value={battingStyle || ""}
          options={battingStyles}
          placeholder="Select Batting Style"
          onSelect={(value) => updateField("battingStyle", value)}
        />

        <SelectField
          label="Bowling Style"
          value={bowlingStyle || ""}
          options={bowlingStyles}
          placeholder="Select Bowling Style"
          onSelect={(value) => updateField("bowlingStyle", value)}
        />

        <InputField
          label="Jersey Number"
          keyboardType="number-pad"
          value={jerseyNumber?.toString() || ""}
          placeholder="07"
          onChangeText={(text) =>
            updateField("jerseyNumber", text.replace(/[^0-9]/g, ""))
          }
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard icon="🏏" title="Cricket Information">
      <InfoRow label="Player Type" value={playerType || ""} />
      <InfoRow label="Batting Style" value={battingStyle || ""} />
      <InfoRow label="Bowling Style" value={bowlingStyle || ""} />
      <InfoRow label="Jersey Number" value={jerseyNumber || ""} />
    </SectionCard>
  );
}