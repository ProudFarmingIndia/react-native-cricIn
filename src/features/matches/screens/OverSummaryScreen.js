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

export default function OverSummaryScreen() {
  const navigation = useNavigation();

  const overData = {
    score: "142/3",

    overs: "14.0",

    runRate: "10.14",

    requiredRate: "8.50",

    runsThisOver: 14,

    balls: [
      "1",
      "4",
      "0",
      "6",
      "2",
      "1",
    ],

    wickets: 0,

    striker: {
      name: "S. Gill",
      runs: 42,
      balls: 28,
    },

    nonStriker: {
      name: "R. Pant",
      runs: 22,
      balls: 13,
    },

    partnership: 68,

    partnershipBalls: 41,

    bowler: {
      name: "Mitchell Starc",

      overs: "3.0",

      maidens: 0,

      runs: 28,

      wickets: 1,
    },
  };

  const handleNextOver = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
      >
        {/* HEADER */}

        <Text style={styles.heading}>
          Over Completed
        </Text>

        <Text style={styles.subHeading}>
          Over 14.0 Finished
        </Text>

        {/* SCORE */}

        <View style={styles.scoreCard}>
          <Text style={styles.score}>
            {overData.score}
          </Text>

          <Text style={styles.overs}>
            ({overData.overs})
          </Text>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>
                Run Rate
              </Text>

              <Text
                style={
                  styles.value
                }
              >
                {
                  overData.runRate
                }
              </Text>
            </View>

            <View>
              <Text style={styles.label}>
                Req Rate
              </Text>

              <Text
                style={
                  styles.value
                }
              >
                {
                  overData.requiredRate
                }
              </Text>
            </View>
          </View>
        </View>

        {/* OVER SUMMARY */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Runs In Over
          </Text>

          <Text
            style={
              styles.bigNumber
            }
          >
            {
              overData.runsThisOver
            }
          </Text>

          <View
            style={
              styles.ballRow
            }
          >
            {overData.balls.map(
              (
                ball,
                index
              ) => (
                <View
                  key={index}
                  style={
                    styles.ball
                  }
                >
                  <Text
                    style={
                      styles.ballText
                    }
                  >
                    {ball}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* PARTNERSHIP */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Partnership
          </Text>

          <Text
            style={
              styles.partnership
            }
          >
            {
              overData.partnership
            }{" "}
            Runs
          </Text>

          <Text>
            {
              overData
                .partnershipBalls
            }{" "}
            Balls
          </Text>

          <View
            style={
              styles.row
            }
          >
            <View>
              <Text>
                {
                  overData
                    .striker
                    .name
                }
              </Text>

              <Text>
                {
                  overData
                    .striker
                    .runs
                }
                (
                {
                  overData
                    .striker
                    .balls
                }
                )
              </Text>
            </View>

            <View>
              <Text>
                {
                  overData
                    .nonStriker
                    .name
                }
              </Text>

              <Text>
                {
                  overData
                    .nonStriker
                    .runs
                }
                (
                {
                  overData
                    .nonStriker
                    .balls
                }
                )
              </Text>
            </View>
          </View>
        </View>

        {/* BOWLER */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Bowler Figures
          </Text>

          <Text
            style={
              styles.bowlerName
            }
          >
            {
              overData.bowler
                .name
            }
          </Text>

          <View
            style={
              styles.row
            }
          >
            <Text>
              O:
              {" "}
              {
                overData
                  .bowler
                  .overs
              }
            </Text>

            <Text>
              M:
              {" "}
              {
                overData
                  .bowler
                  .maidens
              }
            </Text>

            <Text>
              R:
              {" "}
              {
                overData
                  .bowler
                  .runs
              }
            </Text>

            <Text>
              W:
              {" "}
              {
                overData
                  .bowler
                  .wickets
              }
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={
          handleNextOver
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Start Next Over
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

    heading: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
    },

    subHeading: {
      textAlign: "center",
      color: "#666",
      marginBottom: 20,
    },

    scoreCard: {
      backgroundColor:
        "#fff",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },

    score: {
      fontSize: 40,
      fontWeight: "700",
      color: COLORS.primary,
    },

    overs: {
      color: "#666",
      marginBottom: 16,
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

    row: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 10,
    },

    label: {
      color: "#666",
    },

    value: {
      fontSize: 20,
      fontWeight: "700",
    },

    bigNumber: {
      fontSize: 50,
      textAlign: "center",
      fontWeight: "700",
      color:
        COLORS.secondary,
    },

    ballRow: {
      flexDirection: "row",
      justifyContent:
        "center",
      marginTop: 12,
    },

    ball: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor:
        COLORS.primary,
      justifyContent:
        "center",
      alignItems: "center",
      marginHorizontal: 4,
    },

    ballText: {
      color: "#fff",
      fontWeight: "700",
    },

    partnership: {
      fontSize: 28,
      fontWeight: "700",
      color:
        COLORS.secondary,
    },

    bowlerName: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 12,
    },

    button: {
      position: "absolute",
      bottom: 16,
      left: 16,
      right: 16,
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
      fontSize: 16,
      fontWeight: "700",
    },
  });