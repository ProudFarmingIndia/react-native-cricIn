import React, { useCallback, useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import GroundCard from "../components/GroundCard";

import GroundFilterSheet, {
  describeFilters,
} from "../components/GroundFilterSheet";

import useGroundOptions from "../hooks/useGroundOptions";

import useUserLocation from "../hooks/useUserLocation";

import { searchGroundsApi, getMyRolesApi } from "../services/ground.service";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| GroundsScreen.js
|
| Description:
| Find a ground. The Grounds tab's root screen.
|
| WHAT REPLACED WHAT
|
| The old version of this screen was a static placeholder with hardcoded
| cards. There was no /grounds/search on the server to call, because a
| ground stored its coordinates as two plain numbers and Mongo cannot answer
| "within 5 km" against those. Both halves are real now.
|
| THE SORT BAR IS ALWAYS VISIBLE, THE FILTERS ARE IN A SHEET
|
| Sorting is one tap and people switch it constantly - nearest, then
| cheapest, then back. Filtering is a considered act with ten controls in it.
| Putting both in the sheet would bury the thing used most; putting both on
| the screen would leave no room for grounds.
|
| WHEN LOCATION IS REFUSED
|
| Everything still works. The distance chips vanish, the cards stop showing
| a distance, "Nearest" quietly falls back to rating on the server, and an
| area box appears in the filter sheet instead. A user who declines a
| permission should lose a feature, not the screen.
|
|--------------------------------------------------------------------------
*/

const EMPTY_FILTERS = {
  search: "",
  date: "",
  startTime: "",
  endTime: "",
  unitType: "",
  pitchType: "",
  facilities: [],
  minRating: "",
  minPromiseScore: "",
  maxPrice: "",
  floodlights: "",
  verified: "",
  night: "",
  area: "",
  radiusKm: 25,
  sort: "distance",
};

const Separator = () => <View style={styles.gap} />;

export default function GroundsScreen() {
  const navigation = useNavigation();

  const { options } = useGroundOptions();

  const { coords, hasCoords, needsManualArea, request } = useUserLocation();

  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [query, setQuery] = useState("");

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);

  const [isOwner, setIsOwner] = useState(false);

  const load = useCallback(
    async (next, silent = false) => {
      if (!silent) setLoading(true);

      try {
        const data = await searchGroundsApi({
          ...next,

          /*
          | Coordinates are attached here rather than kept in `filters`, so
          | a filter change never has to remember to carry them and a
          | location that arrives late is picked up by the next search
          | without the filter object being touched.
          */
          latitude: coords?.latitude,
          longitude: coords?.longitude,

          /*
          | "Nearest" with no coordinate would silently return an arbitrary
          | order. Asking for rating instead is at least an order the user
          | can understand.
          */
          sort: !coords && next.sort === "distance" ? "rating" : next.sort,
        });

        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [coords],
  );

  useFocusEffect(
    useCallback(() => {
      load(filters, true);

      /*
      | Checked on focus rather than once on mount: somebody can list their
      | first ground mid-session, and the switch to the owner side should be
      | there when they come back to this tab.
      */
      getMyRolesApi()
        .then((r) => setIsOwner(!!r?.isGroundOwner))
        .catch(() => {});
    }, [load, filters]),
  );

  const apply = (next) => {
    setSheetOpen(false);

    setFilters(next);

    setLoading(true);

    load(next);
  };

  const setSort = (key) => {
    const next = { ...filters, sort: key };

    setFilters(next);

    load(next, true);
  };

  const submitSearch = () => {
    const next = { ...filters, search: query.trim() };

    setFilters(next);

    setLoading(true);

    load(next);
  };

  const activeCount = useMemo(() => describeFilters(filters).length, [filters]);

  const sorts = options.sorts || [];

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.outline} />

          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
            placeholder="Ground ka naam, area ya city"
            placeholderTextColor={COLORS.outline}
          />

          {query ? (
            <TouchableOpacity
              hitSlop={8}
              onPress={() => {
                setQuery("");

                apply({ ...filters, search: "" });
              }}
            >
              <Ionicons name="close-circle" size={16} color={COLORS.outline} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, activeCount > 0 && styles.filterButtonActive]}
          activeOpacity={0.85}
          onPress={() => setSheetOpen(true)}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeCount > 0 ? COLORS.onPrimary : COLORS.onSurfaceVariant}
          />

          {activeCount > 0 ? (
            <View style={styles.filterCount}>
              <Text style={styles.filterCountText}>{activeCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/*
      | The sort bar. Distance is dropped from it entirely when there is no
      | coordinate - a sort that cannot run should not be offered.
      */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortBar}
      >
        {sorts
          .filter((s) => s.key !== "distance" || hasCoords)
          .map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortChip, filters.sort === s.key && styles.sortChipActive]}
              activeOpacity={0.85}
              onPress={() => setSort(s.key)}
            >
              <Text
                style={[
                  styles.sortText,
                  filters.sort === s.key && styles.sortTextActive,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/*
      | The applied filters, spelled out. A chip bar that only shows a count
      | leaves people wondering why a ground they can see on the map is
      | missing from the list - this is the answer, and tapping it clears
      | everything.
      */}
      {activeCount > 0 ? (
        <TouchableOpacity
          style={styles.summary}
          activeOpacity={0.8}
          onPress={() => apply({ ...EMPTY_FILTERS, sort: filters.sort })}
        >
          <Text style={styles.summaryText} numberOfLines={1}>
            {describeFilters(filters).join(" · ")}
          </Text>

          <Ionicons name="close-circle" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      ) : null}

      {needsManualArea && !filters.area ? (
        <TouchableOpacity style={styles.locationBanner} onPress={request}>
          <Ionicons name="navigate-outline" size={14} color={COLORS.secondary} />

          <Text style={styles.locationText}>
            Location on karo to distance ke hisab se nearest grounds dikha denge
          </Text>
        </TouchableOpacity>
      ) : null}

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
          renderItem={({ item }) => (
            <GroundCard
              ground={item}
              onPress={(g) =>
                navigation.navigate("GroundDetailScreen", {
                  groundId: g._id,

                  /*
                  | The chosen date rides along so the detail screen's slot
                  | picker opens on the day they searched for, rather than
                  | today - otherwise they pick Sunday, tap a ground, and
                  | have to pick Sunday again.
                  */
                  date: filters.date || undefined,

                  unitType: filters.unitType || undefined,
                })
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);

                load(filters, true);
              }}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="location-outline" size={30} color={COLORS.outline} />

              <Text style={styles.emptyTitle}>
                {activeCount > 0
                  ? "In filters par koi ground nahi mila"
                  : "Aas-paas koi ground list nahi hai"}
              </Text>

              <Text style={styles.emptyBody}>
                {activeCount > 0
                  ? "Filters thode dheele karo — date ya distance badal ke dekho."
                  : "Apna ground list karo — team seedha aapse booking maang sakegi."}
              </Text>

              {activeCount > 0 ? (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => apply({ ...EMPTY_FILTERS, sort: filters.sort })}
                >
                  <Text style={styles.emptyButtonText}>Clear filters</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate("GroundFormScreen")}
                >
                  <Ionicons name="add" size={16} color={COLORS.onPrimary} />

                  <Text style={styles.emptyButtonText}>List your ground</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/*
      |--------------------------------------------------------------------
      | The two things a person does from here that are not searching
      |--------------------------------------------------------------------
      |
      | "My bookings" is always there, because somebody who booked yesterday
      | opens this tab to check it, not to search again.
      |
      | The owner button only appears for somebody who actually owns a
      | ground. For everybody else the route in is the empty state and the
      | profile menu - a prominent "Owner dashboard" button on a player's
      | screen is a dead end they will tap once.
      */}
      <View style={styles.fabColumn}>
        {isOwner ? (
          <TouchableOpacity
            style={[styles.fab, styles.fabSecondary]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("OwnerDashboardScreen")}
          >
            <Ionicons name="business-outline" size={19} color={COLORS.primary} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.fabWide}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("MyBookingsScreen")}
        >
          <Ionicons name="calendar-outline" size={17} color={COLORS.onPrimary} />

          <Text style={styles.fabText}>My bookings</Text>
        </TouchableOpacity>
      </View>

      <GroundFilterSheet
        visible={sheetOpen}
        filters={filters}
        hasCoords={hasCoords}
        onClose={() => setSheetOpen(false)}
        onApply={apply}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  searchInput: { flex: 1, fontSize: 13.5, color: COLORS.onSurface, padding: 0 },

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterCount: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  filterCountText: { fontSize: 9.5, fontWeight: "900", color: COLORS.onPrimary },

  sortBar: { paddingHorizontal: 16, paddingVertical: 11, gap: 7 },

  sortChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  sortChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  sortText: { fontSize: 12, fontWeight: "700", color: COLORS.onSurfaceVariant },

  sortTextActive: { color: COLORS.onPrimary },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceContainer,
  },

  summaryText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#fff1d6",
  },

  locationText: { flex: 1, fontSize: 11.5, fontWeight: "700", color: "#8f4e00" },

  list: { paddingHorizontal: 16, paddingBottom: 110, flexGrow: 1 },

  gap: { height: 12 },

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
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: { fontSize: 13.5, fontWeight: "800", color: COLORS.onPrimary },

  fabColumn: {
    position: "absolute",
    right: 16,
    bottom: 22,
    alignItems: "flex-end",
    gap: 10,
  },

  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },

  fabSecondary: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },

  fabWide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 46,
    paddingHorizontal: 17,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  fabText: { fontSize: 13.5, fontWeight: "800", color: COLORS.onPrimary },
});
