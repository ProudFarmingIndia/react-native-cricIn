import React from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import RunsTrendChart from "../charts/RunsTrendChart";
import StrikeRateTrendChart from "../charts/StrikeRateTrendChart";
import WicketsTrendChart from "../charts/WicketsTrendChart";
import CareerProgressionChart from "../charts/CareerProgressionChart";

export default function PerformanceChartsSection({
  profile,
}) {
  return (
    <View style={styles.container}>
      <RunsTrendChart
        data={profile.battingTrend}
      />

      <StrikeRateTrendChart
        data={
          profile.strikeRateTrend
        }
      />

      <WicketsTrendChart
        data={
          profile.wicketsTrend
        }
      />

      <CareerProgressionChart
        data={
          profile.careerProgression
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
});