import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import { getOwnerEarningsApi, getMyGroundsApi } from "../services/ground.service";

import { money, toDateParam } from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| OwnerEarningsScreen.js
|
| Description:
| What came in, and what has not been collected yet.
|
| WHY "EARNED" AND "RECEIVED" ARE TWO SEPARATE NUMBERS
|
| The money changes hands in cash at the ground, so there is a real gap
| between a session that happened and a session that was paid for - a regular
| customer settling up at the end of the month, a team that promised to
| transfer and did not.
|
| One blended "revenue" figure that quietly includes four unpaid bookings is
| worse than no figure: the owner plans around a number that is not in their
| pocket. So the outstanding amount gets its own tile and its own colour, and
| the day rows show both.
|
| ONLY COMPLETED SESSIONS COUNT
|
| A confirmed booking for next Sunday is not earnings. Counting it would make
| every cancellation look like a loss and every month look better than it was.
|
| WHY THERE IS NO CHART
|
| A ground doing four bookings a day has nothing a chart can show that the
| day rows cannot, and a sparkline over twenty points is decoration that has
| to be maintained. If somebody later wants month-on-month trends, that is a
| different screen with a different question behind it.
|
|--------------------------------------------------------------------------
*/

const RANGES = [
  { key: "week", label: "7 din" },
  { key: "month", label: "Ye mahina" },
  { key: "last", label: "Pichla mahina" },
  { key: "year", label: "Ye saal" },
];

const rangeFor = (key) => {
  const now = new Date();

  if (key === "week") {
    const from = new Date(now);

    from.setDate(now.getDate() - 6);

    return { from, to: now };
  }

  if (key === "last") {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0),
    };
  }

  if (key === "year") {
    return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }

  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
};

const dayLabel = (iso) => {
  const d = new Date(iso);

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export default function OwnerEarningsScreen() {
  const [range, setRange] = useState("month");

  const [groundId, setGroundId] = useState(null);

  const [grounds, setGrounds] = useState([]);

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (key, gid) => {
      setLoading(true);

      const { from, to } = rangeFor(key);

      try {
        const [result, myGrounds] = await Promise.all([
          getOwnerEarningsApi({
            from: toDateParam(from),
            to: toDateParam(to),
            groundId: gid || undefined,
          }),
          getMyGroundsApi().catch(() => []),
        ]);

        setData(result);

        setGrounds(Array.isArray(myGrounds) ? myGrounds : []);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      load(range, groundId);
    }, [load, range, groundId]),
  );

  const totals = data?.totals || {};

  const days = data?.days || [];

  const best = days.reduce(
    (max, d) => (max == null || d.earned > max.earned ? d : max),
    null,
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.chipRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.chip, range === r.key && styles.chipActive]}
            activeOpacity={0.85}
            onPress={() => setRange(r.key)}
          >
            <Text style={[styles.chipText, range === r.key && styles.chipTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/*
      | The ground filter only appears with more than one - a single-ground
      | owner does not need a control whose only option is the thing they are
      | already looking at.
      */}
      {grounds.length > 1 ? (
        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, !groundId && styles.chipActive]}
            activeOpacity={0.85}
            onPress={() => setGroundId(null)}
          >
            <Text style={[styles.chipText, !groundId && styles.chipTextActive]}>
              Saare grounds
            </Text>
          </TouchableOpacity>

          {grounds.map((g) => {
            const active = groundId === String(g._id);

            return (
              <TouchableOpacity
                key={String(g._id)}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}
                onPress={() => setGroundId(String(g._id))}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {g.groundName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>Total kamai</Text>

            <Text style={styles.heroValue}>{money(totals.earned || 0)}</Text>

            <Text style={styles.heroMeta}>
              {totals.sessions || 0} session
              {totals.overtime > 0
                ? ` · isme ${money(totals.overtime)} overtime`
                : ""}
            </Text>
          </View>

          <View style={styles.tileRow}>
            <View style={styles.tile}>
              <Ionicons name="checkmark-circle-outline" size={17} color={COLORS.success} />

              <Text style={styles.tileValue}>{money(totals.paid || 0)}</Text>

              <Text style={styles.tileLabel}>Mil gaya</Text>
            </View>

            <View
              style={[
                styles.tile,
                totals.outstanding > 0 && styles.tileWarn,
              ]}
            >
              <Ionicons
                name="hourglass-outline"
                size={17}
                color={totals.outstanding > 0 ? COLORS.secondary : COLORS.outline}
              />

              <Text
                style={[
                  styles.tileValue,
                  totals.outstanding > 0 && styles.tileValueWarn,
                ]}
              >
                {money(totals.outstanding || 0)}
              </Text>

              <Text style={styles.tileLabel}>Baaki hai</Text>
            </View>
          </View>

          {/*
          | Said plainly, because an owner who sees an outstanding number
          | needs to know where to go and clear it.
          */}
          {totals.outstanding > 0 ? (
            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={15} color={COLORS.secondary} />

              <Text style={styles.noteText}>
                Cash mil jaane par booking kholke "Paid" mark kar dena — tab ye
                number apne aap kam ho jaayega.
              </Text>
            </View>
          ) : null}

          {best && best.earned > 0 ? (
            <View style={styles.bestCard}>
              <Ionicons name="trending-up" size={16} color={COLORS.primary} />

              <Text style={styles.bestText}>
                Sabse achha din: {dayLabel(best.date)} — {money(best.earned)} (
                {best.sessions} session)
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Din ke hisaab se</Text>

            {days.length ? (
              <View style={styles.dayCard}>
                {days
                  .slice()
                  .reverse()
                  .map((d) => (
                    <View key={d.date} style={styles.dayRow}>
                      <View style={styles.dayInfo}>
                        <Text style={styles.dayDate}>{dayLabel(d.date)}</Text>

                        <Text style={styles.daySessions}>
                          {d.sessions} session
                          {d.overtime > 0
                            ? ` · ${money(d.overtime)} overtime`
                            : ""}
                        </Text>
                      </View>

                      <View style={styles.dayMoney}>
                        <Text style={styles.dayEarned}>{money(d.earned)}</Text>

                        {d.paid < d.earned ? (
                          <Text style={styles.dayPending}>
                            {money(d.earned - d.paid)} baaki
                          </Text>
                        ) : (
                          <Text style={styles.dayPaid}>Poora mila</Text>
                        )}
                      </View>
                    </View>
                  ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="wallet-outline" size={26} color={COLORS.outline} />

                <Text style={styles.emptyTitle}>
                  Is period me koi session poora nahi hua
                </Text>

                <Text style={styles.emptyBody}>
                  Sirf complete hue session hi gine jaate hain — aane wali
                  booking abhi kamai nahi hai.
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  scroll: { padding: 16, paddingBottom: 40, gap: 12 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 11.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  loading: { paddingVertical: 60, alignItems: "center" },

  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    gap: 3,
  },

  heroLabel: { fontSize: 11.5, fontWeight: "700", color: COLORS.onPrimaryContainer },

  heroValue: { fontSize: 27, fontWeight: "900", color: COLORS.onPrimary },

  heroMeta: { fontSize: 11.5, color: COLORS.onPrimaryContainer },

  tileRow: { flexDirection: "row", gap: 9 },

  tile: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
    gap: 3,
  },

  tileWarn: { borderColor: COLORS.secondaryContainer, backgroundColor: "#fff8ec" },

  tileValue: { fontSize: 16, fontWeight: "900", color: COLORS.onSurface },

  tileValueWarn: { color: COLORS.secondary },

  tileLabel: { fontSize: 10.5, color: COLORS.onSurfaceVariant },

  note: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#fff1d6",
    borderRadius: 11,
    padding: 11,
  },

  noteText: { flex: 1, fontSize: 11.5, lineHeight: 17, fontWeight: "700", color: "#8f4e00" },

  bestCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 11,
    padding: 11,
  },

  bestText: { flex: 1, fontSize: 12, fontWeight: "700", color: COLORS.onSurfaceVariant },

  section: { gap: 8 },

  sectionTitle: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  dayCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: "hidden",
  },

  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },

  dayInfo: { flex: 1, gap: 1 },

  dayDate: { fontSize: 12.5, fontWeight: "800", color: COLORS.onSurface },

  daySessions: { fontSize: 11, color: COLORS.onSurfaceVariant },

  dayMoney: { alignItems: "flex-end", gap: 1 },

  dayEarned: { fontSize: 13.5, fontWeight: "900", color: COLORS.onSurface },

  dayPending: { fontSize: 10.5, fontWeight: "700", color: COLORS.secondary },

  dayPaid: { fontSize: 10.5, fontWeight: "700", color: COLORS.success },

  empty: {
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 22,
  },

  emptyTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  emptyBody: {
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },
});
