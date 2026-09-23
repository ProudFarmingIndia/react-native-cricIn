import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  getUnitsApi,
  deleteUnitApi,
  getGroundByIdApi,
} from "../services/ground.service";

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
| GroundUnitsScreen.js
|
| Description:
| What is bookable at a ground: every pitch and every net, with its hours
| and its rates.
|
| WHY A UNIT IS ITS OWN THING
|
| A ground with two pitches almost never prices them the same - one has the
| turf wicket and the lights, the other is the practice strip at the far end.
| Folding them into one listing means one price for both, and the owner
| either undersells the good one or nobody books the cheap one.
|
| Nets are the same story in reverse: sold by the hour, several at once, and
| nobody wants one for three hours.
|
| So each is a document with its own weekly hours and its own rates, and a
| booking points at exactly one of them.
|
| WHY THIS SCREEN LEADS WITH "NOT LIVE YET"
|
| A ground stays `draft` until it has a map pin AND one active unit. This is
| the screen where the second half of that gets fixed, so the banner belongs
| here - and it is why the add-ground flow sends people straight to this
| screen after the first save rather than back to a list.
|
|--------------------------------------------------------------------------
*/

const rateRange = (unit) => {
  if (unit.unitType === "net") {
    const weekend = unit.weekendHourlyRate;

    return weekend != null && weekend !== unit.hourlyRate
      ? `${money(unit.hourlyRate)}–${money(weekend)}/hr`
      : `${money(unit.hourlyRate)}/hr`;
  }

  const rates = (unit.matchBlocks || [])
    .filter((b) => b.isActive !== false)
    .flatMap((b) => [b.weekdayRate, b.weekendRate])
    .filter((r) => typeof r === "number" && r > 0);

  if (!rates.length) return "Rate set nahi hai";

  const min = Math.min(...rates);

  const max = Math.max(...rates);

  return min === max ? money(min) : `${money(min)}–${money(max)}`;
};

/*
| The days it is shut, as a short line. Listing all seven rows on a card
| would bury everything else, and "closed Monday" is the only part of a
| weekly schedule anybody scans for.
*/

const closedDays = (unit) => {
  const shut = (unit.weeklyHours || [])
    .filter((h) => h.closed)
    .map((h) => DAY_LABELS[h.day]);

  if (!shut.length) return null;

  if (shut.length === 7) return "Har din band";

  return `Band: ${shut.join(", ")}`;
};

/*
| The common opening hours. Where every open day agrees it prints one range;
| where they differ it says so rather than printing a misleading one.
*/

const hoursLine = (unit) => {
  const open = (unit.weeklyHours || []).filter((h) => !h.closed);

  if (!open.length) return null;

  const same = open.every(
    (h) => h.open === open[0].open && h.close === open[0].close,
  );

  return same
    ? `${fmtHHMM(open[0].open)} – ${fmtHHMM(open[0].close)}`
    : "Din ke hisaab se alag timing";
};

export default function GroundUnitsScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { groundId, groundName } = route.params || {};

  const [ground, setGround] = useState(null);

  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);

  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [unitList, groundData] = await Promise.all([
        getUnitsApi(groundId).catch(() => []),
        getGroundByIdApi(groundId).catch(() => null),
      ]);

      setUnits(Array.isArray(unitList) ? unitList : []);

      setGround(groundData);
    } finally {
      setLoading(false);
    }
  }, [groundId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const remove = (unit) =>
    Alert.alert(
      `${unit.name} hatao?`,
      "Agar iski purani bookings hain to ye delete nahi hoga — sirf band ho jaayega.",
      [
        { text: "Rehne do", style: "cancel" },
        {
          text: "Hatao",
          style: "destructive",
          onPress: async () => {
            setBusyId(String(unit._id));

            try {
              await deleteUnitApi(groundId, unit._id);

              await load();
            } catch (error) {
              Alert.alert(
                "Nahi ho paaya",
                error?.response?.data?.message || "Kuch galat ho gaya.",
              );
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const matchUnits = units.filter((u) => u.unitType === "match");

  const netUnits = units.filter((u) => u.unitType === "net");

  const isDraft = ground?.status === "draft";

  const needsPin = !ground?.latitude || !ground?.longitude;

  const renderUnit = (unit) => {
    const busy = busyId === String(unit._id);

    const blocks = (unit.matchBlocks || []).filter((b) => b.isActive !== false);

    return (
      <View key={String(unit._id)} style={styles.unit}>
        <View style={styles.unitHead}>
          <Ionicons
            name={unit.unitType === "net" ? "grid" : "baseball"}
            size={16}
            color={COLORS.primary}
          />

          <Text style={styles.unitName}>{unit.name}</Text>

          {unit.hasFloodlights ? (
            <Ionicons name="flashlight" size={13} color={COLORS.secondary} />
          ) : null}

          <Text style={styles.unitRate}>{rateRange(unit)}</Text>
        </View>

        <View style={styles.unitMetaRow}>
          {unit.pitchType ? (
            <Text style={styles.unitMeta}>
              {String(unit.pitchType).replace("_", " ")}
            </Text>
          ) : null}

          {hoursLine(unit) ? (
            <Text style={styles.unitMeta}>{hoursLine(unit)}</Text>
          ) : null}

          {closedDays(unit) ? (
            <Text style={styles.unitClosed}>{closedDays(unit)}</Text>
          ) : null}
        </View>

        {/*
        | The blocks, listed. A pitch whose slots are wrong is the single most
        | likely reason an owner gets no bookings, so they are visible here
        | without opening the editor.
        */}
        {unit.unitType === "match" ? (
          blocks.length ? (
            <View style={styles.blockList}>
              {blocks.map((b) => (
                <View key={String(b._id)} style={styles.blockChip}>
                  <Text style={styles.blockTime}>
                    {fmtHHMM(b.start)}–{fmtHHMM(b.end)}
                  </Text>

                  <Text style={styles.blockRate}>
                    {money(b.weekdayRate)}
                    {b.weekendRate != null && b.weekendRate !== b.weekdayRate
                      ? ` / ${money(b.weekendRate)}`
                      : ""}
                  </Text>

                  {b.needsFloodlights ? (
                    <Ionicons name="flashlight" size={10} color={COLORS.secondary} />
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noBlocks}>
              <Ionicons name="alert-circle" size={13} color="#8f4e00" />

              <Text style={styles.noBlocksText}>
                Ek bhi slot nahi hai — koi book nahi kar payega
              </Text>
            </View>
          )
        ) : (
          <Text style={styles.netNote}>
            Ghante ke hisaab se · min {unit.minHours}h, max {unit.maxHours}h
          </Text>
        )}

        <View style={styles.unitActions}>
          <TouchableOpacity
            style={styles.unitAction}
            disabled={busy}
            onPress={() =>
              navigation.navigate("UnitFormScreen", {
                groundId,
                unit,
              })
            }
          >
            <Ionicons name="create-outline" size={14} color={COLORS.primary} />

            <Text style={styles.unitActionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.unitAction}
            disabled={busy}
            onPress={() => remove(unit)}
          >
            {busy ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={14} color={COLORS.error} />

                <Text style={[styles.unitActionText, styles.unitActionDanger]}>
                  Hatao
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {groundName ? (
          <Text style={styles.groundName}>{groundName}</Text>
        ) : null}

        {/*
        | Why it is not live, with the missing piece named. "Draft" alone is a
        | status; this is an instruction.
        */}
        {isDraft ? (
          <View style={styles.draftBanner}>
            <Ionicons name="information-circle" size={17} color="#8f4e00" />

            <View style={styles.draftText}>
              <Text style={styles.draftTitle}>Ye ground abhi live nahi hai</Text>

              <Text style={styles.draftBody}>
                {needsPin && !units.length
                  ? "Map location aur ek pitch ya net — dono chahiye."
                  : needsPin
                    ? "Bas map location baaki hai — Edit me jaake set kar do."
                    : "Bas ek pitch ya net add karna baaki hai."}
              </Text>
            </View>

            {needsPin ? (
              <TouchableOpacity
                style={styles.draftFix}
                onPress={() => navigation.navigate("GroundFormScreen", { groundId })}
              >
                <Text style={styles.draftFixText}>Edit</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              Match pitches {matchUnits.length ? `(${matchUnits.length})` : ""}
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UnitFormScreen", {
                  groundId,
                  unitType: "match",
                })
              }
              hitSlop={8}
            >
              <Text style={styles.sectionAction}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {matchUnits.length ? (
            matchUnits.map(renderUnit)
          ) : (
            <TouchableOpacity
              style={styles.addCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("UnitFormScreen", {
                  groundId,
                  unitType: "match",
                })
              }
            >
              <Ionicons name="baseball-outline" size={22} color={COLORS.primary} />

              <Text style={styles.addCardTitle}>Pehla pitch add karo</Text>

              <Text style={styles.addCardBody}>
                Apne hisaab se slots banao — jaise 6–9 subah, 6–9 shaam — aur
                har slot ka rate set karo.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              Practice nets {netUnits.length ? `(${netUnits.length})` : ""}
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UnitFormScreen", {
                  groundId,
                  unitType: "net",
                })
              }
              hitSlop={8}
            >
              <Text style={styles.sectionAction}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {netUnits.length ? (
            netUnits.map(renderUnit)
          ) : (
            <TouchableOpacity
              style={styles.addCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("UnitFormScreen", {
                  groundId,
                  unitType: "net",
                })
              }
            >
              <Ionicons name="grid-outline" size={22} color={COLORS.primary} />

              <Text style={styles.addCardTitle}>Net practice bhi de sakte ho</Text>

              <Text style={styles.addCardBody}>
                Nets ghante ke hisaab se bikte hain. Match ke beech ke khaali
                time me extra kamai.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.navRow}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("GroundPoliciesScreen", { groundId })}
        >
          <Ionicons name="options-outline" size={17} color={COLORS.primary} />

          <View style={styles.navText}>
            <Text style={styles.navTitle}>Booking ke rules</Text>

            <Text style={styles.navSubtitle}>
              Gap, grace, overtime rate, cancellation window
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={17} color={COLORS.outline} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navRow}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("OwnerCalendarScreen", { groundId, groundName })
          }
        >
          <Ionicons name="calendar-outline" size={17} color={COLORS.primary} />

          <View style={styles.navText}>
            <Text style={styles.navTitle}>Calendar aur band din</Text>

            <Text style={styles.navSubtitle}>
              Maintenance ya barsaat ke din block karo
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={17} color={COLORS.outline} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  scroll: { padding: 16, paddingBottom: 40, gap: 14 },

  groundName: { fontSize: 17, fontWeight: "900", color: COLORS.onSurface },

  draftBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#fff1d6",
    borderRadius: 12,
    padding: 12,
  },

  draftText: { flex: 1, gap: 2 },

  draftTitle: { fontSize: 13, fontWeight: "900", color: "#8f4e00" },

  draftBody: { fontSize: 11.5, lineHeight: 16.5, color: "#8f4e00" },

  draftFix: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#8f4e00",
  },

  draftFixText: { fontSize: 11.5, fontWeight: "900", color: "#fff" },

  section: { gap: 9 },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  sectionAction: { fontSize: 13, fontWeight: "900", color: COLORS.primary },

  unit: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
    gap: 8,
  },

  unitHead: { flexDirection: "row", alignItems: "center", gap: 6 },

  unitName: { flex: 1, fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  unitRate: { fontSize: 12.5, fontWeight: "800", color: COLORS.primary },

  unitMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  unitMeta: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    textTransform: "capitalize",
  },

  unitClosed: { fontSize: 11.5, fontWeight: "700", color: COLORS.secondary },

  blockList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },

  blockChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  blockTime: { fontSize: 11, fontWeight: "800", color: COLORS.onSurface },

  blockRate: { fontSize: 11, color: COLORS.onSurfaceVariant },

  noBlocks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff1d6",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  noBlocksText: { flex: 1, fontSize: 11, fontWeight: "700", color: "#8f4e00" },

  netNote: { fontSize: 11.5, color: COLORS.onSurfaceVariant },

  unitActions: {
    flexDirection: "row",
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    paddingTop: 8,
  },

  unitAction: { flexDirection: "row", alignItems: "center", gap: 5 },

  unitActionText: { fontSize: 11.5, fontWeight: "800", color: COLORS.primary },

  unitActionDanger: { color: COLORS.error },

  addCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1.4,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    padding: 16,
    alignItems: "center",
    gap: 5,
  },

  addCardTitle: { fontSize: 13.5, fontWeight: "900", color: COLORS.onSurface },

  addCardBody: {
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },

  navText: { flex: 1, gap: 1 },

  navTitle: { fontSize: 13.5, fontWeight: "800", color: COLORS.onSurface },

  navSubtitle: { fontSize: 11, color: COLORS.onSurfaceVariant },
});
