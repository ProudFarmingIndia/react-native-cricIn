// src/screens/profile/ProfileScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import { COLORS } from "../../constants/colors";
import { SPACING } from "../../constants/spacing";
import { TYPOGRAPHY } from "../../constants/typography";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.icon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Player Profile</Text>

          <TouchableOpacity>
            <Text style={styles.icon}>⤴</Text>
          </TouchableOpacity>
        </View>

        {/* HERO SECTION */}
        <View style={styles.heroCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200&auto=format&fit=crop",
            }}
            style={styles.profileImage}
          />

          <View style={styles.verifyBadge}>
            <Text style={styles.verifyText}>✔</Text>
          </View>

          <Text style={styles.playerName}>
            Arjun "The Wall" Sharma
          </Text>

          <Text style={styles.playerInfo}>
            India • 12 July 1998 • Right Hand Batsman
          </Text>

          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>
              Rank #4 • 14,250 Points
            </Text>
          </View>

          {/* FOLLOW STATS */}
          <View style={styles.followRow}>
            <View style={styles.followItem}>
              <Text style={styles.followValue}>1.2M</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </View>

            <View style={styles.followItem}>
              <Text style={styles.followValue}>142</Text>
              <Text style={styles.followLabel}>Following</Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BATTING ANALYTICS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🏏 Batting Analytics
          </Text>

          <View style={styles.statsGrid}>
            {[
              { label: "Average", value: "42.5" },
              { label: "Strike Rate", value: "138.2" },
              { label: "100s", value: "4" },
              { label: "50s", value: "18" },
              { label: "4s", value: "245" },
              { label: "6s", value: "82" },
            ].map((item, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statLabel}>
                  {item.label}
                </Text>

                <Text style={styles.statValue}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* WAGON WHEEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎯 Wagon Wheel Analytics
          </Text>

          <View style={styles.wagonCard}>
            <View style={styles.wagonCircle}>
              <View style={styles.centerDot} />
            </View>

            <Text style={styles.wagonText}>
              Primary Scoring Area:
            </Text>

            <Text style={styles.wagonHighlight}>
              Mid-Wicket (32%)
            </Text>
          </View>
        </View>

        {/* BOWLING PERFORMANCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ⚡ Bowling Performance
          </Text>

          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>
                Wickets
              </Text>

              <Text style={styles.performanceValue}>
                12
              </Text>
            </View>

            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>
                Economy
              </Text>

              <Text style={styles.performanceValue}>
                5.8
              </Text>
            </View>

            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>
                Best Spell
              </Text>

              <Text style={styles.performanceValue}>
                3/24
              </Text>
            </View>
          </View>
        </View>

        {/* RECENT MATCHES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📅 Recent Matches
          </Text>

          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.matchCard}>
              <View>
                <Text style={styles.matchTeams}>
                  India vs Australia
                </Text>

                <Text style={styles.matchVenue}>
                  Sydney Cricket Ground
                </Text>
              </View>

              <View style={styles.matchRight}>
                <Text style={styles.matchResult}>
                  Won
                </Text>

                <Text style={styles.matchDate}>
                  15 Oct 2023
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* HIGHLIGHTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎥 Match Highlights
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.highlightCard}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop",
                  }}
                  style={styles.highlightImage}
                />

                <Text style={styles.highlightTitle}>
                  Match Highlight #{item}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContainer: {
    padding: SPACING.lg,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  icon: {
    fontSize: 24,
    color: COLORS.primary,
  },

  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },

  verifyBadge: {
    position: "absolute",
    top: 110,
    right: 120,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  verifyText: {
    color: "#fff",
    fontWeight: "700",
  },

  playerName: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primary,
    textAlign: "center",
  },

  playerInfo: {
    marginTop: 8,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  rankBadge: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  rankText: {
    color: "#fff",
    fontWeight: "700",
  },

  followRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 40,
  },

  followItem: {
    alignItems: "center",
  },

  followValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  followLabel: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },

  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },

  followBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  editBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },

  editBtnText: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  section: {
    marginBottom: SPACING.xl,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 18,
    color: COLORS.textPrimary,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  statLabel: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },

  wagonCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
  },

  wagonCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },

  wagonText: {
    color: COLORS.textSecondary,
  },

  wagonHighlight: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },

  performanceCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
  },

  performanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  performanceLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },

  performanceValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
  },

  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  matchTeams: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  matchVenue: {
    marginTop: 4,
    color: COLORS.textSecondary,
  },

  matchRight: {
    alignItems: "flex-end",
  },

  matchResult: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  matchDate: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  highlightCard: {
    width: 260,
    marginRight: 16,
  },

  highlightImage: {
    width: "100%",
    height: 150,
    borderRadius: 18,
  },

  highlightTitle: {
    marginTop: 10,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});