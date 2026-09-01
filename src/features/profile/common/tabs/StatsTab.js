import React from "react";
import { View, StyleSheet } from "react-native";
import SectionCard from "../../../../cards/SectionCard";
import StatCard from "../../../../cards/StatCard";

export default function StatsTab({ profile = {} }) {
  const safeProfile = profile || {};
  const stats = safeProfile?.stats || {};

  return (
    <View style={styles.container}>
      {/* ---------------- Batting ---------------- */}
      <SectionCard title="🏏 Batting Statistics">
        <View style={styles.row}>
          <StatCard label="Matches" value={stats.totalMatches ?? "-"} />
          <StatCard label="Innings" value={stats.innings ?? "-"} />
        </View>

        <View style={styles.row}>
          <StatCard label="Runs" value={stats.runs ?? "-"} />
          <StatCard label="Highest" value={stats.highestScore ?? "-"} />
        </View>

        <View style={styles.row}>
          <StatCard label="Average" value={stats.average ?? "-"} />
          <StatCard label="Strike Rate" value={stats.strikeRate ?? "-"} />
        </View>

        <View style={styles.row}>
          <StatCard label="Balls" value={stats.ballsFaced ?? "-"} />
          <StatCard label="Fours" value={stats.fours ?? "-"} />
        </View>

        <View style={styles.row}>
          <StatCard label="Sixes" value={stats.sixes ?? "-"} />
          <View style={styles.empty} />
        </View>
      </SectionCard>

      {/* ---------------- Bowling ---------------- */}
      <SectionCard title="🎯 Bowling Statistics">
        <View style={styles.row}>
          <StatCard label="Wickets" value={stats.wickets ?? "-"} />
          <StatCard label="Overs" value={stats.overs ?? "-"} />
        </View>

        <View style={styles.row}>
          <StatCard label="Economy" value={stats.economy ?? "-"} />
          <StatCard label="Maidens" value={stats.maidens ?? "-"} />
        </View>

        <View style={styles.row}>
          <StatCard
            label="Best Bowling"
            value={stats.bestBowling ?? "-"}
          />
          <View style={styles.empty} />
        </View>
      </SectionCard>

      {/* ---------------- Fielding ---------------- */}
      <SectionCard title="🧤 Fielding Statistics">
        <View style={styles.row}>
          <StatCard label="Catches" value={stats.catches ?? "-"} />
          <StatCard label="Stumpings" value={stats.stumpings ?? "-"} />
        </View>

        <View style={styles.row}>
          <StatCard label="Run Outs" value={stats.runOuts ?? "-"} />
          <StatCard label="POTM" value={stats.playerOfMatch ?? "-"} />
        </View>
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  empty: {
    flex: 1,
    margin: 6,
  },
});