import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  SectionCard,
  InputField,
} from "../../../components/common/FormComponents";
import { COLORS } from "../../../constants/colors";

export default function HighlightsSection({
  profile = {},
  isEditMode,
  updateField,
}) {
  const highlights = profile.highlights || [];

  const achievements = profile.achievements || [];

  const addHighlight = () => {
    updateField("highlights", [...highlights, ""]);
  };

  const addAchievement = () => {
    updateField("achievements", [...achievements, ""]);
  };

  const updateHighlight = (index, value) => {
    const updated = [...highlights];

    updated[index] = value;

    updateField("highlights", updated);
  };

  const updateAchievement = (index, value) => {
    const updated = [...achievements];

    updated[index] = value;

    updateField("achievements", updated);
  };

  const removeHighlight = (index) => {
    updateField(
      "highlights",
      highlights.filter((_, i) => i !== index),
    );
  };

  const removeAchievement = (index) => {
    updateField(
      "achievements",
      achievements.filter((_, i) => i !== index),
    );
  };

  return (
    <SectionCard icon="🏆" title="Highlights & Achievements">
      <Text style={styles.heading}>Highlights</Text>

      {highlights.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.achieve}>
            <InputField
              placeholder={`Highlight ${index + 1}`}
              value={item}
              onChangeText={(text) => updateHighlight(index, text)}
            />
          </View>

          {isEditMode && (
            <TouchableOpacity
              onPress={() => removeHighlight(index)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {isEditMode && (
        <TouchableOpacity style={styles.addBtn} onPress={addHighlight}>
          <Text style={styles.addText}>+ Add Highlight</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.heading, styles.highLight]}>Achievements</Text>

      {achievements.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.achieve}>
            <InputField
              placeholder={`Achievement ${index + 1}`}
              value={item}
              onChangeText={(text) => updateAchievement(index, text)}
            />
          </View>

          {isEditMode && (
            <TouchableOpacity
              onPress={() => removeAchievement(index)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {isEditMode && (
        <TouchableOpacity style={styles.addBtn} onPress={addAchievement}>
          <Text style={styles.addText}>+ Add Achievement</Text>
        </TouchableOpacity>
      )}

      {!isEditMode && highlights.length === 0 && achievements.length === 0 && (
        <Text style={styles.empty}>No Highlights Yet</Text>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 15,

    fontWeight: "700",

    color: COLORS.primary,

    marginBottom: 10,
  },

  row: {
    flexDirection: "row",

    alignItems: "center",
  },

  deleteBtn: {
    marginLeft: 10,

    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: "#ff4d4f",

    justifyContent: "center",

    alignItems: "center",
  },

  deleteText: {
    color: "#fff",

    fontSize: 18,

    fontWeight: "700",
  },

  addBtn: {
    marginTop: 5,

    paddingVertical: 12,

    alignItems: "center",

    borderRadius: 10,

    borderWidth: 1,

    borderColor: COLORS.primary,
  },

  addText: {
    color: COLORS.primary,

    fontWeight: "700",
  },

  empty: {
    textAlign: "center",

    marginVertical: 20,

    color: COLORS.onSurfaceVariant,
  },

  highLight: {
    marginTop: 20,
  },
  achieve: {
    flex: 1,
  },
});
