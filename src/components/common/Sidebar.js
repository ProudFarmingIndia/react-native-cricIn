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
  | Live Now and Upcoming both open the Matches tab with a category
  | pre-selected. They are shortcuts into the screen the bottom bar
  | already reaches, which is fine - the bar lands on "All" and these
  | land on the one list you asked for, which on a busy account is the
  | difference between scrolling and not.
  |
  | initialTab is validated by MatchesScreen and initialCategory by
  | MatchesTab, so a stale value here falls back to the default rather
  | than rendering an empty screen.
  */
  {
    key: "liveNow",
    label: "Live Now",
    icon: "flash-outline",
    navigate: () =>
      navigateFromRoot("MainTabs", {
        screen: "Matches",
        params: {
          screen: "MatchesScreen",
          params: { initialTab: "Matches", initialCategory: "live" },
        },
      }),
  },
  {
    key: "upcomingMatches",
    label: "Upcoming Matches",
    icon: "calendar-outline",
    navigate: () =>
      navigateFromRoot("MainTabs", {
        screen: "Matches",
        params: {
          screen: "MatchesScreen",
          params: { initialTab: "Matches", initialCategory: "upcoming" },
        },
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
  /*
  | Live Streaming is its own item, NOT a mode of Live Scoring.
  |
  | They are two different jobs done by two different people: scoring is
  | the captain recording every ball, streaming is somebody holding a
  | phone. Merging them into one entry would put a camera operator - who
  | is often in neither squad - behind a screen called "Live Scoring".
  |
  | The screen it opens does double duty on purpose: every match currently
  | being streamed, and above them, any match THIS user has been asked to
  | film. That second list is the only way an invited outsider can find
  | their match at all - every other feed in the app filters by team
  | membership.
  */
  {
    key: "liveStreaming",
    label: "Live Streaming",
    icon: "videocam-outline",
    navigate: () => navigateFromRoot("LiveStreamingListScreen"),
  },
  /*
  | Tournaments get two entries rather than one.
  |
  | Browsing and organizing are done by different people at different
  | moments: almost everyone opening this menu wants to look at a
  | tournament, and a much smaller number want to start one. Behind a
  | single "Tournaments" item the create button is one screen further away
  | for the organizer and invisible to everyone else, which is the wrong
  | trade in both directions.
  |
  | "Create Tournament" is deliberately open to everyone today. The
  | subscription gate lives in exactly one place on the server
  | (canCreateTournament), so when it turns on, this item starts refusing
  | with a real message instead of quietly disappearing - which is what a
  | user needs in order to know a subscription exists.
  */
  {
    key: "tournaments",
    /* medal, not trophy - "Challenges" below already owns the trophy. */
    label: "Tournaments",
    icon: "medal-outline",
    navigate: () => navigateFromRoot("TournamentListScreen"),
  },
  {
    key: "createTournament",
    label: "Create Tournament",
    icon: "add-circle-outline",
    navigate: () => navigateFromRoot("CreateTournamentScreen"),
  },
  /*
  | Series sits next to Tournaments and gets the same two-entry treatment,
  | for the same reason: browsing and organizing are done by different
  | people at different moments.
  |
  | They are separate items rather than one "Competitions" entry because
  | they are separate things a user chooses between deliberately. A
  | tournament is "many teams, one winner"; a series is "us against them,
  | over N games". Somebody who wants to challenge one rival should not
  | have to go through a screen about tournaments to do it.
  */
  {
    key: "series",
    label: "Series",
    icon: "git-compare-outline",
    navigate: () => navigateFromRoot("SeriesListScreen"),
  },
  {
    key: "createSeries",
    label: "Create Series",
    icon: "add-circle-outline",
    navigate: () => navigateFromRoot("CreateSeriesScreen"),
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