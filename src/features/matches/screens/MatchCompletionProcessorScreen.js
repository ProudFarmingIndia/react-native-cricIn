import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { COLORS } from "../../../constants/colors";

const STEPS = [
  "Processing Statistics",
  "Updating Rankings",
  "Syncing Match History",
  "Generating Scorecard",
];

export default function MatchCompletionProcessorScreen() {
  const navigation =
    useNavigation();

  const [currentStep, setCurrentStep] =
    useState(0);

  useEffect(() => {
    const interval =
      setInterval(() => {
        setCurrentStep(
          (prev) => {
            if (
              prev <
              STEPS.length - 1
            ) {
              return prev + 1;
            }

            return prev;
          }
        );
      }, 1200);

    const timeout =
      setTimeout(() => {
        navigation.replace(
          "MatchCenterScreen"
        );
      }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* SUCCESS ICON */}

      <View
        style={styles.iconContainer}
      >
        <Text
          style={styles.icon}
        >
          🏏
        </Text>
      </View>

      {/* TITLE */}

      <Text style={styles.title}>
        Match Completed
      </Text>

      <Text style={styles.subTitle}>
        Finalizing match
        analytics...
      </Text>

      {/* LOADER */}

      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={{
          marginVertical: 24,
        }}
      />

      {/* STEPS */}

      <View
        style={styles.stepsContainer}
      >
        {STEPS.map(
          (
            step,
            index
          ) => (
            <View
              key={step}
              style={
                styles.stepRow
              }
            >
              <View
                style={[
                  styles.statusDot,

                  index <=
                    currentStep && {
                    backgroundColor:
                      COLORS.primary,
                  },
                ]}
              />

              <Text
                style={[
                  styles.stepText,

                  index <=
                    currentStep && {
                    color:
                      COLORS.primary,
                    fontWeight:
                      "700",
                  },
                ]}
              >
                {step}
              </Text>
            </View>
          )
        )}
      </View>

      <Text style={styles.footer}>
        Redirecting to Match
        Center...
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      justifyContent:
        "center",

      alignItems: "center",

      padding: 24,

      backgroundColor:
        COLORS.background,
    },

    iconContainer: {
      width: 100,

      height: 100,

      borderRadius: 50,

      backgroundColor:
        "#E8F5E9",

      justifyContent:
        "center",

      alignItems: "center",

      marginBottom: 20,
    },

    icon: {
      fontSize: 48,
    },

    title: {
      fontSize: 28,

      fontWeight: "700",

      color: COLORS.primary,
    },

    subTitle: {
      marginTop: 8,

      color: "#666",

      textAlign: "center",
    },

    stepsContainer: {
      width: "100%",

      marginTop: 24,
    },

    stepRow: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 16,
    },

    statusDot: {
      width: 12,

      height: 12,

      borderRadius: 6,

      backgroundColor:
        "#D9D9D9",

      marginRight: 12,
    },

    stepText: {
      fontSize: 16,

      color: "#666",
    },

    footer: {
      marginTop: 30,

      color: "#999",

      fontSize: 14,
    },
  });