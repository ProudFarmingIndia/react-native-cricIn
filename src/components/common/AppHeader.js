import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

import { COLORS } from "../../constants/colors";

export default function AppHeader({ title, showBack = false }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* LEFT */}

      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons
              name="arrow-back-ios"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{title}</Text>
      </View>

      {/* RIGHT */}

      <View style={styles.rightSection}>
        <TouchableOpacity>
          <MaterialIcons name="search" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity style={{ marginLeft: 16 }}>
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 4,
  },
});
