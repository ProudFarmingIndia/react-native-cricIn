import React, { useCallback, useMemo } from "react";

import useNotification from "../hooks/useNotification";

import {
  FlatList,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import NotificationCard from "../components/NotificationCard";
import NotificationFilter from "../components/NotificationFilter";
import NotificationEmpty from "../components/NotificationEmpty";

import {
  NOTIFICATION_FILTERS,
  NOTIFICATION_CATEGORY_MAP,
  NOTIFICATION_TYPES,
} from "../constants/notificationTypes";

import styles from "../styles/notification.styles";
import { COLORS } from "../../../constants/colors";
import useTeam from "../../teams/hooks/useTeam";
import useViceCaptainProposal from "../../viceCaptain/hooks/useViceCaptainProposal";
import { getProfile } from "../../profile/store/profileSlice";

import {
  confirmMatchApi,
  rejectMatchConfirmationApi,
} from "../../matches/services/matches.services";

import { acceptChallengeApi, rejectChallengeApi } from "../../matchChallenges/services/matchChallenges.services";
import { getMatchByIdApi } from "../../matches/services/matches.services";

/*
| Answering a camera invite. The same call the invite screen makes -
| accepting is what mints the stream key, so it has to be the real
| endpoint and not a local flag.
*/
import { respondToBroadcastApi } from "../../liveStream/services/liveStream.service";

/*
| Answering a tournament invite, and an organizer answering a team's
| request to join. Both are the same server calls the tournament screens
| make - accepting from the list has to be the real endpoint, because
| accepting is what puts the team in and fixes its seed.
*/
import {
  respondToTournamentInviteApi,
  respondJoinRequestApi,
} from "../../tournaments/services/tournament.service";

/*
| Answering a series challenge. One invite, one opponent captain - and the
| organizer cannot generate a single fixture until it is answered, which
| is why it is answerable straight from the list.
*/
import { respondToSeriesInviteApi } from "../../series/services/series.service";

/*
|--------------------------------------------------------------------------
| Notification Screen
|--------------------------------------------------------------------------
|
| Accept/Reject route to a DIFFERENT API depending on notification.type -
| this used to be hardcoded to only the team-invitation API regardless of
| type, which meant vice-captain proposals and match challenges had
| Accept/Reject buttons that either did nothing correct or silently
| called the wrong endpoint with the wrong id field.
*/

/*
| Toolbar styles live here rather than in notification.styles.js because
| they belong to this screen's chrome, not to the notification list itself.
*/

const toolbar = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },

  spacer: { flex: 1 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  chipOn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipText: { fontSize: 12, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextOn: { color: COLORS.onPrimary },

  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  actionText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },

  actionTextOff: { color: COLORS.outline },

  count: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },
});

export default function NotificationScreen() {
  const {
    notifications,
    loading,
    filter,
    unreadCount,
    unreadOnly,
    selecting,
    selectedIds,
    getNotifications,
    setFilter,
    markAsRead,
    markAllAsRead,
    markManyAsRead,
    deleteMany,
    setUnreadOnly,
    setSelecting,
    toggleSelected,
    selectAll,
    clearSelection,
    acceptInvitation,
    rejectInvitation,
  } = useNotification();

  const dispatch = useDispatch();

  const navigation = useNavigation();

  const { getMyTeams
    // , getTeamById
   } = useTeam();

  const { acceptProposal, rejectProposal } = useViceCaptainProposal();

  /*
  |--------------------------------------------------------------------------
  | Refetch On Focus, Not Only On Mount
  |--------------------------------------------------------------------------
  |
  | This was a plain mount effect, so the list was fetched once and then
  | trusted for as long as the screen stayed alive. Coming back from the
  | detail screen showed whatever the store happened to hold - which, if a
  | mark-read write had failed, was a row still claiming to be unread with
  | nothing anywhere saying why.
  |
  | Refetching on focus makes the server the tiebreaker: the optimistic
  | update shows instantly, and the next focus confirms or corrects it.
  */

  useFocusEffect(
    useCallback(() => {
      getNotifications();
    }, [getNotifications]),
  );

  /*
  |--------------------------------------------------------------------------
  | Filter Notifications
  |--------------------------------------------------------------------------
  */

  const filteredNotifications = useMemo(() => {
    let list = notifications;

    if (filter !== "ALL") {
      list = list.filter(
        (item) => NOTIFICATION_CATEGORY_MAP[item.type] === filter,
      );
    }

    // Combinable with the category filter, e.g. "unread Invitations".
    if (unreadOnly) {
      list = list.filter((item) => !item.isRead);
    }

    return list;
  }, [notifications, filter, unreadOnly]);

  const allSelected =
    filteredNotifications.length > 0 &&
    selectedIds.length === filteredNotifications.length;

  /*
  |--------------------------------------------------------------------------
  | Bulk Actions
  |--------------------------------------------------------------------------
  */

  const handleToggleSelectAll = () => {
    if (allSelected) {
      selectAll([]);
      return;
    }

    selectAll(filteredNotifications.map((item) => item._id));
  };

  const handleMarkSelectedRead = async () => {
    if (selectedIds.length === 0) return;

    await markManyAsRead(selectedIds);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    Alert.alert(
      "Delete Notifications",
      `Delete ${selectedIds.length} notification${
        selectedIds.length > 1 ? "s" : ""
      }? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMany(selectedIds),
        },
      ],
    );
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    await markAllAsRead();
  };

  /*
  |--------------------------------------------------------------------------
  | Accept - Routed By Notification Type
  |--------------------------------------------------------------------------
  */

  const handleAccept = async (notification) => {
    let result;

    // When a challenge is accepted the match is created server-side; we
    // then deep-fetch it and jump straight into squad selection.
    let squadNavigation = null;

    // Same idea for a camera invite: accepting is what mints the stream
    // key, so we take them to it rather than back to the list.
    let broadcastNavigation = null;

    switch (notification.type) {
      case NOTIFICATION_TYPES.TEAM_INVITATION_RECEIVED:
        result = await acceptInvitation(notification.data.invitationId);
        break;

      case NOTIFICATION_TYPES.VICE_CAPTAIN_PROPOSED:
        result = await acceptProposal(notification.data.proposalId);
        break;

      case NOTIFICATION_TYPES.MATCH_CHALLENGE_RECEIVED:
        try {
          const challenge = await acceptChallengeApi(
            notification.data.challengeId,
          );

          // The match is only created once the opponent accepts. Fetch it
          // fully-populated (teamA/teamB with players) before navigating.
          const matchId =
            challenge?.matchId?._id || challenge?.matchId;

          if (matchId) {
            const match = await getMatchByIdApi(matchId);

            squadNavigation = {
              matchId: match?._id || matchId,
              teamA: match?.teamA,
              teamB: match?.teamB,
            };
          }

          result = { success: true };
        } catch (error) {
          result = { success: false, error: error.response?.data?.message || error.message };
        }
        break;

      case NOTIFICATION_TYPES.MATCH_CONFIRMATION_REQUIRED:
        try {
          const match = await confirmMatchApi(notification.data.matchId);
          Alert.alert(
            "Match Approved",
            `Match PIN: ${match.matchPin}\n\nShare this PIN with the scorer — they'll need it to start scoring.`,
          );
          result = { success: true };
        } catch (error) {
          result = { success: false, error: error.response?.data?.message || error.message };
        }
        break;

      /*
      |------------------------------------------------------------------
      | Broadcast Invite
      |------------------------------------------------------------------
      |
      | Accepting here is the SAME server call the invite screen makes,
      | and it is what issues the stream key - until it happens the
      | invite grants nothing.
      |
      | It then jumps straight to the key. Anyone accepting a camera
      | invite is standing at a ground about to film; leaving them on a
      | notification list with an "Accepted" badge and no key is the one
      | ending that fails them.
      |
      */

      case NOTIFICATION_TYPES.BROADCAST_INVITE_RECEIVED:
        try {
          await respondToBroadcastApi(
            notification.data.matchId,
            notification.data.angle,
            true,
          );

          broadcastNavigation = {
            matchId: notification.data.matchId,
            angle: notification.data.angle,
          };

          result = { success: true };
        } catch (error) {
          result = {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
        break;

      /*
      |------------------------------------------------------------------
      | Tournament
      |------------------------------------------------------------------
      |
      | Accepting an invite from the list is the real call, not a local
      | flag: it is what puts the team in and stamps joinedAt, which is
      | the clock the whole seeding order is derived from. Answering a day
      | late genuinely means a lower seed, so it has to happen when the
      | captain taps, not when they next open the tournament.
      |
      | The captain still has to register a squad afterwards. That is not
      | forced here - the detail screen carries a strip for it, and
      | dragging somebody into a fifteen-name picker straight off a
      | notification is not the moment.
      |
      */

      case NOTIFICATION_TYPES.TOURNAMENT_INVITE_RECEIVED:
        try {
          await respondToTournamentInviteApi(
            notification.data.tournamentId,
            notification.data.teamId,
            true,
          );

          result = { success: true };
        } catch (error) {
          result = {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
        break;

      /* The organizer approving a team that asked to join. */

      case NOTIFICATION_TYPES.TOURNAMENT_JOIN_REQUEST:
        try {
          await respondJoinRequestApi(
            notification.data.tournamentId,
            notification.data.teamId,
            true,
          );

          result = { success: true };
        } catch (error) {
          result = {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
        break;

      /*
      |------------------------------------------------------------------
      | Series
      |------------------------------------------------------------------
      |
      | Accepting is what lets the organizer build the schedule - until it
      | happens the series has no fixtures and nothing else can move.
      */

      case NOTIFICATION_TYPES.SERIES_INVITE_RECEIVED:
        try {
          await respondToSeriesInviteApi(notification.data.seriesId, true);

          result = { success: true };
        } catch (error) {
          result = {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
        break;

      default:
        result = { success: false, error: "This notification type can't be accepted here." };
    }

    if (!result.success) {
      Alert.alert("Failed", result.error);
      return;
    }

    await Promise.all([
      getNotifications(),
      getMyTeams(),
      dispatch(getProfile()),
    ]);

    /*
    |--------------------------------------------------------------------------
    | Enter The Match Flow (Only After A Match Exists)
    |--------------------------------------------------------------------------
    |
    | Squad selection / toss / lineup are gated behind an accepted challenge
    | with a created match - this is the ONLY entry point for a challenge.
    |
    */

    if (squadNavigation?.matchId) {
      navigation.navigate("QuickScoreFlow", {
        screen: "SquadSelectionScreen",
        params: squadNavigation,
      });
    }

    /*
    | BroadcastSetupScreen is on RootNavigator - see the note there - so
    | it is addressed directly and not through a tab's stack.
    */

    if (broadcastNavigation?.matchId) {
      navigation.navigate("BroadcastSetupScreen", broadcastNavigation);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reject - Routed By Notification Type
  |--------------------------------------------------------------------------
  |
  | Match challenge rejection needs a reason - there's no full reason-
  | picker UI built yet (that lives with the still-pending Match
  | Challenge inbox), so this uses a lightweight prompt as a functional
  | stand-in rather than blocking reject entirely.
  |
  */

  const rejectMatchChallenge = async (challengeId) => {
    const submitReject = async (message) => {
      try {
        await rejectChallengeApi(challengeId, { reason: "Other", message: message || "" });
        await getNotifications();
      } catch (error) {
        Alert.alert("Failed", error.response?.data?.message || error.message);
      }
    };

    if (Platform.OS === "ios" && Alert.prompt) {
      Alert.prompt("Decline Challenge", "Optional reason", submitReject);
    } else {
      Alert.alert("Decline Challenge", "Decline this match challenge?", [
        { text: "Cancel", style: "cancel" },
        { text: "Decline", style: "destructive", onPress: () => submitReject("") },
      ]);
    }
  };

  const handleReject = async (notification) => {
    if (notification.type === NOTIFICATION_TYPES.MATCH_CHALLENGE_RECEIVED) {
      await rejectMatchChallenge(notification.data.challengeId);
      return;
    }

    let result;

    switch (notification.type) {
      case NOTIFICATION_TYPES.TEAM_INVITATION_RECEIVED:
        result = await rejectInvitation(notification.data.invitationId);
        break;

      case NOTIFICATION_TYPES.VICE_CAPTAIN_PROPOSED:
        result = await rejectProposal(notification.data.proposalId);
        break;

      case NOTIFICATION_TYPES.MATCH_CONFIRMATION_REQUIRED:
        try {
          await rejectMatchConfirmationApi(notification.data.matchId);
          result = { success: true };
        } catch (error) {
          result = { success: false, error: error.response?.data?.message || error.message };
        }
        break;

      /*
      | Declining a camera invite tells the scorer immediately, so they
      | can hand it to somebody else while they are still at the ground.
      | That is the whole value of having a decline at all rather than
      | letting the invite sit unanswered.
      */

      case NOTIFICATION_TYPES.BROADCAST_INVITE_RECEIVED:
        try {
          await respondToBroadcastApi(
            notification.data.matchId,
            notification.data.angle,
            false,
          );

          result = { success: true };
        } catch (error) {
          result = {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
        break;

      /*
      | Declining a tournament invite matters more than it looks. The
      | organizer is waiting on a fixed number of teams before they can
      | generate fixtures, so an unanswered invite blocks the whole
      | tournament - a decline is what lets them go and ask somebody else.
      */

      case NOTIFICATION_TYPES.TOURNAMENT_INVITE_RECEIVED:
        try {
          await respondToTournamentInviteApi(
            notification.data.tournamentId,
            notification.data.teamId,
            false,
          );

          result = { success: true };
        } catch (error) {
          result = {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
        break;

      case NOTIFICATION_TYPES.TOURNAMENT_JOIN_REQUEST:
        try {
          await respondJoinRequestApi(
            notification.data.tournamentId,
            notification.data.teamId,
            false,
          );

          result = { success: true };
        } catch (error) {
          result = {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
        break;

      /*
      | Declining releases the opponent slot, so the organizer can go and
      | challenge somebody else instead of the series sitting stuck on a
      | team that will never answer.
      */

      case NOTIFICATION_TYPES.SERIES_INVITE_RECEIVED:
        try {
          await respondToSeriesInviteApi(notification.data.seriesId, false);

          result = { success: true };
        } catch (error) {
          result = {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
        break;

      default:
        result = { success: false, error: "This notification type can't be rejected here." };
    }

    if (!result.success) {
      Alert.alert("Failed", result.error);
      return;
    }

    await getNotifications();
  };

  /*
  |--------------------------------------------------------------------------
  | Press - Opens Detail Where One Exists
  |--------------------------------------------------------------------------
  |
  | The notification card itself deliberately shows no match detail (no
  | squads/venue/etc, same idea as a plain push notification) - tapping it
  | is what opens the actual review screen, distinct from the inline
  | Accept/Reject shortcut on the card.
  |
  */

  const handlePress = (notification) => {
    /*
    | Opening a notification marks it read - nothing else in the app ever
    | dispatched markAsRead, so isRead stayed false forever and the unread
    | dot never cleared.
    */
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    /*
    | Match confirmation has a purpose-built review screen with squads and
    | the PIN, so it keeps going there. Everything else opens the generic
    | detail view, which resolves the subject (team / challenge / match)
    | and shows who sent it.
    */
    if (notification.type === NOTIFICATION_TYPES.MATCH_CONFIRMATION_REQUIRED) {
      navigation.navigate("QuickScoreFlow", {
        screen: "MatchApprovalScreen",
        params: { matchId: notification.data.matchId },
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Live Streaming
    |--------------------------------------------------------------------------
    |
    | Three types, three different destinations - because sending all of
    | them to the generic detail screen is exactly how a person ends up
    | with a notification they cannot act on.
    |
    |   INVITE_RECEIVED  -> the invite screen, where they can read what
    |                       they are agreeing to before accepting.
    |
    |   STREAM_LIVE      -> the PLAYER. This notification says "there is
    |                       a picture"; opening a scorecard instead would
    |                       be a bait and switch.
    |
    |   INVITE_REVOKED   -> nothing to open. The match is no longer
    |                       theirs, and the detail screen is the honest
    |                       place for a message with no action.
    |
    */

    if (notification.type === NOTIFICATION_TYPES.BROADCAST_INVITE_RECEIVED) {
      navigation.navigate("BroadcastInviteScreen", {
        matchId: notification.data?.matchId,
        angle: notification.data?.angle,
      });

      return;
    }

    if (notification.type === NOTIFICATION_TYPES.FOLLOWED_STREAM_LIVE) {
      navigation.navigate("WatchLiveScreen", {
        matchId: notification.data?.matchId,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Tournament
    |--------------------------------------------------------------------------
    |
    | Three destinations, by who is being told and what they can do:
    |
    |   INVITE_RECEIVED  -> the full invite screen, where the captain sees
    |                       the organizer, the format, the dates, the
    |                       grounds and the prizes BEFORE answering. The
    |                       Accept button on the card is the shortcut; this
    |                       is the considered version, and committing six
    |                       weekends deserves it.
    |
    |   JOIN_REQUEST     -> the manage screen, because approving is only
    |                       one of the things the organizer is about to do
    |                       and the others are all there.
    |
    |   everything else  -> the tournament itself. Fixtures being out, a
    |                       scorer being appointed, a cancellation - all of
    |                       them are answered by looking at the tournament.
    |
    */

    if (notification.type === NOTIFICATION_TYPES.TOURNAMENT_INVITE_RECEIVED) {
      navigation.navigate("TournamentInviteScreen", {
        tournamentId: notification.data?.tournamentId,
        teamId: notification.data?.teamId,
      });

      return;
    }

    if (notification.type === NOTIFICATION_TYPES.TOURNAMENT_JOIN_REQUEST) {
      navigation.navigate("ManageTournamentScreen", {
        tournamentId: notification.data?.tournamentId,
      });

      return;
    }

    if (notification.data?.tournamentId) {
      navigation.navigate("TournamentDetailScreen", {
        tournamentId: notification.data.tournamentId,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Series
    |--------------------------------------------------------------------------
    |
    | Every series notification opens the series itself - including the
    | invite. There is no separate invite screen: SeriesDetailScreen puts
    | an accept strip at the top and the format, dates, grounds and prizes
    | directly underneath, which is more than a dedicated screen would
    | show.
    */

    if (notification.data?.seriesId) {
      navigation.navigate("SeriesDetailScreen", {
        seriesId: notification.data.seriesId,
      });

      return;
    }

    navigation.navigate("NotificationDetailScreen", {
      notification,
      onAccept: handleAccept,
      onReject: handleReject,
    });
  };

  const renderItem = ({ item }) => (
    <NotificationCard
      notification={item}
      selecting={selecting}
      selected={selectedIds.includes(item._id)}
      onToggleSelect={() => toggleSelected(item._id)}
      onPress={() => handlePress(item)}
      onAccept={() => handleAccept(item)}
      onReject={() => handleReject(item)}
    />
  );

  return (
    <SafeAreaView style={styles.screen}>
      {/* ------------------------------------------------------------ */}
      {/* Toolbar */}
      {/* ------------------------------------------------------------ */}

      <View style={toolbar.row}>
        {selecting ? (
          <>
            <TouchableOpacity
              style={toolbar.action}
              onPress={handleToggleSelectAll}
            >
              <Ionicons
                name={allSelected ? "checkbox" : "square-outline"}
                size={18}
                color={COLORS.primary}
              />
              <Text style={toolbar.actionText}>
                {allSelected ? "None" : "All"}
              </Text>
            </TouchableOpacity>

            <Text style={toolbar.count}>{selectedIds.length} selected</Text>

            <TouchableOpacity
              style={toolbar.action}
              onPress={handleMarkSelectedRead}
              disabled={selectedIds.length === 0}
            >
              <Ionicons
                name="mail-open-outline"
                size={18}
                color={
                  selectedIds.length ? COLORS.primary : COLORS.outline
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={toolbar.action}
              onPress={handleDeleteSelected}
              disabled={selectedIds.length === 0}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={selectedIds.length ? COLORS.error : COLORS.outline}
              />
            </TouchableOpacity>

            <TouchableOpacity style={toolbar.action} onPress={clearSelection}>
              <Text style={toolbar.actionText}>Done</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[toolbar.chip, unreadOnly && toolbar.chipOn]}
              onPress={() => setUnreadOnly(!unreadOnly)}
            >
              <Text
                style={[
                  toolbar.chipText,
                  unreadOnly && toolbar.chipTextOn,
                ]}
              >
                Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </Text>
            </TouchableOpacity>

            <View style={toolbar.spacer} />

            <TouchableOpacity
              style={toolbar.action}
              onPress={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              <Text
                style={[
                  toolbar.actionText,
                  unreadCount === 0 && toolbar.actionTextOff,
                ]}
              >
                Mark all read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={toolbar.action}
              onPress={() => setSelecting(true)}
            >
              <Text style={toolbar.actionText}>Select</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <NotificationFilter
        filters={NOTIFICATION_FILTERS}
        selectedFilter={filter}
        onSelectFilter={setFilter}
      />

      <FlatList
        refreshing={loading}
        onRefresh={getNotifications}
        data={filteredNotifications}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<NotificationEmpty />}
      />
    </SafeAreaView>
  );
}