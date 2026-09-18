import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import PrimaryButton from "../../../components/Button/PrimaryButton";
import LocationPicker from "../../../components/common/LocationPicker";
import DatePickerField from "../../../components/common/DatePickerField";
import { SelectField } from "../../../components/common/FormComponents";

import { COLORS } from "../../../constants/colors";
import { validateNational, findCountry } from "../../../constants/countries";

import playerTypes from "../../../constants/dropdowns/playerTypes";
import genders from "../../../constants/dropdowns/genders";
import battingStyles from "../../../constants/dropdowns/battingStyles";
import bowlingStyles from "../../../constants/dropdowns/bowlingStyles";

import useTeam from "../hooks/useTeam";

/*
|--------------------------------------------------------------------------
| Add Local Player
|--------------------------------------------------------------------------
|
| A captain adds somebody who is not on CricIn yet. Three things are
| required - name, mobile, player type - and everything else can wait.
|
| WHY PLAYER TYPE IS REQUIRED AND THE REST IS NOT
|
| Not a UX preference: `playerType` is `required: true` on the Player
| schema with a fixed enum. Leaving it out produced a raw Mongoose
| ValidationError on save - which is exactly the "it asked me for player
| type" failure. It is now on the form AND validated on the server with a
| readable message instead of a stack trace.
|
| The mobile is required for a different reason: it IS the identity. The
| server creates a real User account alongside the Player, keyed on this
| number, so when that person logs in they land in this profile rather than
| a fresh empty one. A player row with no number can never be reached by
| the human it describes.
|
| Everything else - gender, date of birth, location, batting and bowling
| style, jersey number - is optional on purpose. The captain is on a field
| with eleven people waiting.
|
| A NOTE ON THE FIELDS THAT USED TO BE HERE
|
| An earlier version sent `age`, `countryCode` and a `profileImage` string.
| The schema has `dob`, no countryCode, and profileImage as
| { url, publicId } - so Mongoose dropped all three silently in strict
| mode. The captain picked a photo, saw "Success", and nothing was stored.
| The fields below are the ones the schema really has, in the shape it
| really wants.
*/

export default function AddLocalPlayerScreen({ navigation, route }) {
  const { teamId, mobile: initialMobile = "" } = route.params || {};

  const { createLocalPlayer, loading } = useTeam();

  /* ── Required ──────────────────────────────────────────────────── */

  const [playerName, setPlayerName] = useState("");
  const [mobile, setMobile] = useState(initialMobile);
  const [playerType, setPlayerType] = useState("");

  /* ── Optional ──────────────────────────────────────────────────── */

  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState({
    country: "IN",
    state: "",
    city: "",
  });
  const [battingStyle, setBattingStyle] = useState("");
  const [bowlingStyle, setBowlingStyle] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");

  const [errors, setErrors] = useState({
    playerName: "",
    mobile: "",
    playerType: "",
  });

  const country = findCountry("IN");

  const nameOk = playerName.trim().length >= 2;

  /*
  | validateNational returns a STRING - the message, or "" when the number
  | is fine. Not an { valid, message } object; reading `.valid` on a string
  | is undefined, which would make every number look valid.
  */
  const mobileMessage = validateNational(mobile, country);

  const mobileOk = !mobileMessage;

  const typeOk = !!playerType;

  const canSubmit = nameOk && mobileOk && typeOk && !loading;

  const clearError = (field) =>
    setErrors((previous) =>
      previous[field] ? { ...previous, [field]: "" } : previous,
    );

  const save = async () => {
    const next = {
      playerName: nameOk ? "" : "Enter the player's name.",
      mobile: mobileMessage,
      playerType: typeOk ? "" : "Choose a player type.",
    };

    setErrors(next);

    if (next.playerName || next.mobile || next.playerType) return;

    const result = await createLocalPlayer(teamId, {
      /* Required. */
      playerName: playerName.trim(),
      mobile: mobile.trim(),
      playerType,

      /*
      | Optional. Sent even when empty so the server's `|| null` / `|| ""`
      | defaults normalise in ONE place - gender in particular must become
      | null and not "", because "" is not in its enum and fails validation
      | on every save.
      */
      gender,
      dob,
      country: location.country,
      state: location.state,
      city: location.city,
      battingStyle,
      bowlingStyle,
      jerseyNumber,
    });

    /*
    | useTeam's createLocalPlayer returns { success, data } / { success,
    | error }. Testing `result.meta.requestStatus` - the shape of a RAW
    | dispatch - was always undefined, so the success branch never ran and
    | every successful add reported a failure.
    */
    if (result?.success) {
      /*
      | goBack ONCE, inside the callback. Calling it in the callback AND
      | immediately after popped the screen before the message could be
      | read, and on a fast tap went back two screens.
      */
      Alert.alert(
        "Player Added",
        `${playerName.trim()} is now in the squad. They can log in with this number to complete their profile.`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );

      return;
    }

    const message =
      result?.error?.message ||
      result?.error ||
      "Unable to add the player. Please try again.";

    /* "Already on CricIn" is about the number - show it under that field. */
    if (/already/i.test(String(message))) {
      setErrors((previous) => ({ ...previous, mobile: String(message) }));

      return;
    }

    Alert.alert("Could Not Add Player", String(message));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Add Player</Text>

        <Text style={styles.subtitle}>
          Name, number and player type are all we need. We'll create their
          CricIn account so they can log in and finish their profile.
        </Text>
      </View>

      {/* ── Required ─────────────────────────────────────────────── */}

      <Text style={styles.sectionTitle}>Required</Text>

      <View style={styles.field}>
        <Text style={styles.label}>
          Player Name<Text style={styles.required}> *</Text>
        </Text>

        <TextInput
          placeholder="Rohit Sharma"
          placeholderTextColor="#9CA3AF"
          value={playerName}
          onChangeText={(text) => {
            setPlayerName(text);
            clearError("playerName");
          }}
          style={[styles.input, !!errors.playerName && styles.inputError]}
          maxLength={50}
          autoCapitalize="words"
        />

        {!!errors.playerName && (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {errors.playerName}
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Mobile Number<Text style={styles.required}> *</Text>
        </Text>

        <View style={[styles.phoneRow, !!errors.mobile && styles.inputError]}>
          <Text style={styles.dial}>{country.dialCode}</Text>

          <TextInput
            placeholder="9876543210"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            /*
            | maxLength, not a check inside onChangeText. Setting state to a
            | value it already holds skips the re-render, so the native
            | input keeps the rejected character on screen.
            */
            maxLength={country.nationalLength}
            editable={!initialMobile}
            value={mobile}
            onChangeText={(text) => {
              setMobile(text.replace(/\D/g, ""));
              clearError("mobile");
            }}
            style={styles.phoneInput}
          />
        </View>

        {errors.mobile ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {errors.mobile}
          </Text>
        ) : (
          <Text style={styles.helper}>
            This is how they'll log in and claim this profile.
          </Text>
        )}
      </View>

      {/*
        | SelectField draws its own border and takes no style prop, so the
        | error state is a ring drawn around it rather than passed into it.
      */}
      <View style={!!errors.playerType ? styles.selectError : null}>
        <SelectField
          label="Player Type *"
          value={playerType}
          options={playerTypes}
          placeholder="Select player type"
          onSelect={(value) => {
            setPlayerType(value);
            clearError("playerType");
          }}
        />
      </View>

      {!!errors.playerType && (
        <Text
          style={[styles.error, styles.selectErrorText]}
          accessibilityLiveRegion="polite"
        >
          {errors.playerType}
        </Text>
      )}

      {/* ── Optional ─────────────────────────────────────────────── */}

      <View style={styles.optionalHeader}>
        <Text style={styles.sectionTitle}>Optional</Text>

        <Text style={styles.sectionNote}>The player can add these later</Text>
      </View>

      <SelectField
        label="Gender"
        value={gender}
        options={genders}
        placeholder="Select gender"
        onSelect={setGender}
      />

      <DatePickerField label="Date of Birth" value={dob} onChange={setDob} />

      <LocationPicker value={location} onChange={setLocation} />

      <SelectField
        label="Batting Style"
        value={battingStyle}
        options={battingStyles}
        placeholder="Select batting style"
        onSelect={setBattingStyle}
      />

      <SelectField
        label="Bowling Style"
        value={bowlingStyle}
        options={bowlingStyles}
        placeholder="Select bowling style"
        onSelect={setBowlingStyle}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Jersey Number</Text>

        <TextInput
          placeholder="7"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={3}
          value={jerseyNumber}
          onChangeText={(text) => setJerseyNumber(text.replace(/\D/g, ""))}
          style={styles.input}
        />
      </View>

      <View style={styles.notice}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={COLORS.primary}
        />

        <Text style={styles.noticeText}>
          A CricIn account is created for this number. They can log in any
          time to complete their profile and see their stats.
        </Text>
      </View>

      <View style={styles.mgT}>
        <PrimaryButton
          title={loading ? "Adding Player..." : "Add To Squad"}
          loading={loading}
          disabled={!canSubmit}
          onPress={save}
        />

        {/*
          | A disabled button with no explanation is the most frustrating
          | thing a form can do. This names what is still missing.
        */}
        {!canSubmit && !loading && (
          <Text style={styles.blockedHint}>
            Still needed:{" "}
            {[
              !nameOk && "player name",
              !mobileOk && "mobile number",
              !typeOk && "player type",
            ]
              .filter(Boolean)
              .join(", ")}
            .
          </Text>
        )}
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
    paddingBottom: 60,
  },

  header: {
    marginBottom: 24,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },

  subtitle: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: COLORS.onSurfaceVariant,
    marginBottom: 14,
  },

  optionalHeader: {
    marginTop: 22,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  sectionNote: {
    marginTop: -8,
    marginBottom: 16,
    fontSize: 12,
    color: "#9CA3AF",
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  required: {
    color: COLORS.error,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },

  dial: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginRight: 10,
  },

  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },

  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorContainer,
  },

  selectError: {
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: COLORS.errorContainer,
  },

  selectErrorText: {
    marginTop: -8,
    marginBottom: 14,
  },

  error: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.error,
  },

  helper: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },

  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
  },

  mgT: {
    marginTop: 24,
  },

  blockedHint: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
    color: "#7A7A7A",
  },
});
