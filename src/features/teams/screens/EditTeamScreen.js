import React, { useEffect, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import { COLORS } from "../../../constants/colors";

import useTeam from "../hooks/useTeam";
import useCreateTeam from "../hooks/useCreateTeam";

import TeamLogoUploader from "../components/TeamLogoUploader";
import TeamBasicInfoSection from "../components/TeamBasicInfoSection";
import TeamTypeSelector from "../components/TeamTypeSelector";
import TeamLocationSection from "../components/TeamLocationSection";
import TeamBioSection from "../components/TeamBioSection";
import TeamBottomActionBar from "../components/TeamBottomActionBar";

/*
|--------------------------------------------------------------------------
| Edit Team Screen
|--------------------------------------------------------------------------
|
| Reuses the exact same form sections and useCreateTeam local-state hook
| as CreateTeamScreen - only the submit action differs (updateTeam
| instead of createTeam), and the fields start pre-filled from the
| existing team instead of blank.
|
*/

export default function EditTeamScreen({ navigation, route }) {
  const { teamId, team: teamFromParams } = route.params || {};

  /*
  |--------------------------------------------------------------------------
  | Hooks
  |--------------------------------------------------------------------------
  */

  const { currentTeam, getTeamById, updateTeam, loading } = useTeam();

  const team = teamFromParams || currentTeam;

  const [initialized, setInitialized] = useState(!!teamFromParams);

  useEffect(() => {
    if (!teamFromParams && teamId) {
      getTeamById(teamId);
    }
  }, [teamFromParams, teamId, getTeamById]);

  const { teamData, updateField, pickLogo, validate, setTeamData } =
    useCreateTeam({
      logo: null,
      teamName: "",
      shortName: "",
      teamType: "Club",
      country: "India",
      state: "",
      city: "",
      bio: "",
      visibility: "public",
    });

  /*
  |--------------------------------------------------------------------------
  | Pre-Fill Once The Team Loads
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (team && !initialized) {
      setTeamData({
        logo: team.logo?.url || null,
        teamName: team.teamName || "",
        shortName: team.shortName || "",
        teamType: team.teamType || "Club",
        country: team.country || "India",
        state: team.state || "",
        city: team.city || "",
        bio: team.bio || "",
        visibility: team.visibility || "public",
      });

      setInitialized(true);
    }
  }, [team, initialized, setTeamData]);

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    const result = validate();

    if (!result.valid) {
      Alert.alert("Missing Information", result.message);
      return;
    }

    try {
      const response = await updateTeam(teamId, teamData);

      if (response?.success !== false) {
        navigation.goBack();
      } else {
        Alert.alert(
          "Update Failed",
          response?.error || "Unable to update team.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Update Failed",
        error?.message || "Unable to update team.",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TeamLogoUploader logo={teamData.logo} onPress={pickLogo} />

        <TeamBasicInfoSection teamData={teamData} updateField={updateField} />

        <TeamTypeSelector
          value={teamData.teamType}
          onChange={(value) => updateField("teamType", value)}
        />

        <TeamLocationSection teamData={teamData} updateField={updateField} />

        <TeamBioSection teamData={teamData} updateField={updateField} />
      </ScrollView>

      <TeamBottomActionBar
        loading={loading}
        title="Save Changes"
        onPress={handleSave}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },
});
