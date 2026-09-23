import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import useGroundOptions from "../hooks/useGroundOptions";

import { createUnitApi, updateUnitApi } from "../services/ground.service";

import { money, fmtHHMM, DAY_LABELS } from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| UnitFormScreen.js
|
| Description:
| One pitch or one net: when it is open, and what it costs.
|
| WHY MATCHES ARE SOLD IN BLOCKS AND NETS BY THE HOUR
|
| They are different products. A match needs a whole session, and the owner
| wants to decide how the day is carved up - three hours at six in the
| morning, three more under lights - because a stray one-hour booking in the
| middle of the afternoon destroys the rest of the day's inventory.
|
| A net is the opposite. Nobody wants one for three hours and the owner does
| not care which hour you take, so it is priced by the hour with a minimum
| and a maximum.
|
| That is why this screen shows two completely different halves depending on
| the type, and why the type cannot be changed after creation - the shape of
| the data underneath it is different.
|
| WHY THE WEEKEND RATE IS BLANK BY DEFAULT AND NOT A COPY
|
| Blank means "same as weekday". If it defaulted to a copy of the weekday
| number, an owner raising their weekday price later would silently leave the
| weekend one behind - and the weekend is when most cricket is played, so
| that is the expensive direction to get wrong.
|
|--------------------------------------------------------------------------
*/

const DEFAULT_HOURS = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: "06:00",
  close: "22:00",
  closed: false,
}));

/*
| Times are edited as "HH:mm" text with a light touch of normalising, rather
| than through a native time picker. The picker is four taps per field, and
| this screen can easily have sixteen of them; an owner setting up a ground
| types "0600" far faster than they tap through a clock face twice.
*/

const normaliseTime = (value) => {
  const digits = String(value || "").replace(/[^0-9]/g, "").slice(0, 4);

  if (digits.length < 3) return value;

  const h = Math.min(23, Number(digits.slice(0, digits.length - 2)));

  const m = Math.min(59, Number(digits.slice(-2)));

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const TimeInput = ({ value, onChange, placeholder }) => (
  <TextInput
    style={styles.timeInput}
    value={value}
    onChangeText={onChange}
    onBlur={() => onChange(normaliseTime(value))}
    keyboardType="numbers-and-punctuation"
    maxLength={5}
    placeholder={placeholder}
    placeholderTextColor={COLORS.outline}
  />
);

const Field = ({ label, hint, children }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>

    {hint ? <Text style={styles.hint}>{hint}</Text> : null}

    {children}
  </View>
);

const Block = ({ title, children }) => (
  <View style={styles.block}>
    <Text style={styles.blockTitle}>{title}</Text>

    {children}
  </View>
);

export default function UnitFormScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { groundId, unit: existing } = route.params || {};

  const editing = !!existing;

  const unitType = existing?.unitType || route.params?.unitType || "match";

  const isNet = unitType === "net";

  const { options } = useGroundOptions();

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(
    existing?.name || (isNet ? "Net 1" : "Pitch 1"),
  );

  const [pitchType, setPitchType] = useState(existing?.pitchType || "turf");

  const [hasFloodlights, setHasFloodlights] = useState(
    !!existing?.hasFloodlights,
  );

  const [weeklyHours, setWeeklyHours] = useState(
    existing?.weeklyHours?.length ? existing.weeklyHours : DEFAULT_HOURS,
  );

  const [blocks, setBlocks] = useState(
    existing?.matchBlocks?.length
      ? existing.matchBlocks.map((b) => ({
          ...b,
          weekdayRate: String(b.weekdayRate ?? ""),
          weekendRate: b.weekendRate != null ? String(b.weekendRate) : "",
        }))
      : [],
  );

  const [hourlyRate, setHourlyRate] = useState(
    existing?.hourlyRate ? String(existing.hourlyRate) : "",
  );

  const [weekendHourlyRate, setWeekendHourlyRate] = useState(
    existing?.weekendHourlyRate != null ? String(existing.weekendHourlyRate) : "",
  );

  const [minHours, setMinHours] = useState(String(existing?.minHours ?? 1));

  const [maxHours, setMaxHours] = useState(String(existing?.maxHours ?? 4));

  const setDay = (day, patch) =>
    setWeeklyHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, ...patch } : h)),
    );

  /*
  | "Same as Monday for all" - because an owner whose ground opens at six
  | every day should not type fourteen times. Sunday and Saturday keep their
  | own closed flag, since a ground shut on one weekday is common and this
  | should not quietly reopen it.
  */
  const copyToAll = () => {
    const monday = weeklyHours.find((h) => h.day === 1) || DEFAULT_HOURS[1];

    setWeeklyHours((prev) =>
      prev.map((h) => ({ ...h, open: monday.open, close: monday.close })),
    );
  };

  const addBlock = () =>
    setBlocks((prev) => [
      ...prev,
      {
        label: "",
        start: prev.length ? "" : "06:00",
        end: prev.length ? "" : "09:00",
        weekdayRate: "",
        weekendRate: "",
        needsFloodlights: false,
        isActive: true,
      },
    ]);

  const setBlock = (index, patch) =>
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    );

  /*
  | Overlapping blocks are the mistake that quietly breaks a day: two slots
  | that both look bookable but cannot both be sold. The server refuses them,
  | and this flags them while the owner is still typing rather than at save.
  */
  const overlapping = useMemo(() => {
    const bad = new Set();

    const toMin = (t) => {
      const [h, m] = String(t || "").split(":");

      return (Number(h) || 0) * 60 + (Number(m) || 0);
    };

    blocks.forEach((a, i) => {
      blocks.forEach((b, j) => {
        if (i >= j) return;

        if (!a.start || !a.end || !b.start || !b.end) return;

        if (toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end)) {
          bad.add(i);

          bad.add(j);
        }
      });
    });

    return bad;
  }, [blocks]);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert("Naam chahiye", "Is pitch ya net ko ek naam de dijiye.");

      return;
    }

    if (!isNet && !blocks.length) {
      Alert.alert(
        "Slot chahiye",
        "Kam se kam ek slot banao, warna koi book nahi kar payega.",
      );

      return;
    }

    if (overlapping.size) {
      Alert.alert(
        "Slots overlap ho rahe hain",
        "Do slots ka time aapas me nahi takraana chahiye. Laal wale theek kar do.",
      );

      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),

        unitType,

        hasFloodlights,

        weeklyHours,

        ...(isNet
          ? {
              hourlyRate: Number(hourlyRate) || 0,

              /* Blank stays null - "same as weekday", not zero. */
              weekendHourlyRate:
                weekendHourlyRate === "" ? null : Number(weekendHourlyRate),

              minHours: Number(minHours) || 1,

              maxHours: Number(maxHours) || 4,
            }
          : {
              pitchType,

              matchBlocks: blocks.map((b) => ({
                label: b.label || "",
                start: normaliseTime(b.start),
                end: normaliseTime(b.end),
                weekdayRate: Number(b.weekdayRate) || 0,
                weekendRate:
                  b.weekendRate === "" ? null : Number(b.weekendRate),
                needsFloodlights: !!b.needsFloodlights,
                isActive: b.isActive !== false,
              })),
            }),
      };

      if (editing) {
        await updateUnitApi(groundId, existing._id, payload);
      } else {
        await createUnitApi(groundId, payload);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Save nahi hua",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Block title={isNet ? "Net" : "Pitch"}>
          <Field label="Naam" hint="Jaise 'Pitch 1' ya 'Main ground'">
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={isNet ? "Net 1" : "Pitch 1"}
              placeholderTextColor={COLORS.outline}
            />
          </Field>

          {!isNet ? (
            <Field label="Pitch type">
              <View style={styles.chipRow}>
                {(options.pitchTypes || []).map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[styles.chip, pitchType === p.key && styles.chipActive]}
                    activeOpacity={0.85}
                    onPress={() => setPitchType(p.key)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        pitchType === p.key && styles.chipTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
          ) : null}

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.label}>Floodlights</Text>

              <Text style={styles.hint}>
                Iske bina shaam 7 baje ke baad ke slot offer nahi honge
              </Text>
            </View>

            <Switch
              value={hasFloodlights}
              onValueChange={setHasFloodlights}
              trackColor={{ true: COLORS.primaryContainer }}
              thumbColor={hasFloodlights ? COLORS.primary : undefined}
            />
          </View>
        </Block>

        {/*
        |--------------------------------------------------------------------
        | Weekly hours
        |--------------------------------------------------------------------
        |
        | All seven days are stored, always. A missing row would have to mean
        | either "closed" or "use the default", and those two readings differ
        | by a whole day of inventory.
        */}

        <Block title="Weekly timing">
          <TouchableOpacity style={styles.copyAll} onPress={copyToAll}>
            <Ionicons name="copy-outline" size={13} color={COLORS.primary} />

            <Text style={styles.copyAllText}>
              Monday ka time sab din par laga do
            </Text>
          </TouchableOpacity>

          {weeklyHours.map((h) => (
            <View key={h.day} style={styles.dayRow}>
              <Text
                style={[
                  styles.dayLabel,
                  (h.day === 0 || h.day === 6) && styles.dayWeekend,
                ]}
              >
                {DAY_LABELS[h.day]}
              </Text>

              {h.closed ? (
                <Text style={styles.dayClosed}>Band</Text>
              ) : (
                <View style={styles.dayTimes}>
                  <TimeInput
                    value={h.open}
                    onChange={(t) => setDay(h.day, { open: t })}
                    placeholder="06:00"
                  />

                  <Text style={styles.dayDash}>–</Text>

                  <TimeInput
                    value={h.close}
                    onChange={(t) => setDay(h.day, { close: t })}
                    placeholder="22:00"
                  />
                </View>
              )}

              <Switch
                value={!h.closed}
                onValueChange={(v) => setDay(h.day, { closed: !v })}
                trackColor={{ true: COLORS.primaryContainer }}
                thumbColor={!h.closed ? COLORS.primary : undefined}
              />
            </View>
          ))}
        </Block>

        {/*
        |--------------------------------------------------------------------
        | Rates
        |--------------------------------------------------------------------
        */}

        {isNet ? (
          <Block title="Rate">
            <View style={styles.twoCol}>
              <Field label="Weekday (per hour)">
                <TextInput
                  style={styles.input}
                  value={hourlyRate}
                  onChangeText={(t) => setHourlyRate(t.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  placeholder="300"
                  placeholderTextColor={COLORS.outline}
                />
              </Field>

              <Field label="Weekend (per hour)">
                <TextInput
                  style={styles.input}
                  value={weekendHourlyRate}
                  onChangeText={(t) =>
                    setWeekendHourlyRate(t.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="number-pad"
                  placeholder="Same"
                  placeholderTextColor={COLORS.outline}
                />
              </Field>
            </View>

            <Text style={styles.hint}>
              Weekend khaali chhodoge to weekday wala hi rate lagega.
            </Text>

            <View style={styles.twoCol}>
              <Field label="Minimum ghante">
                <TextInput
                  style={styles.input}
                  value={minHours}
                  onChangeText={(t) => setMinHours(t.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                />
              </Field>

              <Field label="Maximum ghante">
                <TextInput
                  style={styles.input}
                  value={maxHours}
                  onChangeText={(t) => setMaxHours(t.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                />
              </Field>
            </View>
          </Block>
        ) : (
          <Block title="Match slots">
            <Text style={styles.hint}>
              Aap decide karte ho din kaise banta hai. Team poora slot book
              karegi — beech me se ghanta nahi kaat sakti.
            </Text>

            {blocks.map((b, i) => {
              const bad = overlapping.has(i);

              return (
                <View
                  key={i}
                  style={[styles.slotCard, bad && styles.slotCardBad]}
                >
                  <View style={styles.slotHead}>
                    <TextInput
                      style={styles.slotLabel}
                      value={b.label}
                      onChangeText={(t) => setBlock(i, { label: t })}
                      placeholder={`Slot ${i + 1} ka naam (optional)`}
                      placeholderTextColor={COLORS.outline}
                    />

                    <TouchableOpacity
                      hitSlop={8}
                      onPress={() =>
                        setBlocks((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.slotTimes}>
                    <TimeInput
                      value={b.start}
                      onChange={(t) => setBlock(i, { start: t })}
                      placeholder="06:00"
                    />

                    <Text style={styles.dayDash}>–</Text>

                    <TimeInput
                      value={b.end}
                      onChange={(t) => setBlock(i, { end: t })}
                      placeholder="09:00"
                    />
                  </View>

                  <View style={styles.twoCol}>
                    <Field label="Weekday rate">
                      <TextInput
                        style={styles.input}
                        value={b.weekdayRate}
                        onChangeText={(t) =>
                          setBlock(i, { weekdayRate: t.replace(/[^0-9]/g, "") })
                        }
                        keyboardType="number-pad"
                        placeholder="1500"
                        placeholderTextColor={COLORS.outline}
                      />
                    </Field>

                    <Field label="Weekend rate">
                      <TextInput
                        style={styles.input}
                        value={b.weekendRate}
                        onChangeText={(t) =>
                          setBlock(i, { weekendRate: t.replace(/[^0-9]/g, "") })
                        }
                        keyboardType="number-pad"
                        placeholder="Same"
                        placeholderTextColor={COLORS.outline}
                      />
                    </Field>
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={styles.slotSwitchLabel}>
                      Is slot me lights chahiye
                    </Text>

                    <Switch
                      value={!!b.needsFloodlights}
                      onValueChange={(v) => setBlock(i, { needsFloodlights: v })}
                      trackColor={{ true: COLORS.primaryContainer }}
                      thumbColor={b.needsFloodlights ? COLORS.primary : undefined}
                    />
                  </View>

                  {b.needsFloodlights && !hasFloodlights ? (
                    <Text style={styles.slotWarn}>
                      Is pitch par floodlights off hain — ye slot kisi ko dikhega
                      hi nahi.
                    </Text>
                  ) : null}

                  {bad ? (
                    <Text style={styles.slotWarn}>
                      Ye slot kisi doosre slot se takra raha hai.
                    </Text>
                  ) : null}

                  {b.start && b.end && b.weekdayRate ? (
                    <Text style={styles.slotPreview}>
                      {fmtHHMM(normaliseTime(b.start))} –{" "}
                      {fmtHHMM(normaliseTime(b.end))} · {money(b.weekdayRate)}
                      {b.weekendRate ? ` (weekend ${money(b.weekendRate)})` : ""}
                    </Text>
                  ) : null}
                </View>
              );
            })}

            <TouchableOpacity style={styles.addSlot} onPress={addBlock}>
              <Ionicons name="add" size={17} color={COLORS.primary} />

              <Text style={styles.addSlotText}>Slot add karo</Text>
            </TouchableOpacity>
          </Block>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, saving && styles.ctaDisabled]}
          activeOpacity={0.9}
          disabled={saving}
          onPress={save}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.onPrimary} />
          ) : (
            <>
              <Ionicons name="checkmark" size={17} color={COLORS.onPrimary} />

              <Text style={styles.ctaText}>
                {editing ? "Save karo" : isNet ? "Net add karo" : "Pitch add karo"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  scroll: { padding: 16, paddingBottom: 110, gap: 13 },

  block: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    gap: 11,
  },

  blockTitle: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  field: { gap: 5, flex: 1 },

  label: { fontSize: 12.5, fontWeight: "800", color: COLORS.onSurface },

  hint: { fontSize: 11.5, lineHeight: 16.5, color: COLORS.onSurfaceVariant },

  input: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  twoCol: { flexDirection: "row", gap: 9 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 11.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  switchText: { flex: 1, gap: 2 },

  copyAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },

  copyAllText: { fontSize: 11.5, fontWeight: "800", color: COLORS.primary },

  dayRow: { flexDirection: "row", alignItems: "center", gap: 9 },

  dayLabel: {
    width: 34,
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  dayWeekend: { color: COLORS.secondary },

  dayTimes: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },

  dayDash: { fontSize: 13, color: COLORS.outline },

  dayClosed: { flex: 1, fontSize: 12, color: COLORS.outline, fontStyle: "italic" },

  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    textAlign: "center",
    color: COLORS.onSurface,
  },

  slotCard: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    padding: 11,
    gap: 9,
    backgroundColor: COLORS.surfaceContainerLow,
  },

  slotCardBad: { borderColor: COLORS.error, backgroundColor: "#fff5f5" },

  slotHead: { flexDirection: "row", alignItems: "center", gap: 8 },

  slotLabel: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.onSurface,
    paddingVertical: 2,
  },

  slotTimes: { flexDirection: "row", alignItems: "center", gap: 7 },

  slotSwitchLabel: { flex: 1, fontSize: 12, color: COLORS.onSurfaceVariant },

  slotWarn: { fontSize: 11, fontWeight: "700", color: COLORS.error },

  slotPreview: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    paddingTop: 7,
  },

  addSlot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.4,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    borderRadius: 11,
    paddingVertical: 12,
  },

  addSlotText: { fontSize: 13, fontWeight: "800", color: COLORS.primary },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingVertical: 15,
  },

  ctaDisabled: { opacity: 0.6 },

  ctaText: { fontSize: 14.5, fontWeight: "900", color: COLORS.onPrimary },
});
