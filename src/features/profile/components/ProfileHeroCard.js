// import React from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import { COLORS } from "../../../constants/colors";

// export default function ProfileHeroCard({
//   profile = {},
//   isEditMode = false,
//   updateField,
//   onEditPress,
// }) {
//   return (
//     <View style={styles.container}>
//       {/* Avatar */}
//       <View style={styles.avatarWrapper}>
//         <Image
//           source={{
//             uri: profile.profileImage || "https://i.pravatar.cc/300",
//           }}
//           style={styles.avatar}
//         />
//         {isEditMode && (
//           <TouchableOpacity
//             style={styles.editPhotoBtn}
//             onPress={onEditPress}
//           >
//             <Text style={styles.editPhotoIcon}>✎</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <Text style={styles.name}>
//         {profile.fullName || "Your Name"}
//       </Text>

//       {!isEditMode && (
//         <>
//           <Text style={styles.role}>{profile.playerRole}</Text>

//           <View style={styles.statsRow}>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {profile.followers || "0"}
//               </Text>
//               <Text style={styles.statLabel}>Followers</Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {profile.following || "0"}
//               </Text>
//               <Text style={styles.statLabel}>Following</Text>
//             </View>
//           </View>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     alignItems: "center",
//     paddingVertical: 24,
//     paddingHorizontal: 16,
//     backgroundColor: COLORS.background,
//   },

//   avatarWrapper: {
//     position: "relative",
//     marginBottom: 12,
//   },

//   avatar: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 4,
//     borderColor: COLORS.surfaceContainerHighest,
//   },

//   editPhotoBtn: {
//     position: "absolute",
//     bottom: 2,
//     right: 2,
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.secondary,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },

//   editPhotoIcon: {
//     color: COLORS.onPrimary,
//     fontSize: 16,
//   },

//   name: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: COLORS.onSurface,
//   },

//   role: {
//     fontSize: 14,
//     color: COLORS.onSurfaceVariant,
//     marginTop: 4,
//   },

//   statsRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 20,
//     gap: 32,
//   },

//   statItem: {
//     alignItems: "center",
//   },

//   statNumber: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: COLORS.onSurface,
//   },

//   statLabel: {
//     fontSize: 13,
//     color: COLORS.onSurfaceVariant,
//     marginTop: 2,
//   },

//   statDivider: {
//     width: 1,
//     height: 32,
//     backgroundColor: COLORS.outlineVariant,
//   },
// });
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { COLORS } from "../../../constants/colors";

export default function ProfileHeroCard({
  profile = {},
  isEditMode = false,
  updateField,
  onEditPress,
}) {
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri: profile.profileImage || "https://i.pravatar.cc/300",
          }}
          style={styles.avatar}
        />
        {isEditMode && (
          <TouchableOpacity
            style={styles.editPhotoBtn}
            onPress={onEditPress}
          >
            <Text style={styles.editPhotoIcon}>✎</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.name}>
        {profile.fullName || "Your Name"}
      </Text>

      {!isEditMode && (
        <>
          <Text style={styles.role}>{profile.playerRole}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile.followers || "0"}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile.following || "0"}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Edit Profile button — navigates to EditProfileScreen */}
          <TouchableOpacity style={styles.editBtn} onPress={onEditPress}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.surfaceContainerHighest,
  },

  editPhotoBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  editPhotoIcon: {
    color: COLORS.onPrimary,
    fontSize: 16,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  role: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 32,
  },

  statItem: {
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  statLabel: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.outlineVariant,
  },

  editBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },

  editBtnText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
});
