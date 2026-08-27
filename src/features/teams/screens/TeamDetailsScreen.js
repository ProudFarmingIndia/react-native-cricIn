import React, { useState, useCallback } from "react";

import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

import {
  useRoute,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";

import { useSelector } from "react-redux";

import { COLORS } from "../../../constants/colors";

import useTeam from "../hooks/useTeam";

import TeamHeader from "../components/TeamHeader";
import TeamStatsOverview from "../components/TeamStatsOverview";
import TeamTabBar from "../components/TeamTabBar";

import TeamOverviewTab from "../components/TeamOverviewTab";
import TeamPlayersTab from "../components/TeamPlayersTab";
import TeamMatchesTab from "../components/TeamMatchesTab";
import TeamStatisticsTab from "../components/TeamStatisticsTab";
import TeamSettingsTab from "../components/TeamSettingsTab";
import AssignRoleModal from "../components/AssignRoleModal";

export default function TeamDetailsScreen() {
  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigation = useNavigation();

  const route = useRoute();

  const { teamId } = route.params;

  /*
  |--------------------------------------------------------------------------
  | Hook
  |--------------------------------------------------------------------------
  */

  const {
    currentTeam,

    loading,

    getTeamById,

    deleteTeam,

    leaveTeam,

    removePlayerFromTeam,

    setCaptain,
  } = useTeam();

  /*
  |--------------------------------------------------------------------------
  | Current Identity
  |--------------------------------------------------------------------------
  |
  | Owner is a User reference on the team (team.userId). Captain and
  | Vice-Captain are Player references - so we need both the logged-in
  | user's id AND their player profile id to work out what they're
  | allowed to do here.
  |
  */

  const authUser = useSelector((state) => state.auth.user);

  const myPlayer = useSelector((state) => state.profile.profile);

  const myUserId = authUser?._id;

  const myPlayerId = myPlayer?._id;

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [activeTab, setActiveTab] = useState(0);

  const [captainModalOpen, setCaptainModalOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Team
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      getTeamById(teamId);
    }, [teamId, getTeamById]),
  );

  /*
  |--------------------------------------------------------------------------
  | Loader
  |--------------------------------------------------------------------------
  */

  if (loading || !currentTeam) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Permissions
  |--------------------------------------------------------------------------
  |
  | Owner, Captain, and Vice-Captain all have equal management rights.
  | Only the Owner can delete the team. Owner cannot leave (they'd have
  | to delete instead) - everyone else can.
  |
  */

  const ownerId =
    currentTeam?.userId?._id || currentTeam?.userId;

  const isOwner = String(ownerId) === String(myUserId);

  const isCaptain =
    String(currentTeam?.captainId?._id) === String(myPlayerId);

  const isViceCaptain =
    String(currentTeam?.viceCaptainId?._id) === String(myPlayerId);

  const canManage = isOwner || isCaptain || isViceCaptain;

  /*
  |--------------------------------------------------------------------------
  | Handlers - Team
  |--------------------------------------------------------------------------
  */

  const handleEditTeam = () => {
    navigation.navigate("TeamStack", {
      screen: "EditTeamScreen",
      params: {
        teamId,
        team: currentTeam,
      },
    });
  };

  const handleManagePlayers = () => {
    navigation.navigate("TeamStack", {
      screen: "AddPlayerScreen",
      params: {
        teamId,
        team: currentTeam,
        showSuccessBanner: false,
      },
    });
  };

  const handleAvailability = () => {
    navigation.navigate("TeamStack", {
      screen: "TeamAvailabilityScreen",
      params: {
        teamId,
        team: currentTeam,
      },
    });
  };

  const handlePlayerPress = (player) => {
    navigation.navigate("TeamStack", {
      screen: "PlayerProfileScreen",
      params: {
        playerId: player._id,
      },
    });
  };

  const handleDeleteTeam = () => {
    Alert.alert(
      "Delete Team",
      `This will permanently delete ${currentTeam.teamName}. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteTeam(teamId);

            if (result?.error) {
              Alert.alert("Failed", result.error);
              return;
            }

            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleLeaveTeam = () => {
    Alert.alert(
      "Leave Team",
      `You will no longer be a member of ${currentTeam.teamName}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            const result = await leaveTeam(teamId);

            if (result?.error) {
              Alert.alert("Failed", result.error);
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
  | Handlers - Players
  |--------------------------------------------------------------------------
  */

  const handleRemovePlayer = (player) => {
    Alert.alert(
      "Remove Player",
      `Remove ${player.playerName} from the squad?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removePlayerFromTeam(teamId, player._id),
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Handlers - Roles
  |--------------------------------------------------------------------------
  */

  const handleSelectCaptain = async (playerId) => {
    await setCaptain(teamId, playerId);
    setCaptainModalOpen(false);
  };

  const handleManageViceCaptain = () => {
    navigation.navigate("TeamStack", {
      screen: "ManageViceCaptainScreen",
      params: {
        teamId,
        team: currentTeam,
      },
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TeamHeader team={currentTeam} />

        <TeamStatsOverview team={currentTeam} />

        <TeamTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === 0 && (
          <TeamOverviewTab team={currentTeam} />
        )}

        {activeTab === 1 && (
          <TeamPlayersTab
            team={currentTeam}
            canManage={canManage}
            onRemovePlayer={handleRemovePlayer}
            onPlayerPress={handlePlayerPress}
          />
        )}

        {activeTab === 2 && (
          <TeamMatchesTab team={currentTeam} />
        )}

        {activeTab === 3 && (
          <TeamStatisticsTab team={currentTeam} />
        )}

        {activeTab === 4 && (
          <TeamSettingsTab
            team={currentTeam}
            canEdit={canManage}
            canManagePlayers={canManage}
            canAssignCaptain={isOwner || isCaptain}
            canDelete={isOwner}
            canLeave={!isOwner}
            onEditTeam={handleEditTeam}
            onManagePlayers={handleManagePlayers}
            onAvailability={handleAvailability}
            onCaptain={() => setCaptainModalOpen(true)}
            onViceCaptain={handleManageViceCaptain}
            onDeleteTeam={handleDeleteTeam}
            onLeaveTeam={handleLeaveTeam}
          />
        )}
      </ScrollView>

      <AssignRoleModal
        visible={captainModalOpen}
        role="captain"
        players={currentTeam.players || []}
        currentHolderId={currentTeam.captainId?._id}
        onSelect={handleSelectCaptain}
        onClose={() => setCaptainModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  content: {
    paddingBottom: 40,
  },
});