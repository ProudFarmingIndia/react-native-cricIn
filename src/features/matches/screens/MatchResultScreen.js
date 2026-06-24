import React from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { COLORS } from "../../../constants/colors";

export default function MatchResultScreen() {
  const navigation = useNavigation();

  const matchResult = {
    winner: "Highlanders",
    winBy: "45 Runs",

    playerOfMatch: {
      name: "Arjun Varma",
      runs: 84,
      balls: 52,
      fours: 8,
      sixes: 3,
    },

    bestBatter: {
      name: "Liam Sterling",
      score: "62 (41)",
    },

    bestBowler: {
      name: "Kofi Mensah",
      figures: "4/28",
    },

    team1: {
      name: "Highlanders",
      score: "198/4",
      overs: "20.0",
    },

    team2: {
      name: "Strikers",
      score: "153/9",
      overs: "20.0",
    },
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
      >
        {/* WINNER CARD */}

        <View style={styles.winnerCard}>
          <Text style={styles.winnerLabel}>
            MATCH CONCLUSION
          </Text>

          <Text style={styles.winnerText}>
            {matchResult.winner}
          </Text>

          <Text style={styles.winBy}>
            Won By {matchResult.winBy}
          </Text>
        </View>

        {/* POTM */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            🏆 Player Of The Match
          </Text>

          <Text style={styles.playerName}>
            {
              matchResult.playerOfMatch
                .name
            }
          </Text>

          <Text style={styles.bigNumber}>
            {
              matchResult.playerOfMatch
                .runs
            }*
          </Text>

          <Text>
            {
              matchResult.playerOfMatch
                .balls
            }{" "}
            Balls
          </Text>

          <Text>
            {
              matchResult.playerOfMatch
                .fours
            }
            {" "}4s •{" "}
            {
              matchResult.playerOfMatch
                .sixes
            }
            {" "}6s
          </Text>
        </View>

        {/* BEST PERFORMERS */}

        <View style={styles.row}>
          <View
            style={[
              styles.smallCard,
              {
                borderLeftColor:
                  COLORS.primary,
              },
            ]}
          >
            <Text style={styles.label}>
              Best Batter
            </Text>

            <Text style={styles.name}>
              {
                matchResult.bestBatter
                  .name
              }
            </Text>

            <Text>
              {
                matchResult.bestBatter
                  .score
              }
            </Text>
          </View>

          <View
            style={[
              styles.smallCard,
              {
                borderLeftColor:
                  COLORS.secondary,
              },
            ]}
          >
            <Text style={styles.label}>
              Best Bowler
            </Text>

            <Text style={styles.name}>
              {
                matchResult.bestBowler
                  .name
              }
            </Text>

            <Text>
              {
                matchResult.bestBowler
                  .figures
              }
            </Text>
          </View>
        </View>

        {/* MATCH SUMMARY */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Match Summary
          </Text>

          <View style={styles.teamRow}>
            <Text style={styles.teamName}>
              {
                matchResult.team1
                  .name
              }
            </Text>

            <Text style={styles.teamScore}>
              {
                matchResult.team1
                  .score
              }
            </Text>
          </View>

          <Text style={styles.overs}>
            ({
              matchResult.team1
                .overs
            } Ov)
          </Text>

          <View
            style={styles.divider}
          />

          <View style={styles.teamRow}>
            <Text style={styles.teamName}>
              {
                matchResult.team2
                  .name
              }
            </Text>

            <Text style={styles.teamScore}>
              {
                matchResult.team2
                  .score
              }
            </Text>
          </View>

          <Text style={styles.overs}>
            ({
              matchResult.team2
                .overs
            } Ov)
          </Text>
        </View>
      </ScrollView>

      {/* ACTIONS */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scorecardBtn}
          onPress={() =>
            navigation.navigate(
              "ScorecardScreen"
            )
          }
        >
          <Text
            style={
              styles.scorecardText
            }
          >
            View Scorecard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.centerBtn}
          onPress={() =>
            navigation.replace(
              "MatchCenterScreen"
            )
          }
        >
          <Text
            style={
              styles.centerText
            }
          >
            Match Center
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    winnerCard: {
      backgroundColor:
        COLORS.primary,
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
    },

    winnerLabel: {
      color: "#fff",
      opacity: 0.8,
      fontSize: 12,
    },

    winnerText: {
      color: "#fff",
      fontSize: 32,
      fontWeight: "700",
      marginTop: 10,
    },

    winBy: {
      color: "#fff",
      marginTop: 8,
    },

    card: {
      backgroundColor:
        "#fff",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
    },

    playerName: {
      fontSize: 22,
      fontWeight: "700",
    },

    bigNumber: {
      fontSize: 52,
      fontWeight: "700",
      color: COLORS.primary,
    },

    row: {
      flexDirection: "row",
      marginBottom: 16,
    },

    smallCard: {
      flex: 1,
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 4,
      borderLeftWidth: 5,
    },

    label: {
      color: "#666",
      marginBottom: 6,
    },

    name: {
      fontWeight: "700",
    },

    teamRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    teamName: {
      fontWeight: "700",
      fontSize: 18,
    },

    teamScore: {
      fontWeight: "700",
      fontSize: 20,
      color: COLORS.primary,
    },

    overs: {
      color: "#666",
      marginBottom: 10,
    },

    divider: {
      height: 1,
      backgroundColor: "#eee",
      marginVertical: 12,
    },

    footer: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
      flexDirection: "row",
    },

    scorecardBtn: {
      flex: 1,
      height: 56,
      borderRadius: 12,
      backgroundColor:
        COLORS.primary,
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 8,
    },

    centerBtn: {
      flex: 1,
      height: 56,
      borderRadius: 12,
      backgroundColor:
        COLORS.secondary,
      justifyContent:
        "center",
      alignItems: "center",
      marginLeft: 8,
    },

    scorecardText: {
      color: "#fff",
      fontWeight: "700",
    },

    centerText: {
      color: "#fff",
      fontWeight: "700",
    },
  });