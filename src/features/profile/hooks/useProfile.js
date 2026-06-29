import { useState } from "react";

export default function useProfile() {
  const [profile, setProfile] = useState({
    /*
    |--------------------------------------------------------------------------
    | Basic Information
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Cricket Information
    |--------------------------------------------------------------------------
    */

    playerType: "",

    battingStyle: "",

    bowlingStyle: "",

    jerseyNumber: "",

    favoriteTeam: "",

    favoriteCricketer: "",

    favoriteShot: "",

    favoriteBall: "",

    /*
    |--------------------------------------------------------------------------
    | Media
    |--------------------------------------------------------------------------
    */

    achievements: [],

    highlights: [],

    gallery: [],

    /*
    |--------------------------------------------------------------------------
    | Teams
    |--------------------------------------------------------------------------
    */

    teams: [],
  });

  const updateField = (
    field,
    value
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Update Profile Image
  |--------------------------------------------------------------------------
  */

  const updateProfileImage = (
    image
  ) => {
    setProfile((prev) => ({
      ...prev,

      profileImage: image,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Add Gallery Item
  |--------------------------------------------------------------------------
  */

  const addGalleryItem = (
    media
  ) => {
    setProfile((prev) => ({
      ...prev,

      gallery: [
        ...prev.gallery,

        media,
      ],
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Gallery Item
  |--------------------------------------------------------------------------
  */

  const removeGalleryItem = (
    publicId
  ) => {
    setProfile((prev) => ({
      ...prev,

      gallery:
        prev.gallery.filter(
          (item) =>
            item.publicId !==
            publicId
        ),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Reset Profile
  |--------------------------------------------------------------------------
  */

  const resetProfile = () => {
    setProfile({
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

      teams: [],
    });
  };

  return {
    profile,
    setProfile,
    updateField,
    updateProfileImage,
    addGalleryItem,
    removeGalleryItem,
    resetProfile,
  };
}