import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import StarRating from "../components/StarRating";

import useGroundOptions from "../hooks/useGroundOptions";

import useUserLocation from "../hooks/useUserLocation";

import { getGroundByIdApi } from "../services/ground.service";

import { money, fmtHHMM, reliabilityLabel } from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| GroundDetailScreen.js
|
| Description:
| One ground, everything about it, and the way in to booking it.
|
| THE ORDER THINGS APPEAR IN
|
| Photos, then price and trust, then what it has, then the rules, then
| reviews. That is roughly the order a captain's questions arrive in, and
| the booking button is pinned to the bottom so it is reachable from any
| point in that scroll.
|
| WHY THE POLICIES ARE SHOWN BEFORE BOOKING AND NOT AFTER
|
| The buffer, the grace period, the overtime rate and the cancellation
| window are the four things that turn into an argument at the gate. A
| ground that says all of them up front cannot be accused of inventing them
| later - and the team that reads them behaves differently, which is the
| entire point.
|
| WHY THE PHONE NUMBER IS NOT HERE
|
| The server withholds it until there is a confirmed booking. If it were on
| the listing, everybody would call and book off-app, and the availability,
| the reliability record and the reviews would never exist. Once a booking
| is confirmed it appears, because then it is needed.
|
|--------------------------------------------------------------------------
*/

const { width } = Dimensions.get("window");

const Row = ({ icon, label, value, tone }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={15} color={COLORS.onSurfaceVariant} />

    <Text style={styles.rowLabel}>{label}</Text>

    <Text style={[styles.rowValue, tone ? { color: tone } : null]}>{value}</Text>
  </View>
);

const Section = ({ title, action, onAction, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {action ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>

    {children}
  </View>
);

export default function GroundDetailScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { groundId, date, unitType } = route.params || {};

  const { facilityMap } = useGroundOptions();

  const { coords } = useUserLocation({ auto: false });

  const [ground, setGround] = useState(null);

  const [loading, setLoading] = useState(true);

  const [photoIndex, setPhotoIndex] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await getGroundByIdApi(groundId, coords || {});

      setGround(data);
    } catch {
      setGround(null);
    } finally {
      setLoading(false);
    }
  }, [groundId, coords]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!ground) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={28} color={COLORS.outline} />

        <Text style={styles.errorText}>Ye ground load nahi ho paaya.</Text>
      </View>
    );
  }

  const photos = ground.photos?.length
    ? ground.photos
    : ground.image
      ? [ground.image]
      : [];

  const rating = ground.rating || {};

  const reviewed = Number(rating.count || 0) > 0;

  const reliability = reliabilityLabel(ground);

  const matchUnits = (ground.units || []).filter((u) => u.unitType === "match");

  const netUnits = (ground.units || []).filter((u) => u.unitType === "net");

  const cheapest = (ground.units || []).reduce((min, unit) => {
    const rates =
      unit.unitType === "net"
        ? [Number(unit.hourlyRate) || 0]
        : (unit.matchBlocks || [])
            .filter((b) => b.isActive !== false)
            .map((b) => Number(b.weekdayRate) || 0);

    const lowest = rates.filter((r) => r > 0);

    if (!lowest.length) return min;

    const value = Math.min(...lowest);

    return min == null || value < min ? value : min;
  }, null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/*
        |------------------------------------------------------------------
        | Photos
        |------------------------------------------------------------------
        |
        | A paged scroll rather than a carousel library - three or four
        | photos do not need a dependency, and the dots are enough of an
        | affordance that people swipe.
        */}

        {photos.length ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setPhotoIndex(
                  Math.round(e.nativeEvent.contentOffset.x / width),
                )
              }
            >
              {photos.map((uri, i) => (
                <Image
                  key={`${uri}-${i}`}
                  source={{ uri }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {photos.length > 1 ? (
              <View style={styles.dots}>
                {photos.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === photoIndex && styles.dotActive]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View style={[styles.photo, styles.photoEmpty]}>
            <Ionicons name="location" size={34} color={COLORS.onPrimaryContainer} />

            <Text style={styles.photoEmptyText}>Photo abhi nahi hai</Text>
          </View>
        )}

        <View style={styles.head}>
          <View style={styles.headTop}>
            <Text style={styles.name}>{ground.groundName}</Text>

            {ground.isVerified ? (
              <View style={styles.verified}>
                <Ionicons name="shield-checkmark" size={12} color={COLORS.onPrimary} />

                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.whereRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.onSurfaceVariant} />

            <Text style={styles.where}>
              {[ground.area, ground.city].filter(Boolean).join(", ") || "—"}
              {ground.distanceKm != null ? ` · ${ground.distanceKm} km` : ""}
            </Text>
          </View>

          <View style={styles.headStats}>
            <StarRating
              value={rating.overall}
              count={rating.count}
              showValue
              size={15}
            />

            {reviewed && ground.promiseScore > 0 ? (
              <View style={styles.promisePill}>
                <Ionicons name="checkmark-done" size={12} color={COLORS.success} />

                <Text style={styles.promisePillText}>
                  {ground.promiseScore}% promises kept
                </Text>
              </View>
            ) : null}
          </View>

          {ground.description ? (
            <Text style={styles.description}>{ground.description}</Text>
          ) : null}
        </View>

        {/*
        |------------------------------------------------------------------
        | Trust
        |------------------------------------------------------------------
        |
        | Response rate and on-time rate come straight from timestamps -
        | nothing here is self-reported. A ground with too little history
        | gets "Not enough data" rather than a confident percentage from two
        | bookings, which would be worse than saying nothing.
        */}

        <Section title="Bharosa">
          <View style={styles.card}>
            <Row
              icon="chatbubble-ellipses-outline"
              label="Request ka jawab"
              value={
                ground.responseRate != null
                  ? `${ground.responseRate}%`
                  : "Nayi listing"
              }
            />

            <Row
              icon="time-outline"
              label="Time par shuru"
              value={
                ground.onTimeRate != null ? `${ground.onTimeRate}%` : "Nayi listing"
              }
            />

            {ground.stats?.avgResponseMinutes ? (
              <Row
                icon="flash-outline"
                label="Average jawab"
                value={`${ground.stats.avgResponseMinutes} min`}
              />
            ) : null}

            <Row
              icon="ribbon-outline"
              label="Overall"
              value={reliability.label}
              tone={reliability.tone}
            />
          </View>
        </Section>

        {/*
        |------------------------------------------------------------------
        | What is bookable
        |------------------------------------------------------------------
        |
        | Pitches are sold as the owner's own blocks; nets by the hour. Both
        | are listed with their hours and their starting rate, so somebody
        | can decide whether to open the slot picker at all.
        */}

        <Section title="Kya book ho sakta hai">
          <View style={styles.card}>
            {matchUnits.length ? (
              <View style={styles.unitBlock}>
                <Text style={styles.unitHeading}>
                  Match pitches ({matchUnits.length})
                </Text>

                {matchUnits.map((u) => (
                  <View key={String(u._id)} style={styles.unitRow}>
                    <Ionicons
                      name="baseball-outline"
                      size={14}
                      color={COLORS.primary}
                    />

                    <Text style={styles.unitName}>{u.name}</Text>

                    {u.pitchType ? (
                      <Text style={styles.unitMeta}>
                        {String(u.pitchType).replace("_", " ")}
                      </Text>
                    ) : null}

                    {u.hasFloodlights ? (
                      <Ionicons name="flashlight" size={12} color={COLORS.secondary} />
                    ) : null}

                    <Text style={styles.unitBlocks}>
                      {(u.matchBlocks || []).filter((b) => b.isActive !== false)
                        .length}{" "}
                      slots
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {netUnits.length ? (
              <View style={styles.unitBlock}>
                <Text style={styles.unitHeading}>
                  Practice nets ({netUnits.length})
                </Text>

                {netUnits.map((u) => (
                  <View key={String(u._id)} style={styles.unitRow}>
                    <Ionicons name="grid-outline" size={14} color={COLORS.primary} />

                    <Text style={styles.unitName}>{u.name}</Text>

                    <Text style={styles.unitMeta}>
                      {money(u.hourlyRate)}/hr
                      {u.minHours ? ` · min ${u.minHours}h` : ""}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {!ground.units?.length ? (
              <Text style={styles.muted}>
                Owner ne abhi koi pitch ya net add nahi kiya.
              </Text>
            ) : null}
          </View>
        </Section>

        {/*
        |------------------------------------------------------------------
        | Facilities and promises
        |------------------------------------------------------------------
        |
        | Two lists that look similar and mean different things, so the
        | promises get their own strip and their own wording. "We have
        | parking" is a fact about the ground; "we guarantee parking for
        | your booking" is what the promise score is measured against.
        */}

        {ground.facilities?.length ? (
          <Section title="Facilities">
            <View style={styles.facilityWrap}>
              {ground.facilities.map((key) => {
                const f = facilityMap(key);

                const promised = (ground.promises || []).includes(key);

                return (
                  <View
                    key={key}
                    style={[styles.facility, promised && styles.facilityPromised]}
                  >
                    <Ionicons
                      name={f.icon}
                      size={13}
                      color={promised ? COLORS.success : COLORS.onSurfaceVariant}
                    />

                    <Text
                      style={[
                        styles.facilityText,
                        promised && styles.facilityTextPromised,
                      ]}
                    >
                      {f.label}
                    </Text>

                    {promised ? (
                      <Ionicons name="checkmark-circle" size={11} color={COLORS.success} />
                    ) : null}
                  </View>
                );
              })}
            </View>

            {ground.promises?.length ? (
              <Text style={styles.promiseNote}>
                ✓ wali cheezein owner ne guarantee ki hain — match ke baad
                players inhi par rating dete hain.
              </Text>
            ) : null}
          </Section>
        ) : null}

        {/*
        |------------------------------------------------------------------
        | The rules of engagement
        |------------------------------------------------------------------
        |
        | Shown before booking on purpose - see the note at the top. These
        | four numbers are what every dispute at the gate is actually about.
        */}

        <Section title="Booking ke rules">
          <View style={styles.card}>
            <Row
              icon="git-commit-outline"
              label="Do booking ke beech gap"
              value={`${ground.bufferMatchMinutes} min`}
            />

            <Row
              icon="hourglass-outline"
              label="Late aane ki chhoot"
              value={`${ground.graceMinutes} min`}
            />

            <Row
              icon="trending-up-outline"
              label="Overtime rate"
              value={`${ground.overtimeMultiplier}x`}
            />

            <Row
              icon="close-circle-outline"
              label="Free cancellation"
              value={`${ground.cancellationCutoffHours} ghante pehle tak`}
            />

            <Row
              icon="timer-outline"
              label="Request ka jawab"
              value={`${ground.requestExpiryHours} ghante me`}
            />

            {ground.instantBooking ? (
              <View style={styles.instantStrip}>
                <Ionicons name="flash" size={13} color={COLORS.success} />

                <Text style={styles.instantText}>
                  Instant booking on hai — approval ka wait nahi karna padega
                </Text>
              </View>
            ) : null}
          </View>
        </Section>

        {ground.rules ? (
          <Section title="Ground ke niyam">
            <View style={styles.card}>
              <Text style={styles.rules}>{ground.rules}</Text>
            </View>
          </Section>
        ) : null}

        {/*
        |------------------------------------------------------------------
        | Reviews
        |------------------------------------------------------------------
        |
        | Three shown, the rest behind "See all". The per-category averages
        | are here because a cheap ground with a rough pitch and a clean one
        | that costs double are both the right answer to somebody - a single
        | number cannot say that.
        */}

        <Section
          title={`Reviews${reviewed ? ` (${rating.count})` : ""}`}
          action={reviewed ? "See all" : null}
          onAction={() =>
            navigation.navigate("GroundReviewsScreen", {
              groundId: ground._id,
              groundName: ground.groundName,
            })
          }
        >
          <View style={styles.card}>
            {reviewed ? (
              <>
                <View style={styles.breakdown}>
                  {[
                    ["Pitch", rating.pitch],
                    ["Safai", rating.hygiene],
                    ["Facilities", rating.facilities],
                    ["Paise ki value", rating.valueForMoney],
                  ]
                    .filter(([, v]) => Number(v) > 0)
                    .map(([label, value]) => (
                      <View key={label} style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>{label}</Text>

                        <StarRating value={value} size={12} />

                        <Text style={styles.breakdownValue}>
                          {Number(value).toFixed(1)}
                        </Text>
                      </View>
                    ))}
                </View>

                {(ground.reviews || []).slice(0, 3).map((r) => (
                  <View key={String(r._id)} style={styles.review}>
                    <View style={styles.reviewHead}>
                      <Text style={styles.reviewer} numberOfLines={1}>
                        {r.userId?.fullName || "Player"}
                        {r.teamId?.teamName ? ` · ${r.teamId.teamName}` : ""}
                      </Text>

                      <StarRating value={r.overall} size={11} />
                    </View>

                    {r.comment ? (
                      <Text style={styles.reviewBody}>{r.comment}</Text>
                    ) : null}

                    {r.ownerReply ? (
                      <View style={styles.reply}>
                        <Text style={styles.replyLabel}>Owner ka jawab</Text>

                        <Text style={styles.replyBody}>{r.ownerReply}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.muted}>
                Abhi koi review nahi. Pehla match khel ke aap hi rating de sakte
                hain.
              </Text>
            )}
          </View>
        </Section>

        {/*
        | Released only once there is a confirmed booking - see the note at
        | the top of the file.
        */}
        {ground.contactVisible && ground.contactNumber ? (
          <Section title="Contact">
            <TouchableOpacity
              style={styles.contact}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(`tel:${ground.contactNumber}`)}
            >
              <Ionicons name="call" size={16} color={COLORS.onPrimary} />

              <Text style={styles.contactText}>
                {ground.contactPerson || "Ground"} · {ground.contactNumber}
              </Text>
            </TouchableOpacity>
          </Section>
        ) : null}

        {ground.address ? (
          <Section title="Pata">
            <View style={styles.card}>
              <Text style={styles.address}>{ground.address}</Text>

              {ground.landmark ? (
                <Text style={styles.landmark}>Landmark: {ground.landmark}</Text>
              ) : null}

              {ground.latitude && ground.longitude ? (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps/search/?api=1&query=${ground.latitude},${ground.longitude}`,
                    )
                  }
                >
                  <Ionicons name="navigate" size={14} color={COLORS.primary} />

                  <Text style={styles.mapButtonText}>Map par kholo</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Section>
        ) : null}
      </ScrollView>

      {/*
      | Pinned, because the decision can be made at any point in that
      | scroll and nobody should have to hunt for the button.
      |
      | An owner viewing their own listing gets Manage instead of Book -
      | booking your own ground is refused by the server anyway, and
      | offering it would be a button that only ever produces an error.
      */}
      <View style={styles.footer}>
        <View>
          {cheapest != null ? (
            <>
              <Text style={styles.footerFrom}>Starting</Text>

              <Text style={styles.footerPrice}>{money(cheapest)}</Text>
            </>
          ) : (
            <Text style={styles.footerFrom}>Price on request</Text>
          )}
        </View>

        {ground.isOwner ? (
          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("GroundUnitsScreen", { groundId: ground._id })
            }
          >
            <Ionicons name="settings-outline" size={17} color={COLORS.onPrimary} />

            <Text style={styles.ctaText}>Manage ground</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cta, !ground.units?.length && styles.ctaDisabled]}
            activeOpacity={0.9}
            disabled={!ground.units?.length}
            onPress={() =>
              navigation.navigate("GroundSlotPickerScreen", {
                groundId: ground._id,
                groundName: ground.groundName,
                date,
                unitType,
              })
            }
          >
            <Ionicons name="calendar" size={17} color={COLORS.onPrimary} />

            <Text style={styles.ctaText}>Slots dekho</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.background,
  },

  errorText: { fontSize: 13.5, color: COLORS.onSurfaceVariant },

  scroll: { paddingBottom: 110 },

  photo: { width, height: 210 },

  photoEmpty: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  photoEmptyText: { fontSize: 12, color: COLORS.onPrimaryContainer },

  dots: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  dotActive: { backgroundColor: "#fff", width: 16 },

  head: { padding: 16, gap: 7 },

  headTop: { flexDirection: "row", alignItems: "center", gap: 8 },

  name: { flex: 1, fontSize: 19, fontWeight: "900", color: COLORS.onSurface },

  verified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  verifiedText: { fontSize: 9, fontWeight: "900", color: COLORS.onPrimary },

  whereRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  where: { fontSize: 12.5, color: COLORS.onSurfaceVariant },

  headStats: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },

  promisePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e4f4e5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },

  promisePillText: { fontSize: 11, fontWeight: "800", color: "#1b5e20" },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },

  section: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10, gap: 8 },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  sectionAction: { fontSize: 12.5, fontWeight: "800", color: COLORS.primary },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
    gap: 9,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 8 },

  rowLabel: { flex: 1, fontSize: 12.5, color: COLORS.onSurfaceVariant },

  rowValue: { fontSize: 12.5, fontWeight: "800", color: COLORS.onSurface },

  unitBlock: { gap: 6 },

  unitHeading: { fontSize: 12, fontWeight: "800", color: COLORS.primary },

  unitRow: { flexDirection: "row", alignItems: "center", gap: 6 },

  unitName: { fontSize: 12.5, fontWeight: "700", color: COLORS.onSurface },

  unitMeta: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    textTransform: "capitalize",
  },

  unitBlocks: {
    marginLeft: "auto",
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.outline,
  },

  muted: { fontSize: 12.5, lineHeight: 18, color: COLORS.onSurfaceVariant },

  facilityWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  facility: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  facilityPromised: { borderColor: COLORS.success, backgroundColor: "#f0f9f0" },

  facilityText: { fontSize: 11.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  facilityTextPromised: { color: "#1b5e20" },

  promiseNote: {
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
    fontStyle: "italic",
  },

  instantStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e4f4e5",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  instantText: { flex: 1, fontSize: 11.5, fontWeight: "700", color: "#1b5e20" },

  rules: { fontSize: 12.5, lineHeight: 19, color: COLORS.onSurfaceVariant },

  breakdown: { gap: 6, paddingBottom: 4 },

  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  breakdownLabel: { width: 96, fontSize: 12, color: COLORS.onSurfaceVariant },

  breakdownValue: { fontSize: 12, fontWeight: "800", color: COLORS.onSurface },

  review: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    paddingTop: 9,
    gap: 4,
  },

  reviewHead: { flexDirection: "row", alignItems: "center", gap: 8 },

  reviewer: { flex: 1, fontSize: 12.5, fontWeight: "800", color: COLORS.onSurface },

  reviewBody: { fontSize: 12.5, lineHeight: 18, color: COLORS.onSurfaceVariant },

  reply: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 8,
    padding: 8,
    gap: 2,
  },

  replyLabel: { fontSize: 10, fontWeight: "900", color: COLORS.primary },

  replyBody: { fontSize: 12, lineHeight: 17, color: COLORS.onSurfaceVariant },

  contact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
  },

  contactText: { fontSize: 13.5, fontWeight: "800", color: COLORS.onPrimary },

  address: { fontSize: 12.5, lineHeight: 19, color: COLORS.onSurfaceVariant },

  landmark: { fontSize: 11.5, color: COLORS.outline },

  mapButton: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },

  mapButtonText: { fontSize: 12.5, fontWeight: "800", color: COLORS.primary },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  footerFrom: { fontSize: 10.5, fontWeight: "700", color: COLORS.outline },

  footerPrice: { fontSize: 17, fontWeight: "900", color: COLORS.onSurface },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },

  ctaDisabled: { backgroundColor: COLORS.outlineVariant },

  ctaText: { fontSize: 14, fontWeight: "900", color: COLORS.onPrimary },
});
