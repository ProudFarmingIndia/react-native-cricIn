import React, { 
  // useEffect, 
  useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { useRoute,
  //  useNavigation, 
   useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import { getPlayerByIdApi } from "../services/profile.services";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Player Profile Screen (Read-Only)
|--------------------------------------------------------------------------
|
| Views ANOTHER player's profile - no edit affordances, since this isn't
| the logged-in user's own profile. Reuses the same field set as the
| Overview tab on your own profile, for visual consistency.
|
| Expects via route.params: playerId.
*/

export default function PlayerProfileScreen() {
  const route = useRoute();

  // const navigation = useNavigation();

  const { playerId } = route.params || {};

  const [player, setPlayer] = useState(null);

  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      setLoading(true);

      getPlayerByIdApi(playerId)
        .then((data) => {
          if (!cancelled) setPlayer(data);
        })
        .catch((error) => {
          console.error("Failed to load player profile:", error);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [playerId]),
  );

  if (loading || !player) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ---------------------------------------------------------- */}
        {/* Hero */}
        {/* ---------------------------------------------------------- */}

        <View style={styles.hero}>
          <Image
            source={{ uri: player?.profileImage?.url || "https://placehold.co/200" }}
            style={styles.avatar}
          />

          <Text style={styles.name}>{player.playerName}</Text>

          {!!player.playerType && (
            <Text style={styles.role}>{player.playerType}</Text>
          )}

          {!!player.bio && (
            <Text style={styles.bio}>{player.bio}</Text>
          )}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* Cricket Info */}
        {/* ---------------------------------------------------------- */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cricket Info</Text>

          <InfoRow label="Batting Style" value={player.battingStyle} />
          <InfoRow label="Bowling Style" value={player.bowlingStyle} />
          <InfoRow label="Jersey Number" value={player.jerseyNumber ? `#${player.jerseyNumber}` : null} />
        </View>

        {/* ---------------------------------------------------------- */}
        {/* Location */}
        {/* ---------------------------------------------------------- */}

        {(player.city || player.state || player.country) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location</Text>
            <InfoRow label="City" value={player.city} />
            <InfoRow label="State" value={player.state} />
            <InfoRow label="Country" value={player.country} />
          </View>
        )}

        {/* ---------------------------------------------------------- */}
        {/* Teams */}
        {/* ---------------------------------------------------------- */}

        {player.teams?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Teams</Text>

            {player.teams.map((team) => (
              <View
                key={team._id}
                style={styles.teamRow}
              >
                <Image
                  source={{ uri: team?.logo?.url || "https://placehold.co/100" }}
                  style={styles.teamLogo}
                />

                <Text style={styles.teamName}>{team.teamName}</Text>

                {String(team.captainId?._id) === String(player._id) && (
                  <Text style={styles.roleBadge}>C</Text>
                )}

                {String(team.viceCaptainId?._id) === String(player._id) && (
                  <Text style={styles.roleBadge}>VC</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ---------------------------------------------------------- */}
        {/* Stats */}
        {/* ---------------------------------------------------------- */}

        {player.stats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Career Stats</Text>

            <View style={styles.statsRow}>
              <StatBox label="Matches" value={player.stats.matches || 0} />
              <StatBox label="Runs" value={player.stats.runs || 0} />
              <StatBox label="Wickets" value={player.stats.wickets || 0} />
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  hero: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceVariant,
    marginBottom: 12,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  role: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 4,
  },

  bio: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  infoLabel: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceVariant,
    marginRight: 10,
  },

  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  roleBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  statBox: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
});