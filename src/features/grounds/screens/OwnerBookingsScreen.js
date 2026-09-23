import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import BookingCard from "../components/BookingCard";

import {
  getOwnerBookingsApi,
  approveBookingApi,
  checkInApi,
} from "../services/ground.service";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| OwnerBookingsScreen.js
|
| Description:
| The owner's book. Five tabs, and "Pending" leads.
|
| WHY PENDING IS THE DEFAULT TAB
|
| It is the only tab with something for them to do. A ground owner opening
| this at 9 PM wants the four requests waiting, not tomorrow's schedule, and
| every hour those sit unanswered is an hour a team cannot plan.
|
| WHY THERE IS AN ACCEPT BUTTON ON THE CARD
|
| Most requests need no thought - the slot is free, the team looks fine, yes.
| Making that a two-screen journey is how a queue of eight becomes a queue of
| eight tomorrow as well.
|
| Decline and counter are deliberately NOT here. Both need a reason or a
| time, both are the considered answer rather than the obvious one, and both
| belong on the detail screen where there is room to get them right.
|
| Same reasoning for check-in: one tap on today's card, because it happens
| while somebody is walking onto the field and the owner is holding a phone
| in one hand.
|
|--------------------------------------------------------------------------
*/

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "today", label: "Aaj" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const Separator = () => <View style={styles.gap} />;

export default function OwnerBookingsScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const [tab, setTab] = useState(route.params?.tab || "pending");

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [busyId, setBusyId] = useState(null);

  const load = useCallback(
    async (key, silent = false) => {
      if (!silent) setLoading(true);

      try {
        const data = await getOwnerBookingsApi(key, route.params?.groundId);

        setItems(Array.isArray(data?.bookings) ? data.bookings : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [route.params?.groundId],
  );

  useFocusEffect(
    useCallback(() => {
      load(tab, true);
    }, [load, tab]),
  );

  const quickAction = async (booking, fn) => {
    setBusyId(String(booking._id));

    try {
      const result = await fn();

      await load(tab, true);

      if (result?.message) Alert.alert("Done", result.message);
    } catch (error) {
      Alert.alert(
        "Nahi ho paaya",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
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
      </ScrollView>

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
          renderItem={({ item }) => {
            const busy = busyId === String(item._id);

            const canAccept = ["requested", "countered"].includes(item.status);

            const canCheckIn =
              item.status === "confirmed" && !item.checkInAt && tab === "today";

            return (
              <View style={styles.row}>
                <BookingCard
                  booking={item}
                  asOwner
                  onPress={(b) =>
                    navigation.navigate("BookingDetailScreen", {
                      bookingId: b._id,
                    })
                  }
                />

                {canAccept || canCheckIn ? (
                  <View style={styles.quickBar}>
                    {canAccept ? (
                      <>
                        <TouchableOpacity
                          style={styles.quickPrimary}
                          disabled={busy}
                          onPress={() =>
                            quickAction(item, () => approveBookingApi(item._id))
                          }
                        >
                          {busy ? (
                            <ActivityIndicator size="small" color={COLORS.onPrimary} />
                          ) : (
                            <>
                              <Ionicons
                                name="checkmark"
                                size={15}
                                color={COLORS.onPrimary}
                              />

                              <Text style={styles.quickPrimaryText}>Accept</Text>
                            </>
                          )}
                        </TouchableOpacity>

                        {/*
                        | Decline and counter live on the detail screen - both
                        | need something typed, and neither is the answer you
                        | give without looking.
                        */}
                        <TouchableOpacity
                          style={styles.quickSecondary}
                          disabled={busy}
                          onPress={() =>
                            navigation.navigate("BookingDetailScreen", {
                              bookingId: item._id,
                            })
                          }
                        >
                          <Text style={styles.quickSecondaryText}>
                            Decline ya doosra time
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : null}

                    {canCheckIn ? (
                      <TouchableOpacity
                        style={styles.quickPrimary}
                        disabled={busy}
                        onPress={() =>
                          quickAction(item, () => checkInApi(item._id))
                        }
                      >
                        {busy ? (
                          <ActivityIndicator size="small" color={COLORS.onPrimary} />
                        ) : (
                          <>
                            <Ionicons
                              name="log-in"
                              size={15}
                              color={COLORS.onPrimary}
                            />

                            <Text style={styles.quickPrimaryText}>
                              Team aa gayi — check in
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          }}
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
              <Ionicons
                name={tab === "pending" ? "checkmark-circle-outline" : "calendar-outline"}
                size={30}
                color={tab === "pending" ? COLORS.success : COLORS.outline}
              />

              <Text style={styles.emptyTitle}>
                {tab === "pending"
                  ? "Sab clear — koi request pending nahi"
                  : tab === "today"
                    ? "Aaj koi booking nahi"
                    : tab === "upcoming"
                      ? "Aage koi booking nahi"
                      : tab === "past"
                        ? "Abhi tak koi session poora nahi hua"
                        : "Kuch cancel nahi hua"}
              </Text>

              {tab === "upcoming" ? (
                <Text style={styles.emptyBody}>
                  Listing live hai to teams khud dhoondh legi. Rate aur slots
                  theek hain na?
                </Text>
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
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
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

  list: { paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 },

  gap: { height: 14 },

  row: { gap: 8 },

  quickBar: { flexDirection: "row", alignItems: "center", gap: 8 },

  quickPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 11,
    paddingVertical: 12,
  },

  quickPrimaryText: { fontSize: 12.5, fontWeight: "900", color: COLORS.onPrimary },

  quickSecondary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingVertical: 12,
  },

  quickSecondaryText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    gap: 8,
  },

  emptyTitle: {
    marginTop: 4,
    fontSize: 14.5,
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
});
