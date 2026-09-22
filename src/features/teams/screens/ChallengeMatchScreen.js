/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Teams
|
| File:
| ChallengeMatchScreen.js
|
| Description:
| Ask another team for a game.
|
| WHY THIS WAS REWRITTEN
| The old version had a free-text "Match Date" box. Whatever was typed went
| straight to the server, where `startOfDay(proposedDate)` turned anything
| that was not an ISO string into Invalid Date - so a challenge sent as
| "21 sept" was stored with no date at all and skipped every availability
| check. It also rendered a hardcoded hero card that said "Delhi Warriors"
| regardless of who was being challenged.
|
| WHAT THIS SCREEN NOW DOES
| The server already refuses a challenge when either side has a match or a
| blocked date on the proposed day (sendChallenge -> isTeamAvailable). That
| is the right place for the rule, but finding out by having your challenge
| rejected is a bad way to learn it. So the same two calendars are read
| here as soon as a date is picked, and the clash is shown BEFORE the
| button is pressed.
|
| The opponent's standard availability (weekdays / weekends and their
| hours) is informational on the server by design - it describes when a
| team usually plays, it does not forbid anything. It is shown the same
| way here: a note, not a block. A team that normally plays weekends can
| still be asked about a Tuesday; they just get to see it is unusual.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import useTeam from "../hooks/useTeam";

import { getTeamCalendarApi } from "../services/team.service";

import { sendChallengeApi } from "../../matchChallenges/services/matchChallenges.services";

/*
| The server's enum, exactly. T5 was missing from the old mapper, so a T5
| challenge silently became T20.
*/

const MATCH_TYPES = ["T5", "T10", "T20", "ODI", "Test"];

const DEFAULT_OVERS = { T5: 5, T10: 10, T20: 20, ODI: 50, Test: 90 };

const OVERS_CHOICES = [5, 8, 10, 12, 15, 20, 25, 30, 40, 50];

const pad = (n) => String(n).padStart(2, "0");

/* YYYY-MM-DD in LOCAL time - toISOString() would shift the day in IST. */

const dateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const prettyDate = (d) =>
  d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const prettyTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

export default function ChallengeMatchScreen({ navigation, route }) {
  const opponent = route.params?.team || {};

  const { myTeams = [], getMyTeams } = useTeam();

  /*
  | Tomorrow, not today - a challenge for a game starting in three hours
  | is not a challenge, and the opponent has to have time to answer.
  */

  const [date, setDate] = useState(() => {
    const d = new Date();

    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);

    return d;
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  const [venue, setVenue] = useState("");

  const [message, setMessage] = useState("");

  const [selectedTeamId, setSelectedTeamId] = useState(null);

  /*
  | Pre-filled from what the opponent says they prefer. They are the ones
  | being asked for a favour, so their format is the sensible opening
  | offer - and it is still editable.
  */

  const preferred = opponent.matchPreferences || {};

  const [matchType, setMatchType] = useState(() => {
    const first = (preferred.formats || []).find((f) =>
      MATCH_TYPES.includes(f),
    );

    return first || "T20";
  });

  const [overs, setOvers] = useState(
    () => Number(preferred.preferredOvers) || 20,
  );

  const [checking, setChecking] = useState(false);

  const [clashes, setClashes] = useState({ mine: null, theirs: null });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyTeams();
  }, [getMyTeams]);

  useEffect(() => {
    if (myTeams.length === 1) setSelectedTeamId(String(myTeams[0]._id));
  }, [myTeams]);

  const myTeamId = selectedTeamId || (myTeams[0] ? String(myTeams[0]._id) : null);

  /*
  |--------------------------------------------------------------------------
  | Clash check
  |--------------------------------------------------------------------------
  |
  | The calendar endpoint returns ONLY the unavailable days in a range -
  | booked (an upcoming or live match) or blocked (the team marked itself
  | out). So a single-day range that comes back empty means the day is
  | free, which is the cheapest possible question to ask.
  |
  | Both sides are checked, because the server checks both: your own team
  | already having a game that day refuses the challenge just as surely as
  | theirs does, and that is the clash people forget about.
  */

  const checkClashes = useCallback(
    async (when, mineId) => {
      const key = dateKey(when);

      setChecking(true);

      try {
        const [theirs, mine] = await Promise.all([
          opponent._id
            ? getTeamCalendarApi(opponent._id, key, key).catch(() => [])
            : Promise.resolve([]),

          mineId
            ? getTeamCalendarApi(mineId, key, key).catch(() => [])
            : Promise.resolve([]),
        ]);

        setClashes({
          theirs: Array.isArray(theirs) && theirs.length ? theirs[0] : null,
          mine: Array.isArray(mine) && mine.length ? mine[0] : null,
        });
      } finally {
        setChecking(false);
      }
    },
    [opponent._id],
  );

  useEffect(() => {
    checkClashes(date, myTeamId);
  }, [checkClashes, date, myTeamId]);

  /*
  |--------------------------------------------------------------------------
  | Does the day fit how they usually play
  |--------------------------------------------------------------------------
  |
  | Informational only - see the file header. Nothing here disables the
  | button; it just says so out loud.
  */

  const availabilityNote = useMemo(() => {
    const std = opponent.standardAvailability || {};

    const weekend = isWeekend(date);

    const slot = weekend ? std.weekends : std.weekdays;

    if (!std.weekends?.enabled && !std.weekdays?.enabled) {
      return {
        tone: "muted",
        text: "Is team ne apni availability set nahi ki hai.",
      };
    }

    if (slot?.enabled) {
      return {
        tone: "good",
        text: `${weekend ? "Weekends" : "Weekdays"} pe ye team usually ${
          slot.startTime || "—"
        } se ${slot.endTime || "—"} tak khelti hai.`,
      };
    }

    return {
      tone: "warn",
      text: `Ye team usually ${
        weekend ? "weekends" : "weekdays"
      } pe nahi khelti — challenge bhej sakte ho, par wo mana kar sakte hain.`,
    };
  }, [opponent.standardAvailability, date]);

  const blocked = !!(clashes.mine || clashes.theirs);

  /*
  |--------------------------------------------------------------------------
  | Send
  |--------------------------------------------------------------------------
  */

  const send = async () => {
    if (!opponent._id) {
      Alert.alert("Error", "Opponent team missing hai.");

      return;
    }

    if (!myTeamId) {
      Alert.alert(
        "Team nahi hai",
        "Challenge bhejne ke liye pehle apni team banao ya join karo.",
      );

      return;
    }

    if (String(myTeamId) === String(opponent._id)) {
      Alert.alert("Nahi ho sakta", "Team khud ko challenge nahi kar sakti.");

      return;
    }

    setSubmitting(true);

    try {
      /*
      | The date goes as an ISO string built from the picked Date, so the
      | server's startOfDay gets something it can actually parse - the one
      | thing the old free-text field could not guarantee.
      */

      await sendChallengeApi({
        challengerTeamId: myTeamId,
        challengedTeamId: opponent._id,
        proposedDate: date.toISOString(),
        proposedTime: prettyTime(date),
        matchType,
        overs: Number(overs) || 20,
        venueName: venue.trim(),
        message: message.trim(),
      });

      Alert.alert(
        "Challenge bhej diya",
        `${opponent.teamName || "Team"} ke captain ko notification chala gaya hai. Wo accept, reject ya date change kar sakte hain.`,
        [{ text: "Theek hai", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert(
        "Challenge nahi gaya",
        error?.response?.data?.message ||
          error?.message ||
          "Dobara try karo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── Opponent ─────────────────────────────────────────────── */}

        <View style={styles.hero}>
          <View style={styles.heroLogo}>
            <Text style={styles.heroLogoText}>
              {(opponent.shortName ||
                (opponent.teamName || "?").slice(0, 3)
              ).toUpperCase()}
            </Text>
          </View>

          <View style={styles.heroText}>
            <Text style={styles.heroName} numberOfLines={1}>
              {opponent.teamName || "Team"}
            </Text>

            <Text style={styles.heroMeta} numberOfLines={1}>
              {[opponent.city, opponent.teamType].filter(Boolean).join(" · ") ||
                "Opponent"}
            </Text>
          </View>
        </View>

        {/* ── Challenge as ─────────────────────────────────────────── */}

        <Text style={styles.label}>Kaunsi team se challenge bhej rahe ho</Text>

        {myTeams.length === 0 ? (
          <View style={styles.noteMuted}>
            <Text style={styles.noteText}>
              Tumhari koi team nahi hai. Pehle team banao, phir challenge bhej
              paoge.
            </Text>
          </View>
        ) : (
          <View style={styles.chipWrap}>
            {myTeams.map((team) => {
              const active = String(myTeamId) === String(team._id);

              return (
                <TouchableOpacity
                  key={String(team._id)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedTeamId(String(team._id))}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                    numberOfLines={1}
                  >
                    {team.teamName || "Team"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Date & time ──────────────────────────────────────────── */}

        <Text style={styles.label}>Match kab</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.field, styles.fieldHalf]}
            activeOpacity={0.85}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={17}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.fieldText}>{prettyDate(date)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.field, styles.fieldTime]}
            activeOpacity={0.85}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons
              name="time-outline"
              size={17}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.fieldText}>{prettyTime(date)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, picked) => {
              setShowDatePicker(Platform.OS === "ios");

              if (event.type === "dismissed" || !picked) return;

              /* Keep the time that was already chosen. */

              const next = new Date(picked);

              next.setHours(date.getHours(), date.getMinutes(), 0, 0);

              setDate(next);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, picked) => {
              setShowTimePicker(Platform.OS === "ios");

              if (event.type === "dismissed" || !picked) return;

              const next = new Date(date);

              next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);

              setDate(next);
            }}
          />
        )}

        {/* ── What the date means for both sides ───────────────────── */}

        {checking ? (
          <View style={styles.noteMuted}>
            <ActivityIndicator size="small" color={COLORS.onSurfaceVariant} />

            <Text style={styles.noteText}>Dono teams ka din check ho raha hai…</Text>
          </View>
        ) : (
          <>
            {clashes.theirs && (
              <View style={styles.noteBad}>
                <Ionicons name="alert-circle" size={17} color={COLORS.error} />

                <Text style={[styles.noteText, styles.noteTextBad]}>
                  {opponent.teamName || "Is team"} ka is din
                  {clashes.theirs.status === "booked"
                    ? " pehle se match hai."
                    : ` din block hai${
                        clashes.theirs.reason ? ` — ${clashes.theirs.reason}` : "."
                      }`}
                </Text>
              </View>
            )}

            {clashes.mine && (
              <View style={styles.noteBad}>
                <Ionicons name="alert-circle" size={17} color={COLORS.error} />

                <Text style={[styles.noteText, styles.noteTextBad]}>
                  Tumhari team ka is din
                  {clashes.mine.status === "booked"
                    ? " pehle se match hai."
                    : ` din block hai${
                        clashes.mine.reason ? ` — ${clashes.mine.reason}` : "."
                      }`}
                </Text>
              </View>
            )}

            {!blocked && (
              <View
                style={
                  availabilityNote.tone === "warn"
                    ? styles.noteWarn
                    : availabilityNote.tone === "good"
                      ? styles.noteGood
                      : styles.noteMuted
                }
              >
                <Ionicons
                  name={
                    availabilityNote.tone === "warn"
                      ? "information-circle-outline"
                      : availabilityNote.tone === "good"
                        ? "checkmark-circle-outline"
                        : "help-circle-outline"
                  }
                  size={17}
                  color={
                    availabilityNote.tone === "warn"
                      ? COLORS.secondary
                      : availabilityNote.tone === "good"
                        ? COLORS.primary
                        : COLORS.onSurfaceVariant
                  }
                />

                <Text style={styles.noteText}>{availabilityNote.text}</Text>
              </View>
            )}
          </>
        )}

        {/* ── Format ───────────────────────────────────────────────── */}

        <Text style={styles.label}>Format</Text>

        <View style={styles.chipWrap}>
          {MATCH_TYPES.map((type) => {
            const active = matchType === type;

            return (
              <TouchableOpacity
                key={type}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}
                onPress={() => {
                  setMatchType(type);

                  setOvers(DEFAULT_OVERS[type] || 20);
                }}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Overs</Text>

        <View style={styles.chipWrap}>
          {OVERS_CHOICES.map((value) => {
            const active = Number(overs) === value;

            return (
              <TouchableOpacity
                key={value}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}
                onPress={() => setOvers(value)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Venue & message ──────────────────────────────────────── */}

        <Text style={styles.label}>Ground / venue</Text>

        <TextInput
          style={styles.input}
          value={venue}
          onChangeText={setVenue}
          placeholder="Ground ka naam"
          placeholderTextColor={COLORS.outline}
        />

        <Text style={styles.label}>Message (optional)</Text>

        <TextInput
          style={[styles.input, styles.inputMulti]}
          value={message}
          onChangeText={setMessage}
          placeholder="Kuch kehna hai captain se?"
          placeholderTextColor={COLORS.outline}
          multiline
          maxLength={300}
        />
      </ScrollView>

      {/* ── Send ───────────────────────────────────────────────────── */}

      {/*
      | Disabled on a clash rather than letting the request go and fail:
      | the server refuses it anyway, and a red banner plus a dead button
      | says why more clearly than an error alert after the fact.
      */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.send,
            (blocked || submitting || !myTeamId) && styles.sendDisabled,
          ]}
          activeOpacity={0.9}
          disabled={blocked || submitting || !myTeamId}
          onPress={send}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.onPrimary} />
          ) : (
            <>
              <Ionicons name="flash" size={18} color={COLORS.onPrimary} />

              <Text style={styles.sendText}>
                {blocked ? "Is din match nahi ho sakta" : "Challenge bhejo"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  scroll: { padding: 16, paddingBottom: 30 },

  /* ── Opponent ─────────────────────────────────────────────────── */

  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  heroLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 3,
  },

  heroLogoText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: COLORS.onPrimary,
  },

  heroText: { flex: 1 },

  heroName: { fontSize: 16, fontWeight: "800", color: COLORS.onSurface },

  heroMeta: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Form ─────────────────────────────────────────────────────── */

  label: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
  },

  row: { flexDirection: "row", gap: 10 },

  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  fieldHalf: { flex: 1 },

  fieldTime: { width: 112 },

  fieldText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
    maxWidth: "100%",
  },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 12.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  input: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
    fontSize: 14,
    color: COLORS.onSurface,
  },

  inputMulti: { minHeight: 80, textAlignVertical: "top" },

  /* ── Notes ────────────────────────────────────────────────────── */

  noteMuted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainer,
  },

  noteGood: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  noteWarn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: COLORS.secondaryContainer,
  },

  noteBad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.errorContainer,
  },

  noteText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },

  noteTextBad: { color: COLORS.error, fontWeight: "700" },

  /* ── Footer ───────────────────────────────────────────────────── */

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    backgroundColor: COLORS.background,
  },

  send: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },

  sendDisabled: { backgroundColor: COLORS.outline },

  sendText: { fontSize: 14.5, fontWeight: "800", color: COLORS.onPrimary },
});
