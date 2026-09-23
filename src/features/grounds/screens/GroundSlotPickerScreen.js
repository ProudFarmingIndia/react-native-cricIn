import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import SlotGrid from "../components/SlotGrid";

import { getAvailabilityApi } from "../services/ground.service";

import {
  money,
  fmtHHMM,
  nextDays,
  toDateParam,
} from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| GroundSlotPickerScreen.js
|
| Description:
| Pick a date, pick a slot. The whole screen is those two decisions.
|
| WHY THE DATE STRIP IS FOURTEEN DAYS AND NOT A CALENDAR
|
| Local cricket is booked for this weekend or the next one. A month calendar
| makes somebody tap twice to reach Sunday; a horizontal strip puts it one
| swipe away, with the weekend days tinted so they are findable without
| reading.
|
| Anybody booking further out than two weeks is rare enough to be worth one
| extra tap on "Aage ki date" rather than making everybody else pay for a
| calendar.
|
| WHY THE UNIT FILTER IS HERE AND NOT ON THE PREVIOUS SCREEN
|
| A ground with two pitches and four nets produces a long screen, and
| somebody who came for a net does not want to scroll past three pitches.
| But the filter belongs HERE because it is about what is on screen, not
| about which grounds to show - and somebody who arrived looking for a match
| slot might well book a net instead once they see the price.
|
|--------------------------------------------------------------------------
*/

export default function GroundSlotPickerScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const {
    groundId,
    groundName,
    date: initialDate,
    unitType: initialType,
  } = route.params || {};

  const [days, setDays] = useState(() => nextDays(14));

  const [selectedDate, setSelectedDate] = useState(
    initialDate || toDateParam(new Date()),
  );

  const [unitType, setUnitType] = useState(initialType || "");

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [slot, setSlot] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getAvailabilityApi(groundId, selectedDate, unitType);

      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [groundId, selectedDate, unitType]);

  useEffect(() => {
    load();
  }, [load]);

  /*
  | The selection is dropped whenever the date or the unit filter changes.
  | Keeping it would leave a footer offering to book Saturday 6 AM while the
  | screen shows Sunday - and the server would refuse it with an error the
  | user cannot explain.
  */
  useEffect(() => {
    setSlot(null);
  }, [selectedDate, unitType]);

  /*
  | If the requested date is outside the strip - somebody came from a search
  | for three weeks out - the strip is rebuilt around it rather than
  | silently showing a selected date that is not on screen.
  */
  useEffect(() => {
    if (!selectedDate) return;

    if (days.some((d) => d.param === selectedDate)) return;

    setDays(nextDays(14, new Date(selectedDate)));
  }, [selectedDate, days]);

  const units = data?.units || [];

  const anyFree = units.some((u) =>
    (u.slots || []).some((s) => s.status === "available"),
  );

  const extendDays = () =>
    setDays((prev) => [
      ...prev,
      ...nextDays(14, new Date(prev[prev.length - 1].date.getTime() + 86400000)),
    ]);

  return (
    <View style={styles.container}>
      {/*
      |--------------------------------------------------------------------
      | Date
      |--------------------------------------------------------------------
      */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStrip}
      >
        {days.map((d) => {
          const active = selectedDate === d.param;

          return (
            <TouchableOpacity
              key={d.param}
              style={[styles.dateTile, active && styles.dateTileActive]}
              activeOpacity={0.85}
              onPress={() => setSelectedDate(d.param)}
            >
              <Text
                style={[
                  styles.dateDay,
                  active && styles.dateTextActive,
                  d.isWeekend && !active && styles.dateWeekend,
                ]}
              >
                {d.isToday ? "Aaj" : d.day}
              </Text>

              <Text style={[styles.dateNum, active && styles.dateTextActive]}>
                {d.num}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.more} onPress={extendDays}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />

          <Text style={styles.moreText}>Aage</Text>
        </TouchableOpacity>
      </ScrollView>

      {/*
      |--------------------------------------------------------------------
      | What kind of slot
      |--------------------------------------------------------------------
      */}

      <View style={styles.typeBar}>
        {[
          { key: "", label: "Sab" },
          { key: "match", label: "Match" },
          { key: "net", label: "Nets" },
        ].map((t) => (
          <TouchableOpacity
            key={t.key || "all"}
            style={[styles.typeChip, unitType === t.key && styles.typeChipActive]}
            activeOpacity={0.85}
            onPress={() => setUnitType(t.key)}
          >
            <Text
              style={[
                styles.typeText,
                unitType === t.key && styles.typeTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/*
        | The buffer, stated on the screen where it costs somebody a slot.
        | A greyed-out tile saying "30 min gap chahiye" makes sense only if
        | the rule was visible - otherwise it reads as the app being
        | arbitrary.
        */}
        {data?.bufferMatchMinutes ? (
          <Text style={styles.bufferNote}>
            {data.bufferMatchMinutes} min changeover gap
          </Text>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {units.length ? (
            units.map((unit) => (
              <SlotGrid
                key={String(unit.unitId)}
                unit={unit}
                selectedSlot={slot}
                onSelect={setSlot}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={28} color={COLORS.outline} />

              <Text style={styles.emptyTitle}>Is din kuch available nahi</Text>

              <Text style={styles.emptyBody}>
                Doosri date try karo — ya owner ne is unit ke liye abhi slots set
                nahi kiye.
              </Text>
            </View>
          )}

          {units.length && !anyFree ? (
            <View style={styles.fullNote}>
              <Ionicons name="information-circle-outline" size={15} color={COLORS.secondary} />

              <Text style={styles.fullNoteText}>
                Is din sab slots bhar gaye hain. Neeche date strip se agla din
                dekho.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      {/*
      | The footer appears only with a slot selected, so an empty state does
      | not carry a dead Continue button. What it shows is exactly what the
      | booking will cost - the amount comes from the server with the slot,
      | not from any arithmetic on this screen, so it cannot disagree with
      | the booking that gets created.
      */}
      {slot ? (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerSlot}>
              {slot.unitName} · {fmtHHMM(slot.startLabel)}–{fmtHHMM(slot.endLabel)}
            </Text>

            <Text style={styles.footerPrice}>
              {money(slot.amount)}
              <Text style={styles.footerDuration}>
                {"  "}
                {Math.round(slot.durationMinutes / 60)}h
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("BookGroundScreen", {
                groundId,
                groundName,
                date: selectedDate,
                slot,
              })
            }
          >
            <Text style={styles.ctaText}>Aage badho</Text>

            <Ionicons name="arrow-forward" size={16} color={COLORS.onPrimary} />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  dateStrip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: "center",
  },

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

  more: { alignItems: "center", paddingHorizontal: 6 },

  moreText: { fontSize: 10.5, fontWeight: "800", color: COLORS.primary },

  typeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  typeChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  typeText: { fontSize: 12, fontWeight: "700", color: COLORS.onSurfaceVariant },

  typeTextActive: { color: COLORS.onPrimary },

  bufferNote: {
    marginLeft: "auto",
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.outline,
  },

  scroll: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },

  empty: { alignItems: "center", paddingTop: 50, paddingHorizontal: 26, gap: 7 },

  emptyTitle: { fontSize: 15, fontWeight: "800", color: COLORS.onSurface },

  emptyBody: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  fullNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#fff1d6",
    borderRadius: 10,
    padding: 11,
  },

  fullNoteText: { flex: 1, fontSize: 12, fontWeight: "700", color: "#8f4e00" },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  footerInfo: { flex: 1 },

  footerSlot: { fontSize: 11.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  footerPrice: { fontSize: 17, fontWeight: "900", color: COLORS.onSurface },

  footerDuration: { fontSize: 11.5, fontWeight: "700", color: COLORS.outline },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  ctaText: { fontSize: 14, fontWeight: "900", color: COLORS.onPrimary },
});
