import React, { useState } from "react";

import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

const DISMISSAL_TYPES = [
  "Bowled",
  "Caught",
  "LBW",
  "Run Out",
  "Stumped",
  "Hit Wicket",
  "Retired Out",
];

const BATTERS = [
  {
    id: "1",
    name: "Liam Smith",
    role: "Striker",
  },
  {
    id: "2",
    name: "David Warner",
    role: "Non-Striker",
  },
];

const FIELDERS = [
  "Marcus Stoinis",
  "Glenn Maxwell",
  "Adam Zampa",
  "Pat Cummins",
];

const INCOMING_BATTERS = [
  "Ashton Turner",
  "Steve Smith",
  "Josh Inglis",
];

export default function WicketModalScreen({
  route,
}) {
  const navigation = useNavigation();

  const [wicketData, setWicketData] =
    useState({
      dismissalType: "Bowled",

      outBatter: null,

      fielder: null,

      directHit: false,

      incomingBatter: null,
    });

  const updateField = (
    field,
    value
  ) => {
    setWicketData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirm = () => {
    if (!wicketData.outBatter) {
      Alert.alert(
        "Select Out Batter"
      );
      return;
    }

    if (
      !wicketData.incomingBatter
    ) {
      Alert.alert(
        "Select Incoming Batter"
      );
      return;
    }

    route?.params?.onConfirm?.(
      wicketData
    );

    navigation.goBack();
  };

  const showFielder =
    wicketData.dismissalType ===
      "Caught" ||
    wicketData.dismissalType ===
      "Run Out" ||
    wicketData.dismissalType ===
      "Stumped";

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>
            🏏 Wicket Dismissal
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="close"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
          }}
        >
          {/* Dismissal Type */}

          <Text style={styles.label}>
            Dismissal Type
          </Text>

          <View style={styles.chips}>
            {DISMISSAL_TYPES.map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,

                    wicketData.dismissalType ===
                      type &&
                      styles.activeChip,
                  ]}
                  onPress={() =>
                    updateField(
                      "dismissalType",
                      type
                    )
                  }
                >
                  <Text
                    style={[
                      styles.chipText,

                      wicketData.dismissalType ===
                        type &&
                        styles.activeChipText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Out Batter */}

          <Text style={styles.label}>
            Out Batter
          </Text>

          {BATTERS.map(
            (player) => (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.card,

                  wicketData.outBatter ===
                    player.id &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  updateField(
                    "outBatter",
                    player.id
                  )
                }
              >
                <Text
                  style={
                    styles.playerName
                  }
                >
                  {player.name}
                </Text>

                <Text
                  style={
                    styles.playerRole
                  }
                >
                  {player.role}
                </Text>
              </TouchableOpacity>
            )
          )}

          {/* Fielder */}

          {showFielder && (
            <>
              <Text
                style={styles.label}
              >
                Fielder
              </Text>

              {FIELDERS.map(
                (
                  fielder
                ) => (
                  <TouchableOpacity
                    key={fielder}
                    style={[
                      styles.card,

                      wicketData.fielder ===
                        fielder &&
                        styles.selectedCard,
                    ]}
                    onPress={() =>
                      updateField(
                        "fielder",
                        fielder
                      )
                    }
                  >
                    <Text>
                      {fielder}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </>
          )}

          {/* Direct Hit */}

          {wicketData.dismissalType ===
            "Run Out" && (
            <>
              <Text
                style={styles.label}
              >
                Direct Hit
              </Text>

              <View
                style={
                  styles.row
                }
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,

                    wicketData.directHit &&
                      styles.activeOption,
                  ]}
                  onPress={() =>
                    updateField(
                      "directHit",
                      true
                    )
                  }
                >
                  <Text>
                    Yes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,

                    !wicketData.directHit &&
                      styles.activeOption,
                  ]}
                  onPress={() =>
                    updateField(
                      "directHit",
                      false
                    )
                  }
                >
                  <Text>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Incoming Batter */}

          <Text style={styles.label}>
            Incoming Batter
          </Text>

          {INCOMING_BATTERS.map(
            (
              batter
            ) => (
              <TouchableOpacity
                key={batter}
                style={[
                  styles.card,

                  wicketData.incomingBatter ===
                    batter &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  updateField(
                    "incomingBatter",
                    batter
                  )
                }
              >
                <Text>
                  {batter}
                </Text>
              </TouchableOpacity>
            )
          )}

          {/* Confirm */}

          <TouchableOpacity
            style={
              styles.confirmButton
            }
            onPress={
              handleConfirm
            }
          >
            <Ionicons
              name="checkmark-circle"
              size={22}
              color="#fff"
            />

            <Text
              style={
                styles.confirmText
              }
            >
              Confirm Wicket
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,

      backgroundColor:
        "rgba(0,0,0,0.55)",

      justifyContent:
        "center",

      padding: 16,
    },

    modal: {
      backgroundColor:
        "#fff",

      borderRadius: 20,

      maxHeight: "90%",
    },

    header: {
      backgroundColor:
        COLORS.primary,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      padding: 16,

      borderTopLeftRadius: 20,

      borderTopRightRadius: 20,
    },

    title: {
      color: "#fff",

      fontSize: 20,

      fontWeight: "700",
    },

    label: {
      fontSize: 14,

      fontWeight: "700",

      marginBottom: 10,

      marginTop: 16,
    },

    chips: {
      flexDirection: "row",

      flexWrap: "wrap",
    },

    chip: {
      borderWidth: 1,

      borderColor: "#ddd",

      borderRadius: 20,

      paddingHorizontal: 14,

      paddingVertical: 8,

      marginRight: 8,

      marginBottom: 8,
    },

    activeChip: {
      backgroundColor:
        COLORS.primary,

      borderColor:
        COLORS.primary,
    },

    chipText: {
      color: "#444",
    },

    activeChipText: {
      color: "#fff",
    },

    card: {
      borderWidth: 1,

      borderColor: "#ddd",

      borderRadius: 12,

      padding: 14,

      marginBottom: 10,
    },

    selectedCard: {
      borderColor:
        COLORS.primary,

      backgroundColor:
        "#E8F5E9",
    },

    playerName: {
      fontWeight: "700",
    },

    playerRole: {
      color: "#666",

      marginTop: 2,
    },

    row: {
      flexDirection: "row",
    },

    optionButton: {
      flex: 1,

      borderWidth: 1,

      borderColor: "#ddd",

      borderRadius: 12,

      padding: 12,

      alignItems: "center",

      marginRight: 8,
    },

    activeOption: {
      backgroundColor:
        "#E8F5E9",

      borderColor:
        COLORS.primary,
    },

    confirmButton: {
      backgroundColor:
        COLORS.secondary,

      height: 56,

      borderRadius: 12,

      marginTop: 20,

      marginBottom: 10,

      flexDirection: "row",

      justifyContent:
        "center",

      alignItems: "center",
    },

    confirmText: {
      color: "#fff",

      fontSize: 16,

      fontWeight: "700",

      marginLeft: 8,
    },
  });