import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { uploadImageApi, uploadVideoApi } from "../services/upload.service";

/*
| Surfaces the SERVER's reason instead of a generic string. The old catch
| always said "Unable to upload image", which hid the actual multipart
| failure and made the web upload bug much harder to diagnose than it
| needed to be.
*/

const describeError = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function useUpload() {
  const [uploading, setUploading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Pick Image
  |--------------------------------------------------------------------------
  */

  const pickImage = async (folder = "players/profile") => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos.",
        );

        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],

        allowsEditing: true,

        aspect: [1, 1],

        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      setUploading(true);

      const asset = result.assets[0];

      const response = await uploadImageApi(asset, folder);

      if (response?.success) {
        return response.data;
      }

      Alert.alert(
        "Upload Failed",
        response?.message || "Image upload failed.",
      );

      return null;
    } catch (error) {
      console.log("Image Upload Error", error);

      Alert.alert(
        "Upload Failed",
        describeError(error, "Unable to upload image."),
      );

      return null;
    } finally {
      setUploading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Pick Video
  |--------------------------------------------------------------------------
  */

  const pickVideo = async (folder = "players/gallery") => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your videos.",
        );

        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],

        allowsEditing: false,

        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      setUploading(true);

      const asset = result.assets[0];

      const response = await uploadVideoApi(asset, folder);

      /*
      | uploadVideoApi already returns response.data, i.e. the
      | { success, message, data } envelope. This checked
      | response.data.success - one level too deep - so a successful
      | upload always fell through to the failure branch and returned null.
      | pickImage had it right; this did not.
      */

      if (response?.success) {
        return response.data;
      }

      Alert.alert(
        "Upload Failed",
        response?.message || "Video upload failed.",
      );

      return null;
    } catch (error) {
      console.log("Video Upload Error", error);

      Alert.alert(
        "Upload Failed",
        describeError(error, "Unable to upload video."),
      );

      return null;
    } finally {
      setUploading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    uploading,

    pickImage,

    pickVideo,
  };
}
