import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../../constants/colors";

export default function StepIndicator({
  currentStep = 1,
  totalSteps = 2,
  title = "",
}) {
  return (
    <View style={styles.container}>
      {/* Left */}

      {/* Add the Back Icon <- Arrow button here */}

      <View>
        {title ? <Text style={styles.title}>{title}</Text> : null}

        <Text style={styles.subtitle}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>

      {/* Right */}

      <View style={styles.stepContainer}>
        {Array.from({
          length: totalSteps,
        }).map((_, index) => {
          const step = index + 1;

          return (
            <React.Fragment key={step}>
              <View
                style={[
                  styles.circle,

                  step <= currentStep && styles.activeCircle,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,

                    step <= currentStep && styles.activeCircleText,
                  ]}
                >
                  {step}
                </Text>
              </View>

              {step !== totalSteps && (
                <View
                  style={[styles.line, step < currentStep && styles.activeLine]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const CIRCLE_SIZE = 32;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 24,
  },

  title: {
    fontSize: 24,

    fontWeight: "700",

    color: COLORS.primary,
  },

  subtitle: {
    marginTop: 4,

    fontSize: 13,

    fontWeight: "600",

    color: "#6B7280",

    textTransform: "uppercase",

    letterSpacing: 1,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  activeCircle: {
    backgroundColor: COLORS.primary,
  },
  circleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  activeCircleText: {
    color: "#FFF",
  },
  line: {
    width: 42,
    height: 4,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: "#E5E7EB",
  },
  activeLine: {
    backgroundColor: COLORS.primary,
  },
});