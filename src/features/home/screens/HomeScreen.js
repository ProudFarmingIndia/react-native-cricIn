import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../../constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialIcons
            name="sports-cricket"
            size={26}
            color={COLORS.primary}
          />

          <Text style={styles.logoText}>PitchMaster Pro</Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="chat-bubble" size={20} color="#222" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="notifications" size={20} color="#222" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* PROFILE STATUS */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("Profile", {
              screen: "EditProfileScreen",
            })
          }
        >
          <View style={styles.profileTop}>
            <View>
              <Text style={styles.sectionLabel}>PROFILE STATUS</Text>
              <Text style={styles.title}>Almost there, Champ!</Text>
            </View>

            <Text style={styles.progressText}>75%</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.description}>
            Complete your profile to unlock advanced scout analytics.
          </Text>
        </TouchableOpacity>

        {/* LIVE MATCH */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Matches</Text>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>2 ACTIVE</Text>
          </View>
        </View>

        <View style={[styles.card, styles.liveCard]}>
          <View style={styles.matchHeader}>
            <Text style={styles.yourMatch}>YOUR MATCH</Text>
            <Text style={styles.seriesText}>WORLD CUP QUALIFIERS</Text>
          </View>

          <View style={styles.scoreContainer}>
            {/* TEAM 1 */}
            <View style={styles.teamBox}>
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
                }}
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>India</Text>
            </View>

            {/* SCORE */}
            <View style={styles.scoreBox}>
              <Text style={styles.score}>245/4</Text>
              <Text style={styles.overText}>38.2 OVERS</Text>
            </View>

            {/* TEAM 2 */}
            <View style={styles.teamBox}>
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg",
                }}
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>Australia</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>VIEW SCORECARD</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickGrid}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Matches", {
                screen: "QuickScoreFlow",
              })
            }
            style={styles.quickCard}
          >
            <View style={styles.quickIcon}>
              <MaterialIcons
                name="edit-note"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.quickText}>QUICK SCORE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Matches", {
                screen: "CreateTeamScreen",
              })
            }
            style={styles.quickCard}
          >
            <View style={styles.quickIcon}>
              <MaterialIcons name="groups" size={22} color={COLORS.primary} />
            </View>

            <Text style={styles.quickText}>CREATE TEAM</Text>
          </TouchableOpacity>
        </View>

        {/* POPULAR PLAYERS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Cricketers</Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.playerCard}>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/men/32.jpg",
                }}
                style={styles.playerImage}
              />

              <Text style={styles.playerName}>Virat Kohli</Text>

              <Text style={styles.playerStats}>BAT: 2450 | WKT: 12</Text>

              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followText}>FOLLOW</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* UPCOMING MATCHES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Matches</Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.upcomingCard}>
            <Text style={styles.matchDate}>TOMORROW, 14:30</Text>

            <View style={styles.upcomingRow}>
              <Text style={styles.upcomingTeam}>ENG</Text>

              <Text style={styles.vsText}>VS</Text>

              <Text style={styles.upcomingTeam}>RSA</Text>
            </View>

            <View style={styles.groundBox}>
              <Text style={styles.groundText}>LORDS CRICKET GROUND</Text>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 65,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: 8,
  },

  headerIcons: {
    flexDirection: "row",
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  profileTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "700",
    letterSpacing: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 5,
  },

  progressText: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primary,
  },

  progressBar: {
    height: 10,
    backgroundColor: "#e8ece4",
    borderRadius: 50,
    marginTop: 18,
    overflow: "hidden",
  },

  progressFill: {
    width: "75%",
    height: "100%",
    backgroundColor: COLORS.primary,
  },

  description: {
    marginTop: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },

  sectionHeader: {
    marginTop: 22,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    marginRight: 6,
  },

  liveText: {
    color: COLORS.secondary,
    fontWeight: "700",
    fontSize: 12,
  },

  liveCard: {
    borderTopWidth: 5,
    borderTopColor: COLORS.primary,
  },

  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  yourMatch: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 12,
  },

  seriesText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: "600",
  },

  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  teamBox: {
    alignItems: "center",
  },

  teamImage: {
    width: 65,
    height: 65,
    borderRadius: 40,
    marginBottom: 8,
  },

  teamName: {
    fontWeight: "700",
    color: COLORS.text,
  },

  scoreBox: {
    alignItems: "center",
  },

  score: {
    fontSize: 38,
    fontWeight: "800",
    color: COLORS.primary,
  },

  overText: {
    marginTop: 4,
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: "700",
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
  },

  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 14,
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#dff1df",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  quickText: {
    fontWeight: "700",
    color: COLORS.text,
    fontSize: 12,
  },

  seeAll: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 12,
  },

  playerCard: {
    width: 170,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginLeft: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  playerImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginBottom: 12,
  },

  playerName: {
    fontWeight: "700",
    fontSize: 16,
    color: COLORS.text,
  },

  playerStats: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 6,
    marginBottom: 14,
  },

  followButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },

  followText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 11,
  },

  upcomingCard: {
    width: 280,
    backgroundColor: "#fff",
    marginLeft: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  matchDate: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 18,
  },

  upcomingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  upcomingTeam: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  vsText: {
    color: COLORS.textLight,
    fontWeight: "700",
  },

  groundBox: {
    backgroundColor: "#eef2eb",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  groundText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "700",
  },
});
