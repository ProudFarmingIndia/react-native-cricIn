import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

const INNINGS_LABEL = {
  1: "1st Innings",
  2: "2nd Innings",
};

export default function MatchHeader({
  teamAName,
  teamBName,
  inningsNumber,
  score,
  wickets,
  overs,
  target,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.live}>
            LIVE MATCH
          </Text>

          <Text style={styles.match}>
            {teamAName && teamBName ? `${teamAName} vs ${teamBName}` : "Match in progress"}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {INNINGS_LABEL[inningsNumber] || "Innings"}
          </Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View>
          <Text style={styles.score}>
            {score}/{wickets}
          </Text>

          <Text style={styles.overs}>
            ({overs})
          </Text>
        </View>

        <View>
          <Text style={styles.target}>
            TARGET {target}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    backgroundColor:"#fff",
    padding:16,
    borderRadius:16,
    marginBottom:12,
  },

  topRow:{
    flexDirection:"row",
    justifyContent:"space-between",
  },

  live:{
    color:COLORS.secondary,
    fontWeight:"700",
  },

  match:{
    fontSize:20,
    fontWeight:"700",
    marginTop:4,
  },

  badge:{
    backgroundColor:"#E8F5E9",
    paddingHorizontal:10,
    paddingVertical:6,
    borderRadius:20,
  },

  badgeText:{
    color:COLORS.primary,
    fontWeight:"700",
  },

  scoreRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:16,
  },

  score:{
    fontSize:36,
    fontWeight:"700",
    color:COLORS.primary,
  },

  overs:{
    color:"#666",
  },

  target:{
    color:COLORS.secondary,
    fontWeight:"700",
  },
});