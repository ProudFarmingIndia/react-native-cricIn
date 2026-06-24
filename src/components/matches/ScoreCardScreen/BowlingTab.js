import React from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

const DATA = [
  {
    name:"Peterson",
    overs:"4",
    maidens:"0",
    runs:"26",
    wickets:"2",
  },
];

export default function BowlingTab() {
  return (
    <FlatList
      data={DATA}
      keyExtractor={item =>
        item.name
      }
      renderItem={({ item }) => (
        <View
          style={{
            padding:16,
            backgroundColor:"#fff",
            marginBottom:8,
          }}
        >
          <Text>
            {item.name}
          </Text>

          <Text>
            {item.overs}-
            {item.maidens}-
            {item.runs}-
            {item.wickets}
          </Text>
        </View>
      )}
    />
  );
}