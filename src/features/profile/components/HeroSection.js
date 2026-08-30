import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../constants/colors";
import { getProfileCompletion } from "../../../utils/profileCompletion";

/*
|--------------------------------------------------------------------------
| HeroSection
|--------------------------------------------------------------------------
|
| props:
|   profile        - the player document
|   onEditPress    - open EditProfileScreen
|   onCoverPress   - pick + upload a new cover photo (optional; the camera
|                    button only renders when this is supplied, so this
|                    component stays usable read-only)
|   coverUploading - show a spinner over the cover while the upload runs
|
*/

export default function HeroSection({
  profile,
  onEditPress,
  onCoverPress,
  coverUploading = false,
}) {
  // Safe default
  const safeProfile = profile || {};

  /*
  | Computed, not read from the server. safeProfile.profileCompletion is a
  | schema field the backend never writes, so this bar sat at 0% no matter
  | how full the profile was. Same helper HomeScreen uses, so the two can
  | never disagree.
  */

  const completion = getProfileCompletion(profile);

  const coverUrl = safeProfile?.coverPhoto?.url || "";

  return (
    <View style={styles.container}>
      {/* Cover */}
      {/*
        Falls back to the flat primary block when there is no cover photo,
        so the header never looks broken on a new profile. The scrim keeps
        the avatar's white ring and the camera button readable over a
        bright photo.
      */}
      <View style={styles.cover}>
        {!!coverUrl && (
          <>
            <Image source={{ uri: coverUrl }} style={styles.coverImage} />
            <View style={styles.coverScrim} />
          </>
        )}

        {!!onCoverPress && (
          <TouchableOpacity
            style={styles.coverButton}
            onPress={onCoverPress}
            disabled={coverUploading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              coverUrl ? "Change cover photo" : "Add cover photo"
            }
          >
            {coverUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="photo-camera" size={15} color="#fff" />
                <Text style={styles.coverButtonText}>
                  {coverUrl ? "Change" : "Add Cover"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar */}
      <Image
        source={{
          uri:
            safeProfile?.profileImage?.url ||
            "https://i.pravatar.cc/300",
        }}
        style={styles.avatar}
      />

      {/* Edit */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={onEditPress}
      >
        <MaterialIcons name="edit" size={18} color="#fff" />
      </TouchableOpacity>

      {/* Player Name */}
      <Text style={styles.name}>
        {safeProfile.playerName || "Player Name"}
      </Text>

      {/* Player Type */}
      <Text style={styles.role}>
        {safeProfile.playerType || "Cricketer"}
      </Text>

      {/* Location */}
      <Text style={styles.location}>
        {[safeProfile.city, safeProfile.state]
          .filter(Boolean)
          .join(", ")}
      </Text>

      {/* Bio */}
      {!!safeProfile.bio && (
        <Text style={styles.bio}>{safeProfile.bio}</Text>
      )}

      {/* Followers */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.value}>
            {safeProfile.followers || 0}
          </Text>
          <Text style={styles.label}>Followers</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.value}>
            {safeProfile.following || 0}
          </Text>
          <Text style={styles.label}>Following</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.value}>
            {Array.isArray(safeProfile.teams) ? safeProfile.teams.length : 0}
          </Text>
          <Text style={styles.label}>Teams</Text>
        </View>
      </View>

      {/* Rankings */}
      <View style={styles.rankContainer}>
        <View style={styles.rankCard}>
          <Text style={styles.rankValue}>
            #{safeProfile?.ranking?.city || "-"}
          </Text>
          <Text style={styles.rankLabel}>City</Text>
        </View>

        <View style={styles.rankCard}>
          <Text style={styles.rankValue}>
            #{safeProfile?.ranking?.state || "-"}
          </Text>
          <Text style={styles.rankLabel}>State</Text>
        </View>

        <View style={styles.rankCard}>
          <Text style={styles.rankValue}>
            #{safeProfile?.ranking?.national || "-"}
          </Text>
          <Text style={styles.rankLabel}>National</Text>
        </View>
      </View>

      {/* Completion */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Profile Completion</Text>
          <Text style={styles.progressPercent}>{completion.percent}%</Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${completion.percent}%` },
            ]}
          />
        </View>

        {/*
          Naming what's left turns the bar from a score into a to-do.
          Three items keeps it glanceable; the rest are implied by the count.
        */}
        {!completion.isComplete && (
          <Text style={styles.progressHint} numberOfLines={2}>
            {completion.missing
              .slice(0, 3)
              .map((item) => item.label)
              .join(" \u00b7 ")}
            {completion.missing.length > 3
              ? ` \u00b7 +${completion.missing.length - 3} more`
              : ""}
          </Text>
        )}
      </View>

      {/* Edit Button */}
      <TouchableOpacity style={styles.button} onPress={onEditPress}>
        <MaterialIcons name="edit" size={18} color="#fff" />
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    alignItems: "center",
    paddingBottom: 24,
  },
  cover: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },

  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  coverScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },

  coverButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    minHeight: 32,
  },

  coverButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: -60,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  editButton: {
    position: "absolute",
    top: 178,
    right: "34%",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  role: {
    marginTop: 4,
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
  location: {
    marginTop: 4,
    color: COLORS.onSurfaceVariant,
  },
  bio: {
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: "center",
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 24,
    alignItems: "center",
  },
  stat: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: COLORS.outlineVariant,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  rankContainer: {
    flexDirection: "row",
    marginTop: 24,
    paddingHorizontal: 16,
  },
  rankCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  rankValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  rankLabel: {
    marginTop: 6,
    color: "#fff",
    fontSize: 12,
  },
  progressSection: {
    width: "92%",
    marginTop: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressTitle: {
    fontWeight: "600",
    color: COLORS.onSurface,
  },
  progressPercent: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  progressBackground: {
    height: 10,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceContainerHighest,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },
  button: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 30,
  },
  buttonText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});