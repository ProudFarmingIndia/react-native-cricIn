import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SectionCard, InputField } from "./FormComponents";
import { COLORS } from "../../../constants/colors";

export default function FavoritesSection({
  profile,
  isEditMode,
  updateField,
}) {
  if (isEditMode) {
    return (
      <SectionCard icon="⭐" title="Favorites">
        <InputField
          label="Favorite Cricketer"
          value={profile.favoriteCricketer}
          onChangeText={(t) => updateField("favoriteCricketer", t)}
          placeholder="e.g. Virat Kohli"
        />

        <InputField
          label="Favorite Team"
          value={profile.favoriteTeam}
          onChangeText={(t) => updateField("favoriteTeam", t)}
          placeholder="e.g. India"
        />

        <InputField
          label="Favorite Shot"
          value={profile.favoriteShot}
          onChangeText={(t) => updateField("favoriteShot", t)}
          placeholder="e.g. Cover Drive"
        />
      </SectionCard>
    );
  }

  // View mode
  return (
    <SectionCard icon="⭐" title="Favorites">
      {[
        ["Cricketer", profile.favoriteCricketer],
        ["Team", profile.favoriteTeam],
        ["Shot", profile.favoriteShot],
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
  },
});
