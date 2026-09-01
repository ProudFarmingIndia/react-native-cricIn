import React, { useState, useCallback } from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  useRoute,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { getPlayerByIdApi } from "../services/profile.services";

import ProfileTabs from "../components/ProfileTabs";
import OverviewTab from "../common/tabs/OverviewTab";
import GalleryTab from "../common/tabs/GalleryTab";
import MatchesTab from "../common/tabs/MatchesTab";
import PlayerTeamsTab from "../common/tabs/PlayerTeamsTab";
import HighlightsTab from "../common/tabs/HighlightsTab";
import PlayerCareerStatsSection from "../../../components/matches/PlayerCareerStatsSection";

import FollowButton from "../../follows/components/FollowButton";
import FollowStats from "../../follows/components/FollowStats";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Player Profile Screen (Read-Only)
|--------------------------------------------------------------------------
|
| Views ANOTHER player's profile. Same tab structure as your own profile
| so the app reads consistently, but with no edit affordances anywhere.
|
| Reached from: TeamDetailsScreen (Players tab), AddPlayerScreen and
| SearchScreen - each passes route.params.playerId.
|
| Access model
| ------------
| Overview, Stats and Matches are PUBLIC. A player's cricket record is
| their CV, and making it visible is the point of the product - a captain
| scouting an opponent before a challenge is the highest-value viewer and
| the least likely to follow first.
|
| Gallery is personal media, so it is gated on the player's own privacy
| setting (player.visibility === "private"), not on whether the viewer
| follows them. That mirrors how Team.visibility already works. Until the
| backend adds Player.visibility the check simply never trips, so this is
| forward-compatible rather than speculative.
|
| A note on the data: Player.stats is currently all zeros because nothing
| on the backend writes to it yet, and `matches` is not returned by
| GET /players/:id at all. Both tabs therefore render honest empty states
| rather than invented numbers, and will fill in once the backend
| aggregates stats at innings end.
|
*/

const TABS = [
  "Overview",
  "Stats",
  "Matches",
  "Teams",
  "Gallery",
  "Highlights",
];

export default function PlayerProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { playerId } = route.params || {};

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const loadPlayer = useCallback(() => {
    let cancelled = false;

    if (!playerId) {
      setError("No player was selected.");
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError(null);

    getPlayerByIdApi(playerId)
      .then((data) => {
        if (cancelled) return;

        if (!data) {
          setError("This player profile could not be found.");
          return;
        }

        setPlayer(data);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error("Failed to load player profile:", err);

        setError(
          err?.response?.data?.message ||
            "Could not load this player. Check your connection and try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  useFocusEffect(loadPlayer);

  /* ------------------------------------------------------------------ */
  /* Loading / error                                                     */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error || !player) {
    return (
      <SafeAreaView style={styles.centered}>
        <MaterialIcons name="person-off" size={56} color={COLORS.outline} />

        <Text style={styles.errorTitle}>Profile unavailable</Text>

        <Text style={styles.errorText}>
          {error || "This player profile could not be found."}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadPlayer}
          activeOpacity={0.85}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Derived                                                             */
  /* ------------------------------------------------------------------ */

  const teams = Array.isArray(player.teams) ? player.teams : [];

  const isMediaPrivate = player.visibility === "private";

  const location = [player.city, player.state, player.country]
    .filter(Boolean)
    .join(", ");

  const displayName = player.playerName || "This player";

  /*
    TeamDetailsScreen is registered in this same stack (TeamStackNavigator),
    so this is a plain push - Back returns here rather than dropping the
    user into the Profile tab.
  */
  const handleTeamPress = (teamId) => {
    if (!teamId) return;

    navigation.navigate("TeamDetailsScreen", { teamId });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 0:
        return (
          <View style={styles.tabBody}>
            <OverviewTab profile={player} />
          </View>
        );

      case 1:
        return (
          <View style={styles.tabBody}>
            {player.stats ? (
              <PlayerCareerStatsSection stats={player.stats} />
            ) : (
              <EmptyTab
                icon="bar-chart"
                title="No Stats Yet"
                text={`${displayName} hasn't played a scored match yet.`}
              />
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.tabBody}>
            <MatchesTab profile={player} />
          </View>
        );

      case 3:
        // No tabBody padding here: TeamCard brings its own
        // marginHorizontal: 16, and wrapping it would double the inset.
        return (
          <PlayerTeamsTab
            teams={teams}
            playerName={player.playerName}
            onTeamPress={handleTeamPress}
          />
        );

      case 4:
        return (
          <View style={styles.tabBody}>
            {isMediaPrivate ? (
              <EmptyTab
                icon="lock-outline"
                title="Gallery is Private"
                text={`${displayName} has chosen to keep their photos and videos private.`}
              />
            ) : (
              <GalleryTab profile={player} readOnly />
            )}
          </View>
        );

      case 5:
        // HighlightsTab carries its own paddingHorizontal, same as
        // PlayerTeamsTab - wrapping it in tabBody would double the inset.
        return <HighlightsTab profile={player} readOnly />;

      default:
        return null;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/*
          Read-only cover. Mirrors HeroSection on your own profile so a
          player looks the same wherever you view them; falls back to the
          flat primary band when they haven't set one.
        */}
        <View style={styles.cover}>
          {!!player?.coverPhoto?.url && (
            <>
              <Image
                source={{ uri: player.coverPhoto.url }}
                style={styles.coverImage}
              />
              <View style={styles.coverScrim} />
            </>
          )}
        </View>

        <View style={styles.hero}>
          <Image
            source={{
              uri: player?.profileImage?.url || "https://placehold.co/200",
            }}
            style={styles.avatar}
          />

          <Text style={styles.name}>{player.playerName || "Player"}</Text>

          {!!player.playerType && (
            <Text style={styles.role}>{player.playerType}</Text>
          )}

          {!!location && (
            <View style={styles.locationRow}>
              <MaterialIcons
                name="place"
                size={14}
                color={COLORS.onSurfaceVariant}
              />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          )}

          {!!player.bio && <Text style={styles.bio}>{player.bio}</Text>}

          {/*
          |------------------------------------------------------------------
          | Followers / Following / Follow
          |------------------------------------------------------------------
          |
          | A player gets both halves - unlike a team, a player follows
          | people back, so "Following" is a real number here.
          |
          | The button is hidden for a local player (a squad entry with no
          | CricIn account behind it): there is nobody to notify and no
          | activity to follow, and the backend refuses the follow anyway,
          | so offering the button would only produce a failing tap.
          */}

          {!!player?._id && (
            <View style={styles.followBlock}>
              <FollowStats
                targetType="PLAYER"
                targetId={player._id}
                onPressFollowers={() =>
                  navigation.navigate("FollowListScreen", {
                    mode: "followers",
                    targetType: "PLAYER",
                    targetId: player._id,
                    title: `People following ${displayName}`,
                  })
                }
              />

              {!player?.isLocal && !!player?.userId && (
                <FollowButton
                  targetType="PLAYER"
                  targetId={player._id}
                  size="md"
                  style={styles.followButton}
                />
              )}
            </View>
          )}

          {/*
            At-a-glance strip. `totalMatches` is the real field name on
            Player.stats - the previous version read stats.matches, which
            does not exist on the schema, so this always showed 0.
          */}
          <View style={styles.glanceRow}>
            <Glance label="Matches" value={player?.stats?.totalMatches ?? 0} />
            <Glance label="Runs" value={player?.stats?.runs ?? 0} />
            <Glance label="Wickets" value={player?.stats?.wickets ?? 0} />
            <Glance label="Teams" value={teams.length} />
          </View>
        </View>

        <ProfileTabs
          tabs={TABS}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {renderTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------- */
/* Sub-components                                                        */
/* -------------------------------------------------------------------- */

function Glance({ label, value }) {
  return (
    <View style={styles.glanceBox}>
      <Text style={styles.glanceValue}>{value}</Text>
      <Text style={styles.glanceLabel}>{label}</Text>
    </View>
  );
}

function EmptyTab({ icon, title, text }) {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name={icon} size={56} color={COLORS.outline} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

/* -------------------------------------------------------------------- */
/* Styles                                                                */
/* -------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 48,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: COLORS.background,
  },

  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  retryButton: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
  },

  retryText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 14,
  },

  backLink: {
    marginTop: 14,
    padding: 8,
  },

  backLinkText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "600",
  },

  /* Hero */

  cover: {
    width: "100%",
    height: 130,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },

  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  coverScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },

  hero: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // Pulled up so it overlaps the cover, matching your own profile header.
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    marginTop: -52,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: COLORS.background,
    backgroundColor: COLORS.surfaceContainerHighest,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  role: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 4,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },

  locationText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  bio: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginTop: 10,
  },

  followBlock: {
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  followButton: {
    marginTop: 12,
  },

  glanceRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignSelf: "stretch",
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  glanceBox: {
    alignItems: "center",
    minWidth: 60,
  },

  glanceValue: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.primary,
  },

  glanceLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },

  /* Tabs */

  tabBody: {
    paddingHorizontal: 16,
  },





  /* Empty states */

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },
});
