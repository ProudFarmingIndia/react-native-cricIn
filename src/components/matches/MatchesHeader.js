import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { COLORS } from "../../constants/colors";

import { MaterialIcons } from "@expo/vector-icons";

export default function MatchesHeader() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* LEFT LOGO SECTION */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <MaterialIcons
              name="sports-cricket"
              size={22}
              color="#fff"
            />
          </View>

          <View>
            <Text style={styles.logoTitle}>
              Cricket Pro
            </Text>

            <Text style={styles.logoSubtitle}>
              Live Scores & Tournaments
            </Text>
          </View>
        </View>

        {/* RIGHT ICONS */}
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons
              name="search"
              size={22}
              color={COLORS.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons
              name="notifications-none"
              size={22}
              color={COLORS.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton}>
            <MaterialIcons
              name="person"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
  },

  header: {
    height: 75,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  logoTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  logoSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
    fontWeight: "500",
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    elevation: 2,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    elevation: 2,
  },
});