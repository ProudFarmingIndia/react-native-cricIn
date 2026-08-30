import React from "react";
import {
  SectionCard,
  InputField,
  SelectField,
} from "../../../components/common/FormComponents";
import InfoRow from "../../../cards/InfoRow";
import favoriteShots from "../../../constants/dropdowns/favoriteShots";
import favoriteBalls from "../../../constants/dropdowns/favoriteBalls";

export default function FavoritesSection({
  profile = {},
  isEditMode,
  updateField,
}) {
  // Safe destructuring with defaults
  const {
    favoriteCricketer = "",
    favoriteTeam = "",
    favoriteShot = "",
    favoriteBall = "",
  } = profile || {};

  if (isEditMode) {
    return (
      <SectionCard icon="⭐" title="Favorites">
        <InputField
          label="Favorite Cricketer"
          placeholder="Virat Kohli"
          value={favoriteCricketer || ""}
          onChangeText={(text) => updateField("favoriteCricketer", text)}
        />

        <InputField
          label="Favorite Team"
          placeholder="India"
          value={favoriteTeam || ""}
          onChangeText={(text) => updateField("favoriteTeam", text)}
        />

        <SelectField
          label="Favorite Shot"
          value={favoriteShot || ""}
          options={favoriteShots}
          placeholder="Select Favorite Shot"
          onSelect={(value) => updateField("favoriteShot", value)}
        />

        <SelectField
          label="Favorite Ball"
          value={favoriteBall || ""}
          options={favoriteBalls}
          placeholder="Select Favorite Ball"
          onSelect={(value) => updateField("favoriteBall", value)}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard icon="⭐" title="Favorites">
      <InfoRow label="Favorite Cricketer" value={favoriteCricketer || ""} />
      <InfoRow label="Favorite Team" value={favoriteTeam || ""} />
      <InfoRow label="Favorite Shot" value={favoriteShot || ""} />
      <InfoRow label="Favorite Ball" value={favoriteBall || ""} />
    </SectionCard>
  );
}