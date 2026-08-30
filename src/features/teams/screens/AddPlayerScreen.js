import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useSelector } from "react-redux";

import { COLORS } from "../../../constants/colors";

import useTeam from "../hooks/useTeam";

import StepIndicator from "../../../components/common/StepIndicator";

import TeamSuccessBanner from "../components/TeamSuccessBanner";
import SquadProgressCard from "../components/SquadProgressCard";
import TeamSummaryCard from "../components/TeamSummaryCard";
import AddPlayerOptions from "../components/AddPlayerOptions";
import CurrentSquadSection from "../components/CurrentSquadSection";
import TeamBottomActionBar from "../components/TeamBottomActionBar";

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
    | "create" (default) - this is step 2 of creating a team, so the
    |   primary button is "Review Team" and leads to TeamPreviewScreen.
    | "manage" - opened from Team Details > Settings > Manage Players, so
    |   the button is "Done" and returns to that Settings tab. Sending a
    |   captain who just removed a player into the team-creation preview
    |   made no sense.
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
  | Load Team
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (teamId) {
      getTeamById(teamId);
    }
  }, [teamId, getTeamById]);

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

  const handlePrimaryAction = () => {
    if (isManageMode) {
      navigation.navigate("TeamDetailsScreen", {
        teamId,
        initialTab: returnToTab,
      });

      return;
    }

    navigation.navigate("TeamPreviewScreen", {
      teamData: teamInfo,
      players: squad,
      teamId,
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
          onPlayerPress={handlePlayerPress}
          onRemovePlayer={handleRemovePlayer}
        />
      </ScrollView>

      <TeamBottomActionBar
        title={isManageMode ? "Done" : "Review Team"}
        disabled={!isManageMode && squad.length === 0}
        helperText={
          !isManageMode && squad.length === 0
            ? "Add at least one player to continue."
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