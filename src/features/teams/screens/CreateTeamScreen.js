import React, { useState } from "react";

import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import { useSelector } from "react-redux";

import { COLORS } from "../../../constants/colors";

import useTeam from "../hooks/useTeam";
import useCreateTeam from "../hooks/useCreateTeam";
import useUpload from "../../upload/hooks/useUpload";

import StepIndicator from "../../../components/common/StepIndicator";
import TeamLogoUploader from "../components/TeamLogoUploader";
import TeamBasicInfoSection from "../components/TeamBasicInfoSection";
import TeamTypeSelector from "../components/TeamTypeSelector";
import TeamLocationSection from "../components/TeamLocationSection";
import TeamBioSection from "../components/TeamBioSection";
import TeamTipCard from "../components/TeamTipCard";
import TeamBottomActionBar from "../components/TeamBottomActionBar";

export default function CreateTeamScreen({ navigation }) {
  /*
  |--------------------------------------------------------------------------
  | Hooks
  |--------------------------------------------------------------------------
  */

  const { createTeam, loading } = useTeam();

  const user = useSelector((state) => state.auth.user);

  const { uploading, pickImage } = useUpload();

  /*
  |--------------------------------------------------------------------------
  | Team Logo
  |--------------------------------------------------------------------------
  |
  | teamData.logo holds a display URL, because that is what
  | TeamLogoUploader renders. The SERVER field is an object
  | ({ url, publicId }), so sending the bare string as `logo` is a Mongoose
  | cast error and the whole create fails.
  |
  | useCreateTeam's own pickLogo only flips a `showLogoOptions` flag that
  | nothing renders - LogoPickerBottomSheet exists but is imported nowhere -
  | so tapping the circle here previously did nothing at all.
  |
  | Same approach as EditTeamScreen: upload immediately, keep the real
  | asset aside, and merge it into the payload on submit.
  |
  */

  const [logoAsset, setLogoAsset] = useState(null);

  const { teamData, updateField, validate } = useCreateTeam({
    logo: null,

    teamName: "",

    shortName: "",

    teamType: "Club",

    country: "India",

    state: "",

    city: "",

    bio: "",

    visibility: "public",

    captain: user?._id,
  });

  /*
  |--------------------------------------------------------------------------
  | Continue
  |--------------------------------------------------------------------------
  */

  const handlePickLogo = async () => {
    const asset = await pickImage("teams/logo");

    if (!asset?.url) return;

    setLogoAsset({ url: asset.url, publicId: asset.publicId });

    updateField("logo", asset.url);
  };

  const handleContinue = async () => {
    const result = validate();

    if (!result.valid) {
      // Was only console.log - the user tapped Continue and nothing
      // happened, with no indication of what was missing.
      Alert.alert("Missing Information", result.message);

      return;
    }

    try {
      /*
      | Drop the display-only `logo` string, then add the real
      | { url, publicId } object back if one was uploaded.
      */
      const { logo: _displayLogo, ...payload } = teamData;

      if (logoAsset) {
        payload.logo = logoAsset;
      }

      const response = await createTeam(payload);

      if (response.success) {
        navigation.navigate("AddPlayerScreen", {
          teamId: response.data?._id,
          team: response.data,
          teamName: response.data?.teamName || teamData.teamName,
        });

        return;
      }

      Alert.alert(
        "Could Not Create Team",
        response.error || "Please check your details and try again.",
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Could Not Create Team",
        error?.message || "Please try again.",
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
        <StepIndicator currentStep={1} totalSteps={2} />

        <TeamLogoUploader
          logo={teamData.logo}
          onPress={handlePickLogo}
          uploading={uploading}
        />

        <TeamBasicInfoSection teamData={teamData} updateField={updateField} />

        <TeamTypeSelector
          value={teamData.teamType}
          onChange={(value) => updateField("teamType", value)}
        />

        <TeamLocationSection teamData={teamData} updateField={updateField} />

        <TeamBioSection teamData={teamData} updateField={updateField} />

        <TeamTipCard />
      </ScrollView>

      <TeamBottomActionBar
        loading={loading || uploading}
        title="Continue to Add Players"
        onPress={handleContinue}
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
