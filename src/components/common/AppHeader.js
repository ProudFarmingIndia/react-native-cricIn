import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { SafeAreaView }
from "react-native-safe-area-context";

import Ionicons
from "@expo/vector-icons/Ionicons";

export default function AppHeader({
  title,
  showBack,
  navigation,
}) {
  return (
    <SafeAreaView
      edges={["top"]}
      style={styles.safe}
    >
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={24}
            />
          </TouchableOpacity>
        ) : (
          <View
            style={{ width: 24 }}
          />
        )}

        <Text style={styles.title}>
          {title}
        </Text>

        <View
          style={{ width: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#fff",
  },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:"space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },
});