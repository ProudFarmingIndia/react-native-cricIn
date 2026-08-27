import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function AddPlayerOptions({
  onInvitePlayer,
  onAddLocalPlayer,
}) {
  return (
    <View style={styles.container}>
      {/* Invite CricIn Player */}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={onInvitePlayer}
      >
        <View
          style={[
            styles.iconContainer,
            // {
            //   backgroundColor: "#E7F8E8",
            // },
          ]}
        >
          <Ionicons
            name="person-add"
            size={26}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            Invite CricIn Player
          </Text>

          <Text style={styles.subtitle}>
            Search and invite registered platform users
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#A0A0A0"
        />
      </TouchableOpacity>

      {/* Add Local Player */}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={onAddLocalPlayer}
      >
        <View
          style={[
            styles.iconContainer,
            // {
            //   backgroundColor: "#F2F4F5",
            // },
          ]}
        >
          <Ionicons
            name="person"
            size={24}
            color="#777"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            Add Local Player
          </Text>

          <Text style={styles.subtitle}>
            Manually enter player details
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#A0A0A0"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  card: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 18,

    marginBottom: 14,

    borderWidth: 1,

    borderColor: "#EBEBEB",

    shadowColor: "#000",

    shadowOpacity: 0.04,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  iconContainer: {
    width: 56,

    height: 56,

    borderRadius: 28,

    justifyContent: "center",

    alignItems: "center",
  },

  content: {
    flex: 1,

    marginLeft: 16,
  },

  title: {
    fontSize: 17,

    fontWeight: "700",

    color: "#111827",
  },

  subtitle: {
    marginTop: 5,

    fontSize: 13,

    color: "#7B7B7B",

    lineHeight: 18,
  },
});