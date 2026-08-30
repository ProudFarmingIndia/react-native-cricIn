import React, { useState, useCallback, useEffect } from "react";

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

const SETTINGS_TAB = 4;

export default function TeamDetailsScreen() {
  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigation = useNavigation();

  const route = useRoute();

  /*
  | initialTab lets another screen send the user back to a specific tab -
  | EditTeamScreen and AddPlayerScreen both return to Settings (index 4)
  | rather than dumping the user back on Overview after they finish.
  */
  const { teamId, initialTab } = route.params || {};

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

  /*
  |--------------------------------------------------------------------------
  | My User Id
  |--------------------------------------------------------------------------
  |
  | team.userId is a User reference, so the owner check needs the logged-in
  | USER id - not the player id.
  |
  | state.auth.user is the obvious source but it is not always populated:
  | it is only written at login, so any session restored from storage
  | before that was fixed has it as null. The player profile carries the
  | same id on profile.userId (GET /players/me returns it, populated or
  | raw), and getProfile runs on every profile/team screen - so it is a
  | reliable fallback and means ownership resolves without a re-login.
  |
  */

  const myUserId =
    authUser?._id || myPlayer?.userId?._id || myPlayer?.userId;

  const myPlayerId = myPlayer?._id;

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [activeTab, setActiveTab] = useState(
    Number.isInteger(initialTab) ? initialTab : 0,
  );

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
  | Returning here with a new initialTab (from Save Changes, or Done on
  | Manage Players) has to move the tab - the useState initialiser only
  | runs on first mount, so without this the screen would stay on
  | whatever tab it was showing before.
  */

  useEffect(() => {
    if (Number.isInteger(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

  /*
  |--------------------------------------------------------------------------
  | Vice-Captain Rights
  |--------------------------------------------------------------------------
  |
  | This used to be a single `canManage = isOwner || isCaptain || isViceCaptain`,
  | which handed a vice-captain every power the moment they were appointed
  | and made the three toggles on ManageViceCaptainScreen purely decorative -
  | you could switch them all off and nothing changed.
  |
  | Each right is now checked separately, mirroring the backend asserts
  | exactly (assertCanEditTeam / assertCanManagePlayers /
  | assertCanSendInvitations), so the UI hides what the server would refuse
  | rather than showing a control that fails on tap.
  |
  | Owner and captain always hold all three - rights only ever gate a
  | vice-captain.
  |
  */

  const vcRights = currentTeam?.viceCaptainRights || {};

  const isLeader = isOwner || isCaptain;

  const canEditTeam = isLeader || (isViceCaptain && !!vcRights.canEditTeam);

  const canManagePlayers =
    isLeader || (isViceCaptain && !!vcRights.canManagePlayers);

  const canSendInvitations =
    isLeader || (isViceCaptain && !!vcRights.canSendInvitations);

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
        returnToTab: SETTINGS_TAB,
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

        /*
        | mode:"manage" is the difference between reaching this screen
        | from Settings and reaching it as step 2 of team creation. In
        | manage mode the primary button reads "Done" and comes back
        | here; in the create flow it stays "Review Team".
        */
        mode: "manage",
        returnToTab: SETTINGS_TAB,
        canSendInvitations,
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

  /*
  | An owner leaving hands the team over rather than being refused - the
  | server picks the successor (vice-captain, then captain, then the
  | longest-standing member with an account). Say so up front, because
  | "leave" meaning "give this team to someone else" is not obvious.
  */

  const handleLeaveTeam = () => {
    Alert.alert(
      "Leave Team",
      isOwner
        ? `You own ${currentTeam.teamName}. Leaving will hand ownership and captaincy to another member and remove you from the squad.`
        : `You will no longer be a member of ${currentTeam.teamName}.`,
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
        {/*
        | canFollow is off for the owner only. Squad members can still
        | follow their own team - that is how they get the match-live and
        | result notifications.
        |
        | Tapping the follower count opens the followers list at the root,
        | so Back returns here rather than unwinding the team stack.
        */}
        <TeamHeader
          team={currentTeam}
          canFollow={!isOwner}
          onPressFollowers={() =>
            navigation.navigate("FollowListScreen", {
              mode: "followers",
              targetType: "TEAM",
              targetId: currentTeam?._id,
              title: `People following ${currentTeam?.teamName || "this team"}`,
            })
          }
        />

        <TeamStatsOverview team={currentTeam} />

        <TeamTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === 0 && (
          <TeamOverviewTab
            team={currentTeam}
            onPlayerPress={handlePlayerPress}
            onViewAllPlayers={() => setActiveTab(1)}
          />
        )}

        {activeTab === 1 && (
          <TeamPlayersTab
            team={currentTeam}
            canManage={canManagePlayers}
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
            canEdit={canEditTeam}
            canManagePlayers={canManagePlayers}
            canAssignCaptain={isLeader}
            canDelete={isOwner}
            canLeave
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