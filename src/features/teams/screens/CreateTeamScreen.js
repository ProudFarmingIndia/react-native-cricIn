import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useSelector } from "react-redux";

import PrimaryButton from "../../../components/Button/PrimaryButton";

import { COLORS } from "../../../constants/colors";

export default function CreateTeamScreen({
  navigation,
}) {
  const user = useSelector(
    (state) => state.auth.user
  );

  const [teamData, setTeamData] =
    useState({
      logo: null,

      teamName: "",

      shortName: "",

      teamType: "Club",

      country: "India",

      state: "",

      city: "",

      visibility: "public",

      captain: user?._id,
    });

  const updateField = (
    key,
    value
  ) => {
    setTeamData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const teamTypes = [
    "Club",
    "Corporate",
    "Academy",
    "Friends",
    "School",
    "College",
  ];

  const handleContinue = () => {
    if (!teamData.teamName) {
      alert("Enter Team Name");
      return;
    }

    if (!teamData.shortName) {
      alert("Enter Short Name");
      return;
    }

    navigation.navigate(
      "AddPlayersScreen",
      {
        teamData,
      }
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* LOGO */}

      <View style={styles.logoSection}>
        <TouchableOpacity
          style={styles.logoContainer}
        >
          <Ionicons
            name="camera-outline"
            size={40}
            color="#999"
          />

          <Text
            style={styles.uploadText}
          >
            Upload Logo
          </Text>
        </TouchableOpacity>

        <Text style={styles.logoHint}>
          Recommended size:
          500x500
        </Text>
      </View>

      {/* TEAM INFO */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Team Information
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Team Name"
          value={teamData.teamName}
          onChangeText={(text) =>
            updateField(
              "teamName",
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Short Name"
          value={teamData.shortName}
          onChangeText={(text) =>
            updateField(
              "shortName",
              text
            )
          }
        />
      </View>

      {/* TEAM TYPE */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Team Type
        </Text>

        <View
          style={styles.chipsContainer}
        >
          {teamTypes.map(
            (type) => (
              <TouchableOpacity
                key={type}
                onPress={() =>
                  updateField(
                    "teamType",
                    type
                  )
                }
                style={[
                  styles.chip,

                  teamData.teamType ===
                    type &&
                    styles.activeChip,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,

                    teamData.teamType ===
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
      </View>

      {/* LOCATION */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Location
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Country"
          value={teamData.country}
          onChangeText={(text) =>
            updateField(
              "country",
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="State"
          value={teamData.state}
          onChangeText={(text) =>
            updateField(
              "state",
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          value={teamData.city}
          onChangeText={(text) =>
            updateField(
              "city",
              text
            )
          }
        />
      </View>

      {/* VISIBILITY */}

      <View style={styles.card}>
        <View
          style={styles.visibilityRow}
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              {teamData.visibility ===
              "public"
                ? "Public Team"
                : "Private Team"}
            </Text>

            <Text
              style={
                styles.visibilityText
              }
            >
              {teamData.visibility ===
              "public"
                ? "Visible to everyone"
                : "Invitation only"}
            </Text>
          </View>

          <Switch
            value={
              teamData.visibility ===
              "public"
            }
            onValueChange={(
              value
            ) =>
              updateField(
                "visibility",
                value
                  ? "public"
                  : "private"
              )
            }
          />
        </View>
      </View>

      {/* CAPTAIN */}

      <View style={styles.card}>
        <Text style={styles.caption}>
          CAPTAIN
        </Text>

        <Text
          style={styles.captainName}
        >
          {user?.fullName ||
            "Current User"}
        </Text>

        <Text
          style={styles.captainSub}
        >
          Team Creator
        </Text>
      </View>

      {/* INFO */}

      <View style={styles.infoCard}>
        <Ionicons
          name="information-circle"
          size={24}
          color={COLORS.primary}
        />

        <Text style={styles.infoText}>
          As Captain, you can manage
          players, schedule matches,
          accept challenges and
          manage team settings.
        </Text>
      </View>

      {/* BUTTON */}

      <PrimaryButton
        title="Continue To Add Players"
        onPress={handleContinue}
      />

      <View
        style={{ height: 40 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor:
      COLORS.background,

    padding: 16,
  },

  logoSection: {
    alignItems: "center",

    marginBottom: 24,
  },

  logoContainer: {
    width: 120,

    height: 120,

    borderRadius: 60,

    borderWidth: 2,

    borderStyle: "dashed",

    borderColor: "#CCC",

    justifyContent: "center",

    alignItems: "center",
  },

  uploadText: {
    marginTop: 8,

    color: "#777",
  },

  logoHint: {
    marginTop: 8,

    color: "#999",
  },

  card: {
    backgroundColor: "#FFF",

    borderRadius: 12,

    padding: 16,

    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,

    fontWeight: "700",

    marginBottom: 12,
  },

  input: {
    borderWidth: 1,

    borderColor: "#DDD",

    borderRadius: 10,

    paddingHorizontal: 12,

    height: 50,

    marginBottom: 12,
  },

  chipsContainer: {
    flexDirection: "row",

    flexWrap: "wrap",
  },

  chip: {
    paddingHorizontal: 16,

    paddingVertical: 10,

    borderRadius: 30,

    borderWidth: 1,

    borderColor: "#DDD",

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
    color: "#555",
  },

  activeChipText: {
    color: "#FFF",

    fontWeight: "700",
  },

  visibilityRow: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",
  },

  visibilityText: {
    color: "#888",
  },

  caption: {
    fontSize: 12,

    color: "#888",

    marginBottom: 4,
  },

  captainName: {
    fontSize: 18,

    fontWeight: "700",
  },

  captainSub: {
    color: "#777",

    marginTop: 4,
  },

  infoCard: {
    flexDirection: "row",

    backgroundColor:
      "#EEF8EE",

    borderRadius: 12,

    padding: 16,

    marginBottom: 20,
  },

  infoText: {
    flex: 1,

    marginLeft: 10,

    color: "#555",
  },
});