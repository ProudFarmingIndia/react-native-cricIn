import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";


import { COLORS } from "../../constants/colors";

////////////////////////////////////////////////////////////////////////////////
// SECTION CARD
////////////////////////////////////////////////////////////////////////////////

export function SectionCard({ icon, title, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {!!icon && <Text style={styles.icon}>{icon}</Text>}

        <Text style={styles.title}>{title}</Text>
      </View>

      {children}
    </View>
  );
}

////////////////////////////////////////////////////////////////////////////////
// INPUT FIELD
////////////////////////////////////////////////////////////////////////////////

export function InputField({
  label,
  value,
  placeholder,
  onChangeText,
  multiline = false,
  keyboardType = "default",
  editable = true,
}) {
  return (
    <View style={styles.field}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        value={value?.toString()}
        placeholder={placeholder}
        placeholderTextColor={COLORS.outline}
        onChangeText={onChangeText}
        multiline={multiline}
        editable={editable}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

////////////////////////////////////////////////////////////////////////////////
// DROPDOWN
////////////////////////////////////////////////////////////////////////////////

export function SelectField({
  label,
  value,
  options = [],
  placeholder = "Select",
  onSelect,
}) {
  const [visible, setVisible] = useState(false);

  // Normalize option to just its value for comparison
  const currentValue =
    typeof value === "string" ? value : value?.value || "";

  return (
    <>
      <View style={styles.field}>
        {!!label && <Text style={styles.label}>{label}</Text>}

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setVisible(true)}
        >
          <Text
            style={[
              styles.dropdownText,
              !currentValue && {
                color: COLORS.outline,
              },
            ]}
          >
            {currentValue || placeholder}
          </Text>

          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="slide">
        <Pressable style={styles.modalBg} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <FlatList
              data={options}
              keyExtractor={(item) =>
                String(item.value ?? item.label ?? item)
              }
              renderItem={({ item }) => {
                label = item.label ?? item;
                const val = item.value ?? item;

                return (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      onSelect(val);
                      setVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>{label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////
// DATE FIELD
////////////////////////////////////////////////////////////////////////////////

export function DateField({ label, value, onPress }) {
  return (
    <View style={styles.field}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.dropdown} onPress={onPress}>
        <Text style={styles.dropdownText}>{value || "Select Date"}</Text>

        <Text style={styles.arrow}>📅</Text>
      </TouchableOpacity>
    </View>
  );
}

////////////////////////////////////////////////////////////////////////////////
// BUTTON
////////////////////////////////////////////////////////////////////////////////

export function PrimaryOutlineButton({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.outlineButton} onPress={onPress}>
      <Text style={styles.outlineText}>{title}</Text>
    </TouchableOpacity>
  );
}

////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,

    marginBottom: 16,

    borderRadius: 18,

    padding: 16,

    backgroundColor: COLORS.surface,

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 18,
  },

  icon: {
    fontSize: 20,

    marginRight: 8,
  },

  title: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,

    fontSize: 13,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  input: {
    borderWidth: 1,

    borderColor: COLORS.outlineVariant,

    borderRadius: 12,

    paddingHorizontal: 15,

    paddingVertical: 13,

    backgroundColor: COLORS.background,

    color: COLORS.onSurface,

    fontSize: 15,
  },

  multiline: {
    minHeight: 110,

    textAlignVertical: "top",
  },

  dropdown: {
    borderWidth: 1,

    borderColor: COLORS.outlineVariant,

    borderRadius: 12,

    backgroundColor: COLORS.background,

    paddingHorizontal: 15,

    paddingVertical: 15,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  dropdownText: {
    color: COLORS.onSurface,

    fontSize: 15,
  },

  arrow: {
    fontSize: 15,
  },

  modalBg: {
    flex: 1,

    justifyContent: "flex-end",

    backgroundColor: "rgba(0,0,0,0.3)",
  },

  sheet: {
    maxHeight: "60%",

    backgroundColor: COLORS.surface,

    borderTopLeftRadius: 22,

    borderTopRightRadius: 22,

    paddingVertical: 15,
  },

  option: {
    paddingVertical: 18,

    paddingHorizontal: 20,

    borderBottomWidth: 1,

    borderBottomColor: COLORS.outlineVariant,
  },

  optionText: {
    fontSize: 16,

    color: COLORS.onSurface,
  },

  outlineButton: {
    borderWidth: 1,

    borderColor: COLORS.primary,

    borderRadius: 12,

    paddingVertical: 14,

    alignItems: "center",
  },

  outlineText: {
    color: COLORS.primary,

    fontWeight: "700",

    fontSize: 15,
  },
});
