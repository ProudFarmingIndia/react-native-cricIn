import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import BookingCard from "../components/BookingCard";

import {
  getMyGroundsApi,
  getOwnerBookingsApi,
  getOwnerEarningsApi,
} from "../services/ground.service";

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
| OwnerDashboardScreen.js
|
| Description:
| The ground owner's home. What needs answering, what is happening today,
| what came in this month.
|
| WHY PENDING REQUESTS ARE FIRST AND EVERYTHING ELSE IS BELOW
|
| A ground owner opening this app at 9 PM has exactly one job: answer the
| requests waiting on them. Every hour those sit unanswered is an hour a team
| cannot plan, and an unanswered request is the single thing that makes this
| app worse than a phone call.
|
| So they are at the top, with a count, and they are the only thing on the
| screen with a coloured background. Today's schedule comes second because
| that is what they check in the morning. Earnings come third - it is the
| number they enjoy, not the one they need.
|
| WHY THERE IS NO CHART
|
| A ground doing four bookings a day has nothing a chart can show that a
| number cannot, and a sparkline over six data points is decoration. The
| earnings screen has the day-by-day breakdown for anybody who wants it.
|
|--------------------------------------------------------------------------
*/

const StatTile = ({ icon, value, label, tone, onPress }) => (
  <TouchableOpacity
    style={styles.tile}
    activeOpacity={onPress ? 0.85 : 1}
    onPress={onPress}
    disabled={!onPress}
  >
    <Ionicons name={icon} size={17} color={tone || COLORS.primary} />

    <Text style={[styles.tileValue, tone ? { color: tone } : null]}>{value}</Text>

    <Text style={styles.tileLabel}>{label}</Text>
  </TouchableOpacity>
);

const NavRow = ({ icon, title, subtitle, onPress, badge }) => (
  <TouchableOpacity style={styles.navRow} activeOpacity={0.85} onPress={onPress}>
    <View style={styles.navIcon}>
      <Ionicons name={icon} size={17} color={COLORS.primary} />
    </View>

    <View style={styles.navText}>
      <Text style={styles.navTitle}>{title}</Text>

      {subtitle ? <Text style={styles.navSubtitle}>{subtitle}</Text> : null}
    </View>

    {badge ? (
      <View style={styles.navBadge}>
        <Text style={styles.navBadgeText}>{badge}</Text>
      </View>
    ) : null}

    <Ionicons name="chevron-forward" size={17} color={COLORS.outline} />
  </TouchableOpacity>
);

export default function OwnerDashboardScreen() {
  const navigation = useNavigation();

  const [grounds, setGrounds] = useState([]);

  const [pending, setPending] = useState([]);

  const [today, setToday] = useState([]);

  const [earnings, setEarnings] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    const now = new Date();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      const [myGrounds, pendingList, todayList, month] = await Promise.all([
        getMyGroundsApi().catch(() => []),
        getOwnerBookingsApi("pending").catch(() => null),
        getOwnerBookingsApi("today").catch(() => null),
        getOwnerEarningsApi({
          from: toDateParam(monthStart),
          to: toDateParam(now),
        }).catch(() => null),
      ]);

      setGrounds(Array.isArray(myGrounds) ? myGrounds : []);

      setPending(pendingList?.bookings || []);

      setToday(todayList?.bookings || []);

      setEarnings(month);
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  /*
  | No grounds yet. The dashboard would be five zeros and nothing to tap, so
  | it is replaced entirely by the one thing they need to do. The copy says
  | what listing gets them rather than just asking them to fill a form.
  */
  if (!grounds.length) {
    return (
      <View style={styles.onboard}>
        <View style={styles.onboardIcon}>
          <Ionicons name="business" size={30} color={COLORS.onPrimary} />
        </View>

        <Text style={styles.onboardTitle}>Apna ground list karo</Text>

        <Text style={styles.onboardBody}>
          Team seedha app se slot maangegi. Aapko WhatsApp par time pooch-pooch
          ke confirm nahi karna padega — request aayegi, aap accept ya doosra
          time offer kar dena.
        </Text>

        <View style={styles.onboardPoints}>
          {[
            ["calendar-outline", "Apne hisaab se slots aur rate set karo"],
            ["shield-checkmark-outline", "Late aane ka record automatic banega"],
            ["star-outline", "Players rating denge — naya business aayega"],
          ].map(([icon, text]) => (
            <View key={text} style={styles.onboardPoint}>
              <Ionicons name={icon} size={15} color={COLORS.primary} />

              <Text style={styles.onboardPointText}>{text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.onboardButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("GroundFormScreen")}
        >
          <Ionicons name="add" size={17} color={COLORS.onPrimary} />

          <Text style={styles.onboardButtonText}>Ground add karo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const drafts = grounds.filter((g) => g.status === "draft");

  const totals = earnings?.totals || {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);

            load(true);
          }}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/*
      |--------------------------------------------------------------------
      | A draft is invisible, and that is worth saying loudly
      |--------------------------------------------------------------------
      |
      | A ground stays `draft` until it has a map pin AND one active unit.
      | Without this banner an owner fills in the form, sees their ground in
      | the list, and never finds out why nobody books it.
      */}

      {drafts.length ? (
        <TouchableOpacity
          style={styles.warn}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("GroundUnitsScreen", { groundId: drafts[0]._id })
          }
        >
          <Ionicons name="warning" size={17} color="#8f4e00" />

          <View style={styles.warnText}>
            <Text style={styles.warnTitle}>
              {drafts.length === 1
                ? `${drafts[0].groundName} abhi live nahi hai`
                : `${drafts.length} grounds live nahi hain`}
            </Text>

            <Text style={styles.warnBody}>
              Map location aur kam se kam ek pitch ya net add karo — phir
              automatically list ho jaayega.
            </Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/*
      |--------------------------------------------------------------------
      | The one thing that needs them
      |--------------------------------------------------------------------
      */}

      {pending.length ? (
        <View style={styles.pendingPanel}>
          <View style={styles.pendingHead}>
            <Ionicons name="notifications" size={17} color={COLORS.onPrimary} />

            <Text style={styles.pendingTitle}>
              {pending.length} request{pending.length > 1 ? "s" : ""} ka jawab
              baaki
            </Text>
          </View>

          <Text style={styles.pendingHint}>
            Jaldi jawab dene se aapka response rate badhta hai — wo players ko
            dikhta hai.
          </Text>

          <View style={styles.pendingList}>
            {pending.slice(0, 3).map((b) => (
              <BookingCard
                key={String(b._id)}
                booking={b}
                asOwner
                onPress={(booking) =>
                  navigation.navigate("BookingDetailScreen", {
                    bookingId: booking._id,
                  })
                }
              />
            ))}
          </View>

          {pending.length > 3 ? (
            <TouchableOpacity
              style={styles.pendingMore}
              onPress={() =>
                navigation.navigate("OwnerBookingsScreen", { tab: "pending" })
              }
            >
              <Text style={styles.pendingMoreText}>
                Baaki {pending.length - 3} dekho
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <View style={styles.clearPanel}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />

          <Text style={styles.clearText}>
            Koi request pending nahi. Sab clear hai.
          </Text>
        </View>
      )}

      {/*
      |--------------------------------------------------------------------
      | This month
      |--------------------------------------------------------------------
      |
      | Earned and outstanding are shown separately on purpose. A ground
      | taking cash has a real gap between the two, and one blended
      | "revenue" number that quietly includes four unpaid bookings is worse
      | than no number at all.
      */}

      <View style={styles.tileRow}>
        <StatTile
          icon="cash-outline"
          value={money(totals.earned || 0)}
          label="Is mahine"
          onPress={() => navigation.navigate("OwnerEarningsScreen")}
        />

        <StatTile
          icon="hourglass-outline"
          value={money(totals.outstanding || 0)}
          label="Baaki hai"
          tone={totals.outstanding > 0 ? COLORS.secondary : COLORS.primary}
          onPress={() => navigation.navigate("OwnerEarningsScreen")}
        />

        <StatTile
          icon="flag-outline"
          value={String(totals.sessions || 0)}
          label="Sessions"
        />
      </View>

      {/*
      |--------------------------------------------------------------------
      | Today
      |--------------------------------------------------------------------
      |
      | Check-in lives on the booking, not here - a list of arrive/leave
      | buttons on a dashboard is how somebody taps the wrong one.
      */}

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Aaj</Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("OwnerBookingsScreen", { tab: "today" })
            }
            hitSlop={8}
          >
            <Text style={styles.sectionAction}>Sab dekho</Text>
          </TouchableOpacity>
        </View>

        {today.length ? (
          <View style={styles.todayList}>
            {today.map((b) => (
              <BookingCard
                key={String(b._id)}
                booking={b}
                asOwner
                onPress={(booking) =>
                  navigation.navigate("BookingDetailScreen", {
                    bookingId: booking._id,
                  })
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>Aaj koi booking nahi hai.</Text>
          </View>
        )}
      </View>

      {/*
      |--------------------------------------------------------------------
      | Everything else
      |--------------------------------------------------------------------
      */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage</Text>

        <View style={styles.navCard}>
          <NavRow
            icon="business-outline"
            title="Mere grounds"
            subtitle={`${grounds.length} listed${
              drafts.length ? ` · ${drafts.length} draft` : ""
            }`}
            onPress={() => navigation.navigate("MyGroundsScreen")}
          />

          <NavRow
            icon="list-outline"
            title="Saari bookings"
            subtitle="Pending, aaj, upcoming, past"
            badge={pending.length || null}
            onPress={() => navigation.navigate("OwnerBookingsScreen")}
          />

          <NavRow
            icon="calendar-outline"
            title="Calendar"
            subtitle="Mahine ka view, aur din band karna"
            onPress={() =>
              navigation.navigate("OwnerCalendarScreen", {
                groundId: grounds[0]._id,
                groundName: grounds[0].groundName,
              })
            }
          />

          <NavRow
            icon="wallet-outline"
            title="Earnings"
            subtitle="Din-ba-din, aur kitna baaki hai"
            onPress={() => navigation.navigate("OwnerEarningsScreen")}
          />

          <NavRow
            icon="add-circle-outline"
            title="Naya ground add karo"
            onPress={() => navigation.navigate("GroundFormScreen")}
          />
        </View>
      </View>

      {/*
      | The reliability numbers, on the owner's own screen. They are visible
      | to every player on the listing, so the owner should not find out what
      | theirs look like from somebody else's screenshot.
      */}
      {grounds.length === 1 && grounds[0].stats ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aapka record</Text>

          <View style={styles.recordCard}>
            {[
              [
                "Request ka jawab",
                grounds[0].stats.requestsReceived
                  ? `${Math.round(
                      (grounds[0].stats.requestsAnswered /
                        grounds[0].stats.requestsReceived) *
                        100,
                    )}%`
                  : "—",
              ],
              [
                "Time par shuru",
                grounds[0].stats.completedBookings
                  ? `${Math.round(
                      (1 -
                        grounds[0].stats.lateStarts /
                          grounds[0].stats.completedBookings) *
                        100,
                    )}%`
                  : "—",
              ],
              [
                "Promises poore",
                grounds[0].promiseScore ? `${grounds[0].promiseScore}%` : "—",
              ],
              [
                "Rating",
                grounds[0].rating?.count
                  ? `${grounds[0].rating.overall} (${grounds[0].rating.count})`
                  : "Koi review nahi",
              ],
            ].map(([label, value]) => (
              <View key={label} style={styles.recordRow}>
                <Text style={styles.recordLabel}>{label}</Text>

                <Text style={styles.recordValue}>{value}</Text>
              </View>
            ))}

            <Text style={styles.recordNote}>
              Ye numbers har player ko aapki listing par dikhte hain.
            </Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
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

  onboard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 11,
    backgroundColor: COLORS.background,
  },

  onboardIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  onboardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  onboardBody: {
    fontSize: 13,
    lineHeight: 19.5,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  onboardPoints: { gap: 8, marginTop: 6, alignSelf: "stretch" },

  onboardPoint: { flexDirection: "row", alignItems: "center", gap: 8 },

  onboardPointText: { flex: 1, fontSize: 12.5, color: COLORS.onSurfaceVariant },

  onboardButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 13,
  },

  onboardButtonText: { fontSize: 14, fontWeight: "900", color: COLORS.onPrimary },

  warn: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: "#fff1d6",
    borderRadius: 12,
    padding: 12,
  },

  warnText: { flex: 1, gap: 2 },

  warnTitle: { fontSize: 13, fontWeight: "900", color: "#8f4e00" },

  warnBody: { fontSize: 11.5, lineHeight: 16.5, color: "#8f4e00" },

  pendingPanel: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 13,
    gap: 9,
  },

  pendingHead: { flexDirection: "row", alignItems: "center", gap: 7 },

  pendingTitle: { fontSize: 14.5, fontWeight: "900", color: COLORS.onPrimary },

  pendingHint: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: COLORS.onPrimaryContainer,
    marginTop: -4,
  },

  pendingList: { gap: 10 },

  pendingMore: { alignItems: "center", paddingVertical: 8 },

  pendingMoreText: { fontSize: 12.5, fontWeight: "800", color: COLORS.onPrimaryContainer },

  clearPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e4f4e5",
    borderRadius: 12,
    padding: 13,
  },

  clearText: { flex: 1, fontSize: 13, fontWeight: "700", color: "#1b5e20" },

  tileRow: { flexDirection: "row", gap: 9 },

  tile: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 11,
    gap: 3,
  },

  tileValue: { fontSize: 15, fontWeight: "900", color: COLORS.onSurface },

  tileLabel: { fontSize: 10.5, color: COLORS.onSurfaceVariant },

  section: { gap: 8 },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  sectionAction: { fontSize: 12.5, fontWeight: "800", color: COLORS.primary },

  todayList: { gap: 10 },

  emptyCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 16,
    alignItems: "center",
  },

  emptyCardText: { fontSize: 12.5, color: COLORS.onSurfaceVariant },

  navCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: "hidden",
  },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },

  navIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  navText: { flex: 1, gap: 1 },

  navTitle: { fontSize: 13.5, fontWeight: "800", color: COLORS.onSurface },

  navSubtitle: { fontSize: 11, color: COLORS.onSurfaceVariant },

  navBadge: {
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },

  navBadgeText: { fontSize: 10.5, fontWeight: "900", color: COLORS.onError },

  recordCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    gap: 9,
  },

  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  recordLabel: { fontSize: 12.5, color: COLORS.onSurfaceVariant },

  recordValue: { fontSize: 13, fontWeight: "800", color: COLORS.onSurface },

  recordNote: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.outline,
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    paddingTop: 8,
  },
});
