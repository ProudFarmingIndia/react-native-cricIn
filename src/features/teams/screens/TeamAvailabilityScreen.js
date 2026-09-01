import React, { useMemo, useState, useCallback } from "react";

import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  getTeamCalendarApi,
  blockDateApi,
  unblockDateApi,
  updateTeamApi,
} from "../services/team.service";

import { COLORS } from "../../../constants/colors";

const FORMATS = ["T5", "T10", "T20", "ODI", "Test"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/*
|--------------------------------------------------------------------------
| Team Availability Screen
|--------------------------------------------------------------------------
|
| Three sections:
|   1. Standard Availability - a general weekly pattern, informational
|      only, shown to other teams as a rough guide. Not enforced.
|   2. Specific Date Calendar - the REAL availability, tap a day to
|      block/unblock it. Booked (real match) days can't be unblocked
|      here - that's governed by the match itself.
|   3. Match Preferences - preferred formats + overs, shown to other
|      teams and used to pre-fill challenge forms sent to this team.
|
| Expects via route.params: teamId, team.
*/

export default function TeamAvailabilityScreen() {
  const route = useRoute();

  const navigation = useNavigation();

  const { teamId, team } = route.params || {};

  const [standardAvailability, setStandardAvailability] = useState({
    weekdays: team?.standardAvailability?.weekdays || { enabled: false, startTime: "16:00", endTime: "20:00" },
    weekends: team?.standardAvailability?.weekends || { enabled: false, startTime: "09:00", endTime: "18:00" },
  });

  const [formats, setFormats] = useState(team?.matchPreferences?.formats || ["T20"]);
  const [preferredOvers, setPreferredOvers] = useState(team?.matchPreferences?.preferredOvers || 20);

  const [monthOffset, setMonthOffset] = useState(0);
  const [calendarDays, setCalendarDays] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const [savingPrefs, setSavingPrefs] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Month Being Viewed
  |--------------------------------------------------------------------------
  */

  const viewedMonth = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthStart = useMemo(() => {
    const d = new Date(viewedMonth);
    d.setDate(1);
    return d;
  }, [viewedMonth]);

  const monthEnd = useMemo(() => {
    const d = new Date(viewedMonth);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d;
  }, [viewedMonth]);

  const loadCalendar = useCallback(async () => {
    setCalendarLoading(true);

    try {
      const days = await getTeamCalendarApi(
        teamId,
        monthStart.toISOString(),
        monthEnd.toISOString(),
      );

      setCalendarDays(days || []);
    } catch (error) {
      console.error("Failed to load calendar:", error);
    } finally {
      setCalendarLoading(false);
    }
  }, [teamId, monthStart, monthEnd]);

  useFocusEffect(
    useCallback(() => {
      loadCalendar();
    }, [loadCalendar]),
  );

  /*
  |--------------------------------------------------------------------------
  | Calendar Grid
  |--------------------------------------------------------------------------
  */

  const dayStatusMap = useMemo(() => {
    const map = {};
    calendarDays.forEach((d) => {
      const key = new Date(d.date).toDateString();
      map[key] = d;
    });
    return map;
  }, [calendarDays]);

  const calendarCells = useMemo(() => {
    const firstWeekday = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();

    const cells = [];

    for (let i = 0; i < firstWeekday; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthStart);
      date.setDate(day);
      cells.push(date);
    }

    return cells;
  }, [monthStart, monthEnd]);

  const handleDayPress = (date) => {
    const key = date.toDateString();
    const entry = dayStatusMap[key];

    if (entry?.status === "booked") {
      Alert.alert(
        "Already Scheduled",
        "This date has a real match booked - cancel the match itself to free it up.",
      );
      return;
    }

    if (entry?.status === "blocked") {
      Alert.alert("Unblock This Date", "Make this date available again?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          onPress: async () => {
            try {
              await unblockDateApi(teamId, date.toISOString());
              loadCalendar();
            } catch (error) {
              Alert.alert("Failed", error.response?.data?.message || "Could not unblock this date.");
            }
          },
        },
      ]);
      return;
    }

    Alert.prompt
      ? Alert.prompt(
          "Block This Date",
          "Optional reason (e.g. ground unavailable)",
          async (reason) => {
            try {
              await blockDateApi(teamId, date.toISOString(), reason || "");
              loadCalendar();
            } catch (error) {
              Alert.alert("Failed", error.response?.data?.message || "Could not block this date.");
            }
          },
        )
      : Alert.alert("Block This Date", "Mark this date as unavailable?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Block",
            onPress: async () => {
              try {
                await blockDateApi(teamId, date.toISOString(), "");
                loadCalendar();
              } catch (error) {
                Alert.alert("Failed", error.response?.data?.message || "Could not block this date.");
              }
            },
          },
        ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Save Preferences (Standard Availability + Match Preferences)
  |--------------------------------------------------------------------------
  */

  const handleSavePreferences = async () => {
    setSavingPrefs(true);

    try {
      await updateTeamApi(teamId, {
        standardAvailability,
        matchPreferences: {
          formats,
          preferredOvers,
        },
      });

      Alert.alert("Saved", "Availability preferences updated.");
    } catch (error) {
      Alert.alert("Failed", error.response?.data?.message || "Could not save preferences.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const toggleFormat = (format) => {
    setFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Availability</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* ---------------------------------------------------------- */}
      {/* Standard Availability */}
      {/* ---------------------------------------------------------- */}

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>
            {/* was "event-available", a Material Icons name - Ionicons has
                no such glyph, so it rendered as an empty box. */}
            <Ionicons name="calendar-outline" size={16} /> Standard Availability
          </Text>
        </View>

        <Text style={styles.helperText}>
          A general guide for other teams - not strictly enforced. The calendar below is what actually blocks dates.
        </Text>

        <AvailabilityRow
          label="Weekdays"
          value={standardAvailability.weekdays}
          onChange={(next) => setStandardAvailability((prev) => ({ ...prev, weekdays: next }))}
        />

        <AvailabilityRow
          label="Weekends"
          value={standardAvailability.weekends}
          onChange={(next) => setStandardAvailability((prev) => ({ ...prev, weekends: next }))}
        />
      </View>

      {/* ---------------------------------------------------------- */}
      {/* Specific Date Calendar */}
      {/* ---------------------------------------------------------- */}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Specific Date Availability</Text>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => setMonthOffset((m) => m - 1)}>
            <Ionicons name="chevron-back" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>

          <Text style={styles.monthLabel}>
            {MONTH_NAMES[viewedMonth.getMonth()]} {viewedMonth.getFullYear()}
          </Text>

          <TouchableOpacity onPress={() => setMonthOffset((m) => m + 1)}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        {calendarLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.calendarLoader} />
        ) : (
          <>
            <View style={styles.weekdayRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <Text key={i} style={styles.weekdayLabel}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((date, index) => {
                if (!date) {
                  return <View key={index} style={styles.dayCell} />;
                }

                const entry = dayStatusMap[date.toDateString()];
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      entry?.status === "booked" && styles.dayCellBooked,
                      entry?.status === "blocked" && styles.dayCellBlocked,
                      isPast && styles.dayCellPast,
                    ]}
                    disabled={isPast}
                    onPress={() => handleDayPress(date)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        (entry?.status === "booked" || entry?.status === "blocked") && styles.dayTextLight,
                        isPast && styles.dayTextPast,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.legend}>
              <LegendDot color={COLORS.surfaceContainerLowest} border label="Available" />
              <LegendDot color={COLORS.error} label="Booked" />
              <LegendDot color={COLORS.outline} label="Blocked" />
            </View>
          </>
        )}
      </View>

      {/* ---------------------------------------------------------- */}
      {/* Match Preferences */}
      {/* ---------------------------------------------------------- */}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Match Preferences</Text>

        <Text style={styles.helperText}>Preferred Match Format</Text>

        <View style={styles.chipRow}>
          {FORMATS.map((format) => {
            const selected = formats.includes(format);
            return (
              <TouchableOpacity
                key={format}
                style={[styles.formatChip, selected && styles.formatChipSelected]}
                onPress={() => toggleFormat(format)}
              >
                <Text style={[styles.formatChipText, selected && styles.formatChipTextSelected]}>
                  {format}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.oversRow}>
          <Text style={styles.helperText}>Preferred Overs</Text>
          <Text style={styles.oversValue}>{preferredOvers} Overs</Text>
        </View>

        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => setPreferredOvers((v) => Math.max(5, v - 5))}
          >
            <Ionicons name="remove" size={18} color={COLORS.onSurface} />
          </TouchableOpacity>

          <View style={styles.oversBarTrack}>
            <View style={[styles.oversBarFill, { width: `${((preferredOvers - 5) / 45) * 100}%` }]} />
          </View>

          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => setPreferredOvers((v) => Math.min(50, v + 5))}
          >
            <Ionicons name="add" size={18} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSavePreferences} disabled={savingPrefs}>
        {savingPrefs ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
    </SafeAreaView>
  );
}

function AvailabilityRow({ label, value, onChange }) {
  return (
    <View style={styles.availabilityRow}>
      <View style={styles.availabilityHeader}>
        <Text style={styles.availabilityLabel}>{label}</Text>
        <Switch
          value={value.enabled}
          onValueChange={(enabled) => onChange({ ...value, enabled })}
          trackColor={{ false: COLORS.outlineVariant, true: COLORS.primaryContainer }}
          thumbColor={value.enabled ? COLORS.primary : "#fff"}
        />
      </View>

      {value.enabled && (
        <View style={styles.timeRow}>
          <TextInput
            style={styles.timeInput}
            value={value.startTime}
            onChangeText={(startTime) => onChange({ ...value, startTime })}
            placeholder="16:00"
          />
          <Text style={styles.toText}>to</Text>
          <TextInput
            style={styles.timeInput}
            value={value.endTime}
            onChangeText={(endTime) => onChange({ ...value, endTime })}
            placeholder="20:00"
          />
        </View>
      )}
    </View>
  );
}

function LegendDot({ color, border, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }, border && styles.legendDotBorder]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  calendarLoader: {
    marginVertical: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  backButton: {
    padding: 6,
    marginRight: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 4,
  },

  helperText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  availabilityRow: {
    marginTop: 12,
  },

  availabilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  availabilityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  timeInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.onSurface,
    width: 80,
    textAlign: "center",
  },

  toText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  monthLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  weekdayRow: {
    flexDirection: "row",
  },

  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },

  dayCellBooked: {
    backgroundColor: COLORS.error,
    borderRadius: 999,
  },

  dayCellBlocked: {
    backgroundColor: COLORS.outline,
    borderRadius: 999,
  },

  dayCellPast: {
    opacity: 0.3,
  },

  dayText: {
    fontSize: 13,
    color: COLORS.onSurface,
  },

  dayTextLight: {
    color: "#fff",
    fontWeight: "700",
  },

  dayTextPast: {
    color: COLORS.onSurfaceVariant,
  },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },

  legendDotBorder: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  legendLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  formatChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginRight: 8,
    marginBottom: 8,
  },

  formatChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  formatChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  formatChipTextSelected: {
    color: COLORS.onPrimary,
  },

  oversRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  oversValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },

  oversBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: 2,
    marginHorizontal: 12,
  },

  oversBarFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  saveButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
});