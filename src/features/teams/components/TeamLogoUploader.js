import React from "react";

import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| TeamLogoUploader
|--------------------------------------------------------------------------
|
| props:
|   logo       - display URL of the current logo, or null
|   onPress    - open the picker
|   uploading  - swap the circle for a spinner while the upload runs
|
*/

export default function TeamLogoUploader({
  logo,
  onPress,
  uploading = false,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.logoButton}
        onPress={onPress}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : logo ? (
          <Image
            source={{
              uri: logo,
            }}
            style={styles.logo}
          />
        ) : (
          <>
            <Ionicons
              name="camera-outline"
              size={38}
              color={COLORS.primary}
            />

            <Text style={styles.uploadText}>
              Upload Logo
            </Text>
          </>
        )}

        {!uploading && (
          <View style={styles.addIcon}>
            <Ionicons
              name={logo ? "create-outline" : "add"}
              size={18}
              color="#FFF"
            />
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.helperText}>
        {uploading ? "Uploading..." : "Recommended size: 500 × 500 px"}
      </Text>
    </View>
  );
}

const LOGO_SIZE = 130;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",

    marginBottom: 28,
  },

  logoButton: {
    width: LOGO_SIZE,

    height: LOGO_SIZE,

    borderRadius:
      LOGO_SIZE / 2,

    backgroundColor: "#F5F7F4",

    borderWidth: 2,

    borderStyle: "dashed",

    borderColor: "#D1D5DB",

    justifyContent: "center",

    alignItems: "center",

    overflow: "hidden",
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  uploadText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  helperText: {
    marginTop: 12,

    fontSize: 12,

    color: "#9CA3AF",
  },

  addIcon: {
    position: "absolute",

    right: 6,

    bottom: 6,

    width: 34,

    height: 34,

    borderRadius: 17,

    backgroundColor:
      COLORS.primary,

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 3,

    borderColor: "#FFF",
  },
});