import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "../../constants/colors";

export default function DatePickerField({
  label,
  value,
  onChange,
}) {
  const [show, setShow] = useState(false);

  const selectedDate = value
    ? new Date(value)
    : new Date();

  const handleChange = (_, date) => {
    setShow(false);

    if (!date) return;

    onChange(date.toISOString().split("T")[0]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShow(true)}
      >
        <Text
          style={[
            styles.text,
            !value && styles.placeholder,
          ]}
        >
          {value || "Select Date"}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={
            Platform.OS === "ios"
              ? "spinner"
              : "default"
          }
          maximumDate={new Date()}
          onChange={handleChange}
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