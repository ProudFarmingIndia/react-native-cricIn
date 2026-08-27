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

export default function NotificationCard({
  notification,
  onPress,
  onAccept,
  onReject,

  accepting = false,
  rejecting = false,
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
  ];

  const isInvitation = ACTIONABLE_TYPES.includes(type);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.notificationCard, !isRead && styles.unreadNotification]}
      onPress={() => onPress?.(notification)}
    >
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
          <Text style={styles.time}>{createdAt}</Text>

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