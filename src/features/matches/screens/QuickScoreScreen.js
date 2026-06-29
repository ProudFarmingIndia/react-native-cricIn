import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MatchInfoSection from "../components/MatchInfoSection";
import TeamSelectionSection from "../components/TeamSelectionSection";
import MatchSpecificationSection from "../components/MatchSpecificationSection";
import GroundSelectionSection from "../components/GroundSelectionSection";
import BottomAction from "../components/BottomAction";
import { COLORS } from "../../../constants/colors";

export default function QuickScoreScreen() {
  const navigation = useNavigation();

  const [matchData, setMatchData] = useState({
    matchName: "",
    tournament: "",
    teamA: null,
    teamB: null,
    matchType: "T20",
    overs: 20,
    ballType: "Leather",
    pitchType: "Turf",
    matchDate: "",
    matchTime: "",
    ground: "",
    umpire1: "",
    umpire2: "",
    scorer: "",
  });

  const updateField = (field, value) => {
    setMatchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateMatch = () => {
    if (!matchData.matchName.trim()) {
      alert("Please enter match name");
      return false;
    }

    if (!matchData.teamA) {
      alert("Please select Team A");
      return false;
    }

    if (!matchData.teamB) {
      alert("Please select Team B");
      return false;
    }

    if (
      matchData.teamA?._id &&
      matchData.teamB?._id &&
      matchData.teamA._id === matchData.teamB._id
    ) {
      alert("Team A and Team B cannot be same");
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateMatch()) {
      return;
    }

    navigation.navigate(
      "TeamSelectionScreen",
      {
        matchData,
      }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.contentContainer
        }
      >
        <MatchInfoSection
          matchData={matchData}
          updateField={updateField}
        />

        <TeamSelectionSection
          matchData={matchData}
          navigation={navigation}
        />

        <MatchSpecificationSection
          matchData={matchData}
          updateField={updateField}
        />

        <GroundSelectionSection
          matchData={matchData}
          updateField={updateField}
        />
      </ScrollView>

      <BottomAction
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background || "#F7FBF1",
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
});