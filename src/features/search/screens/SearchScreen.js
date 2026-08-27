import React, { useEffect, useMemo, useState } from "react";

import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import useSearch from "../hooks/useSearch";

import SearchBar from "../components/SearchBar";
import PlayerResultCard from "../components/PlayerResultCard";
import TeamResultCard from "../components/TeamResultCard";
import GroundResultCard from "../components/GroundResultCard";

import { COLORS } from "../../../constants/colors";

const TABS = [
  { key: "players", label: "Players" },
  { key: "teams", label: "Teams" },
  { key: "grounds", label: "Grounds" },
];

const DEBOUNCE_MS = 350;

/*
|--------------------------------------------------------------------------
| Search Screen
|--------------------------------------------------------------------------
|
| Global search, reached from the header search icon on any screen.
| Tapping a player goes to their profile, tapping a team goes to its
| preview - both reuse screens already built for other flows rather
| than creating new ones just for search results.
*/

export default function SearchScreen() {
  const navigation = useNavigation();

  const {
    players,
    teams,
    grounds,
    loading,
    searchPlayers,
    searchTeams,
    searchGrounds,
    clearSearchResults,
  } = useSearch();

  const [activeTab, setActiveTab] = useState("players");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      clearSearchResults();
      return;
    }

    const timeout = setTimeout(() => {
      if (activeTab === "players") searchPlayers(query);
      if (activeTab === "teams") searchTeams(query);
      if (activeTab === "grounds") searchGrounds(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, activeTab, searchPlayers, searchTeams, searchGrounds, clearSearchResults]);

  const results = useMemo(() => {
    if (activeTab === "players") return players || [];
    if (activeTab === "teams") return teams || [];
    if (activeTab === "grounds") return grounds || [];
    return [];
  }, [activeTab, players, teams, grounds]);

  const handlePlayerPress = (player) => {
    navigation.navigate("TeamStack", {
      screen: "PlayerProfileScreen",
      params: { playerId: player._id },
    });
  };

  const handleTeamPress = (team) => {
    navigation.navigate("TeamStack", {
      screen: "TeamPreviewScreen",
      params: { teamId: team._id },
    });
  };

  const renderItem = ({ item }) => {
    if (activeTab === "players") {
      return <PlayerResultCard player={item} onPress={handlePlayerPress} />;
    }

    if (activeTab === "teams") {
      return <TeamResultCard team={item} onPress={handleTeamPress} />;
    }

    return <GroundResultCard ground={item} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
          autoFocus
        />
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
      ) : !query.trim() ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={40} color={COLORS.outlineVariant} />
          <Text style={styles.emptyText}>Search for players, teams, or grounds</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.outlineVariant} />
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
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

  loadingIndicator: {
    marginTop: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },

  backButton: {
    marginRight: 8,
    padding: 4,
  },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    marginRight: 8,
  },

  tabActive: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  tabTextActive: {
    color: COLORS.onPrimary,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  emptyState: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },

  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});