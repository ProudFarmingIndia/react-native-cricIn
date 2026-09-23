import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import useGroundOptions from "../hooks/useGroundOptions";

import { nextDays, fmtHHMM } from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| GroundFilterSheet.js
|
| Description:
| Every filter discovery supports, in one sheet.
|
| WHY THE FILTERS ARE HELD IN LOCAL STATE AND APPLIED ON A BUTTON
|
| Each change would otherwise fire a search - and choosing a date, then a
| time, then a pitch type, then two facilities is six requests to arrive at
| one answer, with the list jumping under the user's thumb the whole way.
|
| So the sheet edits a draft copy and hands it back once. Cancelling throws
| the draft away, which is also what a user expects from a sheet with a
| close button.
|
| WHY DATE AND TIME ARE THE FIRST THING IN IT
|
| Nobody browses grounds. They have a team, a date and roughly a time, and
| every ground that cannot host them that day is noise. Putting the date
| first - and defaulting the list to "only show what is free" once one is
| chosen - is the difference between a directory and a booking tool.
|
| The time row is deliberately a coarse set of windows rather than a picker.
| "Morning" is how people actually think about a Sunday game, and a picker
| would make them commit to 06:00 when 06:30 would have done.
|
|--------------------------------------------------------------------------
*/

const TIME_WINDOWS = [
  { key: "", label: "Any time", start: "", end: "" },
  { key: "early", label: "Early (5–9 AM)", start: "05:00", end: "09:00" },
  { key: "morning", label: "Morning (6 AM–12 PM)", start: "06:00", end: "12:00" },
  { key: "afternoon", label: "Afternoon (12–5 PM)", start: "12:00", end: "17:00" },
  { key: "evening", label: "Evening (5–9 PM)", start: "17:00", end: "21:00" },
  { key: "night", label: "Night (after 7 PM)", start: "19:00", end: "" },
];

const RATINGS = [
  { value: 0, label: "Any" },
  { value: 3, label: "3★+" },
  { value: 4, label: "4★+" },
  { value: 4.5, label: "4.5★+" },
];

const PROMISES = [
  { value: 0, label: "Any" },
  { value: 70, label: "70%+" },
  { value: 85, label: "85%+" },
];

const Chip = ({ label, active, onPress, icon }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    activeOpacity={0.85}
    onPress={onPress}
  >
    {icon ? (
      <Ionicons
        name={icon}
        size={12}
        color={active ? COLORS.onPrimary : COLORS.onSurfaceVariant}
      />
    ) : null}

    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const Section = ({ title, hint, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>

    {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}

    <View style={styles.chipRow}>{children}</View>
  </View>
);

export default function GroundFilterSheet({
  visible,
  filters,
  hasCoords,
  onClose,
  onApply,
}) {
  const { options } = useGroundOptions();

  const [draft, setDraft] = useState(filters);

  /*
  | Re-seeded every time the sheet opens, not once on mount. Without this a
  | user who cancels, then reopens, sees the discarded draft rather than
  | what the list is actually showing.
  */
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const set = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const toggleFacility = (key) => {
    const current = draft.facilities || [];

    set({
      facilities: current.includes(key)
        ? current.filter((f) => f !== key)
        : [...current, key],
    });
  };

  const days = nextDays(14);

  const activeWindow =
    TIME_WINDOWS.find(
      (w) => w.start === (draft.startTime || "") && w.end === (draft.endTime || ""),
    ) || TIME_WINDOWS[0];

  const clearAll = () =>
    set({
      date: "",
      startTime: "",
      endTime: "",
      unitType: "",
      pitchType: "",
      facilities: [],
      minRating: "",
      minPromiseScore: "",
      maxPrice: "",
      floodlights: "",
      verified: "",
      night: "",
      area: "",
    });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handleBar}>
            <Text style={styles.heading}>Filters</Text>

            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {/*
            |----------------------------------------------------------------
            | When
            |----------------------------------------------------------------
            |
            | First, because it is the question the user arrived with. Once a
            | date is set the server can say which grounds are actually free,
            | and the list stops offering ones that are not.
            */}

            <Section
              title="Kab khelna hai"
              hint="Date chunne par sirf wahi grounds dikhenge jinke slot khaali hain"
            >
              <Chip
                label="Any day"
                active={!draft.date}
                onPress={() => set({ date: "", startTime: "", endTime: "" })}
              />
            </Section>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateStrip}
            >
              {days.map((d) => {
                const active = draft.date === d.param;

                return (
                  <TouchableOpacity
                    key={d.param}
                    style={[styles.dateTile, active && styles.dateTileActive]}
                    activeOpacity={0.85}
                    onPress={() => set({ date: active ? "" : d.param })}
                  >
                    <Text
                      style={[
                        styles.dateDay,
                        active && styles.dateTextActive,
                        d.isWeekend && !active && styles.dateWeekend,
                      ]}
                    >
                      {d.isToday ? "Today" : d.day}
                    </Text>

                    <Text style={[styles.dateNum, active && styles.dateTextActive]}>
                      {d.num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Section
              title="Time"
              hint={
                draft.date
                  ? "Slot poora is window ke andar hona chahiye"
                  : "Pehle date chuniye"
              }
            >
              {TIME_WINDOWS.map((w) => (
                <Chip
                  key={w.key || "any"}
                  label={w.label}
                  active={activeWindow.key === w.key}
                  onPress={() =>
                    set({
                      startTime: w.start,
                      endTime: w.end,
                      /*
                      | The night window implies floodlights, so it also sets
                      | the night flag - a user picking "after 7 PM" does not
                      | also want to be told to tick a lights box.
                      */
                      night: w.key === "night" ? "true" : "",
                    })
                  }
                />
              ))}
            </Section>

            {/*
            |----------------------------------------------------------------
            | Where
            |----------------------------------------------------------------
            |
            | The distance chips only appear when there is a coordinate to
            | measure from. Without one they would be a control that silently
            | does nothing - so the area box takes their place instead.
            */}

            {hasCoords ? (
              <Section title="Distance">
                {(options.distances || []).map((km) => (
                  <Chip
                    key={km}
                    label={`${km} km`}
                    active={String(draft.radiusKm) === String(km)}
                    onPress={() => set({ radiusKm: km })}
                  />
                ))}
              </Section>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Area ya sector</Text>

                <Text style={styles.sectionHint}>
                  Location off hai, to area se dhoondhenge — jaise "Sector 62"
                </Text>

                <TextInput
                  style={styles.input}
                  value={draft.area}
                  onChangeText={(t) => set({ area: t })}
                  placeholder="Sector 62, Indirapuram..."
                  placeholderTextColor={COLORS.outline}
                />
              </View>
            )}

            {/*
            |----------------------------------------------------------------
            | What
            |----------------------------------------------------------------
            */}

            <Section title="Kis cheez ke liye">
              <Chip
                label="Match"
                icon="trophy-outline"
                active={draft.unitType === "match"}
                onPress={() =>
                  set({ unitType: draft.unitType === "match" ? "" : "match" })
                }
              />

              <Chip
                label="Net practice"
                icon="grid-outline"
                active={draft.unitType === "net"}
                onPress={() =>
                  set({ unitType: draft.unitType === "net" ? "" : "net" })
                }
              />
            </Section>

            <Section title="Pitch">
              {(options.pitchTypes || []).map((p) => (
                <Chip
                  key={p.key}
                  label={p.label}
                  active={draft.pitchType === p.key}
                  onPress={() =>
                    set({ pitchType: draft.pitchType === p.key ? "" : p.key })
                  }
                />
              ))}
            </Section>

            {/*
            |----------------------------------------------------------------
            | Trust
            |----------------------------------------------------------------
            |
            | Promise score is its own filter and not folded into the star
            | rating, because they answer different questions. Stars are "was
            | it nice". Promises are "did they do what they said" - which is
            | the one that decides whether the floodlights this listing
            | advertises will be on when you arrive.
            */}

            <Section title="Rating">
              {RATINGS.map((r) => (
                <Chip
                  key={r.value}
                  label={r.label}
                  active={Number(draft.minRating || 0) === r.value}
                  onPress={() => set({ minRating: r.value || "" })}
                />
              ))}
            </Section>

            <Section
              title="Promises poore kiye"
              hint="Players ne confirm kiya ki ground ne jo promise kiya tha wo mila"
            >
              {PROMISES.map((p) => (
                <Chip
                  key={p.value}
                  label={p.label}
                  active={Number(draft.minPromiseScore || 0) === p.value}
                  onPress={() => set({ minPromiseScore: p.value || "" })}
                />
              ))}
            </Section>

            <Section title="Facilities" hint="Sabhi selected facilities honi chahiye">
              {(options.facilities || []).map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  icon={f.icon}
                  active={(draft.facilities || []).includes(f.key)}
                  onPress={() => toggleFacility(f.key)}
                />
              ))}
            </Section>

            <Section title="Aur">
              <Chip
                label="Floodlights"
                icon="flashlight-outline"
                active={draft.floodlights === "true"}
                onPress={() =>
                  set({ floodlights: draft.floodlights === "true" ? "" : "true" })
                }
              />

              <Chip
                label="Verified only"
                icon="shield-checkmark-outline"
                active={draft.verified === "true"}
                onPress={() =>
                  set({ verified: draft.verified === "true" ? "" : "true" })
                }
              />
            </Section>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Budget (max per slot)</Text>

              <TextInput
                style={styles.input}
                value={draft.maxPrice ? String(draft.maxPrice) : ""}
                onChangeText={(t) => set({ maxPrice: t.replace(/[^0-9]/g, "") })}
                keyboardType="number-pad"
                placeholder="jaise 2000"
                placeholderTextColor={COLORS.outline}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clear} onPress={clearAll}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.apply}
              activeOpacity={0.9}
              onPress={() => onApply(draft)}
            >
              <Text style={styles.applyText}>Show grounds</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* Exported so the discovery screen can build the same summary line. */

export const describeFilters = (filters) => {
  const bits = [];

  if (filters.date) {
    const d = new Date(filters.date);

    bits.push(
      d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    );
  }

  if (filters.startTime) {
    bits.push(
      filters.endTime
        ? `${fmtHHMM(filters.startTime)}–${fmtHHMM(filters.endTime)}`
        : `${fmtHHMM(filters.startTime)} onwards`,
    );
  }

  if (filters.unitType) bits.push(filters.unitType === "net" ? "Nets" : "Match");

  if (filters.pitchType) bits.push(filters.pitchType.replace("_", " "));

  if (filters.minRating) bits.push(`${filters.minRating}★+`);

  if (filters.minPromiseScore) bits.push(`${filters.minPromiseScore}% promises`);

  if ((filters.facilities || []).length) {
    bits.push(`${filters.facilities.length} facilities`);
  }

  if (filters.maxPrice) bits.push(`under ₹${filters.maxPrice}`);

  if (filters.floodlights === "true") bits.push("Lights");

  if (filters.verified === "true") bits.push("Verified");

  if (filters.area) bits.push(filters.area);

  return bits;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "flex-end",
  },

  sheet: {
    maxHeight: "92%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  handleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },

  heading: { fontSize: 16.5, fontWeight: "900", color: COLORS.onSurface },

  body: { flexGrow: 0 },

  bodyContent: { padding: 18, paddingBottom: 8, gap: 16 },

  section: { gap: 7 },

  sectionTitle: { fontSize: 13, fontWeight: "800", color: COLORS.onSurface },

  sectionHint: { fontSize: 11.5, color: COLORS.onSurfaceVariant, lineHeight: 16 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 12, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  dateStrip: { paddingHorizontal: 18, gap: 8, paddingBottom: 4 },

  dateTile: {
    width: 52,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: "center",
    gap: 1,
  },

  dateTileActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  dateDay: { fontSize: 10.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  dateWeekend: { color: COLORS.secondary },

  dateNum: { fontSize: 15, fontWeight: "900", color: COLORS.onSurface },

  dateTextActive: { color: COLORS.onPrimary },

  input: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13.5,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  clear: { paddingHorizontal: 16, paddingVertical: 13 },

  clearText: { fontSize: 13, fontWeight: "800", color: COLORS.onSurfaceVariant },

  apply: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
  },

  applyText: { fontSize: 14, fontWeight: "900", color: COLORS.onPrimary },
});
