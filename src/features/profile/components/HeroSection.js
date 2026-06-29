import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../constants/colors";

export default function HeroSection({
  profile,
  onEditPress,
}) {
  profile = profile || {};

  return (
    <View style={styles.container}>
      {/* Cover */}

      <View style={styles.cover} />

      {/* Avatar */}

      <Image
        source={{
          uri:
            profile?.profileImage?.url ||
            "https://i.pravatar.cc/300",
        }}
        style={styles.avatar}
      />

      {/* Edit */}

      <TouchableOpacity
        style={styles.editButton}
        onPress={onEditPress}
      >
        <MaterialIcons
          name="edit"
          size={18}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Player Name */}

      <Text style={styles.name}>
        {profile.playerName || "Player Name"}
      </Text>

      {/* Player Type */}

      <Text style={styles.role}>
        {profile.playerType || "Cricketer"}
      </Text>

      {/* Location */}

      <Text style={styles.location}>
        {[profile.city, profile.state]
          .filter(Boolean)
          .join(", ")}
      </Text>

      {/* Bio */}

      {!!profile.bio && (
        <Text style={styles.bio}>
          {profile.bio}
        </Text>
      )}

      {/* Followers */}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.value}>
            {profile.followers || 0}
          </Text>

          <Text style={styles.label}>
            Followers
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.value}>
            {profile.following || 0}
          </Text>

          <Text style={styles.label}>
            Following
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.value}>
            {profile.teams?.length || 0}
          </Text>

          <Text style={styles.label}>
            Teams
          </Text>
        </View>
      </View>

      {/* Rankings */}

      <View style={styles.rankContainer}>
        <View style={styles.rankCard}>
          <Text style={styles.rankValue}>
            #{profile?.ranking?.city || "-"}
          </Text>

          <Text style={styles.rankLabel}>
            City
          </Text>
        </View>

        <View style={styles.rankCard}>
          <Text style={styles.rankValue}>
            #{profile?.ranking?.state || "-"}
          </Text>

          <Text style={styles.rankLabel}>
            State
          </Text>
        </View>

        <View style={styles.rankCard}>
          <Text style={styles.rankValue}>
            #{profile?.ranking?.national || "-"}
          </Text>

          <Text style={styles.rankLabel}>
            National
          </Text>
        </View>
      </View>

      {/* Completion */}

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            Profile Completion
          </Text>

          <Text style={styles.progressPercent}>
            {profile.profileCompletion || 0}%
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${profile.profileCompletion || 0}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Edit Button */}

      <TouchableOpacity
        style={styles.button}
        onPress={onEditPress}
      >
        <MaterialIcons
          name="edit"
          size={18}
          color="#fff"
        />

        <Text style={styles.buttonText}>
          Edit Profile
        </Text>
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