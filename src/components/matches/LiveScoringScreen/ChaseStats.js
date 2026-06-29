import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function ChaseStats() {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Text>Needed</Text>

        <Text style={styles.value}>
          120
        </Text>

        <Text>
          from 70 balls
        </Text>
      </View>

      <View style={styles.card}>
        <Text>Win %</Text>

        <Text style={styles.value}>
          42%
        </Text>

        <Text>vs 58%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:12,
  },

  card:{
    flex:1,
    backgroundColor:"#fff",
    borderRadius:16,
    padding:16,
    marginHorizontal:4,
    alignItems:"center",
  },

  value:{
    fontSize:24,
    fontWeight:"700",
    marginVertical:6,
  },
});