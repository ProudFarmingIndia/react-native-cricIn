import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  getProfile,
  updateProfile,
  createPlayerProfile,
} from "../store/profileSlice";
import ProfileHeroCard from "../components/ProfileHeroCard";
import PersonalInfoSection from "../components/PersonalInfoSection";
import CricketInfoSection from "../components/CricketInfoSection";
import FavoritesSection from "../components/FavoritesSection";
import HighlightsSection from "../components/HighlightsSection";
import GallerySection from "../components/GallerySection";
import PrimaryButton from "../../../components/Button/PrimaryButton";
import useUpload from "../../upload/hooks/useUpload";
import { COLORS } from "../../../constants/colors";

export default function EditProfileScreen() {
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const { uploading, pickImage, pickVideo } = useUpload();

  const { isCreated } = useSelector((state) => state.profile || {});

  /*
  |--------------------------------------------------------------------------
  | Screen States
  |--------------------------------------------------------------------------
  */

  const [profile, setProfile] = useState({
    profileImage: {
      url: "",
      publicId: "",
    },

    playerName: "",

    bio: "",

    dob: "",

    gender: "",

    city: "",

    state: "",

    country: "India",

    playerType: "",

    battingStyle: "",

    bowlingStyle: "",

    jerseyNumber: "",

    favoriteTeam: "",

    favoriteCricketer: "",

    favoriteShot: "",

    favoriteBall: "",

    achievements: [],

    highlights: [],

    gallery: [],
  });

  const [fetching, setFetching] = useState(true);

  const [saving, setSaving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Profile
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setFetching(true);

        const result = await dispatch(getProfile());

        if (getProfile.fulfilled.match(result)) {
          setProfile(result.payload.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Update Local State
  |--------------------------------------------------------------------------
  */

  const updateField = useCallback((key, value) => {
    setProfile((previous) => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Upload Profile Image
  |--------------------------------------------------------------------------
  */

  const handleProfileImage = async () => {
    const uploadedImage = await pickImage("players/profile");

    if (!uploadedImage) return;

    updateField("profileImage", uploadedImage);
  };

  /*
  |--------------------------------------------------------------------------
  | Upload Gallery Image
  |--------------------------------------------------------------------------
  */

  const handleGalleryImage = async () => {
    const uploadedImage = await pickImage("players/gallery");

    if (!uploadedImage) return;

    updateField("gallery", [
      ...profile.gallery,

      {
        type: "IMAGE",

        url: uploadedImage.url,

        publicId: uploadedImage.publicId,

        uploadedAt: new Date(),
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Upload Gallery Video
  |--------------------------------------------------------------------------
  */

  const handleGalleryVideo = async () => {
    const uploadedVideo = await pickVideo("players/gallery");

    if (!uploadedVideo) return;

    updateField("gallery", [
      ...profile.gallery,

      {
        type: "VIDEO",

        url: uploadedVideo.url,

        publicId: uploadedVideo.publicId,

        uploadedAt: new Date(),
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Loading Screen
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | Create Player Profile
  |--------------------------------------------------------------------------
  */

  const createProfile = async () => {
    try {
      const payload = {
        ...profile,

        playerName: profile.playerName || "",
      };

      const result = await dispatch(createPlayerProfile(payload));

      if (createPlayerProfile.fulfilled.match(result)) {
        await dispatch(getProfile());

        navigation.goBack();
      } else {
        console.log(result.payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Update Profile
  |--------------------------------------------------------------------------
  */

  const updateExistingProfile = async () => {
    try {
      const result = await dispatch(updateProfile(profile));

      if (updateProfile.fulfilled.match(result)) {
        await dispatch(getProfile());

        navigation.goBack();
      } else {
        console.log(result.payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Save Button
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      setSaving(true);

      if (isCreated) {
        await updateExistingProfile();
      } else {
        await createProfile();
      }
      navigation.replace("ProfileScreen");
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProfileImage = () => {
    updateField("profileImage", {
      url: "",
      publicId: "",
    });
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Profile Hero */}
        {/* ---------------------------------------------------------------- */}

        <ProfileHeroCard
          profile={profile}
          isEditMode
          updateField={updateField}
          uploading={uploading}
          onUploadProfileImage={handleProfileImage}
          onRemoveProfileImage={handleRemoveProfileImage}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Personal Information */}
        {/* ---------------------------------------------------------------- */}

        <PersonalInfoSection
          profile={profile}
          isEditMode
          updateField={updateField}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Cricket Information */}
        {/* ---------------------------------------------------------------- */}

        <CricketInfoSection
          profile={profile}
          isEditMode
          updateField={updateField}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Favourite */}
        {/* ---------------------------------------------------------------- */}

        <FavoritesSection
          profile={profile}
          isEditMode
          updateField={updateField}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Highlights */}
        {/* ---------------------------------------------------------------- */}

        <HighlightsSection
          profile={profile}
          isEditMode
          updateField={updateField}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Gallery */}
        {/* ---------------------------------------------------------------- */}

        <GallerySection
          profile={profile}
          isEditMode
          updateField={updateField}
          onAddImage={handleGalleryImage}
          onAddVideo={handleGalleryVideo}
        />

        {/* ---------------------------------------------------------------- */}

        {/* ---------------------------------------------------------------- */}

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={
              saving
                ? "Saving..."
                : isCreated
                  ? "Save Changes"
                  : "Create Profile"
            }
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: COLORS.background,
  },

  content: {
    paddingBottom: 50,
  },

  buttonContainer: {
    marginHorizontal: 16,

    marginTop: 20,

    marginBottom: 40,
  },
});
