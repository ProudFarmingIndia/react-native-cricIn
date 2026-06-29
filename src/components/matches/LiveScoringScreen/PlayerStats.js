import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function PlayerStats({
  striker,
  nonStriker,
  bowler,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.name}>
          {striker.name} *
        </Text>

        <Text>
          {striker.runs} ({striker.balls})
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.name}>
          {nonStriker.name}
        </Text>

        <Text>
          {nonStriker.runs} ({nonStriker.balls})
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.name}>
          {bowler.name}
        </Text>

        <Text>
          {bowler.figures}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    backgroundColor:"#fff",
    borderRadius:16,
    padding:16,
    marginBottom:12,
  },

  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:10,
  },

  name:{
    fontWeight:"700",
  },
});