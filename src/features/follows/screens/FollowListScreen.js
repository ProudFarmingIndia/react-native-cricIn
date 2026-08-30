import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import useFollow from "../hooks/useFollow";
import FollowButton from "../components/FollowButton";

import PlayerResultCard from "../../search/components/PlayerResultCard";
import TeamResultCard from "../../search/components/TeamResultCard";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Follow List Screen
|--------------------------------------------------------------------------
|
| One screen for three lists, chosen by route params:
|
|   { mode: "followers", targetType, targetId, title }
|       Who follows this player or team.
|
|   { mode: "following" }
|       Who the signed-in user follows - players and teams, in two tabs.
|       Deliberately self-only: showing someone else's following list is a
|       privacy decision that has not been made yet, and the backend has no
|       route for it.
|
| Reuses PlayerResultCard and TeamResultCard from search rather than
| introducing a third row design for the same two entities.
|
*/

export default function FollowListScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const {
    mode = "followers",
    targetType,
    targetId,
    title,
  } = route.params || {};

  const {
    followersList,
    followersLoading,
    followingList,
    followingLoading,
    loadFollowers,
    loadMyFollowing,
  } = useFollow();

  const [followingTab, setFollowingTab] = useState("players");

  const isFollowersMode = mode === "followers";

  useEffect(() => {
    if (isFollowersMode) {
      if (targetType && targetId) {
        loadFollowers(targetType, targetId);
      }

      return;
    }

    loadMyFollowing();
  }, [isFollowersMode, targetType, targetId, loadFollowers, loadMyFollowing]);

  const openPlayer = useCallback(
    (playerId) => {
      if (!playerId) {
        return;
      }

      navigation.navigate("TeamStack", {
        screen: "PlayerProfileScreen",
        params: { playerId },
      });
    },
    [navigation],
  );

  const openTeam = useCallback(
    (team) => {
      navigation.navigate("TeamStack", {
        screen: "TeamPreviewScreen",
        params: { teamId: team._id },
      });
    },
    [navigation],
  );

  /*
  |--------------------------------------------------------------------------
  | Followers Rows
  |--------------------------------------------------------------------------
  |
  | A follower row is not a search result - the backend returns a flattened
  | shape ({ userId, playerId, name, profileImage, ... }) because a
  | follower may be a user with no player profile at all. Those rows are
  | shown but are not tappable and get no Follow button, since there is no
  | profile to open or follow.
  |
  */

  const renderFollowerRow = ({ item }) => {
    const hasProfile = !!item.playerId;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={hasProfile ? 0.7 : 1}
        onPress={() => hasProfile && openPlayer(item.playerId)}
        disabled={!hasProfile}
      >
        {item.profileImage?.url ? (
          <Image
            source={{ uri: item.profileImage.url }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>
              {(item.name || "?").trim().charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.rowContent}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.name}
            {item.isSelf ? " (you)" : ""}
          </Text>

          {(!!item.playerType || !!item.city) && (
            <Text style={styles.rowSub} numberOfLines={1}>
              {[item.playerType, item.city].filter(Boolean).join(" · ")}
            </Text>
          )}
        </View>

        {hasProfile && !item.isSelf && (
          <FollowButton targetType="PLAYER" targetId={item.playerId} />
        )}
      </TouchableOpacity>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Following Rows
  |--------------------------------------------------------------------------
  */

  const followingData = useMemo(() => {
    if (followingTab === "teams") {
      return followingList.teams || [];
    }

    return followingList.players || [];
  }, [followingTab, followingList]);

  const renderFollowingRow = ({ item }) => {
    if (followingTab === "teams") {
      return <TeamResultCard team={item} onPress={openTeam} />;
    }

    return (
      <PlayerResultCard
        player={item}
        onPress={(player) => openPlayer(player._id)}
      />
    );
  };

  const loading = isFollowersMode ? followersLoading : followingLoading;

  const data = isFollowersMode ? followersList : followingData;

  const renderEmpty = () => (
    <View style={styles.emptyBlock}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={isFollowersMode ? "people-outline" : "heart-outline"}
          size={26}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {isFollowersMode
          ? "No followers yet"
          : followingTab === "teams"
            ? "Not following any teams"
            : "Not following any players"}
      </Text>

      <Text style={styles.emptyText}>
        {isFollowersMode
          ? "Followers show up here as people start following."
          : "Search for a player or team and tap Follow to get their match updates."}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {!isFollowersMode && (
        <View style={styles.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabRow}
          >
            {[
              {
                key: "players",
                label: "Players",
                count: followingList.players?.length || 0,
              },
              {
                key: "teams",
                label: "Teams",
                count: followingList.teams?.length || 0,
              },
            ].map((tab) => {
              const isActive = followingTab === tab.key;

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setFollowingTab(tab.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[styles.tabText, isActive && styles.tabTextActive]}
                  >
                    {tab.label} ({tab.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loading}
        />
      ) : data.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) =>
            String(item._id || item.userId || index)
          }
          renderItem={isFollowersMode ? renderFollowerRow : renderFollowingRow}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isFollowersMode && title ? (
              <Text style={styles.listHeader}>{title}</Text>
            ) : null
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
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  tabTextActive: {
    color: COLORS.onPrimary,
  },

  loading: {
    marginTop: 48,
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  listHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  avatarFallback: {
    backgroundColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitials: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  rowContent: {
    flex: 1,
    marginRight: 8,
  },

  rowName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  rowSub: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  emptyBlock: {
    alignItems: "center",
    marginTop: 56,
    paddingHorizontal: 32,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});
