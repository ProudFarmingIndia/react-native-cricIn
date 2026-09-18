/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| CreateTournamentScreen.js
|
| Description:
| Five steps to a draft tournament.
|
| WHY THE PREVIEW MATTERS MORE THAN IT LOOKS
| Step 2 shows "8 teams · League · 28 matches · 7 rounds" and updates as
| the organizer taps. Twenty-eight matches on weekends only is fourteen
| weekends - and the moment to find that out is here, not after the
| fixtures exist and the format is locked.
|
| WHAT IS DELIBERATELY NOT ON THIS FORM
| Teams. Filling a form takes minutes; getting eight captains to accept
| takes weeks. Putting them together means a create screen that can never
| be finished.
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

import {
  createTournamentApi,
  updateTournamentApi,
  getTournamentOptionsApi,
  previewFixturesApi,
  getTournamentApi,
} from "../services/tournament.service";

import {
  FORMAT_LABEL,
  FORMAT_HINT,
  FORMAT_ICON,
  BALL_TYPES,
  DAYS,
  DAY_PRESETS,
  DEFAULT_PRIZE_ROWS,
  DEFAULT_AWARD_ROWS,
  FALLBACK_AWARD_METRICS,
  awardIcon,
  positionSuffix,
  formatMoney,
} from "../constants/tournamentConstants";

const STEPS = ["Basics", "Format", "Schedule", "Rules", "Visibility"];

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

export default function CreateTournamentScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const editingId = route.params?.tournamentId || null;

  const [step, setStep] = useState(0);

  const [saving, setSaving] = useState(false);

  const [options, setOptions] = useState(null);

  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    tournamentName: "",
    description: "",
    bannerImage: "",
    city: "",

    format: "League",
    playoffShape: "none",
    maxTeams: 8,
    overs: 20,
    matchType: "T20",
    ballType: "Tennis",

    grounds: [{ name: "", address: "" }],
    startDate: null,
    endDate: null,
    registrationDeadline: null,
    playDays: [0, 6],
    matchesPerDay: 2,

    entryFee: 0,
    prizes: DEFAULT_PRIZE_ROWS,
    awards: DEFAULT_AWARD_ROWS,

    pointsWin: 2,
    pointsLoss: 0,
    pointsTie: 1,
    pointsNoResult: 1,

    isPublished: false,
    publicParticipation: false,
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    getTournamentOptionsApi().then(setOptions).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!editingId) return;

    getTournamentApi(editingId)
      .then((t) =>
        setForm((f) => ({
          ...f,
          ...t,
          grounds: t.grounds?.length ? t.grounds : f.grounds,
          prizes: t.prizes?.length ? t.prizes : f.prizes,
          awards: t.awards?.length ? t.awards : f.awards,
        })),
      )
      .catch(() => undefined);
  }, [editingId]);

  /*
  | The live count. Debounced lightly so dragging the team stepper does not
  | fire a request per tick, but still feels immediate.
  */

  useEffect(() => {
    const id = setTimeout(() => {
      previewFixturesApi(form.format, form.maxTeams, form.playoffShape)
        .then(setPreview)
        .catch(() => setPreview(null));
    }, 250);

    return () => clearTimeout(id);
  }, [form.format, form.maxTeams, form.playoffShape]);

  const shapes = options?.playoffShapes || [];

  const eligibleShapes = useMemo(
    () => shapes.filter((s) => form.maxTeams >= s.minTeams),
    [shapes, form.maxTeams],
  );

  /*
  | A shape that stops being eligible when the team count drops must not
  | stay selected - otherwise an organizer picks IPL playoffs at 8 teams,
  | reduces to 5, and generates a bracket that cannot exist.
  */

  useEffect(() => {
    if (form.format !== "League+Knockout") return;

    if (
      form.playoffShape !== "none" &&
      !eligibleShapes.some((s) => s.key === form.playoffShape)
    ) {
      set("playoffShape", eligibleShapes[0]?.key || "none");
    }
  }, [eligibleShapes, form.format, form.playoffShape]);

  /*
  | The pool is position prizes PLUS player awards - the same sum the
  | server computes. Somebody reading "₹25,000 prize pool" is being told
  | what is on the table, and ₹5,000 of it being for Most Wickets does not
  | make it less on the table.
  */

  const prizePool = useMemo(
    () =>
      [...form.prizes, ...form.awards].reduce(
        (t, p) => t + Number(p.amount || 0),
        0,
      ),
    [form.prizes, form.awards],
  );

  /*
  | The award catalogue, from the server. The fallback keeps the picker
  | usable if /options has not answered yet - an empty picker on a slow
  | connection reads as "this tournament cannot have awards".
  */

  const awardMetrics = options?.awardMetrics || FALLBACK_AWARD_METRICS;

  /*
  | What can still be added. A metric already on the form is dropped,
  | because the server rejects duplicates and offering one here would only
  | be setting up an error message. `custom` never drops out.
  */

  const availableMetrics = useMemo(() => {
    const used = new Set(form.awards.map((a) => a.metric));

    return awardMetrics.filter((m) => m.key === "custom" || !used.has(m.key));
  }, [awardMetrics, form.awards]);

  /* ── Validation, per step ─────────────────────────────────────── */

  const stepError = useCallback(() => {
    if (step === 0) {
      if (form.tournamentName.trim().length < 3) {
        return "Tournament ka naam kam se kam 3 character ka ho.";
      }
    }

    if (step === 1) {
      if (form.maxTeams < 3) return "Kam se kam 3 teams chahiye.";

      if (form.format === "League+Knockout" && form.playoffShape === "none") {
        return "Playoff ka format chuno.";
      }
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

    if (step < STEPS.length - 1) setStep(step + 1);
    else submit();
  };

  const submit = async () => {
    setSaving(true);

    try {
      const payload = {
        ...form,
        grounds: form.grounds.filter((g) => g.name.trim()),
        prizes: form.prizes.filter((p) => p.label.trim()),

        /*
        | A custom award with no name is a row the organizer started and
        | abandoned. Sending it would fail server validation on `label`,
        | which is required - dropping it silently is the right call for a
        | blank row nobody filled in.
        */
        awards: form.awards.filter((a) => a.metric && a.label.trim()),
        playoffShape:
          form.format === "League+Knockout" ? form.playoffShape : "none",
      };

      const saved = editingId
        ? await updateTournamentApi(editingId, payload)
        : await createTournamentApi(payload);

      /*
      | replace, not navigate: going "back" to a create form for a
      | tournament that now exists would let somebody create it twice.
      */

      navigation.replace("ManageTournamentScreen", {
        tournamentId: saved._id || editingId,
      });
    } catch (err) {
      Alert.alert(
        "Failed",
        err?.response?.data?.message || "Tournament save nahi hua.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── Steps ────────────────────────────────────────────────────── */

  const renderBasics = () => (
    <>
      <Field label="Tournament name">
        <TextInput
          style={styles.input}
          value={form.tournamentName}
          onChangeText={(v) => set("tournamentName", v)}
          placeholder="Gully Champions Cup 2026"
          placeholderTextColor={COLORS.outline}
          maxLength={60}
        />
      </Field>

      <Field
        label="Rules & details"
        hint="Captain accept karne se pehle yahi padhega — poora likho."
      >
        <TextInput
          style={[styles.input, styles.textarea]}
          value={form.description}
          onChangeText={(v) => set("description", v)}
          placeholder="Entry rules, timing, contact number, kya allowed hai kya nahi..."
          placeholderTextColor={COLORS.outline}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </Field>

      <Field label="City">
        <TextInput
          style={styles.input}
          value={form.city}
          onChangeText={(v) => set("city", v)}
          placeholder="Ghaziabad"
          placeholderTextColor={COLORS.outline}
        />
      </Field>

      <Field label="Banner image URL" hint="Optional. Na do toh default card banega.">
        <TextInput
          style={styles.input}
          value={form.bannerImage}
          onChangeText={(v) => set("bannerImage", v)}
          placeholder="https://..."
          placeholderTextColor={COLORS.outline}
          autoCapitalize="none"
        />
      </Field>
    </>
  );

  const renderFormat = () => (
    <>
      <Field label="Format">
        <View style={styles.formatList}>
          {(options?.formats || ["League", "Knockout", "League+Knockout"]).map(
            (f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.formatCard,
                  form.format === f && styles.formatCardActive,
                ]}
                activeOpacity={0.85}
                onPress={() => set("format", f)}
              >
                <Ionicons
                  name={FORMAT_ICON[f] || "trophy-outline"}
                  size={19}
                  color={form.format === f ? COLORS.onPrimary : COLORS.primary}
                />

                <View style={styles.formatText}>
                  <Text
                    style={[
                      styles.formatLabel,
                      form.format === f && styles.formatLabelActive,
                    ]}
                  >
                    {FORMAT_LABEL[f] || f}
                  </Text>

                  <Text
                    style={[
                      styles.formatHint,
                      form.format === f && styles.formatHintActive,
                    ]}
                  >
                    {FORMAT_HINT[f]}
                  </Text>
                </View>
              </TouchableOpacity>
            ),
          )}
        </View>
      </Field>

      <Field label="Number of teams">
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => set("maxTeams", Math.max(3, form.maxTeams - 1))}
          >
            <Ionicons name="remove" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <Text style={styles.stepperValue}>{form.maxTeams}</Text>

          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => set("maxTeams", Math.min(32, form.maxTeams + 1))}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </Field>

      {/*
      | The number that decides whether this tournament is realistic. Shown
      | here, before the format is locked, and not after.
      */}
      {!!preview && (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>YE SCHEDULE BANEGA</Text>

          <Text style={styles.previewBig}>
            {preview.matches} matches
            <Text style={styles.previewSmall}>  ·  {preview.rounds} rounds</Text>
          </Text>

          <Text style={styles.previewNote}>
            {form.maxTeams} teams ·{" "}
            {FORMAT_LABEL[form.format] || form.format}
            {form.playDays.length === 2
              ? ` · weekends par ${Math.ceil(preview.matches / (form.matchesPerDay * 2))} hafte lagenge`
              : ""}
          </Text>
        </View>
      )}

      {form.format === "League+Knockout" && (
        <Field
          label="Playoff format"
          hint="League ke baad top teams kaise khelengi. Fixtures banne ke baad ye nahi badlega."
        >
          <View style={styles.shapeList}>
            {eligibleShapes.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[
                  styles.shapeCard,
                  form.playoffShape === s.key && styles.shapeCardActive,
                ]}
                activeOpacity={0.85}
                onPress={() => set("playoffShape", s.key)}
              >
                <View style={styles.shapeHead}>
                  <Text
                    style={[
                      styles.shapeLabel,
                      form.playoffShape === s.key && styles.shapeLabelActive,
                    ]}
                  >
                    {s.label}
                  </Text>

                  <Text style={styles.shapeCount}>+{s.matches}</Text>
                </View>

                <Text style={styles.shapeSummary}>{s.summary}</Text>

                <Text style={styles.shapeDetail}>{s.detail}</Text>
              </TouchableOpacity>
            ))}

            {eligibleShapes.length < shapes.length && (
              <Text style={styles.shapeNote}>
                Kuch playoff formats zyada teams par hi milte hain.
              </Text>
            )}
          </View>
        </Field>
      )}

      <View style={styles.row}>
        <Field label="Overs">
          <TextInput
            style={[styles.input, styles.inputNarrow]}
            value={String(form.overs)}
            onChangeText={(v) => set("overs", Number(v.replace(/\D/g, "")) || 0)}
            keyboardType="number-pad"
          />
        </Field>

        <Field label="Ball">
          <View style={styles.chipRow}>
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
        hint="Kam se kam ek. Zyada add karoge toh matches inme baant diye jayenge."
      >
        {form.grounds.map((g, i) => (
          <View key={i} style={styles.groundRow}>
            <TextInput
              style={[styles.input, styles.groundInput]}
              value={g.name}
              onChangeText={(v) => {
                const next = [...form.grounds];
                next[i] = { ...next[i], name: v };
                set("grounds", next);
              }}
              placeholder={`Ground ${i + 1} ka naam`}
              placeholderTextColor={COLORS.outline}
            />

            {form.grounds.length > 1 && (
              <TouchableOpacity
                style={styles.groundRemove}
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

      <Field label="Start date">
        <DatePickerField
          value={form.startDate}
          onChange={(d) => set("startDate", d)}
          placeholder="Kab se shuru"
        />
      </Field>

      <Field
        label="Match kaunse din honge"
        hint="Schedule inhi dino par banega. Baad mein badla toh fixtures bhi update ho jayenge."
      >
        <View style={styles.chipRow}>
          {DAY_PRESETS.map((p) => (
            <Chip
              key={p.key}
              label={p.label}
              active={
                form.playDays.length === p.days.length &&
                p.days.every((d) => form.playDays.includes(d))
              }
              onPress={() => set("playDays", p.days)}
            />
          ))}
        </View>

        <View style={[styles.chipRow, styles.dayRow]}>
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

      <Field label="Ek din mein kitne match">
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => set("matchesPerDay", Math.max(1, form.matchesPerDay - 1))}
          >
            <Ionicons name="remove" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <Text style={styles.stepperValue}>{form.matchesPerDay}</Text>

          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => set("matchesPerDay", Math.min(10, form.matchesPerDay + 1))}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </Field>
    </>
  );

  const renderRules = () => (
    <>
      <Field
        label="Points"
        hint="Pehla match complete hone ke baad ye lock ho jayenge."
      >
        <View style={styles.pointsRow}>
          {[
            ["pointsWin", "Win"],
            ["pointsTie", "Tie"],
            ["pointsNoResult", "No result"],
            ["pointsLoss", "Loss"],
          ].map(([key, label]) => (
            <View key={key} style={styles.pointsCell}>
              <Text style={styles.pointsLabel}>{label}</Text>

              <TextInput
                style={[styles.input, styles.pointsInput]}
                value={String(form[key])}
                onChangeText={(v) =>
                  set(key, Number(v.replace(/\D/g, "")) || 0)
                }
                keyboardType="number-pad"
              />
            </View>
          ))}
        </View>
      </Field>

      {/*
      |------------------------------------------------------------------
      | Prizes
      |------------------------------------------------------------------
      |
      | An open ladder - 1st, 2nd, 3rd, 4th, or Man of the Series as a
      | fifth row. Position is just a number the organizer sets.
      |
      */}

      <Field label="Prizes" hint="Jitne chahe. Banner par prize pool dikhega.">
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
                placeholder="Winner / Man of the Series"
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
              style={styles.groundRemove}
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
      |------------------------------------------------------------------
      | Player awards
      |------------------------------------------------------------------
      |
      | Kept separate from the prize ladder above because they are decided
      | by a different thing entirely: a position prize is won by a TEAM in
      | the final, an award is won by a PLAYER across the whole tournament.
      |
      | The catalogue comes from the server, and each entry says whether
      | the app can count it. That distinction is shown on the row - the
      | organizer needs to know before they add "Best Fielder" that nobody
      | is going to calculate it for them.
      |
      */}

      <Field
        label="Player awards"
        hint="Most runs, most wickets, most sixes… jo app gin sakta hai wo khud nikaal lega, live. Baaki tum decide karoge."
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

                <View
                  style={[
                    styles.awardBy,
                    meta?.computed && styles.awardByApp,
                  ]}
                >
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
                  style={styles.groundRemove}
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

              {!!meta?.hint && (
                <Text style={styles.awardHint}>{meta.hint}</Text>
              )}
            </View>
          );
        })}

        {/*
        | The picker only offers what is not already added. The server
        | rejects a duplicate metric outright - two rows fighting over one
        | winner is always a mistake - so offering it here would only be
        | setting the organizer up for an error message.
        |
        | `custom` is exempt and always on offer: three custom awards is
        | the entire reason it exists.
        */}

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

      <Field
        label="Entry fee"
        hint="Sirf dikhane ke liye — CricIn ke through koi payment nahi hoti."
      >
        <TextInput
          style={[styles.input, styles.inputNarrow]}
          value={form.entryFee ? String(form.entryFee) : ""}
          onChangeText={(v) => set("entryFee", Number(v.replace(/\D/g, "")) || 0)}
          placeholder="0"
          placeholderTextColor={COLORS.outline}
          keyboardType="number-pad"
        />
      </Field>
    </>
  );

  const renderVisibility = () => (
    <>
      <View style={styles.toggleCard}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>Publish tournament</Text>

          <Text style={styles.toggleHint}>
            On karte hi har CricIn user ko dikhega — home page aur Matches
            tab dono par.
          </Text>
        </View>

        <Switch
          value={form.isPublished}
          onValueChange={(v) => set("isPublished", v)}
          trackColor={{ true: COLORS.primary }}
        />
      </View>

      <View style={styles.toggleCard}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>Public participation</Text>

          <Text style={styles.toggleHint}>
            On: koi bhi captain apni team ka join request bhej sakta hai,
            approve tum karoge. Off: sirf tumhare invite se teams judengi.
          </Text>
        </View>

        <Switch
          value={form.publicParticipation}
          onValueChange={(v) => set("publicParticipation", v)}
          trackColor={{ true: COLORS.primary }}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>NEXT STEP</Text>

        <Text style={styles.summaryText}>
          Save karte hi teams invite karne wali screen khulegi. Tournament
          tab tak draft rahega jab tak tum publish nahi karte.
        </Text>
      </View>
    </>
  );

  const body = [
    renderBasics,
    renderFormat,
    renderSchedule,
    renderRules,
    renderVisibility,
  ][step];

  return (
    <View style={styles.container}>
      <View style={styles.stepBar}>
        {STEPS.map((label, i) => (
          <TouchableOpacity
            key={label}
            style={styles.stepItem}
            onPress={() => i < step && setStep(i)}
            activeOpacity={i < step ? 0.7 : 1}
          >
            <View
              style={[
                styles.stepDot,
                i === step && styles.stepDotActive,
                i < step && styles.stepDotDone,
              ]}
            >
              {i < step ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
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
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {body()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={next}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.onPrimary} />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === STEPS.length - 1
                ? editingId
                  ? "Save changes"
                  : "Create as draft"
                : "Next"}
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
    fontSize: 9.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  stepLabelActive: { color: COLORS.primary },

  scroll: { flex: 1 },

  content: { padding: 16, paddingBottom: 40, gap: 4 },

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

  textarea: { minHeight: 110 },

  row: { flexDirection: "row", gap: 14 },

  /* ── Chips ────────────────────────────────────────────────────── */

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  dayRow: { marginTop: 10 },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
  },

  chipSmall: { paddingHorizontal: 11, paddingVertical: 7 },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 12.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  /* ── Format cards ─────────────────────────────────────────────── */

  formatList: { gap: 10 },

  formatCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
  },

  formatCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  formatText: { flex: 1 },

  formatLabel: { fontSize: 14.5, fontWeight: "800", color: COLORS.onSurface },

  formatLabelActive: { color: COLORS.onPrimary },

  formatHint: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  formatHintActive: { color: "rgba(255,255,255,0.8)" },

  /* ── Stepper ──────────────────────────────────────────────────── */

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    alignSelf: "flex-start",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  stepperButton: { padding: 6 },

  stepperValue: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.onSurface,
    minWidth: 34,
    textAlign: "center",
  },

  /* ── Preview ──────────────────────────────────────────────────── */

  previewCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
  },

  previewTitle: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: "rgba(255,255,255,0.75)",
  },

  previewBig: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },

  previewSmall: { fontSize: 14, fontWeight: "600" },

  previewNote: {
    marginTop: 5,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },

  /* ── Playoff shapes ───────────────────────────────────────────── */

  shapeList: { gap: 10 },

  shapeCard: {
    padding: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
  },

  shapeCardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: "#F4F8F2",
  },

  shapeHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  shapeLabel: { flex: 1, fontSize: 14, fontWeight: "800", color: COLORS.onSurface },

  shapeLabelActive: { color: COLORS.primary },

  shapeCount: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  shapeSummary: {
    marginTop: 5,
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  shapeDetail: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 16.5,
    color: COLORS.onSurfaceVariant,
  },

  shapeNote: {
    fontSize: 11,
    fontStyle: "italic",
    color: COLORS.onSurfaceVariant,
  },

  /* ── Grounds & prizes ─────────────────────────────────────────── */

  groundRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },

  groundInput: { flex: 1 },

  groundRemove: { padding: 8 },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },

  addRowText: { fontSize: 13, fontWeight: "800", color: COLORS.primary },

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
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.primary,
  },

  prizeFields: { flex: 1, gap: 6 },

  prizeLabelInput: { paddingVertical: 10 },

  prizeAmountInput: { paddingVertical: 10 },

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

  /*
  | "APP" or "TUM" - who will decide this award's winner. The organizer
  | needs to know BEFORE adding "Best Fielder" that nobody is going to
  | calculate it for them.
  */

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

  awardHint: {
    marginTop: 7,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.onSurfaceVariant,
  },

  awardPickTitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },

  awardPickWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

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

  /* ── Points ───────────────────────────────────────────────────── */

  pointsRow: { flexDirection: "row", gap: 10 },

  pointsCell: { flex: 1 },

  pointsLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    marginBottom: 5,
    textAlign: "center",
  },

  pointsInput: { textAlign: "center", paddingVertical: 10 },

  /* ── Toggles ──────────────────────────────────────────────────── */

  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 12,
  },

  toggleText: { flex: 1 },

  toggleLabel: { fontSize: 14.5, fontWeight: "800", color: COLORS.onSurface },

  toggleHint: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  summaryCard: {
    backgroundColor: "#F4F8F2",
    borderRadius: 14,
    padding: 15,
    marginTop: 6,
  },

  summaryTitle: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.primary,
  },

  summaryText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurface,
  },

  /* ── Footer ───────────────────────────────────────────────────── */

  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  backButton: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  backButtonText: { fontSize: 14, fontWeight: "700", color: COLORS.onSurfaceVariant },

  nextButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
  },

  nextButtonText: { fontSize: 14.5, fontWeight: "800", color: COLORS.onPrimary },
});
