import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import useSearch from "../hooks/useSearch";

import SearchBar from "../components/SearchBar";
import PlayerResultCard from "../components/PlayerResultCard";
import TeamResultCard from "../components/TeamResultCard";
import GroundResultCard from "../components/GroundResultCard";
import RecentSearchCard from "../components/RecentSearchCard";
import SearchSectionHeader from "../components/SearchSectionHeader";

import {
  loadRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from "../utils/recentSearches";

import useFollow from "../../follows/hooks/useFollow";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Search Screen
|--------------------------------------------------------------------------
|
| Reached from the search icon in the header on Home, Profile, Matches,
| Grounds and Shop.
|
| What changed, and why:
|
|   ALL TAB
|   The screen opened on "Players" and searched only that one category, so
|   typing a team name returned "No results" until you noticed the tab row
|   and switched. Searching for a player and searching for a team are the
|   same intent from the user's side - they know the name, not which
|   collection it lives in. "All" is now the default and runs one global
|   request that covers every category at once, with each section capped to
|   a preview and a "See all" that switches tabs.
|
|   RECENT SEARCHES
|   The empty state was a single grey line of instructions. It now lists
|   what you searched before, which is what the header search is mostly
|   used for - jumping back to the same teammates and rival teams.
|
|   MINIMUM LENGTH
|   A one-character query regex-matched most of the database and returned a
|   near-random page of results. Two characters is the same floor the
|   backend's own suggestion endpoint uses.
|
|   IMMEDIATE FEEDBACK
|   The spinner now lives inside the search bar and appears on the first
|   keystroke rather than when the request leaves, so the debounce window
|   no longer feels like a dead screen.
|
|   ERRORS
|   A failed search rendered as "No results", which is a different fact
|   entirely - the user retyped a name that was never the problem. Failures
|   now say so and offer a retry.
|
*/

const TABS = [
  { key: "all", label: "All", icon: "apps-outline" },
  { key: "players", label: "Players", icon: "person-outline" },
  { key: "teams", label: "Teams", icon: "shield-outline" },
  { key: "grounds", label: "Grounds", icon: "location-outline" },
];

const DEBOUNCE_MS = 350;

/*
| Matches getSearchSuggestions() on the backend, which also refuses to run
| below two characters.
*/

const MIN_QUERY_LENGTH = 2;

// Rows shown per category on the "All" tab before "See all" takes over.
const PREVIEW_COUNT = 3;

export default function SearchScreen() {
  const navigation = useNavigation();

  const {
    players,
    teams,
    grounds,
    globalResults,
    loading,
    error,
    searchPlayers,
    searchTeams,
    searchGrounds,
    globalSearch,
    clearSearchResults,
    clearSearchError,
  } = useSearch();

  /*
  | Search results arrive with isFollowing and followerCount already
  | stamped on each row, so seeding the follow store from them means the
  | buttons are correct on first paint. Without this every button renders
  | "Follow" and then corrects itself once a stats request lands - which
  | on a twenty-row list is twenty requests and twenty visible flips.
  */

  const { hydrate: hydrateFollow } = useFollow();

  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);

  /*
  | Set the moment the user types and cleared when the request settles.
  | The slice's own `loading` only turns on once the debounce has elapsed
  | and the thunk has been dispatched, which left a visible gap where the
  | screen looked frozen.
  */
  const [typing, setTyping] = useState(false);

  const trimmedQuery = query.trim();

  const isQueryValid = trimmedQuery.length >= MIN_QUERY_LENGTH;

  /*
  |--------------------------------------------------------------------------
  | Recent Searches
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    /*
    | The slice is not reset on unmount, so without this the screen could
    | reopen showing the previous session's results - or its error banner -
    | above an empty search bar.
    */

    clearSearchResults();

    clearSearchError();

    loadRecentSearches().then((entries) => {
      if (isMounted) {
        setRecent(entries);
      }
    });

    return () => {
      isMounted = false;
    };

    // Intentionally mount-only: this is a reset, not a subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  | Recorded when a result is opened or the keyboard's search key is used -
  | both are moments the user got what they wanted. Recording on every
  | debounce tick instead would fill the history with the prefixes typed on
  | the way to the real query ("m", "mu", "mum"...).
  */

  const rememberSearch = useCallback(
    async (term) => {
      const entries = await saveRecentSearch(term, activeTab);

      setRecent(entries);
    },
    [activeTab],
  );

  const handleRemoveRecent = useCallback(async (entry) => {
    const entries = await removeRecentSearch(entry?.term);

    setRecent(entries);
  }, []);

  const handleClearRecent = useCallback(async () => {
    const entries = await clearRecentSearches();

    setRecent(entries);
  }, []);

  const handleRecentPress = useCallback((entry) => {
    if (entry?.scope) {
      setActiveTab(entry.scope);
    }

    setQuery(entry?.term || "");
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Debounced Search
  |--------------------------------------------------------------------------
  */

  const runSearch = useCallback(
    (term, tab) => {
      if (tab === "players") return searchPlayers(term);
      if (tab === "teams") return searchTeams(term);
      if (tab === "grounds") return searchGrounds(term);

      return globalSearch(term);
    },
    [searchPlayers, searchTeams, searchGrounds, globalSearch],
  );

  /*
  | Guards against an out-of-order response overwriting a newer one: a slow
  | request for "mum" must not replace the results for "mumbai" typed after
  | it. The ref is compared on settle and the stale result is dropped.
  */
  const latestRequest = useRef(0);

  useEffect(() => {
    if (!isQueryValid) {
      setTyping(false);

      clearSearchResults();

      return undefined;
    }

    setTyping(true);

    const requestId = latestRequest.current + 1;

    latestRequest.current = requestId;

    const timeout = setTimeout(() => {
      runSearch(trimmedQuery, activeTab).finally(() => {
        if (latestRequest.current === requestId) {
          setTyping(false);
        }
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [trimmedQuery, isQueryValid, activeTab, runSearch, clearSearchResults]);

  /*
  |--------------------------------------------------------------------------
  | Results
  |--------------------------------------------------------------------------
  |
  | The "All" tab reads from globalResults (one request covering every
  | category); the focused tabs read their own slice arrays. Kept apart so
  | switching tabs never renders one tab's data under another's heading.
  |
  */

  const allPlayers = useMemo(
    () => (Array.isArray(globalResults?.players) ? globalResults.players : []),
    [globalResults],
  );

  const allTeams = useMemo(
    () => (Array.isArray(globalResults?.teams) ? globalResults.teams : []),
    [globalResults],
  );

  const allGrounds = useMemo(
    () => (Array.isArray(globalResults?.grounds) ? globalResults.grounds : []),
    [globalResults],
  );

  const tabResults = useMemo(() => {
    if (activeTab === "players") return players || [];
    if (activeTab === "teams") return teams || [];
    if (activeTab === "grounds") return grounds || [];

    return [];
  }, [activeTab, players, teams, grounds]);

  /*
  | Runs for both shapes - the All tab's grouped results and a focused
  | tab's flat array - so the buttons are seeded whichever way the rows
  | arrived.
  */

  useEffect(() => {
    const entries = [
      ...allPlayers.map((p) => ({
        targetType: "PLAYER",
        targetId: p._id,
        isFollowing: p.isFollowing,
        followerCount: p.followerCount,
      })),

      ...allTeams.map((t) => ({
        targetType: "TEAM",
        targetId: t._id,
        isFollowing: t.isFollowing,
        followerCount: t.followerCount,
      })),

      ...(players || []).map((p) => ({
        targetType: "PLAYER",
        targetId: p._id,
        isFollowing: p.isFollowing,
        followerCount: p.followerCount,
      })),

      ...(teams || []).map((t) => ({
        targetType: "TEAM",
        targetId: t._id,
        isFollowing: t.isFollowing,
        followerCount: t.followerCount,
      })),
    ];

    if (entries.length > 0) {
      hydrateFollow(entries);
    }
  }, [allPlayers, allTeams, players, teams, hydrateFollow]);

  const totalAllResults =
    allPlayers.length + allTeams.length + allGrounds.length;

  const hasResults =
    activeTab === "all" ? totalAllResults > 0 : tabResults.length > 0;

  const isBusy = typing || loading;

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const handlePlayerPress = useCallback(
    (player) => {
      rememberSearch(trimmedQuery);

      navigation.navigate("TeamStack", {
        screen: "PlayerProfileScreen",
        params: { playerId: player._id },
      });
    },
    [navigation, rememberSearch, trimmedQuery],
  );

  /*
  | TeamDetailsScreen, not TeamPreviewScreen.
  |
  | Preview is a bare read-only card - name, city, a squad count and two
  | empty leadership rows. Details is the real screen: Overview, Players,
  | Matches, Statistics and Settings, with the squad actually listed and
  | every row tappable through to a player profile. Arriving from search
  | at the thinner of the two made a full team look empty.
  */

  const handleTeamPress = useCallback(
    (team) => {
      rememberSearch(trimmedQuery);

      navigation.navigate("TeamStack", {
        screen: "TeamDetailsScreen",
        params: { teamId: team._id },
      });
    },
    [navigation, rememberSearch, trimmedQuery],
  );

  const handleSubmit = useCallback(() => {
    if (isQueryValid) {
      rememberSearch(trimmedQuery);
    }
  }, [isQueryValid, rememberSearch, trimmedQuery]);

  const handleRetry = useCallback(() => {
    clearSearchError();

    if (isQueryValid) {
      runSearch(trimmedQuery, activeTab);
    }
  }, [clearSearchError, isQueryValid, runSearch, trimmedQuery, activeTab]);

  const handleClearQuery = useCallback(() => {
    setQuery("");

    clearSearchResults();
  }, [clearSearchResults]);

  /*
  |--------------------------------------------------------------------------
  | Renderers
  |--------------------------------------------------------------------------
  */

  const renderTabItem = ({ item }) => {
    if (activeTab === "players") {
      return <PlayerResultCard player={item} onPress={handlePlayerPress} />;
    }

    if (activeTab === "teams") {
      return <TeamResultCard team={item} onPress={handleTeamPress} />;
    }

    return <GroundResultCard ground={item} />;
  };

  const renderEmptyState = () => {
    /*
    | Four genuinely different situations that all used to render as the
    | same "No results" message. Ordered so a stale error from an earlier
    | query can never sit on top of the empty or too-short states, where
    | there is nothing to retry.
    */

    if (!trimmedQuery) {
      return renderRecentBlock();
    }

    if (!isQueryValid) {
      return (
        <View style={styles.stateBlock}>
          <View style={styles.stateIcon}>
            <Ionicons name="create-outline" size={26} color={COLORS.primary} />
          </View>

          <Text style={styles.stateTitle}>Keep typing</Text>

          <Text style={styles.stateText}>
            Enter at least {MIN_QUERY_LENGTH} characters to search.
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateBlock}>
          <View style={[styles.stateIcon, styles.stateIconError]}>
            <Ionicons name="cloud-offline-outline" size={26} color={COLORS.error} />
          </View>

          <Text style={styles.stateTitle}>Search didn't go through</Text>

          <Text style={styles.stateText}>
            {typeof error === "string" ? error : "Check your connection and try again."}
          </Text>

          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={15} color={COLORS.onPrimary} />

            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stateBlock}>
        <View style={styles.stateIcon}>
          <Ionicons name="search-outline" size={26} color={COLORS.primary} />
        </View>

        <Text style={styles.stateTitle}>No matches for "{trimmedQuery}"</Text>

        <Text style={styles.stateText}>
          {activeTab === "all"
            ? "Try a different spelling, or search by city or short name."
            : "Nothing in this tab - try All to search every category."}
        </Text>

        {activeTab !== "all" && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setActiveTab("all")}
          >
            <Ionicons name="apps-outline" size={15} color={COLORS.onPrimary} />

            <Text style={styles.retryText}>Search everything</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRecentBlock = () => {
    if (recent.length === 0) {
      return (
        <View style={styles.stateBlock}>
          <View style={styles.stateIcon}>
            <Ionicons name="search-outline" size={26} color={COLORS.primary} />
          </View>

          <Text style={styles.stateTitle}>Find players and teams</Text>

          <Text style={styles.stateText}>
            Search by name, short name, or the city they play in.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.recentBlock}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent</Text>

          <TouchableOpacity
            onPress={handleClearRecent}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.recentClear}>Clear all</Text>
          </TouchableOpacity>
        </View>

        {recent.map((entry) => (
          <RecentSearchCard
            key={`${entry.term}-${entry.at}`}
            entry={entry}
            onPress={handleRecentPress}
            onRemove={handleRemoveRecent}
          />
        ))}
      </View>
    );
  };

  const renderAllTab = () => (
    <ScrollView
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {allPlayers.length > 0 && (
        <View style={styles.section}>
          <SearchSectionHeader
            title="Players"
            count={allPlayers.length}
            hasMore={allPlayers.length > PREVIEW_COUNT}
            onSeeAll={() => setActiveTab("players")}
          />

          {allPlayers.slice(0, PREVIEW_COUNT).map((player) => (
            <PlayerResultCard
              key={player._id}
              player={player}
              onPress={handlePlayerPress}
            />
          ))}
        </View>
      )}

      {allTeams.length > 0 && (
        <View style={styles.section}>
          <SearchSectionHeader
            title="Teams"
            count={allTeams.length}
            hasMore={allTeams.length > PREVIEW_COUNT}
            onSeeAll={() => setActiveTab("teams")}
          />

          {allTeams.slice(0, PREVIEW_COUNT).map((team) => (
            <TeamResultCard key={team._id} team={team} onPress={handleTeamPress} />
          ))}
        </View>
      )}

      {allGrounds.length > 0 && (
        <View style={styles.section}>
          <SearchSectionHeader
            title="Grounds"
            count={allGrounds.length}
            hasMore={allGrounds.length > PREVIEW_COUNT}
            onSeeAll={() => setActiveTab("grounds")}
          />

          {allGrounds.slice(0, PREVIEW_COUNT).map((ground) => (
            <GroundResultCard key={ground._id} ground={ground} />
          ))}
        </View>
      )}
    </ScrollView>
  );

  /*
  |--------------------------------------------------------------------------
  | Screen
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={handleClearQuery}
          onSubmit={handleSubmit}
          loading={isBusy}
          autoFocus
        />
      </View>

      {/*
      | The chip row is wrapped in a fixed-height View.
      |
      | A horizontal ScrollView inside a flex column stretches to fill the
      | remaining cross-axis space, and its children stretch with it - which
      | is why the chips rendered as four full-height columns instead of a
      | row of pills. Constraining the wrapper is what actually fixes it;
      | flexGrow: 0 on the ScrollView alone is not enough on web.
      */}

      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabRow}
          keyboardShouldPersistTaps="handled"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={isActive ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                />

                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/*
      | The spinner only takes over the results area when there is nothing
      | to show yet. Once results are on screen, refining the query keeps
      | them visible and the search bar's own spinner carries the loading
      | state - the list no longer blanks out on every keystroke.
      */}

      {isBusy && !hasResults ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loadingIndicator}
        />
      ) : !hasResults ? (
        <ScrollView
          contentContainerStyle={styles.stateScroll}
          keyboardShouldPersistTaps="handled"
        >
          {renderEmptyState()}
        </ScrollView>
      ) : activeTab === "all" ? (
        renderAllTab()
      ) : (
        <FlatList
          data={tabResults}
          keyExtractor={(item) => item._id}
          renderItem={renderTabItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {tabResults.length}{" "}
              {tabResults.length === 1 ? "result" : "results"}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  /*
  | Three separate constraints, all needed:
  |
  |   tabBar    - a fixed height so the row can never claim leftover
  |               vertical space in the column.
  |   tabScroll - flexGrow/flexShrink 0, or the ScrollView still tries to
  |               fill its parent before the height lands.
  |   tabRow    - alignItems center, so each chip sizes to its own content
  |               instead of stretching to the track height.
  */

  tabBar: {
    height: 56,
    justifyContent: "center",
  },

  tabScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },

  tabRow: {
    alignItems: "center",
    paddingHorizontal: 16,
  },

  tab: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginRight: 8,
  },

  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  tabText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  tabTextActive: {
    color: COLORS.onPrimary,
  },

  loadingIndicator: {
    marginTop: 48,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  section: {
    marginBottom: 8,
  },

  resultCount: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  stateScroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },

  stateBlock: {
    alignItems: "center",
    marginTop: 56,
    paddingHorizontal: 24,
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

  retryButton: {
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

  recentBlock: {
    paddingTop: 8,
  },

  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  recentTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: COLORS.onSurfaceVariant,
  },

  recentClear: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
