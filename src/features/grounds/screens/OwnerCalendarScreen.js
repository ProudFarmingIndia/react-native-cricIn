import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  getOwnerCalendarApi,
  addBlackoutApi,
  removeBlackoutApi,
} from "../services/ground.service";

import { money, fmtDate, toDateParam, DAY_LABELS } from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| OwnerCalendarScreen.js
|
| Description:
| A month at a glance, and the one action that belongs to a date: closing it.
|
| WHY A MONTH GRID AND NOT A LIST
|
| The question this screen answers is "which days are quiet" - and that is a
| shape question, not a reading question. Three empty Tuesdays in a row are
| obvious in a grid and invisible in a list, and an owner who can see them
| might drop the weekday rate or push a net offer.
|
| The list of bookings has its own screen; this one is deliberately only the
| overview plus blackouts.
|
| WHY BLACKOUTS ARE NOT STORED AS FAKE BOOKINGS
|
| It was tempting - a blackout behaves exactly like a confirmed booking as
| far as the clash check goes. But then every earnings total and every
| reliability percentage would have to remember to exclude it, and the first
| aggregate that forgot would report a ground earning money from its own
| maintenance day. They are their own collection, so they cannot be counted
| by mistake.
|
| WHY THE WHOLE DAY IS THE DEFAULT
|
| "Closed Monday for repairs" is the common case, and making an owner block
| six units one at a time would guarantee they miss one. Part-days exist for
| the "a school has the ground 2-4 on Thursday" case.
|
|--------------------------------------------------------------------------
*/

const monthLabel = (date) =>
  date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

/*
| The grid, padded so the first of the month lands under the right weekday.
| Without the padding every month looks like it starts on a Sunday, which
| makes the weekend columns - the ones that matter - meaningless.
*/

const buildGrid = (year, month) => {
  const first = new Date(year, month, 1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = Array.from({ length: first.getDay() }, () => null);

  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(year, month, d));
  }

  return cells;
};

export default function OwnerCalendarScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { groundId, groundName } = route.params || {};

  const [cursor, setCursor] = useState(() => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);

  const [blackoutOpen, setBlackoutOpen] = useState(false);

  const [reason, setReason] = useState("");

  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1);

    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

    try {
      const result = await getOwnerCalendarApi(
        groundId,
        toDateParam(from),
        toDateParam(to),
      );

      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [groundId, cursor]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const dayMap = new Map((data?.days || []).map((d) => [d.date, d]));

  const blackoutFor = (param) =>
    (data?.blackouts || []).find(
      (b) => toDateParam(b.date) === param && !b.unitId,
    );

  const cells = buildGrid(cursor.getFullYear(), cursor.getMonth());

  const selectedParam = selected ? toDateParam(selected) : null;

  const selectedDay = selectedParam ? dayMap.get(selectedParam) : null;

  const selectedBlackout = selectedParam ? blackoutFor(selectedParam) : null;

  const monthTotals = (data?.days || []).reduce(
    (acc, d) => ({
      confirmed: acc.confirmed + d.confirmed,
      pending: acc.pending + d.pending,
      completed: acc.completed + d.completed,
      revenue: acc.revenue + d.revenue,
    }),
    { confirmed: 0, pending: 0, completed: 0, revenue: 0 },
  );

  const addBlackout = async () => {
    setSaving(true);

    try {
      await addBlackoutApi(groundId, {
        date: selectedParam,
        allDay: true,
        reason: reason.trim(),
      });

      setBlackoutOpen(false);

      setReason("");

      await load();
    } catch (error) {
      Alert.alert(
        "Block nahi hua",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeBlackout = async () => {
    setSaving(true);

    try {
      await removeBlackoutApi(groundId, selectedBlackout._id);

      await load();
    } catch (error) {
      Alert.alert(
        "Nahi ho paaya",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {groundName ? <Text style={styles.groundName}>{groundName}</Text> : null}

        <View style={styles.monthBar}>
          <TouchableOpacity
            hitSlop={10}
            onPress={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
              )
            }
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <Text style={styles.monthText}>{monthLabel(cursor)}</Text>

          <TouchableOpacity
            hitSlop={10}
            onPress={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
              )
            }
          >
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <View style={styles.weekHead}>
              {DAY_LABELS.map((d, i) => (
                <Text
                  key={d}
                  style={[
                    styles.weekHeadText,
                    (i === 0 || i === 6) && styles.weekend,
                  ]}
                >
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((date, i) => {
                if (!date) return <View key={`pad-${i}`} style={styles.cell} />;

                const param = toDateParam(date);

                const day = dayMap.get(param);

                const blocked = day?.blocked || !!blackoutFor(param);

                const isToday = param === toDateParam(new Date());

                const isSelected = param === selectedParam;

                return (
                  <TouchableOpacity
                    key={param}
                    style={[
                      styles.cell,
                      blocked && styles.cellBlocked,
                      isSelected && styles.cellSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelected(date)}
                  >
                    <Text
                      style={[
                        styles.cellDate,
                        isToday && styles.cellToday,
                        isSelected && styles.cellTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>

                    {/*
                    | Three dots, three meanings: amber for a request nobody
                    | has answered, green for confirmed, grey for done. A
                    | number in each cell would be unreadable at this size.
                    */}
                    <View style={styles.dots}>
                      {day?.pending ? (
                        <View style={[styles.dot, styles.dotPending]} />
                      ) : null}

                      {day?.confirmed ? (
                        <View style={[styles.dot, styles.dotConfirmed]} />
                      ) : null}

                      {day?.completed ? (
                        <View style={[styles.dot, styles.dotDone]} />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.legend}>
              {[
                ["dotPending", "Jawab baaki"],
                ["dotConfirmed", "Confirmed"],
                ["dotDone", "Ho gaya"],
              ].map(([key, label]) => (
                <View key={key} style={styles.legendItem}>
                  <View style={[styles.dot, styles[key]]} />

                  <Text style={styles.legendText}>{label}</Text>
                </View>
              ))}

              <View style={styles.legendItem}>
                <View style={styles.legendBlocked} />

                <Text style={styles.legendText}>Band</Text>
              </View>
            </View>

            <View style={styles.monthSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{monthTotals.pending}</Text>

                <Text style={styles.summaryLabel}>Pending</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{monthTotals.confirmed}</Text>

                <Text style={styles.summaryLabel}>Confirmed</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{monthTotals.completed}</Text>

                <Text style={styles.summaryLabel}>Complete</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {money(monthTotals.revenue)}
                </Text>

                <Text style={styles.summaryLabel}>Kamai</Text>
              </View>
            </View>
          </>
        )}

        {/*
        |--------------------------------------------------------------------
        | The selected day
        |--------------------------------------------------------------------
        */}

        {selected ? (
          <View style={styles.dayPanel}>
            <Text style={styles.dayPanelTitle}>{fmtDate(selected)}</Text>

            {selectedBlackout ? (
              <View style={styles.blockedPanel}>
                <Ionicons name="lock-closed" size={15} color={COLORS.onErrorContainer} />

                <View style={styles.blockedText}>
                  <Text style={styles.blockedTitle}>Ye din band hai</Text>

                  {selectedBlackout.reason ? (
                    <Text style={styles.blockedReason}>
                      {selectedBlackout.reason}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.unblock}
                  disabled={saving}
                  onPress={removeBlackout}
                >
                  <Text style={styles.unblockText}>Kholo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.dayStats}>
                <Text style={styles.dayStatsText}>
                  {selectedDay
                    ? `${selectedDay.pending} pending · ${selectedDay.confirmed} confirmed · ${selectedDay.completed} complete`
                    : "Is din koi booking nahi"}
                </Text>
              </View>
            )}

            <View style={styles.dayActions}>
              <TouchableOpacity
                style={styles.dayAction}
                onPress={() =>
                  navigation.navigate("OwnerBookingsScreen", {
                    tab: "upcoming",
                    groundId,
                  })
                }
              >
                <Ionicons name="list-outline" size={15} color={COLORS.primary} />

                <Text style={styles.dayActionText}>Bookings dekho</Text>
              </TouchableOpacity>

              {!selectedBlackout ? (
                <TouchableOpacity
                  style={styles.dayActionDanger}
                  onPress={() => setBlackoutOpen(true)}
                  /*
                  | Blocking a day that already has confirmed bookings on it
                  | would strand those teams, so it is refused here rather
                  | than at the server with a message the owner then has to
                  | interpret.
                  */
                  disabled={!!selectedDay?.confirmed}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={15}
                    color={selectedDay?.confirmed ? COLORS.outlineVariant : COLORS.error}
                  />

                  <Text
                    style={[
                      styles.dayActionDangerText,
                      selectedDay?.confirmed && styles.dayActionDisabled,
                    ]}
                  >
                    {selectedDay?.confirmed
                      ? "Booking hai — band nahi kar sakte"
                      : "Ye din band karo"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={styles.pickHint}>
            Kisi date par tap karo — uski bookings aur "band karo" ka option
            yahan aa jaayega.
          </Text>
        )}
      </ScrollView>

      <Modal
        visible={blackoutOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBlackoutOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {selected ? fmtDate(selected) : ""} band karein?
            </Text>

            <Text style={styles.modalHint}>
              Poora din, saare pitch aur nets. Is din koi booking nahi aa
              payegi.
            </Text>

            <View style={styles.presetWrap}>
              {[
                "Maintenance",
                "Barsaat",
                "Private function",
                "Tournament",
              ].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.preset, reason === p && styles.presetActive]}
                  onPress={() => setReason(p)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      reason === p && styles.presetTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              value={reason}
              onChangeText={setReason}
              maxLength={200}
              placeholder="Wajah (players ko dikhegi)"
              placeholderTextColor={COLORS.outline}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setBlackoutOpen(false)}
              >
                <Text style={styles.modalCancelText}>Rehne do</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirm}
                disabled={saving}
                onPress={addBlackout}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={COLORS.onPrimary} />
                ) : (
                  <Text style={styles.modalConfirmText}>Band karo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  scroll: { padding: 16, paddingBottom: 40, gap: 12 },

  groundName: { fontSize: 16, fontWeight: "900", color: COLORS.onSurface },

  monthBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },

  monthText: { fontSize: 15, fontWeight: "900", color: COLORS.onSurface },

  loading: { paddingVertical: 50, alignItems: "center" },

  weekHead: { flexDirection: "row" },

  weekHeadText: {
    flex: 1,
    textAlign: "center",
    fontSize: 10.5,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  weekend: { color: COLORS.secondary },

  grid: { flexDirection: "row", flexWrap: "wrap" },

  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 9,
  },

  cellBlocked: { backgroundColor: COLORS.errorContainer },

  cellSelected: { backgroundColor: COLORS.primary },

  cellDate: { fontSize: 13, fontWeight: "700", color: COLORS.onSurface },

  cellToday: { color: COLORS.primary, fontWeight: "900" },

  cellTextSelected: { color: COLORS.onPrimary },

  dots: { flexDirection: "row", gap: 2, height: 5 },

  dot: { width: 5, height: 5, borderRadius: 3 },

  dotPending: { backgroundColor: COLORS.warning },

  dotConfirmed: { backgroundColor: COLORS.success },

  dotDone: { backgroundColor: COLORS.outline },

  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingTop: 4 },

  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },

  legendBlocked: {
    width: 9,
    height: 9,
    borderRadius: 3,
    backgroundColor: COLORS.errorContainer,
  },

  legendText: { fontSize: 10.5, color: COLORS.onSurfaceVariant },

  monthSummary: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
  },

  summaryItem: { flex: 1, alignItems: "center", gap: 2 },

  summaryValue: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  summaryLabel: { fontSize: 10, color: COLORS.onSurfaceVariant },

  dayPanel: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    gap: 10,
  },

  dayPanelTitle: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  dayStats: {},

  dayStatsText: { fontSize: 12.5, color: COLORS.onSurfaceVariant },

  blockedPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: COLORS.errorContainer,
    borderRadius: 10,
    padding: 11,
  },

  blockedText: { flex: 1, gap: 1 },

  blockedTitle: { fontSize: 12.5, fontWeight: "900", color: COLORS.onErrorContainer },

  blockedReason: { fontSize: 11.5, color: COLORS.onErrorContainer },

  unblock: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.onErrorContainer,
  },

  unblockText: { fontSize: 11.5, fontWeight: "900", color: "#fff" },

  dayActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  dayAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  dayActionText: { fontSize: 11.5, fontWeight: "800", color: COLORS.primary },

  dayActionDanger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  dayActionDangerText: { fontSize: 11.5, fontWeight: "800", color: COLORS.error },

  dayActionDisabled: { color: COLORS.outlineVariant },

  pickHint: {
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },

  modal: {
    width: "100%",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 17,
    gap: 10,
  },

  modalTitle: { fontSize: 15, fontWeight: "900", color: COLORS.onSurface },

  modalHint: {
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
    marginTop: -4,
  },

  presetWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  preset: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  presetActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  presetText: { fontSize: 11.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  presetTextActive: { color: COLORS.onPrimary },

  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 12.5,
    color: COLORS.onSurface,
  },

  modalActions: { flexDirection: "row", gap: 9 },

  modalCancel: { flex: 1, alignItems: "center", paddingVertical: 13 },

  modalCancelText: { fontSize: 13, fontWeight: "800", color: COLORS.onSurfaceVariant },

  modalConfirm: {
    flex: 1.3,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: COLORS.error,
  },

  modalConfirmText: { fontSize: 13, fontWeight: "900", color: COLORS.onError },
});
