import React, { useState } from "react";

import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Search Bar
|--------------------------------------------------------------------------
|
| Changes over the previous version:
|
|   - A focus ring. The old bar was a flat grey pill with no border, so on
|     a light background there was no visual signal that it was the active
|     input - it read as a placeholder block rather than something to type
|     in.
|
|   - An inline spinner in place of the clear button while a request is in
|     flight, so feedback appears in the bar itself instead of the results
|     area jumping to a full-screen loader on every keystroke.
|
|   - onSubmit, so the keyboard's "search" key does something. Previously
|     returnKeyType was "search" but nothing was wired to it.
|
|   - The clear button is a real 40x40 hit target. At 18px + 4px padding it
|     was well under the 44px minimum and was genuinely hard to hit.
|
*/

/*
| react-native-web renders TextInput as a real <input>, which picks up the
| browser's default focus outline on top of our own border. Applied only on
| web - "outlineStyle" is not a valid native style prop and RN warns on it.
*/

const WEB_INPUT_RESET =
  Platform.OS === "web" ? { outlineStyle: "none" } : null;

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  onSubmit,
  placeholder = "Search players and teams",
  autoFocus = false,
  loading = false,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <Ionicons
        name="search"
        size={19}
        color={focused ? COLORS.primary : COLORS.onSurfaceVariant}
        style={styles.icon}
      />

      <TextInput
        style={[styles.input, WEB_INPUT_RESET]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.outline}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={() => onSubmit?.(value)}
      />

      {loading ? (
        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.spinner}
        />
      ) : (
        !!value && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={19} color={COLORS.outline} />
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 4,
    height: 48,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  containerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
  },

  clearButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  spinner: {
    width: 40,
    height: 40,
  },
});
