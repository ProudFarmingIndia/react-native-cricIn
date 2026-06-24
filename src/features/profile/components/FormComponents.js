import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { COLORS } from "../../../constants/colors";

// ─── Section Card Wrapper ────────────────────────────────────────────────────
export function SectionCard({ icon, title, children }) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <Text style={cardStyles.icon}>{icon}</Text>
        <Text style={cardStyles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.primary,
  },
});

// ─── Labeled Text Input ───────────────────────────────────────────────────────
export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
}) {
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        value={value || ""}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.outline}
        multiline={multiline}
        keyboardType={keyboardType}
        numberOfLines={multiline ? 3 : 1}
        style={[inputStyles.input, multiline && inputStyles.multiline]}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.onSurface,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
});

// ─── Select Field (pill options) ─────────────────────────────────────────────
export function SelectField({ label, value, options, onSelect }) {
  // options: [{ label: string, value: string }]
  return (
    <View style={selectStyles.wrapper}>
      <Text style={selectStyles.label}>{label}</Text>
      <View style={selectStyles.optionsRow}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[
                selectStyles.option,
                active && selectStyles.optionActive,
              ]}
            >
              <Text
                style={[
                  selectStyles.optionText,
                  active && selectStyles.optionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const selectStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  optionActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
  },
  optionTextActive: {
    color: COLORS.onPrimaryContainer,
    fontWeight: "700",
  },
});

// ─── Segmented Toggle (Professional / Amateur) ───────────────────────────────
export function SegmentedToggle({ label, value, options, onSelect }) {
  return (
    <View style={segStyles.wrapper}>
      <Text style={segStyles.label}>{label}</Text>
      <View style={segStyles.track}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[segStyles.segment, active && segStyles.segmentActive]}
            >
              <Text
                style={[
                  segStyles.segmentText,
                  active && segStyles.segmentTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const segStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  track: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 10,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: COLORS.surfaceContainerLowest,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
