import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import HighlightCard from "./HighlightCard";

import {
  getHighlightsApi,
  getMatchHighlightsApi,
} from "../services/highlight.service";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Highlights Feed
|--------------------------------------------------------------------------
|
| One component, two uses:
|
|   <HighlightsFeed />                 the Matches screen tab - top 10
|                                      across CricIn, with a time filter
|   <HighlightsFeed matchId={id} />    one match's best moments, no filter
|
| Sharing it means a moment renders identically wherever it appears, and
| the phrasing only has to be right in one place.
|
| Everything here is computed from ball-by-ball data, so the feed fills as
| soon as anyone scores a match - there is nothing for a user to upload and
| no empty-until-seeded state to design around.
|
*/

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

export default function HighlightsFeed({
  matchId,
  city,
  state,
  country,
  limit,
  onPressItem,

  /*
  | Set when this feed is rendered INSIDE another ScrollView, as it is on
  | MatchDetailsScreen. A FlatList nested in a ScrollView of the same
  | orientation loses its virtualisation, warns, and scrolls badly - so in
  | nested mode the rows are rendered plainly and the parent does the
  | scrolling. Safe here because a single match's feed is capped at 20.
  */
  nested = false,
}) {
  const isMatchFeed = !!matchId;

  const [range, setRange] = useState("week");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const data = isMatchFeed
          ? await getMatchHighlightsApi(matchId, limit || 20)
          : await getHighlightsApi({
              range,
              city,
              state,
              country,
              limit: limit || 10,
            });

        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(
          e.response?.data?.message ||
            e.message ||
            "Could not load highlights.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isMatchFeed, matchId, range, city, state, country, limit],
  );

  useEffect(() => {
    load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Range Filter
  |--------------------------------------------------------------------------
  |
  | Only on the global feed. A single match has one date, so filtering it
  | by "this week" would either show everything or nothing.
  |
  | Same fixed-height wrapper as the search tabs - a horizontal ScrollView
  | in a flex column stretches on the cross axis and turns the chips into
  | full-height columns without it.
  |
  */

  const renderFilter = () => {
    if (isMatchFeed) {
      return null;
    }

    return (
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {RANGES.map((item) => {
            const active = range === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setRange(item.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.stateBlock}>
      <View style={styles.stateIcon}>
        <Ionicons name="sparkles-outline" size={26} color={COLORS.primary} />
      </View>

      <Text style={styles.stateTitle}>
        {isMatchFeed ? "No moments yet" : "Nothing here yet"}
      </Text>

      <Text style={styles.stateText}>
        {isMatchFeed
          ? "Sixes, wickets and milestones will appear here as the match is scored."
          : range === "today"
            ? "No matches scored today. Try This Week or All Time."
            : "Highlights are built from scored matches. Score one and it shows up here."}
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.stateBlock}>
      <View style={[styles.stateIcon, styles.stateIconError]}>
        <Ionicons name="cloud-offline-outline" size={26} color={COLORS.error} />
      </View>

      <Text style={styles.stateTitle}>Couldn't load highlights</Text>

      <Text style={styles.stateText}>{error}</Text>

      <TouchableOpacity style={styles.retry} onPress={() => load()}>
        <Ionicons name="refresh" size={15} color={COLORS.onPrimary} />

        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={nested ? styles.containerNested : styles.container}>
      {renderFilter()}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loading}
        />
      ) : error ? (
        renderError()
      ) : nested ? (
        <View>
          {items.length === 0
            ? renderEmpty()
            : items.map((item, index) => (
                <HighlightCard
                  key={String(item.id || index)}
                  item={item}
                  onPress={onPressItem}
                  showMatch={false}
                />
              ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={({ item }) => (
            <HighlightCard
              item={item}
              onPress={onPressItem}
              showMatch={!isMatchFeed}
            />
          )}
          contentContainerStyle={[
            styles.list,
            items.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /*
  | No flex and no background when nested - flex:1 inside a ScrollView's
  | content collapses to zero height, and the parent already paints the
  | surface behind it.
  */
  containerNested: {},

  filterBar: {
    height: 56,
    justifyContent: "center",
  },

  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },

  filterRow: {
    alignItems: "center",
    paddingHorizontal: 16,
  },

  chip: {
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginRight: 8,
  },

  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  chipTextActive: {
    color: COLORS.onPrimary,
  },

  loading: {
    marginTop: 48,
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 120,
  },

  listEmpty: {
    flexGrow: 1,
  },

  stateBlock: {
    alignItems: "center",
    marginTop: 48,
    paddingHorizontal: 32,
  },

  stateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  stateIconError: {
    backgroundColor: COLORS.errorContainer,
  },

  stateTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  stateText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  retry: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
  },

  retryText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onPrimary,
  },
});
