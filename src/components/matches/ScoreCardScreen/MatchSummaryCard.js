import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function MatchSummaryCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Match Summary
      </Text>

      <View style={styles.row}>
        <View>
          <Text style={styles.team}>
            Rangers
          </Text>

          <Text>
            186/4 (20)
          </Text>
        </View>

        <Text style={styles.vs}>
          VS
        </Text>

        <View>
          <Text style={styles.team}>
            Titans
          </Text>

          <Text>
            142/6 (16.2)
          </Text>
        </View>
      </View>

      <Text style={styles.result}>
        Rangers won by 44 runs
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    backgroundColor:"#fff",
    padding:16,
  },

  title:{
    fontSize:20,
    fontWeight:"700",
    marginBottom:16,
  },

  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
  },

  team:{
    fontWeight:"700",
    fontSize:18,
  },

  vs:{
    fontSize:20,
    fontWeight:"700",
  },

  result:{
    marginTop:16,
    color:"green",
    fontWeight:"700",
  },
});