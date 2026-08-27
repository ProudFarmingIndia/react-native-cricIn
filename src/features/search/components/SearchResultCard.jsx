import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function SearchResultCard({
  item,
  titleKey = "playerName",
  subtitleKey = "phone",
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
    >
      <View style={styles.avatar}>
        <Ionicons
          name="person"
          size={26}
          color="#FFF"
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>
          {item?.[titleKey]}
        </Text>

        <Text style={styles.subtitle}>
          {item?.[subtitleKey]}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#BBB"
      />
    </TouchableOpacity>
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

    elevation: 2,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  avatar: {
    width: 48,

    height: 48,

    borderRadius: 24,

    backgroundColor: COLORS.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  info: {
    flex: 1,

    marginLeft: 14,
  },

  title: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.text,
  },

  subtitle: {
    marginTop: 4,

    fontSize: 13,

    color: "#777",
  },
});