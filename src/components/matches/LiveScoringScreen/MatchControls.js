import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function MatchControls({
  onExtras,
  onOverEnd,
  onUndo,
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.button}
        onPress={onExtras}
      >
        <Text>Extras</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onOverEnd}
      >
        <Text>Over End</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onUndo}
      >
        <Text>Undo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:12,
  },

  button:{
    flex:1,
    backgroundColor:"#fff",
    padding:12,
    borderRadius:12,
    alignItems:"center",
    marginHorizontal:4,
  },
});