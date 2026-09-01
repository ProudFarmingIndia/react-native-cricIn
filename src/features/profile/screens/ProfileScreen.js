import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";

import useUpload from "../../upload/hooks/useUpload";

import HeroSection from "../components/HeroSection";
import ProfileTabBar from "../components/ProfileTabBar";
import OverviewTab from "../common/tabs/OverviewTab";
import TeamsTab from "../common/tabs/TeamsTab";
import MatchesTab from "../common/tabs/MatchesTab";
import GalleryTab from "../common/tabs/GalleryTab";
import HighlightsTab from "../common/tabs/HighlightsTab";

// Batch 4: Auto-updated career stats component
import PlayerCareerStatsSection from "../../../components/matches/PlayerCareerStatsSection";

import { getProfile, updateProfile } from "../store/profileSlice";
import { COLORS } from "../../../constants/colors";

export default function ProfileScreen({ route }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState(route?.params?.initialTab ?? 0);

  const { profile, loading } = useSelector((state) => state.profile || {});

  /*
  |--------------------------------------------------------------------------
  | Cover Photo
  |--------------------------------------------------------------------------
  |
  | Uploaded straight from the header rather than buried in
  | EditProfileScreen - changing a cover is a one-tap action everywhere
  | else, and routing it through a form would be a worse trade.
  |
  | pickImage returns { url, publicId }, which is exactly the shape of
  | Player.coverPhoto, and updateProfile.fulfilled writes the returned
  | player back into state - so the new cover appears without a refetch.
  |
  */

  const { uploading, pickImage } = useUpload();

  const handleCoverPress = async () => {
    const asset = await pickImage("players/cover");

    if (!asset?.url) return;

    const result = await dispatch(
      updateProfile({
        coverPhoto: { url: asset.url, publicId: asset.publicId },
      }),
    );

    if (updateProfile.rejected.match(result)) {
      Alert.alert(
        "Cover Not Saved",
        result.payload?.message || "Could not update your cover photo.",
      );
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(getProfile());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  /*
  |--------------------------------------------------------------------------
  | No Profile Yet
  |--------------------------------------------------------------------------
  |
  | getProfile resolves successfully with data: null when the logged-in
  | user hasn't created a player profile yet — that's expected for a
  | brand-new user, not an error. EditProfileScreen handles both create
  | and update, so we route there instead of spinning forever.
  |
  */
  useEffect(() => {
    if (!loading && !profile) {
      navigation.replace("EditProfileScreen");
    }
  }, [loading, profile, navigation]);

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HeroSection
          profile={profile}
          onEditPress={() => navigation.navigate("EditProfileScreen")}
          onCoverPress={handleCoverPress}
          coverUploading={uploading}
        />

        <ProfileTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 0 && <OverviewTab profile={profile} />}

        {/*
         * Tab 1 — Stats
         * Batch 4: Replaced StatsTab with PlayerCareerStatsSection.
         * stats are auto-updated by the backend on every match completion
         * via updatePlayerStatsOnMatchComplete (player.stats.service.ts).
         * profile.stats is the persisted career stats object on the Player doc.
         */}
        {activeTab === 1 && (
          <PlayerCareerStatsSection stats={profile?.stats} />
        )}

        {activeTab === 2 && <TeamsTab profile={profile} />}

        {activeTab === 3 && <MatchesTab profile={profile} />}

        {activeTab === 4 && (
          <GalleryTab
            profile={profile}
            onAddPhoto={() => navigation.navigate("EditProfileScreen")}
          />
        )}

        {/*
          ProfileTabBar has always declared six tabs, but only 0-4 were
          rendered - so tapping "HighLight" showed a blank body.
        */}
        {activeTab === 5 && (
          <HighlightsTab
            profile={profile}
            onAdd={() => navigation.navigate("EditProfileScreen")}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  content: {
    paddingBottom: 40,
  },
});


// 9910202839 -> team start from 9100000032