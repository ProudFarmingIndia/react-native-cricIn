import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS }
from "../../../constants/colors";

export default function WinProbabilityCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Win Probability
      </Text>

      <Text style={styles.value}>
        78%
      </Text>

      <Text style={styles.team}>
        INDIA
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card:{
      backgroundColor:
        COLORS.primary,

      margin:16,

      borderRadius:16,

      padding:20,
    },

    title:{
      color:"#fff",
    },

    value:{
      color:"#fff",
      fontSize:42,
      fontWeight:"700",
    },

    team:{
      color:"#fff",
    },
  });