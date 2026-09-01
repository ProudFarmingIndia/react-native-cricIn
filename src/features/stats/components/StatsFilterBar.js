import React, { useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { getFilterOptionsApi } from "../services/stats.service";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Stats Filter Bar
|--------------------------------------------------------------------------
|
| A scrollable row of dropdown chips, shared by the Stats and Teams tabs.
|
| The options come from the server (/stats/filters), which returns the
| city, state and country values that ACTUALLY exist on teams. A free-text
| box would look more flexible but quietly returns nothing whenever the
| spelling differs by a space or a capital - "New delhi" against
| "New Delhi". Offering only real values makes an empty result mean
| something.
|
| Each chip shows its current value when set, so the active filters are
| readable without opening anything.
|
*/

export default function StatsFilterBar({ filters, onChange, fields }) {
  const [options, setOptions] = useState(null);
  const [openField, setOpenField] = useState(null);

  useEffect(() => {
    let mounted = true;

    getFilterOptionsApi()
      .then((data) => {
        if (mounted) {
          setOptions(data);
        }
      })
      .catch(() => {
        /*
        | A failed options fetch leaves the chips disabled rather than
        | breaking the board behind them - the unfiltered leaderboard is
        | still perfectly useful.
        */
        if (mounted) {
          setOptions({});
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const definitions = useMemo(
    () => ({
      range: {
        label: "Period",
        values: [
          { value: "all", label: "All Time" },
          { value: "today", label: "Today" },
          { value: "week", label: "This Week" },
          { value: "month", label: "This Month" },
        ],
      },

      city: {
        label: "City",
        values: (options?.cities || []).map((v) => ({ value: v, label: v })),
      },

      state: {
        label: "State",
        values: (options?.states || []).map((v) => ({ value: v, label: v })),
      },

      country: {
        label: "Country",
        values: (options?.countries || []).map((v) => ({ value: v, label: v })),
      },

      ballType: {
        label: "Ball",
        values: (options?.ballTypes || []).map((v) => ({ value: v, label: v })),
      },

      matchType: {
        label: "Format",
        values: (options?.matchTypes || []).map((v) => ({ value: v, label: v })),
      },

      teamType: {
        label: "Type",
        values: (options?.teamTypes || []).map((v) => ({ value: v, label: v })),
      },
    }),
    [options],
  );

  const activeField = openField ? definitions[openField] : null;

  const currentValue = openField ? filters?.[openField] : null;

  const select = (value) => {
    onChange({
      ...filters,

      /*
      | Tapping the value already selected clears it - otherwise a filter
      | with no "Any" row can never be undone once set.
      */
      [openField]: filters?.[openField] === value ? undefined : value,
    });

    setOpenField(null);
  };

  const clearAll = () => {
    const cleared = { ...filters };

    fields.forEach((field) => {
      if (field !== "range") {
        cleared[field] = undefined;
      }
    });

    onChange(cleared);
  };

  const activeCount = fields.filter(
    (f) => f !== "range" && filters?.[f],
  ).length;

  return (
    <View style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {fields.map((field) => {
          const def = definitions[field];

          if (!def) {
            return null;
          }

          const value = filters?.[field];

          const selected = def.values.find((v) => v.value === value);

          const isSet = !!value && field !== "range";

          return (
            <TouchableOpacity
              key={field}
              style={[styles.chip, isSet && styles.chipActive]}
              onPress={() => setOpenField(field)}
              disabled={def.values.length === 0}
            >
              <Text style={[styles.chipText, isSet && styles.chipTextActive]}>
                {selected ? selected.label : def.label}
              </Text>

              <Ionicons
                name="chevron-down"
                size={13}
                color={isSet ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                style={styles.chipIcon}
              />
            </TouchableOpacity>
          );
        })}

        {activeCount > 0 && (
          <TouchableOpacity style={styles.clearChip} onPress={clearAll}>
            <Ionicons name="close" size={13} color={COLORS.error} />

            <Text style={styles.clearText}>Clear ({activeCount})</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={!!openField}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenField(null)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpenField(null)}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{activeField?.label}</Text>

              <TouchableOpacity onPress={() => setOpenField(null)}>
                <Ionicons name="close" size={20} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={activeField?.values || []}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = currentValue === item.value;

                return (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => select(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyOption}>
                  Nothing to filter by yet.
                </Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 54,
    justifyContent: "center",
  },

  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },

  row: {
    alignItems: "center",
    paddingHorizontal: 16,
  },

  chip: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginRight: 8,
  },

  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  chipTextActive: {
    color: COLORS.onPrimary,
  },

  chipIcon: {
    marginLeft: 4,
  },

  clearChip: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginRight: 8,
  },

  clearText: {
    marginLeft: 4,
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.error,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  sheet: {
    maxHeight: "60%",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },

  optionText: {
    fontSize: 14.5,
    color: COLORS.onSurface,
  },

  optionTextSelected: {
    fontWeight: "800",
    color: COLORS.primary,
  },

  emptyOption: {
    padding: 24,
    textAlign: "center",
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
});
