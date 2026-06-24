import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function CommentarySection({
  commentary,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Commentary
      </Text>

      {commentary.map(
        (item,index)=>(
          <View
            key={index}
            style={styles.card}
          >
            <Text style={styles.over}>
              {item.over}
            </Text>

            <Text>
              {item.text}
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    marginBottom:20,
  },

  heading:{
    fontWeight:"700",
    marginBottom:8,
  },

  card:{
    backgroundColor:"#fff",
    borderRadius:12,
    padding:12,
    marginBottom:8,
  },

  over:{
    fontWeight:"700",
    color:"#00490e",
  },
});