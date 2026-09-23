import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import BookingCard from "../components/BookingCard";

import { getMyBookingsApi } from "../services/ground.service";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| MyBookingsScreen.js
|
| Description:
| The player's own bookings, in three tabs.
|
| WHY "UPCOMING" INCLUDES REQUESTS THAT ARE NOT YET CONFIRMED
|
| From the team's side there is no useful difference between a slot they are
| waiting on and one that is confirmed - both are things they are planning
| Sunday around, and both need watching. Splitting them into "Pending" and
| "Confirmed" would mean checking two tabs to answer one question, and the
| status pill on each card already says which is which.
|
| "Past" deliberately also catches active bookings whose time has gone by -
| a confirmed booking nobody checked in or out of. Those would otherwise
| vanish from both tabs: too old for upcoming, not completed enough for past.
| A booking that silently disappears is the kind of thing that makes somebody
| stop trusting a list.
|
|--------------------------------------------------------------------------
*/

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const Separator = () => <View style={styles.gap} />;

export default function MyBookingsScreen() {
  const navigation = useNavigation();

  const [tab, setTab] = useState("upcoming");

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (key, silent = false) => {
    if (!silent) setLoading(true);

    try {
      const data = await getMyBookingsApi(key);

      setItems(Array.isArray(data?.bookings) ? data.bookings : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(tab, true);
    }, [load, tab]),
  );

  /*
  | Reviewable bookings are surfaced at the top of "Past" rather than being
  | left for somebody to find. A rating asked for an hour after the game is
  | worth several asked for a week later, because by then nobody remembers
  | whether the toilets were clean.
  */
  const pendingReview =
    tab === "past"
      ? items.filter((b) => b.status === "completed" && !b.isReviewed)
      : [];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            activeOpacity={0.85}
            onPress={() => {
              setTab(t.key);

              setLoading(true);

              load(t.key);
            }}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item._id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={
            pendingReview.length ? (
              <TouchableOpacity
                style={styles.reviewNudge}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate("RateGroundScreen", {
                    bookingId: pendingReview[0]._id,
                  })
                }
              >
                <Ionicons name="star" size={16} color={COLORS.secondary} />

                <Text style={styles.reviewNudgeText}>
                  {pendingReview.length === 1
                    ? "Ek ground ki rating baaki hai"
                    : `${pendingReview.length} grounds ki rating baaki hai`}{" "}
                  — doosron ko madad milegi
                </Text>

                <Ionicons name="chevron-forward" size={15} color={COLORS.secondary} />
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onPress={(b) =>
                navigation.navigate("BookingDetailScreen", { bookingId: b._id })
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);

                load(tab, true);
              }}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={30} color={COLORS.outline} />

              <Text style={styles.emptyTitle}>
                {tab === "upcoming"
                  ? "Koi booking nahi hai"
                  : tab === "past"
                    ? "Abhi tak koi ground book nahi kiya"
                    : "Kuch cancel nahi hua"}
              </Text>

              {tab !== "cancelled" ? (
                <>
                  <Text style={styles.emptyBody}>
                    Aas-paas ke grounds dekho — date aur time daal ke sirf khaali
                    slots dikhenge.
                  </Text>

                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate("GroundsScreen")}
                  >
                    <Ionicons name="search" size={15} color={COLORS.onPrimary} />

                    <Text style={styles.emptyButtonText}>Ground dhoondo</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  tabBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  tabText: { fontSize: 12, fontWeight: "700", color: COLORS.onSurfaceVariant },

  tabTextActive: { color: COLORS.onPrimary },

  list: { padding: 16, paddingBottom: 40, flexGrow: 1 },

  gap: { height: 12 },

  reviewNudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff4e0",
    borderRadius: 11,
    padding: 12,
    marginBottom: 12,
  },

  reviewNudgeText: { flex: 1, fontSize: 12, fontWeight: "700", color: "#8f4e00" },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    gap: 8,
  },

  emptyTitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  emptyBody: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: { fontSize: 13.5, fontWeight: "800", color: COLORS.onPrimary },
});
