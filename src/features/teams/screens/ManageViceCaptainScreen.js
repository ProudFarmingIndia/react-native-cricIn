import React, { useState, useCallback, useEffect } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import useTeam from "../hooks/useTeam";
import useViceCaptainProposal from "../../viceCaptain/hooks/useViceCaptainProposal";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Manage Vice-Captain Screen
|--------------------------------------------------------------------------
|
| Three states, depending on the team's current situation:
|   1. No vice-captain, no pending proposal -> pick someone from the squad
|   2. A proposal is pending, waiting on their response -> show it,
|      allow cancelling
|   3. A vice-captain is confirmed -> toggle their specific rights, or
|      revoke the role entirely
|
| Only reachable when canAssignCaptain is true (owner/captain) - granting
| rights is never delegable to the vice-captain themselves.
*/

export default function ManageViceCaptainScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { teamId, team: teamFromParams } = route.params || {};

  const { currentTeam, getTeamById, revokeViceCaptain, updateViceCaptainRights } = useTeam();

  /*
  |--------------------------------------------------------------------------
  | Team - Live, Not A Stale Snapshot
  |--------------------------------------------------------------------------
  |
  | route.params.team is a one-time snapshot from whenever navigation
  | happened - it never reflects a vice-captain accepting (or any other
  | change) that happens afterward. currentTeam (from useTeam, backed by
  | Redux) is refetched below on every focus, so it's what should
  | actually drive currentViceCaptain - the params version is only a
  | fallback for the very first render before that fetch resolves.
  |
  */

  const team = currentTeam?._id === teamId ? currentTeam : teamFromParams;

  const {
    teamProposal,
    getTeamProposal,
    proposeViceCaptain,
    cancelProposal,
    loading,
  } = useViceCaptainProposal();

  const [rights, setRights] = useState({
    canEditTeam: teamFromParams?.viceCaptainRights?.canEditTeam || false,
    canManagePlayers: teamFromParams?.viceCaptainRights?.canManagePlayers || false,
    canSendInvitations: teamFromParams?.viceCaptainRights?.canSendInvitations || false,
  });

  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getTeamById(teamId);
      getTeamProposal(teamId);
    }, [teamId, getTeamById, getTeamProposal]),
  );

  /*
  |--------------------------------------------------------------------------
  | Keep Rights Toggles In Sync With The Live Team
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (team?.viceCaptainRights) {
      setRights({
        canEditTeam: team.viceCaptainRights.canEditTeam || false,
        canManagePlayers: team.viceCaptainRights.canManagePlayers || false,
        canSendInvitations: team.viceCaptainRights.canSendInvitations || false,
      });
    }
  }, [team?.viceCaptainId, team?.viceCaptainRights]);

  const currentViceCaptain = team?.viceCaptainId;

  /*
  |--------------------------------------------------------------------------
  | Propose (No VC, No Pending Proposal)
  |--------------------------------------------------------------------------
  */

  const handlePropose = async (player) => {
    const result = await proposeViceCaptain(teamId, player._id);

    if (!result.success) {
      Alert.alert("Failed", result.error || "Could not send the proposal.");
      return;
    }

    Alert.alert("Proposal Sent", `Waiting for ${player.playerName} to respond.`);
  };

  const handleCancelProposal = () => {
    Alert.alert("Cancel Proposal", "Withdraw this vice-captain proposal?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          const result = await cancelProposal(teamProposal._id);

          if (!result.success) {
            Alert.alert("Failed", result.error || "Could not cancel the proposal.");
          }
        },
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Rights & Revoke (VC Confirmed)
  |--------------------------------------------------------------------------
  */

  const handleSaveRights = async () => {
    setSaving(true);

    const result = await updateViceCaptainRights(teamId, rights);

    setSaving(false);

    if (!result.success) {
      Alert.alert("Failed", result.error || "Could not update rights.");
      return;
    }

    getTeamById(teamId);
    Alert.alert("Saved", "Vice-captain rights updated.");
  };

  const handleRevoke = () => {
    Alert.alert(
      "Revoke Vice-Captain",
      `Remove ${currentViceCaptain?.playerName || "this player"} as vice-captain?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            const result = await revokeViceCaptain(teamId);

            if (!result.success) {
              Alert.alert("Failed", result.error || "Could not revoke the role.");
              return;
            }

            navigation.goBack();
          },
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render - Confirmed Vice-Captain
  |--------------------------------------------------------------------------
  */

  if (currentViceCaptain) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.confirmedContent}>
          <View style={styles.currentCard}>
            <Image
              source={{ uri: currentViceCaptain?.profileImage?.url || "https://placehold.co/100" }}
              style={styles.avatar}
            />

            <View style={styles.currentDetails}>
              <Text style={styles.currentLabel}>Current Vice-Captain</Text>
              <Text style={styles.currentName}>{currentViceCaptain.playerName}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Rights</Text>

          <RightRow
            label="Edit Team Info & Logo"
            value={rights.canEditTeam}
            onChange={(v) => setRights((prev) => ({ ...prev, canEditTeam: v }))}
          />

          <RightRow
            label="Manage Players (Add/Remove)"
            value={rights.canManagePlayers}
            onChange={(v) => setRights((prev) => ({ ...prev, canManagePlayers: v }))}
          />

          <RightRow
            label="Send Invitations"
            value={rights.canSendInvitations}
            onChange={(v) => setRights((prev) => ({ ...prev, canSendInvitations: v }))}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveRights} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <Text style={styles.saveButtonText}>Save Rights</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.revokeButton} onPress={handleRevoke}>
            <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
            <Text style={styles.revokeButtonText}>Revoke Vice-Captain</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render - Pick Someone (Also Shows Pending Status Inline, If Any)
  |--------------------------------------------------------------------------
  |
  | If a proposal is already pending, that candidate's row shows a
  | "Pending" badge with a Cancel action instead of the usual chevron.
  | Tapping any OTHER player sends a new proposal, which automatically
  | cancels the pending one first (see proposeViceCaptain on the
  | backend) - no need to explicitly cancel before picking someone else.
  */

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.selectContent}>
        <Text style={styles.sectionTitle}>Select Vice-Captain</Text>

        <Text style={styles.helperText}>
          They'll need to accept before the role is confirmed.
        </Text>

        {teamProposal && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={16} color={COLORS.secondary} />
            <Text style={styles.pendingBannerText}>
              Waiting for {teamProposal.playerId?.playerName} to respond
            </Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        ) : (
          (team?.players || [])
            .filter((p) => p._id !== team?.captainId?._id)
            .map((player) => {
              const isPendingCandidate =
                teamProposal && String(teamProposal.playerId?._id) === String(player._id);

              return (
                <TouchableOpacity
                  key={player._id}
                  style={[styles.playerRow, isPendingCandidate && styles.playerRowPending]}
                  onPress={() =>
                    isPendingCandidate ? handleCancelProposal() : handlePropose(player)
                  }
                >
                  <Image
                    source={{ uri: player?.profileImage?.url || "https://placehold.co/100" }}
                    style={styles.smallAvatar}
                  />

                  <Text style={styles.playerName}>{player.playerName}</Text>

                  {isPendingCandidate ? (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pending · Cancel</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={COLORS.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              );
            })
        )}
      </ScrollView>
    </View>
  );
}

function RightRow({ label, value, onChange }) {
  return (
    <View style={styles.rightRow}>
      <Text style={styles.rightLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.outlineVariant, true: COLORS.primaryContainer }}
        thumbColor={value ? COLORS.primary : "#fff"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  confirmedContent: {
    padding: 16,
    paddingBottom: 140,
  },

  currentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  currentDetails: {
    flex: 1,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceVariant,
    marginRight: 14,
  },

  currentLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: "700",
  },

  currentName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 4,
  },

  helperText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginBottom: 16,
  },

  selectContent: {
    padding: 16,
  },

  loadingIndicator: {
    marginTop: 40,
  },

  rightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  rightLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
    marginRight: 10,
  },

  saveButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  saveButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },

  revokeButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
  },

  revokeButtonText: {
    marginLeft: 6,
    color: COLORS.error,
    fontWeight: "700",
  },

  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },

  pendingBannerText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  playerRowPending: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surfaceContainer,
  },

  pendingBadge: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  pendingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceVariant,
    marginRight: 12,
  },

  playerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.onSurface,
  },
});