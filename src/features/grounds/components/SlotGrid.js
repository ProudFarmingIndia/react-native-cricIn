import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  money,
  fmtHHMM,
  SLOT_STATUS_META,
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
| SlotGrid.js
|
| Description:
| One unit's slots for one date, as tappable tiles.
|
| WHY UNAVAILABLE SLOTS ARE SHOWN, NOT HIDDEN
|
| The obvious design shows only what can be booked. It is wrong, and it is
| wrong in a way that generates support messages: somebody sees a gap where
| 6-9 should be, cannot tell whether it is booked, closed or simply never
| offered, and concludes the app is broken.
|
| So every slot is rendered with its own reason - "Already booked", "30 min
| gap chahiye", "Ground band hai", "Nikal chuka" - and greyed out. The
| screen never has an unexplained hole in it.
|
| The buffer case matters most. A slot that is free but sits inside the
| ground's changeover gap looks identical to a free one on a screen that
| only knows free/taken, and "6-9 is not available" when 6-9 is visibly
| empty reads as a bug. Saying a gap is needed is a fact the user can work
| with.
|
|--------------------------------------------------------------------------
*/

const Tile = ({ slot, selected, onPress }) => {
  const meta = SLOT_STATUS_META[slot.status] || SLOT_STATUS_META.booked;

  const free = slot.status === "available";

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        { backgroundColor: meta.bg, borderColor: meta.border },
        selected && styles.tileSelected,
      ]}
      activeOpacity={free ? 0.8 : 1}
      /*
      | A tapped-but-unavailable tile does nothing rather than showing an
      | alert. The reason is already printed on the tile, so an alert would
      | only repeat it with an extra dismiss.
      */
      onPress={free ? () => onPress?.(slot) : undefined}
    >
      <View style={styles.tileTop}>
        <Text
          style={[
            styles.time,
            { color: selected ? COLORS.onPrimary : meta.fg },
          ]}
        >
          {fmtHHMM(slot.startLabel)} – {fmtHHMM(slot.endLabel)}
        </Text>

        {slot.isNight ? (
          <Ionicons
            name="moon"
            size={11}
            color={selected ? COLORS.onPrimary : meta.fg}
          />
        ) : null}
      </View>

      {slot.label && slot.label !== slot.startLabel ? (
        <Text
          style={[
            styles.blockLabel,
            { color: selected ? COLORS.onPrimary : meta.fg },
          ]}
          numberOfLines={1}
        >
          {slot.label}
        </Text>
      ) : null}

      <View style={styles.tileBottom}>
        <Text
          style={[
            styles.amount,
            { color: selected ? COLORS.onPrimary : meta.fg },
          ]}
        >
          {money(slot.amount)}
        </Text>

        {!free ? <Text style={styles.reason}>{slot.reason}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

export default function SlotGrid({ unit, selectedSlot, onSelect }) {
  if (!unit) return null;

  if (unit.closed) {
    return (
      <View style={styles.unit}>
        <UnitHeader unit={unit} />

        <View style={styles.closed}>
          <Ionicons name="lock-closed-outline" size={14} color={COLORS.outline} />

          <Text style={styles.closedText}>Is din ye band rehta hai</Text>
        </View>
      </View>
    );
  }

  if (!unit.slots?.length) {
    return (
      <View style={styles.unit}>
        <UnitHeader unit={unit} />

        <Text style={styles.closedText}>
          Owner ne is unit ke liye koi slot set nahi kiya.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.unit}>
      <UnitHeader unit={unit} />

      <View style={styles.grid}>
        {unit.slots.map((slot) => (
          <Tile
            key={`${slot.unitId}-${slot.startLabel}-${slot.endLabel}`}
            slot={slot}
            selected={
              selectedSlot?.unitId === slot.unitId &&
              selectedSlot?.startLabel === slot.startLabel
            }
            onPress={onSelect}
          />
        ))}
      </View>
    </View>
  );
}

const UnitHeader = ({ unit }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Ionicons
        name={unit.unitType === "net" ? "grid-outline" : "baseball-outline"}
        size={14}
        color={COLORS.primary}
      />

      <Text style={styles.unitName}>{unit.name}</Text>

      {unit.pitchType ? (
        <Text style={styles.pitch}>· {unit.pitchType.replace("_", " ")}</Text>
      ) : null}
    </View>

    {!unit.closed && unit.open ? (
      <Text style={styles.hours}>
        {fmtHHMM(unit.open)} – {fmtHHMM(unit.close)}
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  unit: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 11,
    gap: 9,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },

  unitName: { fontSize: 13.5, fontWeight: "800", color: COLORS.onSurface },

  pitch: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    textTransform: "capitalize",
  },

  hours: { fontSize: 11, fontWeight: "700", color: COLORS.outline },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  tile: {
    minWidth: "47%",
    flexGrow: 1,
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 3,
  },

  tileSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  tileTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },

  time: { fontSize: 12.5, fontWeight: "800" },

  blockLabel: { fontSize: 10.5, fontWeight: "600" },

  tileBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },

  amount: { fontSize: 13, fontWeight: "800" },

  reason: { fontSize: 9.5, fontWeight: "700", color: COLORS.outline },

  closed: { flexDirection: "row", alignItems: "center", gap: 6 },

  closedText: { fontSize: 12, color: COLORS.onSurfaceVariant },
});
