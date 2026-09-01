import React from "react";

import {
  View,
  StyleSheet,
} from "react-native";

export default function SearchSkeleton({
  count = 6,
}) {
  return (
    <>
      {Array.from({
        length: count,
      }).map((_, index) => (
        <View
          key={index}
          style={styles.card}
        >
          <View style={styles.avatar} />

          <View style={styles.info}>
            <View
              style={styles.title}
            />

            <View
              style={styles.subtitle}
            />
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFF",

    borderRadius: 12,

    padding: 14,

    marginBottom: 12,
  },

  avatar: {
    width: 48,

    height: 48,

    borderRadius: 24,

    backgroundColor: "#ECECEC",
  },

  info: {
    flex: 1,

    marginLeft: 14,
  },

  title: {
    width: "65%",

    height: 14,

    borderRadius: 4,

    backgroundColor: "#ECECEC",

    marginBottom: 10,
  },

  subtitle: {
    width: "40%",

    height: 12,

    borderRadius: 4,

    backgroundColor: "#F3F3F3",
  },
});