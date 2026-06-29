import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { COLORS } from "../../../constants/colors";

export default function ProfileHeroCard({
  profile = {},
  isEditMode = false,

  uploading = false,

  updateField,

  onUploadProfileImage,
  onRemoveProfileImage,

  onEditPress,
}) {
  const profileImage =
    profile?.profileImage?.url || "https://i.pravatar.cc/300";

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri: profileImage,
          }}
          style={styles.avatar}
        />

        {uploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}

        {isEditMode && (
          <>
            {/* Upload */}
            <TouchableOpacity
              style={styles.editPhotoBtn}
              onPress={onUploadProfileImage}
            >
              <Text style={styles.editPhotoIcon}>📷</Text>
            </TouchableOpacity>

            {/* Remove */}
            {profile?.profileImage?.url ? (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={onRemoveProfileImage}
              >
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>

      {isEditMode ? (
        <TextInput
          style={styles.nameInput}
          placeholder="Player Name"
          value={profile?.playerName}
          onChangeText={(text) => updateField("playerName", text)}
        />
      ) : (
        <Text style={styles.name}>{profile?.playerName || "Player Name"}</Text>
      )}

      {/* Player Type */}
      <Text style={styles.role}>{profile?.playerType || "Player"}</Text>

      {/* Followers */}
      {!isEditMode && (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.followers || 0}</Text>

              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.following || 0}</Text>

              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: COLORS.surfaceContainerHighest,
  },

  loadingOverlay: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  editPhotoBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,

    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: COLORS.primary,

    justifyContent: "center",
    alignItems: "center",

    elevation: 5,
  },

  editPhotoIcon: {
    fontSize: 18,
  },

  removeBtn: {
    position: "absolute",

    top: 0,
    left: 0,

    width: 30,
    height: 30,

    borderRadius: 15,

    backgroundColor: "#E53935",

    justifyContent: "center",
    alignItems: "center",
  },

  removeText: {
    color: "#fff",
    fontWeight: "700",
  },

  name: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  role: {
    marginTop: 5,
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 24,
    alignItems: "center",
  },

  statItem: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: COLORS.outlineVariant,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  statLabel: {
    marginTop: 4,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },

  editButton: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
  },

  editButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    minWidth: 220,
    textAlign: "center",
    paddingVertical: 4,
  },
});
