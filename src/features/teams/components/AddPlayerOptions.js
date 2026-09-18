import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Add Player Options
|--------------------------------------------------------------------------
|
| canInvite / canAddLocal map to the vice-captain rights
| canSendInvitations and canManagePlayers. A vice-captain without the
| right shouldn't be shown a card that the backend will reject on tap.
|
| Both default to true so the create-team flow, where the creator is
| always owner and captain, is unaffected.
|
| THE SECOND CARD IS BACK
|
| "Add Player Manually" was commented out, which left a captain with only
| one option: invite somebody who is already on CricIn. At a ground that is
| almost nobody - the whole squad is standing there and none of them have
| the app. There was no way to build a team out of the people actually
| present.
|
| It now creates a real CricIn account behind the player, so the person can
| log in with that number later and find their profile, their squad and
| their match history already waiting.
|
*/

export default function AddPlayerOptions({
  onInvitePlayer,
  onAddLocalPlayer,
  canInvite = true,
  canAddLocal = true,
}) {
  if (!canInvite && !canAddLocal) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Invite CricIn Player */}

      {canInvite && (
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
      )}

      {/* Add Local Player */}

      {canAddLocal && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={onAddLocalPlayer}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="person-add-outline" size={24} color="#777" />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Add Player Manually</Text>

            <Text style={styles.subtitle}>
              Not on CricIn yet? Add their name and number
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
        </TouchableOpacity>
      )}
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