import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function PlayerCard({
  player,
  selected,
  onSelect,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
      onPress={() => onSelect(player)}
    >
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {player.playerName?.charAt(0)}
          </Text>
        </View>

        <View style={styles.playerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.playerName}>
              {player.playerName}
            </Text>
          </View>

          <Text style={styles.role}>
            {player.playerType}
          </Text>

          {(!!player.battingStyle || !!player.bowlingStyle) && (
            <View style={styles.tagRow}>
              {!!player.battingStyle && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {player.battingStyle}
                  </Text>
                </View>
              )}

              {!!player.bowlingStyle && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {player.bowlingStyle}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <Ionicons
        name={
          selected
            ? "checkmark-circle"
            : "ellipse-outline"
        }
        size={24}
        color={
          selected
            ? COLORS.primary
            : "#BDBDBD"
        }
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",

    borderRadius: 12,

    padding: 12,

    marginBottom: 10,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#E5E5E5",
  },

  selectedContainer: {
    borderColor: COLORS.primary,
  },

  leftSection: {
    flexDirection: "row",

    flex: 1,
  },

  avatar: {
    width: 50,

    height: 50,

    borderRadius: 10,

    backgroundColor: "#E8F5E9",

    justifyContent: "center",

    alignItems: "center",
  },

  avatarText: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.primary,
  },

  playerInfo: {
    marginLeft: 12,

    flex: 1,
  },

  nameRow: {
    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",
  },

  playerName: {
    fontSize: 15,

    fontWeight: "700",

    color: "#111",
  },

  role: {
    marginTop: 2,

    color: "#666",

    fontSize: 12,
  },

  tagRow: {
    flexDirection: "row",

    marginTop: 6,
  },

  tag: {
    backgroundColor: "#F2F2F2",

    borderRadius: 6,

    paddingHorizontal: 8,

    paddingVertical: 3,

    marginRight: 6,
  },

  tagText: {
    fontSize: 10,

    fontWeight: "600",
  },
});