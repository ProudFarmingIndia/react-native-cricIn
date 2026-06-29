import React from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

const DATA = [
  {
    name:"Aman Sharma",
    dismissal:"c David b Peterson",
    runs:54,
    balls:32,
    fours:6,
    sixes:2,
    sr:"168.75",
  },

  {
    name:"Karthik R",
    dismissal:"Not Out",
    runs:82,
    balls:45,
    fours:10,
    sixes:3,
    sr:"182.22",
  },
];

export default function BattingTab() {
  return (
    <FlatList
      data={DATA}
      keyExtractor={item =>
        item.name
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text>
            {item.dismissal}
          </Text>

          <Text>
            {item.runs}(
            {item.balls})
          </Text>
        </View>
      )}
    />
  );
}

const styles =
  StyleSheet.create({
    row:{
      backgroundColor:"#fff",
      padding:16,
      marginBottom:8,
    },

    name:{
      fontWeight:"700",
    },
  });