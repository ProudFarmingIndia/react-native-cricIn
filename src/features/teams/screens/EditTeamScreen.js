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
import useUpload from "../../upload/hooks/useUpload";

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
  const {
    teamId,
    team: teamFromParams,

    /*
    | Which TeamDetailsScreen tab to land on after saving. Settings sent
    | the user here, so Settings is where they expect to come back to -
    | a plain goBack() would drop them on Overview instead.
    */
    returnToTab = 4,
  } = route.params || {};

  /*
  |--------------------------------------------------------------------------
  | Hooks
  |--------------------------------------------------------------------------
  */

  const { currentTeam, getTeamById, updateTeam, loading } = useTeam();

  const team = teamFromParams || currentTeam;

  /*
  |--------------------------------------------------------------------------
  | Prefill Guard
  |--------------------------------------------------------------------------
  |
  | This MUST start false.
  |
  | It used to be useState(!!teamFromParams), and TeamDetailsScreen always
  | passes `team` in the route params - so it started true. The prefill
  | effect below is guarded on `!initialized`, so it never ran, and the
  | form opened completely blank on a screen whose entire job is editing
  | existing values.
  |
  | Its only real purpose is "fill the fields exactly once", so that
  | re-renders, or a late currentTeam arriving from the API, don't stomp
  | on what the user has already typed.
  |
  */

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!teamFromParams && teamId) {
      getTeamById(teamId);
    }
  }, [teamFromParams, teamId, getTeamById]);

  const { uploading, pickImage } = useUpload();

  /*
  |--------------------------------------------------------------------------
  | Logo
  |--------------------------------------------------------------------------
  |
  | teamData.logo is only ever a display URL, because that is what
  | TeamLogoUploader renders. The SERVER field is an object
  | ({ url, publicId }), so a bare string sent as `logo` is a Mongoose
  | cast error and the whole save fails.
  |
  | So the uploaded asset is kept separately and only merged into the
  | payload when the user actually picked a new image. If they didn't,
  | `logo` is left out of the update entirely and the existing one is
  | preserved.
  |
  | useCreateTeam's own pickLogo only flips a `showLogoOptions` flag that
  | nothing renders, so tapping the logo here previously did nothing at all.
  |
  */

  const [logoAsset, setLogoAsset] = useState(null);

  const { teamData, updateField, validate, setTeamData } =
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

  const handlePickLogo = async () => {
    const asset = await pickImage("teams/logo");

    if (!asset?.url) return;

    setLogoAsset({ url: asset.url, publicId: asset.publicId });

    updateField("logo", asset.url);
  };

  const handleSave = async () => {
    const result = validate();

    if (!result.valid) {
      Alert.alert("Missing Information", result.message);
      return;
    }

    try {
      /*
      | Drop the display-only `logo` string, then add the real object
      | back only if a new image was uploaded in this session.
      */
      const { logo: _displayLogo, ...payload } = teamData;

      if (logoAsset) {
        payload.logo = logoAsset;
      }

      const response = await updateTeam(teamId, payload);

      if (response?.success !== false) {
        /*
        | navigate (not push) - TeamDetailsScreen is already behind this
        | screen in the stack, so this pops back to it and merges the new
        | params rather than stacking a second copy.
        */
        navigation.navigate("TeamDetailsScreen", {
          teamId,
          initialTab: returnToTab,
        });
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
        <TeamLogoUploader logo={teamData.logo} onPress={handlePickLogo} />

        <TeamBasicInfoSection teamData={teamData} updateField={updateField} />

        <TeamTypeSelector
          value={teamData.teamType}
          onChange={(value) => updateField("teamType", value)}
        />

        <TeamLocationSection teamData={teamData} updateField={updateField} />

        <TeamBioSection teamData={teamData} updateField={updateField} />
      </ScrollView>

      <TeamBottomActionBar
        loading={loading || uploading}
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
