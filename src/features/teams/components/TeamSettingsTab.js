import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Team Settings Tab
|--------------------------------------------------------------------------
|
| Each row shows the CURRENT value (read-only) as its subtitle, not just
| a generic description - "Captain: A. Rahman" rather than just "Assign
| new captain" - so you can see the state of the team without having to
| tap into each edit screen first.
*/

export default function TeamSettingsTab({
  team,

  onEditTeam,

  onManagePlayers,

  onAvailability,

  onCaptain,

  onViceCaptain,

  onDeleteTeam,

  onLeaveTeam,

  canEdit = false,

  canManagePlayers = false,

  canAssignCaptain = false,

  canDelete = false,

  canLeave = true,
}) {
  const captainName = team?.captainId?.playerName || "Not assigned";

  const viceCaptainName = team?.viceCaptainId?.playerName;

  const viceCaptainSubtitle = viceCaptainName
    ? viceCaptainSummary(team?.viceCaptainRights)
    : "Not assigned";

  return (
    <View style={styles.container}>
      {/* ---------------------------------------------------------- */}
      {/* Team */}
      {/* ---------------------------------------------------------- */}

      <Text style={styles.sectionTitle}>
        Team
      </Text>

      {canEdit && (
        <SettingItem
          icon="create-outline"
          title="Edit Team"
          subtitle={team?.teamName ? `${team.teamName} · Update info & logo` : "Update team information"}
          onPress={onEditTeam}
        />
      )}

      {canManagePlayers && (
        <SettingItem
          icon="people-outline"
          title="Manage Players"
          subtitle={`${team?.players?.length || 0} players in squad`}
          onPress={onManagePlayers}
        />
      )}

      {canEdit && (
        <SettingItem
          icon="calendar-outline"
          title="Availability"
          subtitle="Set when your team is free to play"
          onPress={onAvailability}
        />
      )}

      {/* ---------------------------------------------------------- */}
      {/* Leadership */}
      {/* ---------------------------------------------------------- */}

      {canAssignCaptain && (
        <>
          <Text style={styles.sectionTitle}>
            Leadership
          </Text>

          <SettingItem
            icon="ribbon-outline"
            title="Captain"
            subtitle={captainName}
            onPress={onCaptain}
          />

          <SettingItem
            icon="star-outline"
            title="Vice-Captain"
            subtitle={viceCaptainSubtitle}
            onPress={onViceCaptain}
          />
        </>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Danger Zone */}
      {/* ---------------------------------------------------------- */}
      {/*
        The owner sees both: Delete ends the team for everyone, Leave hands
        it to another member and steps away. Everyone else sees Leave only,
        since deleting is the owner's alone.

        Delete comes first because it is the more consequential of the two.
        The header is hidden when neither row applies, so the section never
        renders as a bare title.
      */}

      {(canLeave || canDelete) && (
        <Text style={styles.sectionTitle}>Danger Zone</Text>
      )}

      {canDelete && (
        <SettingItem
          danger
          icon="trash-outline"
          title="Delete Team"
          subtitle="This action cannot be undone"
          onPress={onDeleteTeam}
        />
      )}

      {canLeave && (
        <SettingItem
          danger
          icon="exit-outline"
          title="Leave Team"
          subtitle={
            canDelete
              ? "Hand the team to another member and step away"
              : "You will no longer be a member"
          }
          onPress={onLeaveTeam}
        />
      )}
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Vice-Captain Rights Summary
|--------------------------------------------------------------------------
*/

function viceCaptainSummary(rights) {
  if (!rights) return "No rights granted yet";

  const granted = [];

  if (rights.canEditTeam) granted.push("Edit Team");
  if (rights.canManagePlayers) granted.push("Manage Players");
  if (rights.canSendInvitations) granted.push("Invitations");

  return granted.length > 0 ? granted.join(", ") : "No rights granted yet";
}

/*
|--------------------------------------------------------------------------
| Setting Item
|--------------------------------------------------------------------------
*/

function SettingItem({
  icon,

  title,

  subtitle,

  onPress,

  danger = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.item}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,

          danger && styles.dangerIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={
            danger
              ? COLORS.error
              : COLORS.primary
          }
        />
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,

            danger && styles.dangerText,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={COLORS.outline}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.onSurface,

    marginBottom: 12,

    marginTop: 12,
  },

  item: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      COLORS.surfaceContainerLowest,

    borderRadius: 14,

    padding: 14,

    marginBottom: 12,

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  iconContainer: {
    width: 46,

    height: 46,

    borderRadius: 23,

    backgroundColor:
      COLORS.primaryContainer,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 14,
  },

  dangerIcon: {
    backgroundColor: COLORS.errorContainer,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  subtitle: {
    marginTop: 4,

    fontSize: 13,

    color: COLORS.onSurfaceVariant,
  },

  dangerText: {
    color: COLORS.error,
  },
});