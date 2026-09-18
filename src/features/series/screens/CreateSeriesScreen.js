/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Series
|
| File:
| CreateSeriesScreen.js
|
| Description:
| Four steps to a draft series: Basics, Format, Schedule, Prizes.
|
| WHY FOUR AND NOT THE TOURNAMENT'S FIVE
| A series has no playoff shape, no seeding, no points rules and no public
| participation - there is nothing for a fifth step to hold. The whole
| Rules step of the tournament form collapses to "how many matches and how
| many overs", which fits in Format.
|
| WHY THE OPPONENT IS NOT ON THIS FORM
| Same reason teams are not on the tournament form: filling a form takes
| minutes, getting a captain to accept takes days. Putting them together
| means a create screen that cannot be finished in one sitting.
|
| The organizer picks their OWN team here - a series is between two named
| sides and there is no series without knowing who you are - and invites
| the opponent from the manage screen afterwards.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import DatePickerField from "../../../components/common/DatePickerField";

import useTeam from "../../teams/hooks/useTeam";

import {
  createSeriesApi,
  updateSeriesApi,
  getSeriesOptionsApi,
  getSeriesApi,
} from "../services/series.service";

import {
  LENGTH_PRESETS,
  MATCH_TYPES,
  DAYS,
  DAY_PRESETS,
  BALL_TYPES,
  DEFAULT_PRIZE_ROWS,
  FALLBACK_AWARD_METRICS,
  awardIcon,
  positionSuffix,
  formatMoney,
} from "../constants/seriesConstants";

const STEPS = ["Basics", "Format", "Schedule", "Prizes"];

/*
| All at module scope. Defined inside the component, every keystroke would
| give React a new component type for each of these and it would throw the
| input away and rebuild it - which loses the cursor position mid-word.
*/

const Field = ({ label, hint, children }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
    {!!hint && <Text style={styles.fieldHint}>{hint}</Text>}
  </View>
);

const Chip = ({ active, label, onPress, small }) => (
  <TouchableOpacity
    style={[styles.chip, small && styles.chipSmall, active && styles.chipActive]}
    activeOpacity={0.85}
    onPress={onPress}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function CreateSeriesScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const editingId = route.params?.seriesId || null;

  const { myTeams, getMyTeams } = useTeam();

  const [step, setStep] = useState(0);

  const [saving, setSaving] = useState(false);

  const [options, setOptions] = useState(null);

  const [form, setForm] = useState({
    seriesName: "",
    description: "",
    bannerImage: "",
    city: "",

    teamA: null,

    totalMatches: 3,
    matchType: "T20",
    overs: 20,
    ballType: "Tennis",

    grounds: [{ name: "", address: "" }],
    startDate: null,
    endDate: null,
    playDays: [0, 6],
    matchesPerDay: 1,

    prizes: DEFAULT_PRIZE_ROWS,
    awards: [{ metric: "man_of_the_series", label: "Man of the Series", amount: 0 }],

    isPublished: false,
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    getSeriesOptionsApi().then(setOptions).catch(() => undefined);

    getMyTeams();
  }, [getMyTeams]);

  useEffect(() => {
    if (!editingId) return;

    getSeriesApi(editingId)
      .then((s) =>
        setForm((f) => ({
          ...f,
          ...s,
          /* Populated on read, an id on write. */
          teamA: String(s.teamA?._id ?? s.teamA ?? ""),
          grounds: s.grounds?.length ? s.grounds : f.grounds,
          prizes: s.prizes?.length ? s.prizes : f.prizes,
          awards: s.awards?.length ? s.awards : f.awards,
        })),
      )
      .catch(() => undefined);
  }, [editingId]);

  /*
  | Only teams this user actually runs. The server refuses a series
  | created in somebody else's team's name, so offering those here would
  | only be setting up a rejection.
  */

  const teams = myTeams || [];

  const awardMetrics = options?.awardMetrics || FALLBACK_AWARD_METRICS;

  const availableMetrics = useMemo(() => {
    const used = new Set(form.awards.map((a) => a.metric));

    return awardMetrics.filter((m) => m.key === "custom" || !used.has(m.key));
  }, [awardMetrics, form.awards]);

  const prizePool = useMemo(
    () =>
      [...form.prizes, ...form.awards].reduce(
        (t, p) => t + Number(p.amount || 0),
        0,
      ),
    [form.prizes, form.awards],
  );

  /* ── Validation, per step ─────────────────────────────────────── */

  const stepError = useCallback(() => {
    if (step === 0) {
      if (form.seriesName.trim().length < 3) {
        return "Series ka naam kam se kam 3 character ka ho.";
      }

      if (!form.teamA) return "Apni team chuno.";
    }

    if (step === 1) {
      if (form.totalMatches < 1) return "Kam se kam 1 match.";

      if (form.overs < 1) return "Overs daalo.";
    }

    if (step === 2) {
      if (!form.grounds.some((g) => g.name.trim())) {
        return "Kam se kam ek ground ka naam daalo.";
      }

      if (!form.playDays.length) {
        return "Kam se kam ek din chuno jab match ho sakein.";
      }
    }

    return null;
  }, [step, form]);

  const next = () => {
    const err = stepError();

    if (err) {
      Alert.alert("Ruko", err);

      return;
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);

      return;
    }

    submit();
  };

  const submit = async () => {
    setSaving(true);

    try {
      const payload = {
        ...form,
        grounds: form.grounds.filter((g) => g.name.trim()),
        prizes: form.prizes.filter((p) => p.label.trim()),
        awards: form.awards.filter((a) => a.metric && a.label.trim()),
      };

      const saved = editingId
        ? await updateSeriesApi(editingId, payload)
        : await createSeriesApi(payload);

      /*
      | replace, not navigate: going "back" to a create form for a series
      | that already exists would let somebody create it twice.
      */

      navigation.replace("SeriesDetailScreen", {
        seriesId: saved._id || editingId,
      });
    } catch (err) {
      Alert.alert(
        "Save nahi hua",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Steps
  |--------------------------------------------------------------------------
  */

  const renderBasics = () => (
    <>
      <Field label="Series ka naam">
        <TextInput
          style={styles.input}
          value={form.seriesName}
          onChangeText={(v) => set("seriesName", v)}
          placeholder="Sunday Rivals Trophy"
          placeholderTextColor={COLORS.outline}
        />
      </Field>

      <Field
        label="Tumhari team"
        hint="Series sirf apni team ke liye bana sakte ho. Opponent baad mein invite karoge."
      >
        {teams.length === 0 ? (
          <Text style={styles.warn}>
            Tumhari koi team nahi hai. Pehle team banao, phir series.
          </Text>
        ) : (
          <View style={styles.chipWrap}>
            {teams.map((t) => (
              <Chip
                key={String(t._id)}
                label={t.teamName}
                active={String(form.teamA) === String(t._id)}
                onPress={() => set("teamA", String(t._id))}
              />
            ))}
          </View>
        )}
      </Field>

      <Field label="Shehar">
        <TextInput
          style={styles.input}
          value={form.city}
          onChangeText={(v) => set("city", v)}
          placeholder="Ghaziabad"
          placeholderTextColor={COLORS.outline}
        />
      </Field>

      <Field label="Description" hint="Rules, entry ki shart, jo bhi batana ho.">
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(v) => set("description", v)}
          placeholder="Optional"
          placeholderTextColor={COLORS.outline}
          multiline
        />
      </Field>
    </>
  );

  const renderFormat = () => (
    <>
      <Field
        label="Kitne match"
        hint="Saare match khele jayenge — series decide hone ke baad bhi. Ground book hai, dono team aati hai, dead rubber bhi match hai."
      >
        <View style={styles.presetWrap}>
          {LENGTH_PRESETS.map((p) => (
            <TouchableOpacity
              key={p.matches}
              style={[
                styles.preset,
                form.totalMatches === p.matches && styles.presetOn,
              ]}
              activeOpacity={0.85}
              onPress={() => set("totalMatches", p.matches)}
            >
              <Text
                style={[
                  styles.presetLabel,
                  form.totalMatches === p.matches && styles.presetLabelOn,
                ]}
              >
                {p.label}
              </Text>

              <Text
                style={[
                  styles.presetHint,
                  form.totalMatches === p.matches && styles.presetHintOn,
                ]}
              >
                {p.hint}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.stepperRow}>
          <Text style={styles.stepperLabel}>Ya khud daalo</Text>

          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() =>
                set("totalMatches", Math.max(1, form.totalMatches - 1))
              }
            >
              <Ionicons name="remove" size={17} color={COLORS.primary} />
            </TouchableOpacity>

            <Text style={styles.stepperValue}>{form.totalMatches}</Text>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() =>
                set("totalMatches", Math.min(15, form.totalMatches + 1))
              }
            >
              <Ionicons name="add" size={17} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Field>

      <Field label="Match type">
        <View style={styles.chipWrap}>
          {MATCH_TYPES.map((t) => (
            <Chip
              key={t}
              label={t}
              active={form.matchType === t}
              onPress={() => set("matchType", t)}
            />
          ))}
        </View>
      </Field>

      <View style={styles.twoUp}>
        <Field label="Overs">
          <TextInput
            style={[styles.input, styles.inputNarrow]}
            value={String(form.overs)}
            onChangeText={(v) => set("overs", Number(v.replace(/\D/g, "")) || 0)}
            keyboardType="number-pad"
            placeholder="20"
            placeholderTextColor={COLORS.outline}
          />
        </Field>

        <Field label="Ball">
          <View style={styles.chipWrap}>
            {BALL_TYPES.map((b) => (
              <Chip
                key={b}
                small
                label={b}
                active={form.ballType === b}
                onPress={() => set("ballType", b)}
              />
            ))}
          </View>
        </Field>
      </View>
    </>
  );

  const renderSchedule = () => (
    <>
      <Field
        label="Grounds"
        hint="Kam se kam ek. Zyada honge to har match alag ground par rotate ho jayega."
      >
        {form.grounds.map((g, i) => (
          <View key={i} style={styles.groundRow}>
            <View style={styles.groundFields}>
              <TextInput
                style={styles.input}
                value={g.name}
                onChangeText={(v) => {
                  const next = [...form.grounds];
                  next[i] = { ...next[i], name: v };
                  set("grounds", next);
                }}
                placeholder="Ground ka naam"
                placeholderTextColor={COLORS.outline}
              />

              <TextInput
                style={[styles.input, styles.groundAddress]}
                value={g.address}
                onChangeText={(v) => {
                  const next = [...form.grounds];
                  next[i] = { ...next[i], address: v };
                  set("grounds", next);
                }}
                placeholder="Address (optional)"
                placeholderTextColor={COLORS.outline}
              />
            </View>

            {form.grounds.length > 1 && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() =>
                  set(
                    "grounds",
                    form.grounds.filter((_, index) => index !== i),
                  )
                }
              >
                <Ionicons name="close" size={17} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addRow}
          onPress={() => set("grounds", [...form.grounds, { name: "", address: "" }])}
        >
          <Ionicons name="add-circle-outline" size={17} color={COLORS.primary} />

          <Text style={styles.addRowText}>Ground add karo</Text>
        </TouchableOpacity>
      </Field>

      <DatePickerField
        label="Pehla match kab se"
        value={form.startDate}
        onChange={(iso) => set("startDate", iso)}
      />

      <Field label="Kis din match ho sakte hain">
        <View style={styles.chipWrap}>
          {DAY_PRESETS.map((p) => (
            <Chip
              key={p.key}
              label={p.label}
              active={
                p.days.length === form.playDays.length &&
                p.days.every((d) => form.playDays.includes(d))
              }
              onPress={() => set("playDays", p.days)}
            />
          ))}
        </View>

        <View style={[styles.chipWrap, styles.dayWrap]}>
          {DAYS.map((d) => (
            <Chip
              key={d.value}
              small
              label={d.short}
              active={form.playDays.includes(d.value)}
              onPress={() =>
                set(
                  "playDays",
                  form.playDays.includes(d.value)
                    ? form.playDays.filter((x) => x !== d.value)
                    : [...form.playDays, d.value],
                )
              }
            />
          ))}
        </View>
      </Field>

      <Field
        label="Ek din mein kitne match"
        hint="Do team ka do baar ek hi din khelna hota hai, lekin common nahi — isliye default ek hai."
      >
        <View style={styles.chipWrap}>
          {[1, 2].map((n) => (
            <Chip
              key={n}
              label={String(n)}
              active={form.matchesPerDay === n}
              onPress={() => set("matchesPerDay", n)}
            />
          ))}
        </View>
      </Field>
    </>
  );

  const renderPrizes = () => (
    <>
      <Field
        label="Prizes"
        hint="Sirf dikhane ke liye — CricIn ke through koi payment nahi hoti."
      >
        {form.prizes.map((p, i) => (
          <View key={i} style={styles.prizeRow}>
            <View style={styles.prizePos}>
              <Text style={styles.prizePosText}>
                {positionSuffix(p.position)}
              </Text>
            </View>

            <View style={styles.prizeFields}>
              <TextInput
                style={[styles.input, styles.prizeLabelInput]}
                value={p.label}
                onChangeText={(v) => {
                  const next = [...form.prizes];
                  next[i] = { ...next[i], label: v };
                  set("prizes", next);
                }}
                placeholder="Winner"
                placeholderTextColor={COLORS.outline}
              />

              <TextInput
                style={[styles.input, styles.prizeAmountInput]}
                value={p.amount ? String(p.amount) : ""}
                onChangeText={(v) => {
                  const next = [...form.prizes];
                  next[i] = {
                    ...next[i],
                    amount: Number(v.replace(/\D/g, "")) || 0,
                  };
                  set("prizes", next);
                }}
                placeholder="₹ amount"
                placeholderTextColor={COLORS.outline}
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() =>
                set(
                  "prizes",
                  form.prizes.filter((_, index) => index !== i),
                )
              }
            >
              <Ionicons name="close" size={17} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addRow}
          onPress={() =>
            set("prizes", [
              ...form.prizes,
              {
                position: form.prizes.length + 1,
                label: "",
                amount: 0,
                description: "",
              },
            ])
          }
        >
          <Ionicons name="add-circle-outline" size={17} color={COLORS.primary} />

          <Text style={styles.addRowText}>Prize add karo</Text>
        </TouchableOpacity>
      </Field>

      {/*
      | Player awards. A series starts with Man of the Series rather than
      | two statistical awards - three matches is not enough for "Most
      | Runs" to feel like a real title, but every series ever played has
      | had a man of the series.
      */}

      <Field
        label="Player awards"
        hint="Jo app gin sakta hai wo khud nikaal lega. Man of the Series jaise awards tum decide karoge."
      >
        {form.awards.map((a, i) => {
          const meta = awardMetrics.find((m) => m.key === a.metric);

          return (
            <View key={i} style={styles.awardRow}>
              <View style={styles.awardHead}>
                <View style={styles.awardIcon}>
                  <Ionicons
                    name={awardIcon(a.metric)}
                    size={15}
                    color={COLORS.secondary}
                  />
                </View>

                <Text style={styles.awardMetricName} numberOfLines={1}>
                  {meta?.label || a.metric}
                </Text>

                <View style={[styles.awardBy, meta?.computed && styles.awardByApp]}>
                  <Text
                    style={[
                      styles.awardByText,
                      meta?.computed && styles.awardByTextApp,
                    ]}
                  >
                    {meta?.computed ? "APP" : "TUM"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() =>
                    set(
                      "awards",
                      form.awards.filter((_, index) => index !== i),
                    )
                  }
                >
                  <Ionicons name="close" size={17} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.prizeFields}>
                <TextInput
                  style={[styles.input, styles.prizeLabelInput]}
                  value={a.label}
                  onChangeText={(v) => {
                    const next = [...form.awards];
                    next[i] = { ...next[i], label: v };
                    set("awards", next);
                  }}
                  placeholder="Award ka naam"
                  placeholderTextColor={COLORS.outline}
                />

                <TextInput
                  style={[styles.input, styles.prizeAmountInput]}
                  value={a.amount ? String(a.amount) : ""}
                  onChangeText={(v) => {
                    const next = [...form.awards];
                    next[i] = {
                      ...next[i],
                      amount: Number(v.replace(/\D/g, "")) || 0,
                    };
                    set("awards", next);
                  }}
                  placeholder="₹ amount"
                  placeholderTextColor={COLORS.outline}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          );
        })}

        {availableMetrics.length > 0 && (
          <>
            <Text style={styles.awardPickTitle}>AWARD ADD KARO</Text>

            <View style={styles.awardPickWrap}>
              {availableMetrics.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={styles.awardPick}
                  activeOpacity={0.85}
                  onPress={() =>
                    set("awards", [
                      ...form.awards,
                      {
                        metric: m.key,
                        label: m.key === "custom" ? "" : m.label,
                        amount: 0,
                        description: "",
                      },
                    ])
                  }
                >
                  <Ionicons
                    name={awardIcon(m.key)}
                    size={13}
                    color={COLORS.primary}
                  />

                  <Text style={styles.awardPickText}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {prizePool > 0 && (
          <Text style={styles.poolLine}>
            Total prize pool: {formatMoney(prizePool)}
          </Text>
        )}
      </Field>

      <View style={styles.publishRow}>
        <View style={styles.publishText}>
          <Text style={styles.publishLabel}>Abhi publish kar do</Text>

          <Text style={styles.publishHint}>
            Publish karne par sab users ko dikhega. Baad mein bhi kar sakte ho.
          </Text>
        </View>

        <Switch
          value={form.isPublished}
          onValueChange={(v) => set("isPublished", v)}
          trackColor={{
            false: COLORS.outlineVariant,
            true: COLORS.onPrimaryContainer,
          }}
          thumbColor={form.isPublished ? COLORS.primary : COLORS.surfaceContainerHighest}
        />
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* ── Step bar ────────────────────────────────────────────── */}

      <View style={styles.stepBar}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                i === step && styles.stepDotActive,
                i < step && styles.stepDotDone,
              ]}
            >
              {i < step ? (
                <Ionicons name="checkmark" size={13} color={COLORS.onPrimary} />
              ) : (
                <Text
                  style={[
                    styles.stepDotText,
                    i === step && styles.stepDotTextActive,
                  ]}
                >
                  {i + 1}
                </Text>
              )}
            </View>

            <Text
              style={[styles.stepLabel, i === step && styles.stepLabelActive]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && renderBasics()}
        {step === 1 && renderFormat()}
        {step === 2 && renderSchedule()}
        {step === 3 && renderPrizes()}
      </ScrollView>

      {/* ── Footer ──────────────────────────────────────────────── */}

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.85}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backText}>Peeche</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.nextBtn}
          activeOpacity={0.85}
          disabled={saving}
          onPress={next}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.onPrimary} />
          ) : (
            <Text style={styles.nextText}>
              {step === STEPS.length - 1
                ? editingId
                  ? "Save karo"
                  : "Series banao"
                : "Aage"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  /* ── Step bar ─────────────────────────────────────────────────── */

  stepBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  stepItem: { flex: 1, alignItems: "center", gap: 5 },

  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceContainer,
  },

  stepDotActive: { backgroundColor: COLORS.primary },

  stepDotDone: { backgroundColor: COLORS.primaryContainer },

  stepDotText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  stepDotTextActive: { color: COLORS.onPrimary },

  stepLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  stepLabelActive: { color: COLORS.primary },

  scroll: { flex: 1 },

  content: { padding: 16, paddingBottom: 40 },

  /* ── Fields ───────────────────────────────────────────────────── */

  field: { marginBottom: 20, flex: 1 },

  fieldLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  fieldHint: {
    marginTop: 6,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    color: COLORS.onSurface,
  },

  inputNarrow: { width: 110 },

  textArea: { minHeight: 90, textAlignVertical: "top" },

  twoUp: { flexDirection: "row", gap: 14 },

  warn: {
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.error,
  },

  /* ── Chips ────────────────────────────────────────────────────── */

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  dayWrap: { marginTop: 10 },

  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  chipSmall: { paddingHorizontal: 10, paddingVertical: 6 },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  chipTextActive: { color: COLORS.onPrimary },

  /* ── Length presets ───────────────────────────────────────────── */

  presetWrap: { gap: 9 },

  preset: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
    padding: 12,
  },

  presetOn: { borderColor: COLORS.primary, backgroundColor: "#F2F8F0" },

  presetLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  presetLabelOn: { color: COLORS.primary },

  presetHint: {
    marginTop: 3,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  presetHintOn: { color: COLORS.onSurfaceVariant },

  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  stepperLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  stepperValue: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.onSurface,
    minWidth: 22,
    textAlign: "center",
  },

  /* ── Grounds ──────────────────────────────────────────────────── */

  groundRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },

  groundFields: { flex: 1, gap: 8 },

  groundAddress: { paddingVertical: 10, fontSize: 13 },

  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.errorContainer,
  },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },

  addRowText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },

  /* ── Prizes ───────────────────────────────────────────────────── */

  prizeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  prizePos: {
    width: 42,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
  },

  prizePosText: {
    fontSize: 11.5,
    fontWeight: "900",
    color: COLORS.onSurfaceVariant,
  },

  prizeFields: { flex: 1, gap: 8 },

  prizeLabelInput: { paddingVertical: 10, fontSize: 13.5 },

  prizeAmountInput: { paddingVertical: 10, fontSize: 13.5 },

  poolLine: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  /* ── Awards ───────────────────────────────────────────────────── */

  awardRow: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 10,
    marginBottom: 10,
  },

  awardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 9,
  },

  awardIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
  },

  awardMetricName: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  awardBy: {
    backgroundColor: "#FFF3E0",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  awardByApp: { backgroundColor: "#E2EDE0" },

  awardByText: {
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: COLORS.secondary,
  },

  awardByTextApp: { color: COLORS.primary },

  awardPickTitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },

  awardPickWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  awardPick: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  awardPickText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  /* ── Publish ──────────────────────────────────────────────────── */

  publishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
  },

  publishText: { flex: 1 },

  publishLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  publishHint: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Footer ───────────────────────────────────────────────────── */

  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  backBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  backText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.primary,
  },

  nextBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  nextText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },
});
