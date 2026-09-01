import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "../../constants/colors";

export default function DatePickerField({ label, value, onChange }) {
  const [show, setShow] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShow(false);
    if (event.type === "set" && selectedDate) {
      onChange(selectedDate.toISOString()); // or whatever format you want
    }
  };

  return (
    <View style={styles.field}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.dropdown} onPress={() => setShow(true)}>
        <Text style={styles.dropdownText}>
          {value ? new Date(value).toLocaleDateString() : "Select Date"}
        </Text>
        <Text style={styles.arrow}>📅</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
  },

  text: {
    fontSize: 15,
    color: COLORS.onSurface,
  },

  placeholder: {
    color: COLORS.outline,
  },
});