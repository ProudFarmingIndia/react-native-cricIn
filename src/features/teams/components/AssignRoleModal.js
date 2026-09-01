import React from "react";

import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Assign Role Modal
|--------------------------------------------------------------------------
|
| Reusable picker for both "Change Captain" and "Change Vice Captain".
| Lists the current squad, highlights whoever already holds the role,
| and lets the user tap someone new to assign.
|
*/

export default function AssignRoleModal({
  visible,
  role, // "captain" | "viceCaptain"
  players = [],
  currentHolderId,
  onSelect,
  onClose,
}) {
  const title =
    role === "captain" ? "Change Captain" : "Change Vice Captain";

  const renderPlayer = ({ item }) => {
    const isCurrentHolder =
      String(item._id) === String(currentHolderId);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.playerRow,
          isCurrentHolder && styles.playerRowActive,
        ]}
        onPress={() => onSelect?.(item._id)}
      >
        <Image
          source={{
            uri:
              item?.profileImage?.url ||
              "https://placehold.co/100",
          }}
          style={styles.avatar}
        />

        <Text style={styles.playerName}>
          {item.playerName}
        </Text>

        {isCurrentHolder && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={COLORS.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>

          <TouchableOpacity onPress={onClose}>
            <Ionicons
              name="close"
              size={24}
              color={COLORS.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {players.length === 0 ? (
          <Text style={styles.emptyText}>
            Add players to the squad before assigning this role.
          </Text>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderPlayer}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 24,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
  },

  playerRowActive: {
    backgroundColor: COLORS.primaryContainer,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceVariant,
    marginRight: 12,
  },

  playerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  emptyText: {
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
});
