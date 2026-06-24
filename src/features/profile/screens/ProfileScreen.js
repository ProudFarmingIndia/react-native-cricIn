import React, { useEffect } from "react";
import { ScrollView, SafeAreaView, View, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { getProfile } from "../store/profileSlice";
import ProfileHeroCard from "../components/ProfileHeroCard";
import PersonalInfoSection from "../components/PersonalInfoSection";
import CricketInfoSection from "../components/CricketInfoSection";
import FavoritesSection from "../components/FavoritesSection";
import HighlightsSection from "../components/HighlightsSection";
import GallerySection from "../components/GallerySection";
import RankingsSection from "../components/RankingsSection";
import { COLORS } from "../../../constants/colors";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Read directly from Redux — no local state needed
  const { profile, loading } = useSelector((state) => state.profile);

  // Reload every time screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(getProfile());
    });
    return unsubscribe;
  }, [navigation]);

  if (loading && !profile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView>
        <ProfileHeroCard
          profile={profile}
          onEditPress={() => navigation.navigate("EditProfileScreen")}
        />
        <Text style={{ fontSize: 18, fontWeight: "600", marginHorizontal: 16, marginTop: 16 }}>Profile Screen 11</Text>
        <PersonalInfoSection profile={profile} />
        <CricketInfoSection profile={profile} />
        <FavoritesSection profile={profile} />
        <HighlightsSection profile={profile} />
        <GallerySection profile={profile} />
        <RankingsSection profile={profile} />
      </ScrollView>
    </SafeAreaView>
  );
}