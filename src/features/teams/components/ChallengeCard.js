import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ChallengeCard({
  challenge,
  type,
  onAccept,
  onReject,
  onWithdraw,
}) {
  return (
    <View style={styles.card}>
      <Text
        style={styles.team}
      >
        {
          challenge.teamName
        }
      </Text>

      <Text>
        {challenge.format}
      </Text>

      <Text>
        📅 {challenge.date} •{" "}
        {challenge.time}
      </Text>

      <Text>
        📍 {challenge.venue}
      </Text>

      {type ===
        "received" && (
        <View
          style={
            styles.actionRow
          }
        >
          <TouchableOpacity
            style={
              styles.acceptBtn
            }
            onPress={
              onAccept
            }
          >
            <Text
              style={{
                color:
                  "#fff",
              }}
            >
              Accept
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.rejectBtn
            }
            onPress={
              onReject
            }
          >
            <Text>
              Decline
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {type === "sent" && (
        <TouchableOpacity
          style={
            styles.withdrawBtn
          }
          onPress={
            onWithdraw
          }
        >
          <Text
            style={{
              color:
                "red",
            }}
          >
            Withdraw Challenge
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#fff",

      padding: 16,

      borderRadius: 16,

      marginBottom: 16,
    },

    team: {
      fontSize: 18,

      fontWeight:
        "700",

      marginBottom: 8,
    },

    actionRow: {
      flexDirection:
        "row",

      marginTop: 12,
    },

    acceptBtn: {
      flex: 1,

      backgroundColor:
        "#0B7A0B",

      padding: 12,

      borderRadius: 8,

      alignItems:
        "center",

      marginRight: 8,
    },

    rejectBtn: {
      flex: 1,

      borderWidth: 1,

      borderColor:
        "#ccc",

      padding: 12,

      borderRadius: 8,

      alignItems:
        "center",
    },

    withdrawBtn: {
      marginTop: 12,

      padding: 12,

      borderWidth: 1,

      borderColor:
        "#ff5252",

      borderRadius: 8,

      alignItems:
        "center",
    },
  });