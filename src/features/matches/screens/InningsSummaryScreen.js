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

export default function InningsSummaryScreen() {
  const navigation = useNavigation();

  const inningsData = {
    score: 184,
    wickets: 6,
    overs: "20.0",
    runRate: "9.20",

    fours: 16,
    sixes: 8,

    topBatter: {
      name: "Virat Kohli",
      runs: 78,
      balls: 42,
      strikeRate: 185.7,
    },

    topBowler: {
      name: "Jasprit Bumrah",
      wickets: 3,
      runs: 22,
      overs: 4,
      economy: 5.5,
    },

    phases: [
      {
        title: "Powerplay",
        score: "54/1",
        rr: "9.00",
      },
      {
        title: "Middle Overs",
        score: "82/3",
        rr: "9.11",
      },
      {
        title: "Death Overs",
        score: "48/2",
        rr: "9.60",
      },
    ],
  };

  const handleStartSecondInnings =
    () => {
      navigation.replace(
        "SecondInningsScreen"
      );
    };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
      >
        {/* HERO */}

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>
            1st Innings Completed
          </Text>

          <Text style={styles.heroScore}>
            {inningsData.score}
            <Text
              style={
                styles.heroWickets
              }
            >
              /{inningsData.wickets}
            </Text>
          </Text>

          <Text style={styles.heroInfo}>
            Overs: {inningsData.overs}
            {" • "}
            RR: {inningsData.runRate}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.smallCard}>
              <Text
                style={
                  styles.smallLabel
                }
              >
                4s
              </Text>

              <Text
                style={
                  styles.smallValue
                }
              >
                {inningsData.fours}
              </Text>
            </View>

            <View style={styles.smallCard}>
              <Text
                style={
                  styles.smallLabel
                }
              >
                6s
              </Text>

              <Text
                style={
                  styles.smallValue
                }
              >
                {inningsData.sixes}
              </Text>
            </View>
          </View>
        </View>

        {/* TOP BATTER */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            ⭐ Top Batter
          </Text>

          <Text style={styles.playerName}>
            {
              inningsData
                .topBatter
                .name
            }
          </Text>

          <Text style={styles.bigText}>
            {
              inningsData
                .topBatter
                .runs
            }
          </Text>

          <Text>
            {
              inningsData
                .topBatter
                .balls
            }{" "}
            Balls
          </Text>

          <Text>
            SR:
            {" "}
            {
              inningsData
                .topBatter
                .strikeRate
            }
          </Text>
        </View>

        {/* TOP BOWLER */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🎯 Top Bowler
          </Text>

          <Text style={styles.playerName}>
            {
              inningsData
                .topBowler
                .name
            }
          </Text>

          <Text style={styles.bigText}>
            {
              inningsData
                .topBowler
                .wickets
            }
            /
            {
              inningsData
                .topBowler
                .runs
            }
          </Text>

          <Text>
            {
              inningsData
                .topBowler
                .overs
            }{" "}
            Overs
          </Text>

          <Text>
            Econ:
            {" "}
            {
              inningsData
                .topBowler
                .economy
            }
          </Text>
        </View>

        {/* WAGON WHEEL */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Wagon Wheel
          </Text>

          <View
            style={
              styles.wagonWheel
            }
          >
            <Text>
              Wagon Wheel
            </Text>
          </View>
        </View>

        {/* PHASES */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Phase Wise Analysis
          </Text>

          {inningsData.phases.map(
            (
              phase,
              index
            ) => (
              <View
                key={index}
                style={
                  styles.phaseRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.phaseTitle
                    }
                  >
                    {phase.title}
                  </Text>
                </View>

                <View>
                  <Text>
                    {
                      phase.score
                    }
                  </Text>

                  <Text>
                    RR{" "}
                    {phase.rr}
                  </Text>
                </View>
              </View>
            )
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={
          handleStartSecondInnings
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Start Second Innings
        </Text>
      </TouchableOpacity>
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

    hero: {
      backgroundColor:
        "#fff",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },

    heroLabel: {
      color: "#666",
      fontWeight: "700",
    },

    heroScore: {
      fontSize: 52,
      fontWeight: "700",
      color: COLORS.primary,
    },

    heroWickets: {
      color: "#666",
    },

    heroInfo: {
      color: "#666",
      marginTop: 4,
    },

    statsRow: {
      flexDirection: "row",
      marginTop: 16,
    },

    smallCard: {
      flex: 1,
      backgroundColor:
        "#F5F5F5",
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 4,
      alignItems: "center",
    },

    smallLabel: {
      color:
        COLORS.secondary,
    },

    smallValue: {
      fontSize: 24,
      fontWeight: "700",
    },

    card: {
      backgroundColor:
        "#fff",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },

    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
    },

    playerName: {
      fontSize: 20,
      fontWeight: "700",
    },

    bigText: {
      fontSize: 42,
      fontWeight: "700",
      color: COLORS.primary,
    },

    wagonWheel: {
      height: 220,
      borderRadius: 110,
      backgroundColor:
        "#2E7D32",
      justifyContent:
        "center",
      alignItems: "center",
    },

    phaseRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        "#eee",
    },

    phaseTitle: {
      fontWeight: "700",
    },

    button: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
      height: 56,
      backgroundColor:
        COLORS.primary,
      borderRadius: 12,
      justifyContent:
        "center",
      alignItems: "center",
    },

    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },
  });