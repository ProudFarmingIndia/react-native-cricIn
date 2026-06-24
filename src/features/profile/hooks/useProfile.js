// hooks/useProfile.js

import { useState } from "react";

export default function useProfile() {
  const [profile, setProfile] = useState({
    profileImage: "",

    fullName: "",
    bio: "",

    city: "",
    state: "",
    country: "",

    dob: "",
    gender: "",

    playerRole: "",
    playerType: "",

    battingStyle: "",
    bowlingStyle: "",

    jerseyNumber: "",

    favoriteTeam: "",
    favoriteCricketer: "",
    favoriteShot: "",
    favoriteBall: "",

    highlights: [],
    galleryImages: [],
    galleryVideos: [],
  });

  const updateField = (
    field,
    value
  ) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return {
    profile,
    setProfile,
    updateField,
  };
}