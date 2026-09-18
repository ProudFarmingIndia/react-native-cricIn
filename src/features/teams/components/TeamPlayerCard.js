import React from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Squad status ribbon
|--------------------------------------------------------------------------
|
| A player who has been invited but has not answered yet is NOT in the
| squad - createLocalPlayer raises a PENDING invitation instead of pushing
| them into team.players. Without a ribbon they would either be invisible
| (confusing: "I just added them") or indistinguishable from a real squad
| member (worse: a captain picks an XI containing someone who never
| agreed to play).
|
| ACCEPTED gets no ribbon at all. Marking the normal case is noise - the
| ribbon exists to flag the exceptions.
*/

const STATUS_STYLE = {
  PENDING: { label: "Pending", background: "#FFF3CD", text: "#8F4E00" },
  REJECTED: { label: "Declined", background: "#FFDAD6", text: "#93000A" },
  CANCELLED: { label: "Cancelled", background: "#E5EAE0", text: "#40493D" },
  EXPIRED: { label: "Expired", background: "#E5EAE0", text: "#40493D" },
};

export default function TeamPlayerCard({
  player,
  team,
  onPress,
  canManage = false,
  onRemove,
  /*
  | One of the invitation statuses, or undefined for a confirmed member.
  | "ACCEPTED" is accepted too and deliberately renders nothing.
  */
  invitationStatus,
}) {
  const ribbon = STATUS_STYLE[String(invitationStatus || "").toUpperCase()];
  /*
  |--------------------------------------------------------------------------
  | Leadership
  |--------------------------------------------------------------------------
  */

  const isCaptain =
    String(team?.captainId?._id) ===
    String(player?._id);

  const isViceCaptain =
    String(team?.viceCaptainId?._id) ===
    String(player?._id);

  /*
  |--------------------------------------------------------------------------
  | Owner
  |--------------------------------------------------------------------------
  |
  | The team owner is always in the squad but can never be removed from
  | it - they'd have to delete the whole team instead.
  |
  */

  const isOwner =
    String(player?.userId?._id || player?.userId) ===
    String(team?.userId?._id || team?.userId);

  const canRemove = canManage && !isOwner;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      /*
      | The ribbon is absolutely positioned against this card. A View is
      | already position:"relative" by default in React Native, so no extra
      | style is needed - but the card has padding:14 and rounded corners,
      | so the ribbon carries a matching borderTopRightRadius to sit flush.
      */
      style={styles.card}
      onPress={() => onPress?.(player)}
    >
      {/* ------------------------------------------------------- */}
      {/* Left */}
      {/* ------------------------------------------------------- */}

      <View style={styles.leftSection}>
        <Image
          source={{
            uri:
              player?.profileImage?.url ||
              "https://placehold.co/100",
          }}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <Text style={styles.playerName}>
            {player?.playerName}
          </Text>

          <Text style={styles.playerRole}>
            {player?.playerType || "Player"}
          </Text>
        </View>
      </View>

      {/* ------------------------------------------------------- */}
      {/* Right */}
      {/* ------------------------------------------------------- */}

      <View style={styles.rightSection}>
        {isCaptain && (
          <View
            style={[
              styles.badge,
              styles.captainBadge,
            ]}
          >
            <Text style={styles.badgeText}>
              CPT
            </Text>
          </View>
        )}

        {isViceCaptain && (
          <View
            style={[
              styles.badge,
              styles.viceCaptainBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    COLORS.onSecondaryContainer,
                },
              ]}
            >
              VC
            </Text>
          </View>
        )}

        {canRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            activeOpacity={0.7}
            onPress={(event) => {
              event.stopPropagation();
              onRemove?.(player);
            }}
          >
            <Ionicons
              name="close-circle"
              size={22}
              color={COLORS.error}
            />
          </TouchableOpacity>
        )}

        <Ionicons
          name="chevron-forward"
          size={18}
          color={COLORS.onSurfaceVariant}
        />
      </View>

      {!!ribbon && (
        <View
          style={[styles.ribbon, { backgroundColor: ribbon.background }]}
          accessibilityLabel={`Invitation ${ribbon.label}`}
        >
          <Text style={[styles.ribbonText, { color: ribbon.text }]}>
            {ribbon.label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      COLORS.surfaceContainerLowest,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,

    padding: 14,

    marginBottom: 12,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  ribbon: {
    position: "absolute",

    top: 0,

    right: 0,

    paddingHorizontal: 10,

    paddingVertical: 3,

    /* Matches the card's own borderRadius so the corner stays clean. */
    borderTopRightRadius: 15,

    borderBottomLeftRadius: 10,
  },

  ribbonText: {
    fontSize: 10,

    fontWeight: "800",

    letterSpacing: 0.4,

    textTransform: "uppercase",
  },

  leftSection: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  avatar: {
    width: 54,

    height: 54,

    borderRadius: 27,

    backgroundColor:
      COLORS.surfaceVariant,
  },

  info: {
    marginLeft: 14,

    flex: 1,
  },

  playerName: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  playerRole: {
    marginTop: 4,

    fontSize: 13,

    color:
      COLORS.onSurfaceVariant,
  },

  rightSection: {
    flexDirection: "row",

    alignItems: "center",
  },

  removeButton: {
    marginRight: 10,
    padding: 2,
  },

  badge: {
    paddingHorizontal: 10,

    paddingVertical: 4,

    borderRadius: 8,

    marginRight: 8,
  },

  captainBadge: {
    backgroundColor:
      COLORS.primary,
  },

  viceCaptainBadge: {
    backgroundColor:
      COLORS.secondaryContainer,
  },

  badgeText: {
    color: "#FFFFFF",

    fontWeight: "700",

    fontSize: 11,
  },
});