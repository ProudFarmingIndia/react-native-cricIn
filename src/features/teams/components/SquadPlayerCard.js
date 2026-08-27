import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  // TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function SquadPlayerCard({
    player,
    isCaptain,
    isViceCaptain,
}) {
  const role =
    player?.role || "Player";

  const captain =
    player?.isCaptain;

  const viceCaptain =
    player?.isViceCaptain;

  return (
    <View style={styles.card}>
      {/* Avatar */}

      {player?.profileImage ? (
        <Image
          source={{
            uri: player.profileImage,
          }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={24}
            color="#FFF"
          />
        </View>
      )}

      {/* Player Info */}

      <View style={styles.info}>
        <Text style={styles.name}>
          {player.playerName}
        </Text>

        <Text style={styles.role}>
          {role}
        </Text>

        {(captain ||
          viceCaptain) && (
          <View
            style={styles.badges}
          >
            {captain && (
              <View
                style={[
                  styles.badge,
                  styles.capStyl,
                ]}
              >
                <Text
                  style={
                    styles.badgeText
                  }
                >
                  Captain
                </Text>
              </View>
            )}

            {viceCaptain && (
              <View
                style={[
                  styles.badge,
                  styles.viceCapStyl,
                ]}
              >
                <Text
                  style={
                    styles.badgeText
                  }
                >
                  Vice Captain
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Remove */}

      {/* {onRemove && (
        <TouchableOpacity
          onPress={() =>
            onRemove(player)
          }
        >
          <Ionicons
            name="close-circle"
            size={28}
            color="#E53935"
          />
        </TouchableOpacity>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFF",

    padding: 16,

    borderRadius: 18,

    marginBottom: 14,

    elevation: 2,

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  avatar: {
    width: 56,

    height: 56,

    borderRadius: 28,

    backgroundColor: COLORS.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  info: {
    flex: 1,

    marginLeft: 15,
  },

  name: {
    fontSize: 17,

    fontWeight: "700",

    color: COLORS.text,
  },

  role: {
    marginTop: 4,

    color: "#777",

    fontSize: 14,
  },

  badges: {
    flexDirection: "row",

    marginTop: 10,
  },

  badge: {
    paddingHorizontal: 10,

    paddingVertical: 5,

    borderRadius: 20,

    marginRight: 8,
  },

  badgeText: {
    fontSize: 12,

    fontWeight: "700",

    color: "#333",
  },
  capStyl:{
    backgroundColor: "#DCFCE7",
  },
  viceCapStyl:{
    backgroundColor: "#DBEAFE",
  },
});