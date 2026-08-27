import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";

import PrimaryButton from "../../../components/Button/PrimaryButton";
import {
  InputField,
  SelectField,
} from "../../../components/common/FormComponents";

import playerTypes from "../../../constants/dropdowns/playerTypes";
import battingStyles from "../../../constants/dropdowns/battingStyles";
import bowlingStyles from "../../../constants/dropdowns/bowlingStyles";
import { COLORS } from "../../../constants/colors";

import useTeam from "../hooks/useTeam";

export default function AddLocalPlayerScreen({ navigation, route }) {
  /*
  |--------------------------------------------------------------------------
  | Route
  |--------------------------------------------------------------------------
  */

  const { teamId, mobile: initialMobile = "" } = route.params;

  /*
  |--------------------------------------------------------------------------
  | Hook
  |--------------------------------------------------------------------------
  */

  const { createLocalPlayer, loading } = useTeam();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [player, setPlayer] = useState({
    playerName: "",

    mobile: initialMobile,

    role: "",

    battingStyle: "",

    bowlingStyle: "",

    jerseyNumber: "",

    age: "",

    profileImage: null,
  });

  /*
  |--------------------------------------------------------------------------
  | Update Field
  |--------------------------------------------------------------------------
  */

  const updateField = (key, value) => {
    setPlayer((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Pick Image
  |--------------------------------------------------------------------------
  */

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    updateField("profileImage", result.assets[0].uri);
  };

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const validate = () => {
    if (!player.playerName.trim()) {
      Alert.alert("Validation", "Please enter player name.");
      return false;
    }

    if (player.mobile && player.mobile.length !== 10) {
      Alert.alert("Validation", "Please enter valid mobile number.");
      return false;
    }

    if (!player.role) {
      Alert.alert("Validation", "Please select player role.");
      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | Create Player
  |--------------------------------------------------------------------------
  */

  const savePlayer = async () => {
    if (!validate()) return;

    const result = await createLocalPlayer(teamId, {
      playerName: player.playerName.trim(),

      mobile: player.mobile.trim(),

      playerType: player.playerType,

      battingStyle: player.battingStyle,

      bowlingStyle: player.bowlingStyle,

      jerseyNumber: player.jerseyNumber ? Number(player.jerseyNumber) : null,

      age: player.age ? Number(player.age) : null,

      profileImage: player.profileImage,
    });

    if (result?.meta?.requestStatus === "fulfilled") {
      Alert.alert("Success", "Local player added successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);

      navigation.goBack();
    } else {
      Alert.alert("Failed", result?.payload || "Unable to create player.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Add Local Player</Text>

        <Text style={styles.subtitle}>
          Create a player who isn't registered on CricIn yet.
        </Text>
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {player.profileImage ? (
          <Image
            source={{
              uri: player.profileImage,
            }}
            style={styles.image}
          />
        ) : (
          <>
            <Ionicons name="camera-outline" size={42} color={COLORS.primary} />

            <Text style={styles.imageText}>Add Player Photo</Text>
          </>
        )}
      </TouchableOpacity>

      <InputField
        label="Player Name"
        placeholder="Player Name"
        value={player.playerName}
        onChangeText={(text) => updateField("playerName", text)}
      />

      <InputField
        label="Mobile Number"
        placeholder="Mobile Number"
        keyboardType="number-pad"
        maxLength={10}
        editable={!initialMobile}
        value={player.mobile}
        onChangeText={(text) =>
          updateField("mobile", text.replace(/[^0-9]/g, ""))
        }
      />

      <SelectField
        label="Player Type"
        value={player.role}
        options={playerTypes}
        placeholder="Select Player Type"
        onSelect={(value) => updateField("playerType", value)}
      />

      <SelectField
        label="Batting Style"
        value={player.battingStyle}
        options={battingStyles}
        placeholder="Select Batting Style"
        onSelect={(value) => updateField("battingStyle", value)}
      />

      <SelectField
        label="Bowling Style"
        value={player.bowlingStyle}
        options={bowlingStyles}
        placeholder="Select Bowling Style"
        onSelect={(value) => updateField("bowlingStyle", value)}
      />

      <InputField
        label="Jersey Number"
        placeholder="Jersey Number"
        keyboardType="number-pad"
        value={player.jerseyNumber}
        onChangeText={(text) =>
          updateField("jerseyNumber", text.replace(/[^0-9]/g, ""))
        }
      />

      <InputField
        label="Age"
        placeholder="Age"
        keyboardType="number-pad"
        value={player.age}
        onChangeText={(text) => updateField("age", text.replace(/[^0-9]/g, ""))}
      />

      <View style={styles.mgT}>
        <PrimaryButton
          title={loading ? "Creating Player..." : "Create Local Player"}
          loading={loading}
          disabled={loading}
          onPress={savePlayer}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 24,
  },

  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 30,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imageText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
  },
  mgT: {
    marginTop: 20,
  },
  header: {
    marginBottom: 25,
  },

  subtitle: {
    marginTop: 6,
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
});
