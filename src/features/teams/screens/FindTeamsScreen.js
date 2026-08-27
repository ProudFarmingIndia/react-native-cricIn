import React, { useEffect, useRef, useState } from "react";

import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";

import TeamSearchBar from "../components/TeamSearchBar";
import TeamFilterChips from "../components/TeamFilterChips";
import TeamCard from "../components/TeamCard";

import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

export default function FindTeamsScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Nearby");

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Search teams (debounced 500ms)
  |--------------------------------------------------------------------------
  */

  const fetchTeams = async (query) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(ENDPOINTS.SEARCH.TEAMS, {
        params: { query },
      });

      const data =
        response.data?.data?.results ??
        response.data?.data ??
        response.data?.results ??
        response.data ??
        [];

      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load teams.",
      );
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchTeams(search.trim());
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <TeamSearchBar value={search} onChangeText={setSearch} />

      <View style={styles.filterWrap}>
        <TeamFilterChips
          selected={selectedFilter}
          setSelected={setSelectedFilter}
        />
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0B7A0B" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && teams.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {search.trim()
              ? "No teams found."
              : "Search for teams to challenge."}
          </Text>
        </View>
      )}

      {!loading &&
        teams.map((team) => (
          <TeamCard
            key={team._id || team.id}
            team={team}
            onPress={() =>
              navigation.navigate("ChallengeMatchScreen", { team })
            }
          />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },

  filterWrap: {
    marginBottom: 16,
  },

  centered: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },

  emptyText: {
    color: "#777",
    fontSize: 14,
  },
});
