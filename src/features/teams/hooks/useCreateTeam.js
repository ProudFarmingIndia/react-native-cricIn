import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function useCreateTeam(initialValues) {
  const [teamData, setTeamData] =
    useState(initialValues);

  const [showLogoOptions, setShowLogoOptions] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Update Field
  |--------------------------------------------------------------------------
  */

  const updateField = (key, value) => {
    setTeamData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Open Logo Options
  |--------------------------------------------------------------------------
  */

  const pickLogo = () => {
    setShowLogoOptions(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Close Logo Options
  |--------------------------------------------------------------------------
  */

  const closeLogoOptions = () => {
    setShowLogoOptions(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Gallery
  |--------------------------------------------------------------------------
  */

  const chooseFromGallery = async () => {
    closeLogoOptions();

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      console.log("Gallery permission denied.");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,

        allowsEditing: true,

        aspect: [1, 1],

        quality: 0.8,
      });

    if (result.canceled) return;

    updateField(
      "logo",
      result.assets[0].uri
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Camera
  |--------------------------------------------------------------------------
  */

  const openCamera = async () => {
    closeLogoOptions();

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      console.log("Camera permission denied.");
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        allowsEditing: true,

        aspect: [1, 1],

        quality: 0.8,
      });

    if (result.canceled) return;

    updateField(
      "logo",
      result.assets[0].uri
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Logo
  |--------------------------------------------------------------------------
  */

  const removeLogo = () => {
    closeLogoOptions();

    updateField(
      "logo",
      null
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const validate = () => {
    if (!teamData.teamName.trim()) {
      return {
        valid: false,
        message: "Please enter team name.",
      };
    }

    if (!teamData.shortName.trim()) {
      return {
        valid: false,
        message: "Please enter short name.",
      };
    }

    if (teamData.shortName.length > 5) {
      return {
        valid: false,
        message:
          "Short name cannot exceed 5 characters.",
      };
    }

    return {
      valid: true,
    };
  };

  return {
    teamData,

    setTeamData,

    updateField,

    validate,

    pickLogo,

    openCamera,

    chooseFromGallery,

    removeLogo,

    showLogoOptions,

    closeLogoOptions,
  };
}