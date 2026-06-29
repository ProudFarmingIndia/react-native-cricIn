import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import HeroSection from "../components/HeroSection";
import ProfileTabBar from "../components/ProfileTabBar";
import OverviewTab from "../common/tabs/OverviewTab";
import StatsTab from "../common/tabs/StatsTab";
import TeamsTab from "../common/tabs/TeamsTab";
import MatchesTab from "../common/tabs/MatchesTab";
import GalleryTab from "../common/tabs/GalleryTab";
import { getProfile } from "../store/profileSlice";
import { COLORS } from "../../../constants/colors";

export default function ProfileScreen() {
  const dispatch = useDispatch();

  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState(0);

  const { profile, loading } = useSelector((state) => state.profile || {});

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(getProfile());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

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
        />

        <ProfileTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 0 && <OverviewTab profile={profile} />}

        {activeTab === 1 && <StatsTab profile={profile} />}

        {activeTab === 2 && <TeamsTab profile={profile} />}

        {activeTab === 3 && <MatchesTab profile={profile} />}

        {activeTab === 4 && (
          <GalleryTab
            profile={profile}
            onAddPhoto={() => navigation.navigate("EditProfileScreen")}
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
