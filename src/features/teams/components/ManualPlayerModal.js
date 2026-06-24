import React, {
  useState,
} from "react";

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ManualPlayerModal({
  visible,
  onClose,
  onAddPlayer,
}) {
  const [player, setPlayer] =
    useState({
      name: "",
      role: "Batter",
      battingStyle: "",
      bowlingStyle: "",
    });

  const handleAdd = () => {
    onAddPlayer(player);

    setPlayer({
      name: "",
      role: "Batter",
      battingStyle: "",
      bowlingStyle: "",
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View
        style={styles.overlay}
      >
        <View
          style={styles.modal}
        >
          <Text
            style={styles.title}
          >
            Add Player
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Player Name"
            value={player.name}
            onChangeText={(
              text
            ) =>
              setPlayer({
                ...player,
                name: text,
              })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Role"
            value={player.role}
            onChangeText={(
              text
            ) =>
              setPlayer({
                ...player,
                role: text,
              })
            }
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleAdd}
          >
            <Text
              style={{
                color:
                  "#fff",
              }}
            >
              Add Player
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent:
      "center",
    backgroundColor:
      "rgba(0,0,0,0.4)",
  },

  modal: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 50,
  },

  button: {
    backgroundColor:
      "#0B7A0B",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});