import React, { useEffect, useRef } from "react";

import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector } from "react-redux";

import { navigate as navigateFromRoot } from "../../app/navigation/navigationRef";
import { useSidebar } from "../../context/SidebarContext";
import useAuth from "../../features/auth/hooks/useAuth";
import { COLORS } from "../../constants/colors";

const SIDEBAR_WIDTH = Math.min(300, Dimensions.get("window").width * 0.8);

/*
|--------------------------------------------------------------------------
| Menu Items
|--------------------------------------------------------------------------
*/

const MENU_ITEMS = [
  /*
  | Add Match and the Home screen's Quick Score button open the SAME
  | screen - QuickScoreScreen - which carries a Quick / Scheduled toggle.
  | The two entry points used to be indistinguishable: both landed on the
  | screen in "quick" mode, so "Add Match" and "Quick Score" did exactly
  | the same thing.
  |
  | Passing the mode is what makes them different. Coming from "Add Match"
  | the screen opens on Scheduled, which is what the label promises; the
  | user can still flip the toggle.
  |
  | The target is also corrected: QuickScoreFlow moved from inside the
  | Matches tab up to RootNavigator, so this route no longer resolves
  | through MainTabs > Matches and this item had stopped working.
  */
  {
    key: "addMatch",
    label: "Add Match",
    icon: "add-circle-outline",
    navigate: () =>
      navigateFromRoot("QuickScoreFlow", {
        screen: "QuickScoreScreen",
        params: { mode: "scheduled" },
      }),
  },
  /*
  | The Matches screen's Teams tab - every team on CricIn, ranked and
  | filterable. This used to open the PROFILE screen's Teams tab, which is
  | only the teams you belong to: a different list, and one already a tap
  | away from the Profile tab.
  */
  {
    key: "teams",
    label: "Teams",
    icon: "people-outline",
    navigate: () =>
      navigateFromRoot("MainTabs", {
        screen: "Matches",
        params: { screen: "MatchesScreen", params: { initialTab: "Teams" } },
      }),
  },
  /*
  | A dedicated screen listing the matches in progress that this user can
  | score. It previously opened the Matches tab - the same destination as
  | the bottom bar - so the item did nothing the bar did not already do.
  */
  {
    key: "liveScoring",
    label: "Live Scoring",
    icon: "radio-outline",
    navigate: () => navigateFromRoot("LiveScoringListScreen"),
  },
  {
    key: "createTeam",
    label: "Create Team",
    icon: "shield-outline",
    navigate: () =>
      navigateFromRoot("TeamStack", { screen: "CreateTeamScreen" }),
  },
  {
    key: "challenges",
    label: "Challenges",
    icon: "trophy-outline",
    navigate: () =>
      navigateFromRoot("TeamStack", { screen: "ChallengeInboxScreen" }),
  },
];

const LOGOUT_ITEM = {
  key: "logout",
  label: "Logout",
  icon: "log-out-outline",
};

export default function Sidebar() {
  const { isOpen, closeSidebar } = useSidebar();

  const { logoutUser } = useAuth();

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const myPlayer = useSelector((state) => state.profile?.profile);

  const authUser = useSelector((state) => state.auth?.user);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOpen, translateX]);

  const handleNavigate = (item) => {
    closeSidebar();
    item.navigate();
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  |
  | logoutUser() already clears the Redux token AND removes it from
  | AsyncStorage (see authSlice.js). No navigation call needed here -
  | AppNavigator watches state.auth.token and switches to AuthNavigator
  | automatically the moment it's cleared, same as after OTP verification.
  */

  const handleLogout = () => {
    closeSidebar();

    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logoutUser(),
      },
    ]);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={closeSidebar}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeSidebar} />

        <Animated.View
          style={[
            styles.panel,
            { width: SIDEBAR_WIDTH, transform: [{ translateX }] },
          ]}
        >
          {/* ---------------------------------------------------------- */}
          {/* User Header */}
          {/* ---------------------------------------------------------- */}

          {/*
          | The header card is now the way into your profile, which is why
          | the separate "Profile" menu item below it is gone - two rows
          | opening the same screen, one directly above the other, is just
          | a second thing to read.
          |
          | The close button stays outside the touchable so tapping the X
          | cannot also fire the navigation.
          */}

          <View style={styles.userHeader}>
            <TouchableOpacity
              style={styles.userHeaderMain}
              onPress={() => {
                closeSidebar();

                navigateFromRoot("MainTabs", { screen: "Profile" });
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{
                  uri:
                    myPlayer?.profileImage?.url || "https://placehold.co/100",
                }}
                style={styles.avatar}
              />

              <View style={styles.userText}>
                <Text style={styles.userName} numberOfLines={1}>
                  {myPlayer?.playerName || "Your Profile"}
                </Text>

                {!!authUser?.phone && (
                  <Text style={styles.userPhone}>{authUser.phone}</Text>
                )}

                <Text style={styles.userHint}>View profile</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={22}
                color={COLORS.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* Menu Items */}
          {/* ---------------------------------------------------------- */}

          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => handleNavigate(item)}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={COLORS.primary}
                  style={styles.menuIcon}
                />

                <Text style={styles.menuLabel}>{item.label}</Text>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.onSurfaceVariant}
                />
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <Ionicons
                name={LOGOUT_ITEM.icon}
                size={22}
                color={COLORS.error}
                style={styles.menuIcon}
              />

              <Text style={[styles.menuLabel, styles.logoutLabel]}>
                {LOGOUT_ITEM.label}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  panel: {
    height: "100%",
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },

  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surfaceVariant,
    marginRight: 12,
  },

  userHeaderMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  userHint: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },

  userText: {
    flex: 1,
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  userPhone: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },

  closeButton: {
    padding: 4,
  },

  menuList: {
    paddingTop: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 18,
  },

  menuIcon: {
    marginRight: 16,
  },

  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  logoutLabel: {
    color: COLORS.error,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 8,
    marginHorizontal: 18,
  },
});
