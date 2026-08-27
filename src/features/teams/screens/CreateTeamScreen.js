import React from "react";

import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useSelector } from "react-redux";

import { COLORS } from "../../../constants/colors";

import useTeam from "../hooks/useTeam";
import useCreateTeam from "../hooks/useCreateTeam";

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

  const { teamData, updateField, pickLogo, validate } = useCreateTeam({
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

  const handleContinue = async () => {
    const result = validate();

    if (!result.valid) {
      console.log(result.message);

      return;
    }

    try {
      const response = await createTeam(teamData);

      // const response = await createTeam(teamData);

      console.log("Create Team Response:", response);
      if (response.success) {
        navigation.navigate("AddPlayerScreen", {
          teamId: response.data?._id,
          team: response.data,
          teamName: response.data?.teamName || teamData.teamName,
        });
      }
    } catch (error) {
      console.log(error);
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

        <TeamLogoUploader logo={teamData.logo} onPress={pickLogo} />

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
        loading={loading}
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
