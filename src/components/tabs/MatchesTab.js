// screens/matches/tabs/MatchesTab.js

import React from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

// const COLORS = {
//   primary: "#00490e",
//   secondary: "#8f4e00",
//   background: "#f7fbf1",
//   surface: "#ffffff",
//   text: "#181d17",
//   textLight: "#40493d",
//   border: "#dfe5d9",
//   card: "#ffffff",
//   error: "#ba1a1a",
// };

export default function MatchesTab() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* LIVE MATCHES */}
        <View style={styles.sectionHeader}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />

            <Text style={styles.sectionTitle}>
              Live Matches
            </Text>
          </View>

          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>
              See all
            </Text>

            <MaterialIcons
              name="chevron-right"
              size={18}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 16,
            paddingRight: 10,
          }}
        >
          {/* LIVE CARD 1 */}
          <View style={styles.liveCard}>
            <View style={styles.liveCardHeader}>
              <Text style={styles.liveBadge}>
                LIVE • IPL 2026
              </Text>

              <Text style={styles.overText}>
                Overs: 18.4
              </Text>
            </View>

            <View style={styles.teamRow}>
              <View style={styles.teamLeft}>
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/men/32.jpg",
                  }}
                  style={styles.teamImage}
                />

                <Text style={styles.teamName}>
                  RCB
                </Text>
              </View>

              <Text style={styles.score}>
                182/4
              </Text>
            </View>

            <View style={[styles.teamRow, { opacity: 0.6 }]}>
              <View style={styles.teamLeft}>
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/men/12.jpg",
                  }}
                  style={styles.teamImage}
                />

                <Text style={styles.teamName}>
                  CSK
                </Text>
              </View>

              <Text style={styles.pendingText}>
                Yet to bat
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>
                Kohli 78* (44) • Deshpande 2/32
              </Text>
            </View>
          </View>

          {/* LIVE CARD 2 */}
          <View style={styles.liveCard}>
            <View style={styles.liveCardHeader}>
              <Text style={styles.liveBadge}>
                LIVE • TEST
              </Text>

              <Text style={styles.overText}>
                Day 3
              </Text>
            </View>

            <View style={styles.teamRow}>
              <View style={styles.teamLeft}>
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/men/55.jpg",
                  }}
                  style={styles.teamImage}
                />

                <Text style={styles.teamName}>
                  AUS
                </Text>
              </View>

              <Text style={styles.score}>
                284 & 112/2
              </Text>
            </View>

            <View style={styles.teamRow}>
              <View style={styles.teamLeft}>
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/men/75.jpg",
                  }}
                  style={styles.teamImage}
                />

                <Text style={styles.teamName}>
                  IND
                </Text>
              </View>

              <Text style={styles.score}>
                210
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>
                Australia lead by 186 runs
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* UPCOMING MATCHES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Upcoming Matches
          </Text>

          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>
              Calendar
            </Text>

            <MaterialIcons
              name="calendar-month"
              size={18}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 16,
            paddingRight: 10,
          }}
        >
          <View style={styles.upcomingCard}>
            <Text style={styles.matchTime}>
              TOMORROW, 19:30
            </Text>

            <View style={styles.upcomingTeamRow}>
              <Text style={styles.upcomingTeam}>
                MI
              </Text>

              <Text style={styles.vsText}>
                VS
              </Text>

              <Text style={styles.upcomingTeam}>
                LSG
              </Text>
            </View>

            <Text style={styles.groundText}>
              IPL • Wankhede Stadium
            </Text>
          </View>

          <View style={styles.upcomingCard}>
            <Text style={styles.matchTime}>
              25 MAY, 15:00
            </Text>

            <View style={styles.upcomingTeamRow}>
              <Text style={styles.upcomingTeam}>
                ENG
              </Text>

              <Text style={styles.vsText}>
                VS
              </Text>

              <Text style={styles.upcomingTeam}>
                PAK
              </Text>
            </View>

            <Text style={styles.groundText}>
              T20I • Edgbaston
            </Text>
          </View>
        </ScrollView>

        {/* RECENT RESULTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent Results
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 16,
            paddingRight: 10,
          }}
        >
          <View style={styles.resultCard}>
            <Text style={styles.resultDate}>
              FINISHED • YESTERDAY
            </Text>

            <View style={styles.resultRow}>
              <View style={styles.resultTeam}>
                <Text style={styles.resultTeamName}>
                  GT
                </Text>

                <Text style={styles.resultScore}>
                  210/4
                </Text>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.resultTeam}>
                <Text style={styles.resultTeamName}>
                  KKR
                </Text>

                <Text
                  style={[
                    styles.resultScore,
                    { color: COLORS.primary },
                  ]}
                >
                  211/3
                </Text>
              </View>
            </View>

            <Text style={styles.winText}>
              KKR won by 7 wickets
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultDate}>
              FINISHED • 20 MAY
            </Text>

            <View style={styles.resultRow}>
              <View style={styles.resultTeam}>
                <Text style={styles.resultTeamName}>
                  SRH
                </Text>

                <Text
                  style={[
                    styles.resultScore,
                    { color: COLORS.primary },
                  ]}
                >
                  245/2
                </Text>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.resultTeam}>
                <Text style={styles.resultTeamName}>
                  PBKS
                </Text>

                <Text style={styles.resultScore}>
                  180/8
                </Text>
              </View>
            </View>

            <Text style={styles.winText}>
              SRH won by 65 runs
            </Text>
          </View>
        </ScrollView>
      </ScrollView>

      {/* FLOAT BUTTON */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons
          name="add"
          size={30}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  liveRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },

  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  seeAllText: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  liveCard: {
    width: 310,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  liveCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  liveBadge: {
    backgroundColor: "#ffdad6",
    color: "#93000a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "700",
  },

  overText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "600",
  },

  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  teamLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  teamImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  teamName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  score: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },

  pendingText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textLight,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 14,
    marginTop: 8,
  },

  footerText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },

  upcomingCard: {
    width: 240,
    backgroundColor: "#eef2eb",
    borderRadius: 18,
    padding: 18,
    marginRight: 14,
  },

  matchTime: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: "700",
    marginBottom: 18,
  },

  upcomingTeamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  upcomingTeam: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },

  vsText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textLight,
  },

  groundText: {
    marginTop: 22,
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "600",
  },

  resultCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  resultDate: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "700",
    marginBottom: 18,
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultTeam: {
    flex: 1,
    alignItems: "center",
  },

  resultDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#e5e7eb",
  },

  resultTeamName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textLight,
    marginBottom: 8,
  },

  resultScore: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },

  winText: {
    marginTop: 20,
    textAlign: "center",
    color: COLORS.secondary,
    fontWeight: "700",
    fontSize: 13,
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom: 95,
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#ff8f04",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
});