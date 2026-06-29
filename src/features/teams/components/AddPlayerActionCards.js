import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function AddPlayerActionCards({
  onInviteUser,
  onInviteMobile,
  onAddManual,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={onInviteUser}
      >
        <Text>👤</Text>

        <Text>
          Invite CricIn User
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={onInviteMobile}
      >
        <Text>📱</Text>

        <Text>
          Invite By Mobile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={onAddManual}
      >
        <Text>✍️</Text>

        <Text>
          Add Manual Player
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
});