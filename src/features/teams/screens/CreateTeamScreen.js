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
import useNameAvailability from "../hooks/useNameAvailability";
import { hasStates } from "../../../constants/geo";
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

    /*
    | An ISO code now, not the display name. LocationPicker and
    | src/constants/geo.js speak codes so that state-wise and city-wise
    | rankings can group reliably later.
    */
    country: "IN",

    state: "",

    city: "",

    bio: "",

    visibility: "public",

    captain: user?._id,
  });

  /*
  |--------------------------------------------------------------------------
  | Is the name already taken?
  |--------------------------------------------------------------------------
  |
  | Asked while the user types, so the error appears under the field and
  | Continue is disabled - rather than letting them fill in the whole form,
  | pick a logo, and only then be told the name is gone.
  |
  | The server checks the same thing on write, so this is UX, not security.
  */

  const names = useNameAvailability({
    teamName: teamData.teamName,
    shortName: teamData.shortName,
  });

  /*
  |--------------------------------------------------------------------------
  | Required fields
  |--------------------------------------------------------------------------
  |
  | LOGO AND BIO ARE OPTIONAL. A team is perfectly usable without either,
  | and demanding a logo before a captain can create a team is the kind of
  | friction that loses the user at step one. Everything else is required.
  |
  | `state` is required only where the country HAS states - 53 countries
  | have no subdivisions at all, and in those the field is not even
  | rendered, so requiring it would disable Continue with nothing on screen
  | to fix. That is the worst possible failure for a form: a dead button and
  | no explanation.
  */

  const missing = [];

  if (!teamData.teamName?.trim()) missing.push("team name");
  if (!teamData.shortName?.trim()) missing.push("short name");
  if (!teamData.teamType) missing.push("team type");
  if (!teamData.country) missing.push("country");
  if (hasStates(teamData.country) && !teamData.state) missing.push("state");
  if (!teamData.city?.trim()) missing.push("city");

  const incomplete = missing.length > 0;

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

        <TeamBasicInfoSection
          teamData={teamData}
          updateField={updateField}
          errors={names.errors}
          checking={names.checking}
          onBlurField={names.onBlur}
        />

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
        /*
        | Disabled while a required field is empty, while a name is taken,
        | and while a check is in flight - a fast tap during the check would
        | otherwise submit before the answer lands and be rejected by the
        | server, which is the exact modal this replaced.
        |
        | NOT disabled when a check FAILS. useNameAvailability reports no
        | error on a network failure, so a user on bad signal can still
        | submit and let the server have the final word.
        */
        disabled={incomplete || names.blocked || names.checking}
        /*
        | A disabled button with no explanation is the most frustrating
        | thing a form can do - the user taps, nothing happens, and there is
        | nothing to read. This always says which of the two reasons applies
        | and, when fields are missing, names them.
        */
        helperText={
          names.blocked
            ? "Choose a different name to continue."
            : incomplete
              ? `Still needed: ${missing.join(", ")}.`
              : ""
        }
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
