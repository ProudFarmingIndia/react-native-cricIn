import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import ProfileHeroCard from "../components/ProfileHeroCard";
import PersonalInfoSection from "../components/PersonalInfoSection";
import CricketInfoSection from "../components/CricketInfoSection";
import FavoritesSection from "../components/FavoritesSection";
import HighlightsSection from "../components/HighlightsSection";
import GallerySection from "../components/GallerySection";

import { getProfile, updateProfile, createPlayerProfile } from "../store/profileSlice";
import { COLORS } from "../../../constants/colors";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { isCreated } = useSelector((state) => state.profile);

  const [profile, setProfile] = useState({});
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // ─── GET Profile ────────────────────────────────────────────────────────────
  const loadProfile = async () => {
    try {
      setFetching(true);
      console.log("─────────────────────────────────────");
      console.log("📡 [GET PROFILE] Calling API...");
      console.log("   Endpoint: GET /api/players/me");

      const result = await dispatch(getProfile());

      if (getProfile.fulfilled.match(result)) {
        console.log("✅ [GET PROFILE] Success");
        console.log("   Data:", JSON.stringify(result.payload?.data, null, 2));
        setProfile(result.payload?.data || {});
      } else {
        console.log("❌ [GET PROFILE] Failed");
        console.log("   Error:", JSON.stringify(result.payload, null, 2));
        setProfile({});
      }
    } catch (err) {
      console.log("💥 [GET PROFILE] Exception:", err.message);
    } finally {
      setFetching(false);
      console.log("─────────────────────────────────────");
    }
  };

  // Generic field updater
  const updateField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  // ─── SAVE / CREATE Profile ──────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      console.log("─────────────────────────────────────");

      if (isCreated) {
        // ── UPDATE ──
        console.log("📡 [UPDATE PROFILE] Calling API...");
        console.log("   Endpoint: PUT /api/players/me");
        console.log("   Payload:", JSON.stringify(profile, null, 2));

        const result = await dispatch(updateProfile(profile));

        if (updateProfile.fulfilled.match(result)) {
          console.log("✅ [UPDATE PROFILE] Success");
          console.log("   Updated Data:", JSON.stringify(result.payload?.data, null, 2));
          console.log("─────────────────────────────────────");
          navigation.goBack();
        } else {
          console.log("❌ [UPDATE PROFILE] Failed");
          console.log("   Error:", JSON.stringify(result.payload, null, 2));
          console.log("─────────────────────────────────────");
        }

      } else {
        // ── CREATE ──
        const payload = {
          ...profile,
          playerName: profile.playerName || profile.fullName || "",
        };

        console.log("📡 [CREATE PROFILE] Calling API...");
        console.log("   Endpoint: POST /api/players");
        console.log("   Payload:", JSON.stringify(payload, null, 2));

        const result = await dispatch(createPlayerProfile(payload));

        if (createPlayerProfile.fulfilled.match(result)) {
          console.log("✅ [CREATE PROFILE] Success");
          console.log("   Created Data:", JSON.stringify(result.payload?.data, null, 2));
          console.log("─────────────────────────────────────");
          navigation.goBack();
        } else {
          console.log("❌ [CREATE PROFILE] Failed");
          console.log("   Error:", JSON.stringify(result.payload, null, 2));
          console.log("─────────────────────────────────────");
        }
      }

    } catch (error) {
      console.log("💥 [SAVE PROFILE] Exception:", error.message);
      console.log("─────────────────────────────────────");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeroCard
          profile={profile}
          isEditMode
          updateField={updateField}
        />
        <Text style={{ fontSize: 18, fontWeight: "600", marginHorizontal: 16, marginTop: 16 }}>Edit Profile Screen 11</Text>
        <PersonalInfoSection
          profile={profile}
          isEditMode
          updateField={updateField}
        />

        <CricketInfoSection
          profile={profile}
          isEditMode
          updateField={updateField}
        />

        <FavoritesSection
          profile={profile}
          isEditMode
          updateField={updateField}
        />

        <HighlightsSection
          profile={profile}
          isEditMode
          updateField={updateField}
        />

        <GallerySection
          profile={profile}
          isEditMode
          updateField={updateField}
          onAddImage={() => console.log("Add image pressed")}
          onAddVideo={() => console.log("Add video pressed")}
        />

        <View style={styles.bottomSave}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.onPrimary} />
            ) : (
              <Text style={styles.saveBtnText}>
                {isCreated ? "Save Changes ✓" : "Create Profile ✓"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  bottomSave: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  saveBtnText: {
    color: COLORS.onPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
});