import React, { useEffect } from "react";

import {
  ScrollView,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import useTeam from "../hooks/useTeam";

import TeamHeroCard from "../components/TeamHeroCard";
import LeadershipCard from "../components/LeadershipCard";
import SquadListCard from "../components/SquadListCard";

import PrimaryButton from "../../../components/Button/PrimaryButton";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Team Preview Screen
|--------------------------------------------------------------------------
|
| Two distinct modes, depending on what route.params has:
|
|   CREATE-FLOW MODE (route.params.teamData + players, no teamId, team
|   not yet created): used right before finalizing a brand new team.
|
|   VIEW MODE (route.params.teamId, existing team): fetches the real
|   team from the backend - this is what makes it possible to view any
|   OTHER team's overview, not just your own mid-creation.
*/

export default function TeamPreviewScreen({ route, navigation }) {
  const { teamId, teamData, players } = route.params || {};

  const isViewMode = !!teamId && !teamData;

  const { currentTeam, loading, getTeamById } = useTeam();

  useEffect(() => {
    if (isViewMode) {
      getTeamById(teamId);
    }
  }, [isViewMode, teamId, getTeamById]);

  if (isViewMode && (loading || !currentTeam)) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const teamInfo = isViewMode ? currentTeam : teamData || {};

  const squad = isViewMode
    ? currentTeam?.players || []
    : Array.isArray(players)
      ? players
      : [];

  const captain = isViewMode
    ? currentTeam?.captainId
    : squad.find((p) => p.isCaptain);

  const viceCaptain = isViewMode
    ? currentTeam?.viceCaptainId
    : squad.find((p) => p.isViceCaptain);

  const handleCreateTeam = async () => {
    navigation.navigate("TeamDetailsScreen");
  };

  return (
    <ScrollView>
      <TeamHeroCard teamData={teamInfo} players={squad} />

      {captain && (
        <LeadershipCard title="Captain" player={captain} type="C" />
      )}

      {viceCaptain && (
        <LeadershipCard title="Vice Captain" player={viceCaptain} type="VC" />
      )}

      <SquadListCard players={squad} />

      <View />

      {/* ---------------------------------------------------------- */}
      {/* Create-Flow Actions - only shown before the team exists */}
      {/* ---------------------------------------------------------- */}

      {!isViewMode && (
        <>
          <PrimaryButton title="Edit Team" onPress={() => navigation.goBack()} />

          <View />

          <PrimaryButton title="Finalize & Create Team" onPress={handleCreateTeam} />
        </>
      )}

      <View />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});