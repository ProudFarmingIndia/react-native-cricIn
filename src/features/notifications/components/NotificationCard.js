import React, { useMemo } from "react";

import { View, Text, TouchableOpacity } from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";

import NotificationActionButtons from "./NotificationActionButtons";

import { NOTIFICATION_TYPES } from "../constants/notificationTypes";

import styles from "../styles/notification.styles";

import { timeAgo } from "../../../utils/timeAgo";

export default function NotificationCard({
  notification,
  onPress,
  onAccept,
  onReject,

  accepting = false,
  rejecting = false,

  /*
  | Multi-select. When `selecting` is on the whole card becomes a
  | checkbox target and the inline Accept/Reject buttons are suppressed -
  | tapping a row must mean one thing at a time.
  */
  selecting = false,
  selected = false,
  onToggleSelect,
}) {
  /*
  |--------------------------------------------------------------------------
  | Notification
  |--------------------------------------------------------------------------
  */

  const { type, title, message, createdAt, status, isRead } = notification;

  /*
  |--------------------------------------------------------------------------
  | Icon
  |--------------------------------------------------------------------------
  */

  const icon = useMemo(() => {
    switch (type) {
      /*
      |--------------------------------------------------------------------------
      | Invitations
      |--------------------------------------------------------------------------
      */

      case NOTIFICATION_TYPES.TEAM_INVITATION_RECEIVED:
        return {
          library: Ionicons,
          name: "person-add",
          color: "#16A34A",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.TEAM_INVITATION_ACCEPTED:
        return {
          library: Ionicons,
          name: "checkmark-circle",
          color: "#16A34A",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.TEAM_INVITATION_REJECTED:
        return {
          library: Ionicons,
          name: "close-circle",
          color: "#DC2626",
          background: "#FEE2E2",
        };

      case NOTIFICATION_TYPES.TEAM_INVITATION_CANCELLED:
      case NOTIFICATION_TYPES.TEAM_INVITATION_EXPIRED:
        return {
          library: Ionicons,
          name: "remove-circle",
          color: "#6B7280",
          background: "#F3F4F6",
        };

      /*
      |--------------------------------------------------------------------------
      | Team
      |--------------------------------------------------------------------------
      */

      case NOTIFICATION_TYPES.TEAM_CREATED:
        return {
          library: FontAwesome5,
          name: "users",
          color: "#0F766E",
          background: "#CCFBF1",
        };

      case NOTIFICATION_TYPES.PLAYER_JOINED_TEAM:
        return {
          library: Ionicons,
          name: "person",
          color: "#15803D",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.PLAYER_LEFT_TEAM:
        return {
          library: Ionicons,
          name: "person-remove",
          color: "#EF4444",
          background: "#FEE2E2",
        };

      case NOTIFICATION_TYPES.CAPTAIN_ASSIGNED:
        return {
          library: MaterialCommunityIcons,
          name: "crown",
          color: "#F59E0B",
          background: "#FEF3C7",
        };

      case NOTIFICATION_TYPES.VICE_CAPTAIN_PROPOSED:
        return {
          library: MaterialCommunityIcons,
          name: "crown-outline",
          color: "#D97706",
          background: "#FEF3C7",
        };

      case NOTIFICATION_TYPES.VICE_CAPTAIN_ASSIGNED:
        return {
          library: MaterialCommunityIcons,
          name: "crown-outline",
          color: "#D97706",
          background: "#FEF3C7",
        };

      case NOTIFICATION_TYPES.VICE_CAPTAIN_REJECTED:
        return {
          library: Ionicons,
          name: "close-circle-outline",
          color: "#6B7280",
          background: "#F3F4F6",
        };

      /*
      |--------------------------------------------------------------------------
      | Match
      |--------------------------------------------------------------------------
      */

      case NOTIFICATION_TYPES.MATCH_CREATED:
        return {
          library: MaterialCommunityIcons,
          name: "cricket",
          color: "#2563EB",
          background: "#DBEAFE",
        };

      case NOTIFICATION_TYPES.MATCH_REMINDER:
        return {
          library: Feather,
          name: "clock",
          color: "#2563EB",
          background: "#DBEAFE",
        };

      case NOTIFICATION_TYPES.MATCH_COMPLETED:
        return {
          library: Ionicons,
          name: "trophy",
          color: "#F59E0B",
          background: "#FEF3C7",
        };

      case NOTIFICATION_TYPES.MATCH_CANCELLED:
        return {
          library: Ionicons,
          name: "close-circle",
          color: "#DC2626",
          background: "#FEE2E2",
        };

      case NOTIFICATION_TYPES.MATCH_CONFIRMATION_REQUIRED:
        return {
          library: Ionicons,
          name: "shield-checkmark-outline",
          color: "#16A34A",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.MATCH_CONFIRMED:
        return {
          library: Ionicons,
          name: "checkmark-circle",
          color: "#16A34A",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.MATCH_CONFIRMATION_REJECTED:
        return {
          library: Ionicons,
          name: "close-circle",
          color: "#DC2626",
          background: "#FEE2E2",
        };

      /*
      |--------------------------------------------------------------------------
      | Match Challenges
      |--------------------------------------------------------------------------
      */

      case NOTIFICATION_TYPES.MATCH_CHALLENGE_RECEIVED:
        return {
          library: MaterialCommunityIcons,
          name: "sword-cross",
          color: "#16A34A",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.MATCH_CHALLENGE_ACCEPTED:
        return {
          library: Ionicons,
          name: "checkmark-circle",
          color: "#16A34A",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.MATCH_CHALLENGE_REJECTED:
        return {
          library: Ionicons,
          name: "close-circle",
          color: "#DC2626",
          background: "#FEE2E2",
        };

      case NOTIFICATION_TYPES.MATCH_CHALLENGE_CANCELLED:
        return {
          library: Ionicons,
          name: "remove-circle",
          color: "#6B7280",
          background: "#F3F4F6",
        };

      case NOTIFICATION_TYPES.MATCH_CHALLENGE_MODIFIED:
        return {
          library: Ionicons,
          name: "create-outline",
          color: "#D97706",
          background: "#FEF3C7",
        };

      /*
      |--------------------------------------------------------------------------
      | Ground
      |--------------------------------------------------------------------------
      */

      case NOTIFICATION_TYPES.GROUND_BOOKING_APPROVED:
        return {
          library: Ionicons,
          name: "location",
          color: "#0EA5E9",
          background: "#E0F2FE",
        };

      case NOTIFICATION_TYPES.GROUND_BOOKING_CANCELLED:
        return {
          library: Ionicons,
          name: "location-outline",
          color: "#6B7280",
          background: "#F3F4F6",
        };

      /*
      |--------------------------------------------------------------------------
      | Tournament
      |--------------------------------------------------------------------------
      */

      case NOTIFICATION_TYPES.TOURNAMENT_CREATED:
        return {
          library: FontAwesome5,
          name: "trophy",
          color: "#CA8A04",
          background: "#FEF9C3",
        };

      /*
      |--------------------------------------------------------------------------
      | Follow Activity
      |--------------------------------------------------------------------------
      |
      | Without these the six follow types all fell through to the grey
      | default bell, which made a followed team's result look identical to
      | a system message.
      |
      */

      case NOTIFICATION_TYPES.NEW_FOLLOWER:
        return {
          library: Ionicons,
          name: "person-add",
          color: "#0d631b",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.FOLLOWED_MATCH_LIVE:
        return {
          library: Ionicons,
          name: "radio",
          color: "#BA1A1A",
          background: "#FFDAD6",
        };

      /*
      |--------------------------------------------------------------------------
      | Live Streaming
      |--------------------------------------------------------------------------
      |
      | The invite is the only actionable one here, so it gets the amber
      | of every other "you need to answer this" notification in the app -
      | the same colour as a vice-captain proposal. The rest are news and
      | stay muted.
      |
      | A stream going live gets a camera in red rather than the radio
      | icon used for scoring going live, because the two land in the same
      | list on the same match and must not look identical.
      |
      */

      case NOTIFICATION_TYPES.BROADCAST_INVITE_RECEIVED:
        return {
          library: Ionicons,
          name: "videocam",
          color: "#8F4E00",
          background: "#FFEDD5",
        };

      case NOTIFICATION_TYPES.BROADCAST_INVITE_ACCEPTED:
        return {
          library: Ionicons,
          name: "checkmark-circle",
          color: "#16A34A",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.BROADCAST_INVITE_DECLINED:
      case NOTIFICATION_TYPES.BROADCAST_INVITE_REVOKED:
        return {
          library: Ionicons,
          name: "videocam-off",
          color: "#6B7280",
          background: "#F3F4F6",
        };

      case NOTIFICATION_TYPES.FOLLOWED_STREAM_LIVE:
        return {
          library: Ionicons,
          name: "videocam",
          color: "#BA1A1A",
          background: "#FFDAD6",
        };

      case NOTIFICATION_TYPES.RECORDING_EXPIRING:
        return {
          library: Ionicons,
          name: "time",
          color: "#8F4E00",
          background: "#FFEDD5",
        };

      /*
      |--------------------------------------------------------------------------
      | Tournament
      |--------------------------------------------------------------------------
      |
      | Two colours, split by whether the person has to do something.
      |
      | Amber - answer needed: the invite to a captain, the join request to
      | an organizer. Same amber as every other "you need to answer this"
      | in the app, so an unread list reads at a glance.
      |
      | Green - news: fixtures are out, a scorer was appointed, an invite
      | was answered. Muted grey for the ones that take something away,
      | red for a cancelled tournament, which is the only bad news here.
      |
      */

      case NOTIFICATION_TYPES.TOURNAMENT_INVITE_RECEIVED:
      case NOTIFICATION_TYPES.TOURNAMENT_JOIN_REQUEST:
        return {
          library: Ionicons,
          name: "medal",
          color: "#8F4E00",
          background: "#FFEDD5",
        };

      case NOTIFICATION_TYPES.TOURNAMENT_INVITE_ACCEPTED:
        return {
          library: Ionicons,
          name: "checkmark-circle",
          color: "#16A34A",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.TOURNAMENT_INVITE_DECLINED:
      case NOTIFICATION_TYPES.TOURNAMENT_SCORER_REVOKED:
        return {
          library: Ionicons,
          name: "close-circle",
          color: "#6B7280",
          background: "#F3F4F6",
        };

      case NOTIFICATION_TYPES.TOURNAMENT_FIXTURES_READY:
        return {
          library: Ionicons,
          name: "calendar",
          color: "#0d631b",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.TOURNAMENT_MATCH_REMINDER:
        return {
          library: Ionicons,
          name: "alarm",
          color: "#0d631b",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.TOURNAMENT_SCORER_ASSIGNED:
        return {
          library: Ionicons,
          name: "create",
          color: "#0d631b",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.TOURNAMENT_CANCELLED:
        return {
          library: Ionicons,
          name: "alert-circle",
          color: "#BA1A1A",
          background: "#FFDAD6",
        };

      /*
      |--------------------------------------------------------------------------
      | Series
      |--------------------------------------------------------------------------
      |
      | Same amber-for-action, green-for-news split as the tournament
      | block above. The icon differs on purpose: a series is two teams
      | facing each other, so it gets the compare arrows rather than the
      | medal - the two land in the same list and must not look identical.
      |
      */

      case NOTIFICATION_TYPES.SERIES_INVITE_RECEIVED:
        return {
          library: Ionicons,
          name: "git-compare",
          color: "#8F4E00",
          background: "#FFEDD5",
        };

      case NOTIFICATION_TYPES.SERIES_INVITE_ACCEPTED:
        return {
          library: Ionicons,
          name: "checkmark-circle",
          color: "#16A34A",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.SERIES_INVITE_DECLINED:
      case NOTIFICATION_TYPES.SERIES_SCORER_REVOKED:
        return {
          library: Ionicons,
          name: "close-circle",
          color: "#6B7280",
          background: "#F3F4F6",
        };

      case NOTIFICATION_TYPES.SERIES_FIXTURES_READY:
        return {
          library: Ionicons,
          name: "calendar",
          color: "#0d631b",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.SERIES_MATCH_REMINDER:
        return {
          library: Ionicons,
          name: "alarm",
          color: "#0d631b",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.SERIES_SCORER_ASSIGNED:
        return {
          library: Ionicons,
          name: "create",
          color: "#0d631b",
          background: "#DCFCE7",
        };

      case NOTIFICATION_TYPES.SERIES_CANCELLED:
        return {
          library: Ionicons,
          name: "alert-circle",
          color: "#BA1A1A",
          background: "#FFDAD6",
        };

      case NOTIFICATION_TYPES.FOLLOWED_MATCH_RESULT:
        return {
          library: FontAwesome5,
          name: "flag-checkered",
          color: "#0d631b",
          background: "#DCFCE7",
        };

      /*
      | The award and the milestone share the trophy/medal family, but the
      | award the player won themselves is gold - it is about them, not
      | about someone they follow.
      */

      case NOTIFICATION_TYPES.PLAYER_OF_THE_MATCH:
        return {
          library: FontAwesome5,
          name: "medal",
          color: "#CA8A04",
          background: "#FEF9C3",
        };

      case NOTIFICATION_TYPES.FOLLOWED_PLAYER_AWARD:
        return {
          library: FontAwesome5,
          name: "medal",
          color: "#8f4e00",
          background: "#FFEDD5",
        };

      case NOTIFICATION_TYPES.FOLLOWED_PLAYER_MILESTONE:
        return {
          library: Ionicons,
          name: "trending-up",
          color: "#8f4e00",
          background: "#FFEDD5",
        };

      /*
      |--------------------------------------------------------------------------
      | Default
      |--------------------------------------------------------------------------
      */

      default:
        return {
          library: Ionicons,
          name: "notifications",
          color: "#6B7280",
          background: "#F3F4F6",
        };
    }
  }, [type]);

  /*
  |--------------------------------------------------------------------------
  | Icon Component
  |--------------------------------------------------------------------------
  */

  const IconComponent = icon.library;

  /*
  |--------------------------------------------------------------------------
  | Actionable Notifications
  |--------------------------------------------------------------------------
  |
  | Only "received/required/proposed" notifications are actionable - the
  | accepted/rejected/cancelled variants are one-way confirmations sent
  | to the other party and should never show Accept/Reject buttons.
  |
  | IMPORTANT: this list must cover every actionable type. Missing one
  | here means its backend status enrichment works perfectly but the
  | buttons just never render - exactly what happened to vice-captain
  | proposals and match challenges, which had this gate hardcoded to
  | team invitations only for weeks before it was caught.
  |
  */

  const ACTIONABLE_TYPES = [
    NOTIFICATION_TYPES.TEAM_INVITATION_RECEIVED,
    NOTIFICATION_TYPES.VICE_CAPTAIN_PROPOSED,
    NOTIFICATION_TYPES.MATCH_CHALLENGE_RECEIVED,
    NOTIFICATION_TYPES.MATCH_CONFIRMATION_REQUIRED,

    /*
    | The camera invite. NotificationScreen has had accept and reject
    | handlers for it since live streaming shipped, but the type was never
    | added here - so the handlers were unreachable and the only way to
    | answer was to tap through to the invite screen. Exactly the failure
    | the note above describes.
    */
    NOTIFICATION_TYPES.BROADCAST_INVITE_RECEIVED,

    /*
    | Tournament invite to a captain, and a team's join request to the
    | organizer. Both answerable in place: the organizer is chasing eight
    | captains and cannot generate fixtures until they all answer, so
    | every tap saved is real.
    */
    NOTIFICATION_TYPES.TOURNAMENT_INVITE_RECEIVED,
    NOTIFICATION_TYPES.TOURNAMENT_JOIN_REQUEST,

    /*
    | The series challenge to an opponent captain. It is the only decision
    | anybody other than the organizer makes in a whole series, and the
    | organizer cannot generate a single fixture until it is answered - so
    | answering it in place is worth the two buttons.
    */
    NOTIFICATION_TYPES.SERIES_INVITE_RECEIVED,
  ];

  const isInvitation = ACTIONABLE_TYPES.includes(type) && !selecting;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.notificationCard,
        !isRead && styles.unreadNotification,
        selected && styles.selectedNotification,
      ]}
      onPress={() =>
        selecting
          ? onToggleSelect?.(notification)
          : onPress?.(notification)
      }
      onLongPress={() => onToggleSelect?.(notification)}
    >
      {selecting && (
        <View style={[styles.checkbox, selected && styles.checkboxOn]}>
          {selected && <Text style={styles.checkboxTick}>✓</Text>}
        </View>
      )}

      {/* ------------------------------------------------------- */}
      {/* Left Icon */}
      {/* ------------------------------------------------------- */}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: icon.background,
          },
        ]}
      >
        <IconComponent name={icon.name} size={24} color={icon.color} />
      </View>

      {/* ------------------------------------------------------- */}
      {/* Content */}
      {/* ------------------------------------------------------- */}

      <View style={styles.content}>
        {/* Title */}

        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>

          {!isRead && <View style={styles.unreadDot} />}
        </View>

        {/* Message */}

        <Text numberOfLines={2} style={styles.message}>
          {message}
        </Text>

        {/* Footer */}

        <View style={styles.footer}>
          {/* was the raw ISO string straight from the API */}
          <Text style={styles.time}>{timeAgo(createdAt)}</Text>

          {isInvitation && (
            <NotificationActionButtons
                status={status}
                accepting={accepting}
                rejecting={rejecting}
                onAccept={() => onAccept?.(notification)}
                onReject={() => onReject?.(notification)}
/>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}