import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  money,
  fmtSlot,
  fmtTime,
  statusMeta,
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
| BookingCard.js
|
| Description:
| One booking in a list - the same card for both sides of it.
|
| WHY ONE CARD AND NOT TWO
|
| A booking is one fact with two readings. The team sees "Waiting for
| owner"; the owner sees "Needs your answer". Everything else on the card -
| the ground, the slot, the money, the match - is identical, and two
| components would have to be kept in step forever for the sake of one
| label and one name.
|
| So `asOwner` picks the wording and which counterparty to name, and the
| rest is shared. The status colours live in one map in groundConstants for
| the same reason.
|
| WHAT THE CARD LEADS WITH
|
| The time, in bold, because that is what the person is scanning for. Not
| the ground name - on "My bookings" they mostly know where they are going,
| and on the owner's list every row is their own ground anyway.
|
|--------------------------------------------------------------------------
*/

export default function BookingCard({ booking, asOwner = false, onPress }) {
  if (!booking) return null;

  const meta = statusMeta(booking.status, asOwner);

  const ground = booking.groundId || {};

  const unit = booking.unitId || {};

  const match = booking.matchId || null;

  /*
  | The owner needs to know WHO, the player needs to know WHERE. Same slot,
  | different missing piece.
  */
  const counterparty = asOwner
    ? booking.teamId?.teamName || booking.bookedBy?.fullName || "A team"
    : ground.groundName || "Ground";

  const late = Number(booking.delayMinutes || 0);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress?.(booking)}
    >
      <View style={styles.top}>
        <Text style={styles.when} numberOfLines={1}>
          {fmtSlot(booking.startTime, booking.endTime)}
        </Text>

        <View style={[styles.pill, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={11} color={meta.fg} />

          <Text style={[styles.pillText, { color: meta.fg }]}>{meta.label}</Text>
        </View>
      </View>

      <Text style={styles.who} numberOfLines={1}>
        {counterparty}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons
            name={unit.unitType === "net" ? "grid-outline" : "baseball-outline"}
            size={12}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.metaText} numberOfLines={1}>
            {unit.name || (booking.purpose === "net" ? "Net" : "Pitch")}
          </Text>
        </View>

        {!asOwner && ground.area ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="location-outline"
              size={12}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.metaText} numberOfLines={1}>
              {ground.area}
            </Text>
          </View>
        ) : null}

        <View style={styles.metaItem}>
          <Text style={styles.amount}>{money(booking.totalAmount || booking.amount)}</Text>

          {booking.paymentStatus === "paid" ? (
            <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
          ) : null}
        </View>
      </View>

      {/*
      | The attached fixture, when there is one. This single line is why a
      | ground owner wants the app instead of a phone call - they can see
      | who is playing whom on their pitch.
      */}
      {match ? (
        <View style={styles.matchStrip}>
          <Ionicons name="trophy-outline" size={12} color={COLORS.primary} />

          <Text style={styles.matchText} numberOfLines={1}>
            {match.teamA?.teamName || "Team A"} vs{" "}
            {match.teamB?.teamName || "TBD"}
            {match.matchType ? ` · ${match.matchType}` : ""}
          </Text>
        </View>
      ) : null}

      {/*
      | A counter-offer is the one state with something urgent in it for the
      | player, so it gets its own strip rather than being hidden behind a
      | status pill.
      */}
      {booking.status === "countered" && booking.counterOffer?.startTime ? (
        <View style={styles.counterStrip}>
          <Ionicons name="swap-horizontal" size={12} color="#8f4e00" />

          <Text style={styles.counterText} numberOfLines={2}>
            {asOwner ? "Offered" : "Owner offers"}{" "}
            {fmtTime(booking.counterOffer.startTime)} –{" "}
            {fmtTime(booking.counterOffer.endTime)}
          </Text>
        </View>
      ) : null}

      {/*
      | A ground-side delay and a team-side delay are both worth showing,
      | and they read completely differently - one is an apology with time
      | attached, the other is a record against the team.
      */}
      {booking.delayFault === "ground" && booking.compensationMinutes > 0 ? (
        <View style={styles.compStrip}>
          <Ionicons name="time" size={12} color={COLORS.success} />

          <Text style={styles.compText}>
            Ground late tha — {booking.compensationMinutes} min extra mile, koi
            charge nahi
          </Text>
        </View>
      ) : booking.delayFault === "team" && late > 0 ? (
        <View style={styles.lateStrip}>
          <Ionicons name="alert-circle" size={12} color={COLORS.onErrorContainer} />

          <Text style={styles.lateText}>{late} min late start</Text>
        </View>
      ) : null}

      {booking.overtimeMinutes > 0 ? (
        <Text style={styles.overtime}>
          +{booking.overtimeMinutes} min overtime · {money(booking.overtimeAmount)}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
    gap: 6,
  },

  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  when: { flex: 1, fontSize: 13.5, fontWeight: "800", color: COLORS.onSurface },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  pillText: { fontSize: 10, fontWeight: "800" },

  who: { fontSize: 13, fontWeight: "700", color: COLORS.primary },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },

  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },

  metaText: { fontSize: 11.5, color: COLORS.onSurfaceVariant, maxWidth: 120 },

  amount: { fontSize: 12.5, fontWeight: "800", color: COLORS.onSurface },

  matchStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  matchText: { flex: 1, fontSize: 11.5, fontWeight: "700", color: COLORS.onSurface },

  counterStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff1d6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  counterText: { flex: 1, fontSize: 11.5, fontWeight: "700", color: "#8f4e00" },

  compStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#e4f4e5",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  compText: { flex: 1, fontSize: 11, fontWeight: "700", color: "#1b5e20" },

  lateStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.errorContainer,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  lateText: { fontSize: 11, fontWeight: "700", color: COLORS.onErrorContainer },

  overtime: { fontSize: 11, fontWeight: "700", color: COLORS.secondary },
});
