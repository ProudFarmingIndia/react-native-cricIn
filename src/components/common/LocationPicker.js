import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { COLORS } from "../../constants/colors";

import {
  COUNTRIES,
  getStates,
  hasStates,
  getCities,
  hasCities,
  countryName,
  stateName,
  matches,
  normaliseLocation,
} from "../../constants/geo";

/*
|--------------------------------------------------------------------------
| LocationPicker - Country → State → City
|--------------------------------------------------------------------------
|
| One component for every place field in the app. Team.country/state/city,
| Player.country/state/city and Ground.city/state all store the same shape,
| so they all use this.
|
|     <LocationPicker value={location} onChange={setLocation} />
|
| `value` and the object passed to `onChange` are always
| { country, state, city } with ISO CODES for country and state - "IN",
| "UP" - and a plain name for city. See src/constants/geo.js for why.
|
| ─────────────────────────────────────────────────────────────────────────
|
| THREE THINGS THIS GETS RIGHT THAT A NAIVE CASCADE DOES NOT
|
| 1. CHANGING A PARENT CLEARS ITS CHILDREN.
|
|    Pick India / Uttar Pradesh / Lucknow, then switch the country to
|    Australia, and a naive implementation keeps state "UP" and city
|    "Lucknow" in the payload. They are saved, they are meaningless, and
|    they quietly corrupt the state-wise rankings. Every change goes
|    through normaliseLocation, which drops whatever no longer fits.
|
| 2. SEARCH IS ALWAYS AVAILABLE, THE LIST IS NEVER JUST SCROLLED.
|
|    250 countries. Uttar Pradesh alone has 624 cities. A plain scrolling
|    list is unusable at those sizes, so the modal always has a search box
|    and it autofocuses.
|
| 3. COUNTRIES WITHOUT SUBDIVISIONS SKIP THE STATE STEP.
|
|    53 countries have no subdivisions. Showing an empty, tappable "State"
|    row there reads as a loading bug. hasStates() hides it.
*/

const FIELDS = ["country", "state", "city"];

const LABELS = { country: "Country", state: "State", city: "City" };

export default function LocationPicker({
  value,
  onChange,
  disabled = false,
  required = false,
  style,
}) {
  const location = value || { country: "", state: "", city: "" };

  /* Which picker modal is open, or null. */
  const [open, setOpen] = useState(null);

  const [query, setQuery] = useState("");

  const { country, state, city } = location;

  const cityIsFreeText = !!country && !hasCities(country);

  const showState = !country || hasStates(country);

  /*
  | The options for whichever modal is open. Recomputed only when the modal
  | or its parent selection changes - not on every keystroke, which would
  | rebuild a 624-item array while the user types.
  */
  const options = useMemo(() => {
    if (open === "country") {
      return COUNTRIES.map((c) => ({ key: c.c, label: c.n, prefix: c.f }));
    }

    if (open === "state") {
      return getStates(country).map((s) => ({ key: s.c, label: s.n }));
    }

    if (open === "city") {
      return getCities(country, state).map((n) => ({ key: n, label: n }));
    }

    return [];
  }, [open, country, state]);

  const filtered = useMemo(
    () => (query ? options.filter((o) => matches(o.label, query)) : options),
    [options, query],
  );

  const commit = useCallback(
    (field, key) => {
      /*
      | Build the next value, then normalise. Setting country also has to
      | clear state and city - normaliseLocation does that rather than this
      | callback having to know the hierarchy.
      */
      onChange(normaliseLocation({ ...location, [field]: key }));

      setOpen(null);
      setQuery("");
    },
    [location, onChange],
  );

  const display = {
    country: countryName(country),
    state: stateName(country, state),
    city,
  };

  const enabled = {
    country: true,
    /* A state cannot be chosen before its country. */
    state: !!country,
    /*
    | Nor a city before its state - except where the country has no states
    | at all, in which case the city follows straight from the country.
    */
    city: !!country && (!!state || !hasStates(country)),
  };

  const openPicker = (field) => {
    if (disabled || !enabled[field]) return;

    setQuery("");
    setOpen(field);
  };

  return (
    <View style={style}>
      {FIELDS.map((field) => {
        if (field === "state" && !showState) return null;

        /*
        | Outside the countries with bundled city lists, the city is a plain
        | text input. That is the honest option: we do not have the list, so
        | pretending to offer one would show an empty picker.
        */
        if (field === "city" && cityIsFreeText) {
          return (
            <View key={field} style={styles.field}>
              <Text style={styles.label}>
                {LABELS.city}
                {required ? <Text style={styles.required}> *</Text> : null}
              </Text>

              <TextInput
                value={city}
                onChangeText={(text) => onChange({ ...location, city: text })}
                editable={!disabled && enabled.city}
                placeholder="Enter city"
                placeholderTextColor={COLORS.outline}
                style={[styles.control, !enabled.city && styles.controlOff]}
              />
            </View>
          );
        }

        const isSet = !!display[field];

        return (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>
              {LABELS[field]}
              {required ? <Text style={styles.required}> *</Text> : null}
            </Text>

            <TouchableOpacity
              onPress={() => openPicker(field)}
              activeOpacity={0.7}
              disabled={disabled || !enabled[field]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${LABELS[field]}`}
              accessibilityState={{ disabled: disabled || !enabled[field] }}
              style={[
                styles.control,
                styles.select,
                !enabled[field] && styles.controlOff,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.selectText, !isSet && styles.placeholder]}
              >
                {isSet
                  ? display[field]
                  : enabled[field]
                    ? `Select ${LABELS[field].toLowerCase()}`
                    : /*
                       | Says WHY it is disabled. "Select state" greyed out
                       | with no explanation reads as a broken screen.
                       */
                      `Select ${field === "state" ? "country" : "state"} first`}
              </Text>

              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Modal
        visible={open !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(null)}
      >
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheet}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Select {open ? LABELS[open] : ""}
              </Text>

              <TouchableOpacity
                onPress={() => setOpen(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              autoFocus
              placeholder={`Search ${open ? LABELS[open].toLowerCase() : ""}`}
              placeholderTextColor={COLORS.outline}
              style={styles.search}
            />

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              /*
              | 4,242 Indian cities live behind this list. Without these the
              | first open of a large state drops frames badly.
              */
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              removeClippedSubviews
              ListEmptyComponent={
                <Text style={styles.empty}>
                  Nothing matches “{query}”.
                </Text>
              }
              renderItem={({ item }) => {
                const selected =
                  (open === "country" && item.key === country) ||
                  (open === "state" && item.key === state) ||
                  (open === "city" && item.key === city);

                return (
                  <TouchableOpacity
                    onPress={() => commit(open, item.key)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[styles.row, selected && styles.rowSelected]}
                  >
                    {item.prefix ? (
                      <Text style={styles.flag}>{item.prefix}</Text>
                    ) : null}

                    <Text
                      style={[
                        styles.rowText,
                        selected && styles.rowTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {selected ? <Text style={styles.tick}>✓</Text> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
  },

  required: { color: COLORS.error },

  control: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    fontSize: 15,
    color: COLORS.onSurface,
  },

  controlOff: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: COLORS.outlineVariant,
  },

  select: { flexDirection: "row", alignItems: "center" },

  selectText: { flex: 1, fontSize: 15, color: COLORS.onSurface },

  placeholder: { color: COLORS.outline },

  chevron: { fontSize: 14, color: COLORS.onSurfaceVariant, marginLeft: 8 },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  sheet: {
    height: "80%",
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    overflow: "hidden",
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  sheetTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  close: { fontSize: 18, color: COLORS.onSurfaceVariant },

  search: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.outlineVariant,
  },

  rowSelected: { backgroundColor: COLORS.surfaceContainerHigh },

  flag: { fontSize: 18, marginRight: 12 },

  rowText: { flex: 1, fontSize: 15, color: COLORS.onSurface },

  rowTextSelected: { fontWeight: "700", color: COLORS.primary },

  tick: { fontSize: 15, color: COLORS.primary, marginLeft: 8 },

  empty: {
    textAlign: "center",
    paddingVertical: 28,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
});
