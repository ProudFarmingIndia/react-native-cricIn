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
  if (isEditMode) {
    return (
      <SectionCard
        icon="⭐"
        title="Favorites"
      >
        <InputField
          label="Favorite Cricketer"
          placeholder="Virat Kohli"
          value={profile.favoriteCricketer}
          onChangeText={(text) =>
            updateField(
              "favoriteCricketer",
              text
            )
          }
        />

        <InputField
          label="Favorite Team"
          placeholder="India"
          value={profile.favoriteTeam}
          onChangeText={(text) =>
            updateField(
              "favoriteTeam",
              text
            )
          }
        />

        <SelectField
          label="Favorite Shot"
          value={profile.favoriteShot}
          options={favoriteShots}
          placeholder="Select Favorite Shot"
          onSelect={(value) =>
            updateField(
              "favoriteShot",
              value
            )
          }
        />

        <SelectField
          label="Favorite Ball"
          value={profile.favoriteBall}
          options={favoriteBalls}
          placeholder="Select Favorite Ball"
          onSelect={(value) =>
            updateField(
              "favoriteBall",
              value
            )
          }
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon="⭐"
      title="Favorites"
    >
      <InfoRow
        label="Favorite Cricketer"
        value={profile.favoriteCricketer}
      />

      <InfoRow
        label="Favorite Team"
        value={profile.favoriteTeam}
      />

      <InfoRow
        label="Favorite Shot"
        value={profile.favoriteShot}
      />

      <InfoRow
        label="Favorite Ball"
        value={profile.favoriteBall}
      />
    </SectionCard>
  );
}