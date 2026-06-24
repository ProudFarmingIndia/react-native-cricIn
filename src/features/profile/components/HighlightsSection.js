import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { SectionCard } from "./FormComponents";
import { COLORS } from "../../../constants/colors";

export default function HighlightsSection({
  profile,
  isEditMode,
  updateField,
}) {
  // highlights is stored as string[] in profile.
  // In edit mode we join with newlines for the multiline TextInput,
  // and split back on change — keeping updateField in sync.

  const textValue = Array.isArray(profile.highlights)
    ? profile.highlights.join("\n")
    : profile.highlights || "";

  const handleChange = (text) => {
    // Store as array, filtering empty lines
    const arr = text.split("\n").filter((line) => line.trim().length > 0 || text.endsWith("\n"));
    // Keep raw split so user can type freely; trim on save
    updateField("highlights", text.split("\n"));
  };

  if (isEditMode) {
    return (
      <SectionCard icon="🏆" title="Highlights">
        <Text style={styles.hint}>
          Enter each achievement on a new line
        </Text>
        <TextInput
          value={textValue}
          onChangeText={handleChange}
          placeholder={"e.g. Scored 150 in state finals\nBest bowler 2023 tournament"}
          placeholderTextColor={COLORS.outline}
          multiline
          numberOfLines={5}
          style={styles.input}
        />
      </SectionCard>
    );
  }

  // View mode
  const items = Array.isArray(profile.highlights)
    ? profile.highlights.filter(Boolean)
    : [];

  return (
    <SectionCard icon="🏆" title="Highlights">
      {items.length === 0 ? (
        <Text style={styles.empty}>No highlights added yet.</Text>
      ) : (
        items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 12,
    color: COLORS.outline,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.onSurface,
    minHeight: 110,
    textAlignVertical: "top",
  },
  item: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  bullet: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "700",
  },
  itemText: {
    fontSize: 14,
    color: COLORS.onSurface,
    flex: 1,
    lineHeight: 20,
  },
  empty: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: "center",
    paddingVertical: 12,
  },
});
