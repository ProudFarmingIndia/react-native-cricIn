import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import { requestBookingApi } from "../services/ground.service";

import { getMyTeamsApi } from "../../teams/services/team.service";

import { getUpcomingMatchesApi } from "../../matches/services/matches.services";

import {
  money,
  fmtDate,
  fmtHHMM,
  PURPOSES,
  FLEXIBILITY_OPTIONS,
} from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| BookGroundScreen.js
|
| Description:
| The last screen before a request goes out: what the slot is for, who it is
| for, and how much the team can move.
|
| THE THREE THINGS THAT CAN HAPPEN TO A SLOT
|
| Attach an existing match, create a new one from it, or neither. All three
| are offered because all three are real - a net session has no match, and
| forcing one into existence to satisfy a foreign key would fill the matches
| list with fixtures nobody ever played.
|
| When a match IS attached, the owner's booking card shows both team names
| and the format. That single line is the whole reason a ground owner would
| rather have this app than a phone call.
|
| WHY FLEXIBILITY GETS THE MOST SPACE ON THE SCREEN
|
| It is the field that turns a refusal into a booking. An owner who cannot
| do 6-9 but could do 6:30-9:30 has, with a flexible request, something to
| offer; without one, their only options are yes and no. Most users will not
| work that out from a label reading "Flexibility (minutes)", so each option
| says what it actually buys them.
|
| WHY THERE IS NO PAYMENT STEP
|
| Cash at the ground, phase one. The amount is shown here, frozen onto the
| booking, and presented again at check-out. No gateway means no refunds to
| process and no penalty the app cannot collect - and the amounts are already
| itemised for the day one arrives.
|
|--------------------------------------------------------------------------
*/

const Card = ({ title, hint, children }) => (
  <View style={styles.block}>
    <Text style={styles.blockTitle}>{title}</Text>

    {hint ? <Text style={styles.blockHint}>{hint}</Text> : null}

    {children}
  </View>
);

const Option = ({ active, title, subtitle, icon, onPress, disabled }) => (
  <TouchableOpacity
    style={[
      styles.option,
      active && styles.optionActive,
      disabled && styles.optionDisabled,
    ]}
    activeOpacity={disabled ? 1 : 0.85}
    onPress={disabled ? undefined : onPress}
  >
    <View style={styles.optionLeft}>
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={active ? COLORS.primary : COLORS.onSurfaceVariant}
        />
      ) : null}

      <View style={styles.optionText}>
        <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
          {title}
        </Text>

        {subtitle ? <Text style={styles.optionSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>

    <Ionicons
      name={active ? "radio-button-on" : "radio-button-off"}
      size={18}
      color={active ? COLORS.primary : COLORS.outlineVariant}
    />
  </TouchableOpacity>
);

export default function BookGroundScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { groundId, groundName, date, slot } = route.params || {};

  const isNet = slot?.unitType === "net";

  const [purpose, setPurpose] = useState(isNet ? "net" : "match");

  const [teams, setTeams] = useState([]);

  const [teamId, setTeamId] = useState(null);

  /* "none" | "existing" | "new" */
  const [matchMode, setMatchMode] = useState("none");

  const [matches, setMatches] = useState([]);

  const [matchId, setMatchId] = useState(null);

  const [newMatch, setNewMatch] = useState({
    matchTitle: "",
    matchType: "T20",
    overs: "20",
  });

  const [flexibility, setFlexibility] = useState(30);

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [myTeams, upcoming] = await Promise.all([
        getMyTeamsApi().catch(() => []),
        getUpcomingMatchesApi().catch(() => []),
      ]);

      const list = Array.isArray(myTeams) ? myTeams : myTeams?.teams || [];

      setTeams(list);

      /* One team means no decision to make - pre-select it. */
      if (list.length === 1) setTeamId(String(list[0]._id));

      /*
      | Only matches with no ground on them yet. A fixture already tied to a
      | ground is not a candidate - attaching it here would silently move it,
      | and the other captain would find out by turning up at the old place.
      */
      const candidates = (Array.isArray(upcoming) ? upcoming : []).filter(
        (m) => !m.groundId && m.status !== "completed" && m.status !== "cancelled",
      );

      setMatches(candidates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /*
  | A net booking has no fixture, so the match section is not shown at all
  | rather than shown and disabled. If the user came in on a net slot and the
  | mode was somehow set, it is reset here.
  */
  useEffect(() => {
    if (isNet && matchMode !== "none") setMatchMode("none");
  }, [isNet, matchMode]);

  const submit = async () => {
    if (matchMode === "existing" && !matchId) {
      Alert.alert("Match chuniye", "Kaunsa match is slot par khelna hai?");

      return;
    }

    if (matchMode === "new" && !newMatch.matchTitle.trim()) {
      Alert.alert("Match ka naam", "Match ko ek naam de dijiye.");

      return;
    }

    setSubmitting(true);

    try {
      const result = await requestBookingApi({
        groundId,

        unitId: slot.unitId,

        date,

        startTime: slot.start,

        endTime: slot.end,

        blockId: slot.blockId,

        purpose,

        teamId: teamId || undefined,

        matchId: matchMode === "existing" ? matchId : undefined,

        createMatch:
          matchMode === "new"
            ? {
                matchTitle: newMatch.matchTitle.trim(),
                matchType: newMatch.matchType,
                overs: Number(newMatch.overs) || 20,
                teamA: teamId || undefined,
              }
            : undefined,

        flexibilityMinutes: flexibility,

        note: note.trim(),
      });

      const instant = !!result?.instant;

      Alert.alert(
        instant ? "Booking confirm!" : "Request bhej di",
        result?.message ||
          (instant
            ? "Slot aapka hai. Ground par cash de dena."
            : "Owner ko notification chala gaya hai. Jawab aane par aapko bata denge."),
        [
          {
            text: "Booking dekho",
            onPress: () =>
              navigation.replace("BookingDetailScreen", {
                bookingId: result?.booking?._id,
              }),
          },
        ],
      );
    } catch (error) {
      /*
      | The server's own message, not a generic one. It says exactly which
      | rule was hit - "ye slot already booked hai", "30 min gap chahiye",
      | "us din ye unit band rehti hai" - and each of those is something the
      | user can act on.
      */
      Alert.alert(
        "Booking nahi ho payi",
        error?.response?.data?.message || "Kuch galat ho gaya. Dobara try karo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/*
        | The slot, restated. Somebody two screens deep should not have to
        | trust their memory about which day they picked.
        */}
        <View style={styles.summary}>
          <Text style={styles.summaryGround}>{groundName}</Text>

          <Text style={styles.summarySlot}>
            {fmtDate(slot?.start)} · {fmtHHMM(slot?.startLabel)}–
            {fmtHHMM(slot?.endLabel)}
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryUnit}>{slot?.unitName}</Text>

            <Text style={styles.summaryAmount}>{money(slot?.amount)}</Text>
          </View>
        </View>

        <Card title="Kis cheez ke liye">
          <View style={styles.chipRow}>
            {PURPOSES.filter((p) => (isNet ? p.key === "net" : p.key !== "net")).map(
              (p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.chip, purpose === p.key && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => setPurpose(p.key)}
                >
                  <Ionicons
                    name={p.icon}
                    size={13}
                    color={purpose === p.key ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                  />

                  <Text
                    style={[styles.chipText, purpose === p.key && styles.chipTextActive]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </Card>

        {teams.length ? (
          <Card
            title="Kis team ke liye"
            hint="Owner ko team ka naam dikhega — optional hai"
          >
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, !teamId && styles.chipActive]}
                activeOpacity={0.85}
                onPress={() => setTeamId(null)}
              >
                <Text style={[styles.chipText, !teamId && styles.chipTextActive]}>
                  Personal
                </Text>
              </TouchableOpacity>

              {teams.map((t) => {
                const active = teamId === String(t._id);

                return (
                  <TouchableOpacity
                    key={String(t._id)}
                    style={[styles.chip, active && styles.chipActive]}
                    activeOpacity={0.85}
                    onPress={() => setTeamId(String(t._id))}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {t.teamName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        ) : null}

        {/*
        |--------------------------------------------------------------------
        | The match
        |--------------------------------------------------------------------
        |
        | Three options, and "just the ground" is a first-class one rather
        | than a way of skipping the step.
        */}

        {!isNet ? (
          <Card
            title="Match"
            hint="Ground owner ko match ki detail dikhegi — dono team ke naam aur format"
          >
            <Option
              active={matchMode === "none"}
              title="Sirf ground book karo"
              subtitle="Match baad me decide karenge"
              icon="ellipse-outline"
              onPress={() => setMatchMode("none")}
            />

            <Option
              active={matchMode === "existing"}
              title="Pehle se bana match jodo"
              subtitle={
                matches.length
                  ? `${matches.length} match bina ground ke hain`
                  : "Aapka koi match bina ground ke nahi hai"
              }
              icon="link-outline"
              disabled={!matches.length}
              onPress={() => setMatchMode("existing")}
            />

            <Option
              active={matchMode === "new"}
              title="Naya match banao"
              subtitle="Is slot par ek draft match ban jaayega"
              icon="add-circle-outline"
              onPress={() => setMatchMode("new")}
            />

            {matchMode === "existing" ? (
              <View style={styles.subSection}>
                {matches.map((m) => {
                  const active = matchId === String(m._id);

                  return (
                    <TouchableOpacity
                      key={String(m._id)}
                      style={[styles.matchRow, active && styles.matchRowActive]}
                      activeOpacity={0.85}
                      onPress={() => setMatchId(String(m._id))}
                    >
                      <Ionicons
                        name={active ? "checkmark-circle" : "ellipse-outline"}
                        size={17}
                        color={active ? COLORS.primary : COLORS.outlineVariant}
                      />

                      <View style={styles.matchInfo}>
                        <Text style={styles.matchTitle} numberOfLines={1}>
                          {m.matchTitle || "Match"}
                        </Text>

                        <Text style={styles.matchMeta} numberOfLines={1}>
                          {m.teamA?.teamName || "Team A"} vs{" "}
                          {m.teamB?.teamName || "TBD"}
                          {m.matchType ? ` · ${m.matchType}` : ""}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {matchMode === "new" ? (
              <View style={styles.subSection}>
                <TextInput
                  style={styles.input}
                  value={newMatch.matchTitle}
                  onChangeText={(t) => setNewMatch((p) => ({ ...p, matchTitle: t }))}
                  placeholder="Match ka naam — jaise Sunday League R3"
                  placeholderTextColor={COLORS.outline}
                />

                <View style={styles.chipRow}>
                  {["T5", "T10", "T20", "ODI"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        newMatch.matchType === type && styles.chipActive,
                      ]}
                      activeOpacity={0.85}
                      onPress={() =>
                        setNewMatch((p) => ({
                          ...p,
                          matchType: type,

                          /*
                          | Overs follow the format, because a T10 with 20
                          | overs on it is a data-entry mistake waiting to
                          | confuse a scorer.
                          */
                          overs:
                            type === "T5"
                              ? "5"
                              : type === "T10"
                                ? "10"
                                : type === "T20"
                                  ? "20"
                                  : "50",
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          newMatch.matchType === type && styles.chipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.draftNote}>
                  Ye draft match banega — opponent aur squad baad me add kar
                  sakte hain.
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/*
        |--------------------------------------------------------------------
        | Flexibility
        |--------------------------------------------------------------------
        |
        | The highest-leverage field on the form. See the note at the top.
        */}

        <Card
          title="Time me flexibility"
          hint="Slot exactly free na ho to owner is limit ke andar doosra time offer kar sakta hai"
        >
          {FLEXIBILITY_OPTIONS.map((f) => (
            <Option
              key={f.value}
              active={flexibility === f.value}
              title={f.label}
              subtitle={f.hint}
              icon={f.value === 0 ? "lock-closed-outline" : "swap-horizontal-outline"}
              onPress={() => setFlexibility(f.value)}
            />
          ))}
        </Card>

        <Card title="Owner ke liye note" hint="Optional">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={300}
            placeholder="Jaise: 14 log aayenge, stumps aur ball ki zaroorat hai"
            placeholderTextColor={COLORS.outline}
          />
        </Card>

        {/*
        | What happens next, in plain words. Without this line a user taps
        | the button and does not know whether they have a ground or a
        | request, and that uncertainty is what makes people phone the
        | ground anyway.
        */}
        <View style={styles.expect}>
          <Ionicons name="information-circle-outline" size={15} color={COLORS.primary} />

          <Text style={styles.expectText}>
            Request owner ke paas jaayegi. Wo accept, reject ya naya time offer
            kar sakta hai — aapko notification mil jaayega. Paisa ground par
            cash dena hai.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total</Text>

          <Text style={styles.footerAmount}>{money(slot?.amount)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.cta, submitting && styles.ctaDisabled]}
          activeOpacity={0.9}
          disabled={submitting}
          onPress={submit}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.onPrimary} />
          ) : (
            <>
              <Ionicons name="paper-plane" size={16} color={COLORS.onPrimary} />

              <Text style={styles.ctaText}>Request bhejo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  scroll: { padding: 16, paddingBottom: 120, gap: 13 },

  summary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 14,
    gap: 3,
  },

  summaryGround: { fontSize: 15, fontWeight: "900", color: COLORS.onPrimary },

  summarySlot: { fontSize: 12.5, fontWeight: "700", color: COLORS.onPrimaryContainer },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },

  summaryUnit: { fontSize: 12, color: COLORS.onPrimaryContainer },

  summaryAmount: { fontSize: 16, fontWeight: "900", color: COLORS.onPrimary },

  block: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    gap: 8,
  },

  blockTitle: { fontSize: 13.5, fontWeight: "900", color: COLORS.onSurface },

  blockHint: {
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
    marginTop: -4,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 12, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 11,
  },

  optionActive: { borderColor: COLORS.primary, backgroundColor: "#f2f8f2" },

  optionDisabled: { opacity: 0.45 },

  optionLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9 },

  optionText: { flex: 1, gap: 1 },

  optionTitle: { fontSize: 13, fontWeight: "800", color: COLORS.onSurface },

  optionTitleActive: { color: COLORS.primary },

  optionSubtitle: { fontSize: 11, lineHeight: 15, color: COLORS.onSurfaceVariant },

  subSection: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    paddingTop: 10,
  },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 10,
    padding: 10,
  },

  matchRowActive: { borderColor: COLORS.primary, backgroundColor: "#f2f8f2" },

  matchInfo: { flex: 1, gap: 1 },

  matchTitle: { fontSize: 12.5, fontWeight: "800", color: COLORS.onSurface },

  matchMeta: { fontSize: 11, color: COLORS.onSurfaceVariant },

  input: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  textarea: { minHeight: 74, textAlignVertical: "top" },

  draftNote: { fontSize: 11, lineHeight: 16, color: COLORS.outline },

  expect: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 11,
    padding: 12,
  },

  expectText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  footerLabel: { fontSize: 10.5, fontWeight: "700", color: COLORS.outline },

  footerAmount: { fontSize: 18, fontWeight: "900", color: COLORS.onSurface },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minWidth: 160,
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  ctaDisabled: { opacity: 0.6 },

  ctaText: { fontSize: 14, fontWeight: "900", color: COLORS.onPrimary },
});
