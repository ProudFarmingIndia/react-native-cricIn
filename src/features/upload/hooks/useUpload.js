import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { uploadImageApi, uploadVideoApi } from "../services/upload.service";

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
        response?.data?.message || "Image upload failed.",
      );

      return null;
    } catch (error) {
      console.log("Image Upload Error", error);

      Alert.alert("Upload Failed", "Unable to upload image.");

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

      if (response?.data?.success) {
        return response.data.data;
      }

      Alert.alert(
        "Upload Failed",
        response?.data?.message || "Video upload failed.",
      );

      return null;
    } catch (error) {
      console.log("Video Upload Error", error);

      Alert.alert("Upload Failed", "Unable to upload video.");

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
