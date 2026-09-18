/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| File:
| components/matches/MatchPinGate.js
|
| Description:
| The PIN gate that stands between a finished match setup and a live
| match. One input per team whose captain has to say "yes, we are here".
|
| WHY IT RENDERS A LIST AND DOES NOT WORK THE RULE OUT ITSELF
| The server sends `pinsRequired` on the match - which sides need a PIN,
| and the team name to label each one - built by the same function that
| checks them when Start is pressed.
|
| Deriving it here as well would mean two copies of one rule, and they
| drift. The failure mode is silent and horrible: the app asks for one
| PIN, the server demands two, and somebody stands at the ground reading
| "Incorrect PIN for Sharma XI" while holding a PIN that is completely
| correct.
|
| So this component draws whatever it is handed. Nothing more.
|
| THE THREE CASES IT COVERS
|   Captain of one team    one input - the opponent's PIN
|   Captain of both        no inputs - it does not open at all
|   Captain of neither     two inputs, one per team
|
| The third case is the TOURNAMENT AND SERIES ORGANIZER, and it is why
| this exists. An organizer runs the fixture and captains neither side, so
| starting it means collecting a PIN from each captain. That is the right
| amount of friction: an organizer who could start a match alone could
| start it while one team was still travelling.
|
| WHY THE TEAM NAME IS ON THE LABEL AND NOT JUST "TEAM A"
| The person typing is holding a phone and looking at two captains. "Team
| A PIN" makes them guess which side is which; "Sharma XI PIN" does not.
|
|--------------------------------------------------------------------------
*/

import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../constants/colors";

export default function MatchPinGate({
  visible,
  /* [{ side: "teamA" | "teamB", teamName }] - straight from the server. */
  sides = [],
  loading = false,
  error = "",
  onCancel,
  /* Called with { teamA: "1234", teamB: "5678" } - only the needed keys. */
  onSubmit,
}) {
  const [values, setValues] = useState({});

  const inputs = useRef({});

  /*
  | Cleared every time the sheet opens. A PIN left in state from a failed
  | attempt would be pre-filled on the next one, and somebody would press
  | Start without reading it.
  */

  useEffect(() => {
    if (visible) setValues({});
  }, [visible]);

  const setPin = (side, raw) => {
    /* Digits only - the PIN is four digits and a stray space fails the
       comparison with no visible reason why. */
    const digits = raw.replace(/\D/g, "").slice(0, 4);

    setValues((prev) => ({ ...prev, [side]: digits }));

    /*
    | Jump to the next box on the fourth digit. With two PINs to type this
    | saves a tap at exactly the moment the person is being watched by two
    | captains.
    */

    if (digits.length === 4) {
      const i = sides.findIndex((s) => s.side === side);

      const next = sides[i + 1];

      if (next) inputs.current[next.side]?.focus();
    }
  };

  const complete = sides.every((s) => (values[s.side] || "").length === 4);

  const submit = () => {
    if (!complete) return;

    const payload = {};

    sides.forEach((s) => {
      payload[s.side] = values[s.side];
    });

    onSubmit?.(payload);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.wrap}>
        <View style={styles.sheet}>
          <View style={styles.head}>
            <View style={styles.headIcon}>
              <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
            </View>

            <View style={styles.headText}>
              <Text style={styles.title}>
                {sides.length > 1 ? "Dono teams ka PIN" : "Match PIN"}
              </Text>

              <Text style={styles.subtitle}>
                {sides.length > 1
                  ? "Dono captains se unka 4-digit PIN maango. Dono sahi honge tabhi match start hoga."
                  : "Opponent captain se unka 4-digit PIN maango."}
              </Text>
            </View>
          </View>

          {sides.map((s, i) => (
            <View key={s.side} style={styles.field}>
              <Text style={styles.label} numberOfLines={1}>
                {s.teamName} — PIN
              </Text>

              <TextInput
                ref={(r) => {
                  inputs.current[s.side] = r;
                }}
                style={[
                  styles.input,
                  (values[s.side] || "").length === 4 && styles.inputDone,
                ]}
                value={values[s.side] || ""}
                onChangeText={(v) => setPin(s.side, v)}
                placeholder="0000"
                placeholderTextColor={COLORS.outline}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus={i === 0}
                editable={!loading}
              />
            </View>
          ))}

          {!!error && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={15} color={COLORS.error} />

              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.85}
              disabled={loading}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.startBtn, !complete && styles.startBtnOff]}
              activeOpacity={0.85}
              disabled={!complete || loading}
              onPress={submit}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.onPrimary} />
              ) : (
                <Text style={styles.startText}>Start Match</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 24,
  },

  sheet: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 20,
  },

  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginBottom: 18,
  },

  headIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E2EDE0",
    alignItems: "center",
    justifyContent: "center",
  },

  headText: { flex: 1 },

  title: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.onSurface,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  field: { marginBottom: 14 },

  label: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: COLORS.onSurfaceVariant,
    marginBottom: 7,
    textTransform: "uppercase",
  },

  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 10,
    textAlign: "center",
    color: COLORS.onSurface,
  },

  inputDone: { borderColor: COLORS.primary },

  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: COLORS.errorContainer,
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onErrorContainer,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  cancelBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignItems: "center",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  startBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  startBtnOff: { backgroundColor: COLORS.outline },

  startText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },
});
