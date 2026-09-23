import React from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  money,
  fmtTime,
  reliabilityLabel,
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
| GroundCard.js
|
| Description:
| One ground in a list. Used on discovery and on the owner's own list.
|
| WHAT A CAPTAIN ACTUALLY DECIDES ON
|
| Four things, in this order: can I get there, can I afford it, is it any
| good, and is it free when I need it. So the card leads with distance and
| price, carries the rating and the promise score as the trust signals, and
| - when the search included a date - says how many slots are actually free
| that day.
|
| Everything else (facility list, rules, photos) is on the detail screen.
| A card that tries to show all of it becomes a wall and stops being
| scannable, which defeats the point of a list.
|
| WHY THE PROMISE SCORE IS ON THE CARD AND NOT JUST THE STARS
|
| Every ground averages about four stars, so the stars barely separate them.
| "Kept 9 of 10 promises" does - it is the number that tells a captain
| whether the floodlights this listing advertises will actually be on.
|
|--------------------------------------------------------------------------
*/

const Badge = ({ icon, text, tone = COLORS.onSurfaceVariant, bg }) => (
  <View style={[styles.badge, bg ? { backgroundColor: bg } : null]}>
    {icon ? <Ionicons name={icon} size={11} color={tone} /> : null}

    <Text style={[styles.badgeText, { color: tone }]}>{text}</Text>
  </View>
);

export default function GroundCard({ ground, onPress, showOwnerState = false }) {
  if (!ground) return null;

  const photo = ground.image || ground.photos?.[0] || null;

  const rating = ground.rating || {};

  const reviewed = Number(rating.count || 0) > 0;

  const reliability = reliabilityLabel(ground);

  /*
  | When the search carried a date, the price shown is the cheapest slot
  | that is FREE that day. Showing the ground's cheapest slot in general
  | would be a number they cannot book, which is the same as a wrong one.
  */
  const price = ground.cheapestFreeSlot?.amount ?? ground.fromPrice;

  const free = Number(ground.freeSlotCount ?? -1);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress?.(ground)}
    >
      <View style={styles.imageWrap}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />
        ) : (
          /*
          | A flat green panel with a pitch icon rather than a grey box. A
          | ground with no photo should look unphotographed, not broken -
          | and plenty of real grounds will never have one.
          */
          <View style={[styles.image, styles.imageEmpty]}>
            <Ionicons name="location" size={22} color={COLORS.onPrimaryContainer} />
          </View>
        )}

        {ground.isVerified ? (
          <View style={styles.verified}>
            <Ionicons name="shield-checkmark" size={11} color={COLORS.onPrimary} />
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {ground.groundName}
          </Text>

          {ground.distanceKm != null ? (
            <Text style={styles.distance}>{ground.distanceKm} km</Text>
          ) : null}
        </View>

        <Text style={styles.where} numberOfLines={1}>
          {[ground.area, ground.city].filter(Boolean).join(", ") || "—"}
        </Text>

        <View style={styles.row}>
          {reviewed ? (
            <Badge
              icon="star"
              text={`${rating.overall} (${rating.count})`}
              tone={COLORS.secondary}
              bg="#fff4e0"
            />
          ) : (
            <Badge text="No reviews yet" tone={COLORS.outline} />
          )}

          {/*
          | Shown only once there are reviews behind it. A promise score of
          | 0% on a brand new ground would read as a failure rather than an
          | absence, and it is the one number people will act on.
          */}
          {reviewed && ground.promiseScore > 0 ? (
            <Badge
              icon="checkmark-done"
              text={`${ground.promiseScore}% promises`}
              tone={COLORS.success}
              bg="#e4f4e5"
            />
          ) : null}

          {ground.hasFloodlights ? (
            <Badge icon="flashlight" text="Lights" />
          ) : null}
        </View>

        <View style={styles.footer}>
          <View>
            {price != null ? (
              <Text style={styles.price}>
                <Text style={styles.priceFrom}>from </Text>
                {money(price)}
              </Text>
            ) : (
              <Text style={styles.noPrice}>Price on request</Text>
            )}

            <Text style={[styles.reliability, { color: reliability.tone }]}>
              {reliability.label}
            </Text>
          </View>

          {/*
          | Only rendered when the search actually asked about a date - so
          | it is either a real count or absent, never a misleading zero.
          */}
          {free >= 0 ? (
            <View style={styles.slotsPill}>
              <Text style={styles.slotsText}>
                {free === 0
                  ? "Full"
                  : `${free} slot${free > 1 ? "s" : ""} free`}
              </Text>

              {ground.nextFreeSlot ? (
                <Text style={styles.slotsNext}>
                  from {fmtTime(ground.nextFreeSlot.start)}
                </Text>
              ) : null}
            </View>
          ) : null}

          {showOwnerState ? (
            <View
              style={[
                styles.statePill,
                ground.status === "active"
                  ? styles.stateLive
                  : ground.status === "paused"
                    ? styles.statePaused
                    : styles.stateDraft,
              ]}
            >
              <Text style={styles.stateText}>
                {ground.status === "active"
                  ? "LIVE"
                  : ground.status === "paused"
                    ? "PAUSED"
                    : "DRAFT"}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: "hidden",
  },

  imageWrap: { width: 96 },

  image: { width: 96, height: "100%", minHeight: 118 },

  imageEmpty: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  verified: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  body: { flex: 1, padding: 11, gap: 5 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  name: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  distance: { fontSize: 11.5, fontWeight: "800", color: COLORS.primary },

  where: { fontSize: 11.5, color: COLORS.onSurfaceVariant },

  row: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 1 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceContainer,
  },

  badgeText: { fontSize: 10.5, fontWeight: "700" },

  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 3,
  },

  price: { fontSize: 14, fontWeight: "800", color: COLORS.onSurface },

  priceFrom: { fontSize: 10.5, fontWeight: "600", color: COLORS.outline },

  noPrice: { fontSize: 12, fontWeight: "600", color: COLORS.outline },

  reliability: { fontSize: 10.5, fontWeight: "700", marginTop: 1 },

  slotsPill: {
    alignItems: "flex-end",
  },

  slotsText: { fontSize: 11.5, fontWeight: "800", color: COLORS.primary },

  slotsNext: { fontSize: 10, color: COLORS.onSurfaceVariant },

  statePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },

  stateLive: { backgroundColor: "#d9f2da" },

  statePaused: { backgroundColor: "#fff1d6" },

  stateDraft: { backgroundColor: COLORS.surfaceContainerHigh },

  stateText: { fontSize: 9.5, fontWeight: "900", color: COLORS.onSurfaceVariant },
});
