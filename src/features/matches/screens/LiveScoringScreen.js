import React, { useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import MatchHeader from "../../../components/matches/LiveScoringScreen/MatchHeader";
import ChaseStats from "../../../components/matches/LiveScoringScreen/ChaseStats";
import PlayerStats from "../../../components/matches/LiveScoringScreen/PlayerStats";
import ScoringPad from "../../../components/matches/LiveScoringScreen/ScoringPad";
import MatchControls from "../../../components/matches/LiveScoringScreen/MatchControls";
import CommentarySection from "../../../components/matches/LiveScoringScreen/CommentarySection";
import { COLORS } from "../../../constants/colors";

export default function LiveScoringScreen() {
  const [matchState, setMatchState] = useState({
    score: 65,
    wickets: 2,
    overs: "8.2",
    target: 185,

    striker: {
      name: "Alex Johnson",
      runs: 28,
      balls: 18,
    },

    nonStriker: {
      name: "David Warner",
      runs: 15,
      balls: 12,
    },

    bowler: {
      name: "M. Shami",
      figures: "1.2-0-12-1",
    },

    commentary: [
      {
        over: "8.2",
        text: "1 run",
      },
      {
        over: "8.1",
        text: "FOUR",
      },
    ],
  });

  const handleRun = (runs) => {
    navigation.navigate("ShotSelectionModalScreen", { runs });
  };

  const handleWicket = () => {
    navigation.navigate("WicketModalScreen");
  };

  const handleOverEnd = () => {
    navigation.navigate("OverSummaryScreen");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <MatchHeader
        score={matchState.score}
        wickets={matchState.wickets}
        overs={matchState.overs}
        target={matchState.target}
      />

      <ChaseStats />

      <PlayerStats
        striker={matchState.striker}
        nonStriker={matchState.nonStriker}
        bowler={matchState.bowler}
      />

      <ScoringPad onRun={handleRun} onWicket={handleWicket} />

      <MatchControls
        onExtras={() => {}}
        onOverEnd={() => {}}
        onUndo={() => {}}
      />

      <CommentarySection commentary={matchState.commentary} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
