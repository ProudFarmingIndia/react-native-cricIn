import React, { useEffect, useCallback } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";

import { COLORS } from "../../../constants/colors";

import useTeam from "../hooks/useTeam";

import StepIndicator from "../../../components/common/StepIndicator";

import TeamSuccessBanner from "../components/TeamSuccessBanner";
import SquadProgressCard from "../components/SquadProgressCard";
import TeamSummaryCard from "../components/TeamSummaryCard";
import AddPlayerOptions from "../components/AddPlayerOptions";
import CurrentSquadSection from "../components/CurrentSquadSection";
import TeamBottomActionBar from "../components/TeamBottomActionBar";

import useTeamInvitations from "../hooks/useTeamInvitations";

export default function AddPlayerScreen({ navigation, route }) {
  /*
  |--------------------------------------------------------------------------
  | Route Params
  |--------------------------------------------------------------------------
  */

  const {
    teamId,
    team,
    teamName: initialTeamName,
    showSuccessBanner = true,

    /*
    | Both modes now end on "Done" and land on TeamDetailsScreen; the only
    | difference left is WHICH tab.
    |
    | "create" (default) - step 2 of creating a team, so it opens the team
    |   on its first tab.
    | "manage" - opened from Team Details > Settings > Manage Players, so
    |   it returns to the tab it came from.
    |
    | The old "Review Team" branch pointed at TeamPreviewScreen, a
    | read-only summary of a squad the captain had just built one tap
    | earlier. It is gone - see handlePrimaryAction below.
    */
    mode = "create",
    returnToTab = 4,
  } = route.params || {};

  const isManageMode = mode === "manage";

  /*
  |--------------------------------------------------------------------------
  | Team Hook
  |--------------------------------------------------------------------------
  */

  const { currentTeam, getTeamById, removePlayerFromTeam } = useTeam();

  /*
  |--------------------------------------------------------------------------
  | Invitations
  |--------------------------------------------------------------------------
  |
  | Players added manually are no longer pushed straight into the squad -
  | they get a PENDING invitation and join when they accept. So the squad
  | list needs to know each player's invitation status to show the ribbon,
  | otherwise somebody who has not agreed to play looks like a confirmed
  | member.
  */

  const { statusOf, reload: reloadInvitations } = useTeamInvitations(teamId);

  /*
  |--------------------------------------------------------------------------
  | Load Team
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (teamId) {
      getTeamById(teamId);
    }
  }, [teamId, getTeamById]);

  /*
  | Refetched when the screen regains focus, so a player added on the Add
  | Player screen shows up as pending the moment you come back rather than
  | after a manual reload.
  */
  useFocusEffect(
    useCallback(() => {
      reloadInvitations();
    }, [reloadInvitations]),
  );

  /*
  |--------------------------------------------------------------------------
  | Team
  |--------------------------------------------------------------------------
  */

  const teamInfo = currentTeam ||
    team || {
      teamName: initialTeamName || "Untitled Team",
    };

  /*
  |--------------------------------------------------------------------------
  | Squad
  |--------------------------------------------------------------------------
  */

  const squad = teamInfo?.players || [];

  /*
  |--------------------------------------------------------------------------
  | Permission - Same Owner/Captain/Vice-Captain Check As TeamDetailsScreen
  |--------------------------------------------------------------------------
  */

  const authUser = useSelector((state) => state.auth.user);
  const myPlayer = useSelector((state) => state.profile.profile);

  const ownerId = teamInfo?.userId?._id || teamInfo?.userId;

  // Same fallback as TeamDetailsScreen - see the note there.
  const myUserId =
    authUser?._id || myPlayer?.userId?._id || myPlayer?.userId;

  const isOwner = String(ownerId) === String(myUserId);

  const isCaptain = String(teamInfo?.captainId?._id) === String(myPlayer?._id);
  const isViceCaptain =
    String(teamInfo?.viceCaptainId?._id) === String(myPlayer?._id);

  /*
  | Same per-right split as TeamDetailsScreen: a vice-captain only gets
  | what the captain actually granted them. Removing a player needs
  | canManagePlayers; inviting needs canSendInvitations, which the
  | backend now enforces too (assertCanSendInvitations).
  */

  const vcRights = teamInfo?.viceCaptainRights || {};

  const isLeader = isOwner || isCaptain;

  const canManage = isLeader || (isViceCaptain && !!vcRights.canManagePlayers);

  const canInvite = isLeader || (isViceCaptain && !!vcRights.canSendInvitations);

  /*
  |--------------------------------------------------------------------------
  | Handlers - Squad List (Same Pattern As TeamDetailsScreen)
  |--------------------------------------------------------------------------
  */

  const handlePlayerPress = (player) => {
    navigation.navigate("TeamStack", {
      screen: "PlayerProfileScreen",
      params: { playerId: player._id },
    });
  };

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
  | Review Team
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | Done
  |--------------------------------------------------------------------------
  |
  | The "Review Team" step is gone. It navigated to TeamPreviewScreen - a
  | read-only summary of a squad the captain had just built on this very
  | screen, one tap earlier. Re-reading what you just typed is not a step,
  | it is a wall, and it sat between a captain and a finished team.
  |
  | Both modes now land on the team itself, which is where you actually
  | want to be: the real squad, with its tabs and settings.
  */

  const handlePrimaryAction = () => {
    navigation.navigate("TeamDetailsScreen", {
      teamId,
      initialTab: isManageMode ? returnToTab : 0,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* The 2-step indicator belongs to the create flow only. */}
        {!isManageMode && <StepIndicator currentStep={2} totalSteps={2} />}

        {showSuccessBanner && (
          <TeamSuccessBanner teamName={teamInfo?.teamName} />
        )}

        <SquadProgressCard
          players={squad}
          captain={teamInfo?.captainId}
          viceCaptain={teamInfo?.viceCaptainId}
        />

        <TeamSummaryCard teamData={teamInfo} players={squad} />

        <AddPlayerOptions
          canInvite={canInvite}
          canAddLocal={canManage}
          onInvitePlayer={() =>
            navigation.navigate("InvitePlayerScreen", {
              teamId,
            })
          }
          onAddLocalPlayer={() =>
            navigation.navigate("AddLocalPlayerScreen", {
              teamId,
            })
          }
        />

        <CurrentSquadSection
          team={teamInfo}
          players={squad}
          canManage={canManage}
          statusOf={statusOf}
          onPlayerPress={handlePlayerPress}
          onRemovePlayer={handleRemovePlayer}
        />
      </ScrollView>

      <TeamBottomActionBar
        title="Done"
        /*
        | No longer disabled on an empty squad. Players now have to ACCEPT
        | an invitation before they appear here, so a captain who has just
        | invited eleven people still sees an empty squad - blocking them
        | would trap them on this screen with no way forward and nothing
        | they could do about it.
        */
        helperText={
          squad.length === 0
            ? "Invited players appear here once they accept."
            : undefined
        }
        onPress={handlePrimaryAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 140,
  },
});