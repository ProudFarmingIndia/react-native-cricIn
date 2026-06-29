import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function MatchHeroCard() {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.team}>
          INDIA
        </Text>

        <Text style={styles.score}>
          342/6
        </Text>
      </View>

      <Text style={styles.vs}>
        VS
      </Text>

      <View>
        <Text style={styles.team}>
          AUS
        </Text>

        <Text style={styles.score}>
          298/10
        </Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:"#fff",
      padding:20,
      flexDirection:"row",
      justifyContent:"space-between",
      alignItems:"center",
    },

    team:{
      fontWeight:"700",
      fontSize:18,
    },

    score:{
      fontSize:26,
      fontWeight:"700",
    },

    vs:{
      fontSize:20,
      fontWeight:"700",
    },
  });