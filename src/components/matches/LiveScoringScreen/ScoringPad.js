import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const RUNS = [0,1,2,3,4,5,6];

export default function ScoringPad({
  onRun,
  onWicket,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {RUNS.map((run)=>(
          <TouchableOpacity
            key={run}
            style={styles.button}
            onPress={() =>
              onRun(run)
            }
          >
            <Text style={styles.text}>
              {run}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.wicket}
          onPress={onWicket}
        >
          <Text style={styles.wicketText}>
            W
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    marginBottom:12,
  },

  grid:{
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"space-between",
  },

  button:{
    width:"23%",
    height:60,
    backgroundColor:"#fff",
    borderRadius:12,
    justifyContent:"center",
    alignItems:"center",
    marginBottom:8,
  },

  wicket:{
    width:"23%",
    height:60,
    backgroundColor:"#ffdad6",
    borderRadius:12,
    justifyContent:"center",
    alignItems:"center",
  },

  text:{
    fontSize:22,
    fontWeight:"700",
  },

  wicketText:{
    fontSize:22,
    fontWeight:"700",
    color:"#ba1a1a",
  },
});