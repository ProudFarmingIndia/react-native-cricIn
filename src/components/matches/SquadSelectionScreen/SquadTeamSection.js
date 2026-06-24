import React from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

import PlayerCard from "./PlayerCard";

import { COLORS } from "../../../constants/colors";

export default function SquadTeamSection({
  teamLabel,
  teamName,
  players,
  selectedPlayers,
  captain,
  viceCaptain,
  searchText,
  onSearch,
  onSelectPlayer,
  onSetCaptain,
  onSetViceCaptain,
}) {
  const renderPlayer = ({ item }) => {
    const selected = selectedPlayers.some(
      (player) => player._id === item._id
    );

    return (
      <View>
        <PlayerCard
          player={item}
          selected={selected}
          captain={captain === item._id}
          viceCaptain={
            viceCaptain === item._id
          }
          onSelect={onSelectPlayer}
        />

        {selected && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                onSetCaptain(item._id)
              }
            >
              <Text style={styles.smallButtonText}>
                Captain
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                onSetViceCaptain(
                  item._id
                )
              }
            >
              <Text style={styles.smallButtonText}>
                Vice Captain
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.teamLabel}>
        {teamLabel}
      </Text>

      <Text style={styles.teamName}>
        {teamName}
      </Text>

      <TextInput
        placeholder="Search Player"
        style={styles.searchInput}
        value={searchText}
        onChangeText={onSearch}
      />

      <Text style={styles.counter}>
        Playing XI:
        {" "}
        {selectedPlayers.length}
        /11
      </Text>

      <FlatList
        data={players}
        keyExtractor={(item) =>
          item._id
        }
        renderItem={renderPlayer}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",

    borderRadius: 12,

    padding: 16,

    marginBottom: 20,
  },

  teamLabel: {
    fontSize: 12,

    fontWeight: "700",

    color: COLORS.primary,
  },

  teamName: {
    fontSize: 20,

    fontWeight: "700",

    marginBottom: 12,
  },

  searchInput: {
    borderWidth: 1,

    borderColor: "#E5E5E5",

    borderRadius: 10,

    height: 50,

    paddingHorizontal: 12,

    marginBottom: 12,
  },

  counter: {
    marginBottom: 12,

    fontWeight: "700",
  },

  actionRow: {
    flexDirection: "row",

    justifyContent: "flex-end",

    marginBottom: 10,
  },

  smallButton: {
    backgroundColor:
      COLORS.primary,

    paddingHorizontal: 10,

    paddingVertical: 5,

    borderRadius: 6,

    marginLeft: 8,
  },

  smallButtonText: {
    color: "#fff",

    fontSize: 11,

    fontWeight: "700",
  },
});