import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  getGroundByIdApi,
  updateGroundApi,
  getUnitsApi,
} from "../services/ground.service";

import { money } from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| GroundPoliciesScreen.js
|
| Description:
| The five numbers that decide every argument at the gate, set by the owner
| rather than by the app.
|
| WHY THESE ARE PER-GROUND AND NOT ONE GLOBAL SETTING
|
| A busy municipal ground with a waiting list wants a 15-minute changeover
| and a hard cancellation window. A weekend-only society ground can afford
| 45 minutes and be relaxed about it. One global number would be wrong for
| both, and wrong in a way the owner cannot fix.
|
| WHY THE BUFFER SHOWS ITS COST IN SLOTS AND RUPEES
|
| This is the one setting where the right answer is a trade-off, and an
| owner cannot make it from a number of minutes alone. Thirty minutes looks
| harmless on a screen; on a 6 AM-10 PM day of three-hour blocks it is the
| difference between four bookings and five.
|
| So the screen does that arithmetic live, against this ground's OWN slots,
| and prices it. An owner who then chooses 30 has chosen it knowing what it
| costs - and most will, because fifteen minutes does not survive a real
| Sunday: twenty-two players and their kit have to clear, the stumps and
| creases have to be reset, and the next side wants a knock.
|
| WHY THERE ARE NO CASH PENALTIES ANYWHERE ON THIS SCREEN
|
| The app holds no money, so it cannot collect a fine and cannot pay one
| out - and a penalty it announces but cannot collect is worse than none.
| What it can do is keep the facts: who arrived when, who was kept waiting,
| who answered their requests. Those become the reliability numbers on the
| listing, which every future customer sees. That turns out to be the
| stronger lever anyway.
|
|--------------------------------------------------------------------------
*/

const Stepper = ({ value, onChange, step, min, max, suffix }) => (
  <View style={styles.stepper}>
    <TouchableOpacity
      style={styles.stepButton}
      onPress={() => onChange(Math.max(min, value - step))}
      disabled={value <= min}
    >
      <Ionicons
        name="remove"
        size={17}
        color={value <= min ? COLORS.outlineVariant : COLORS.primary}
      />
    </TouchableOpacity>

    <Text style={styles.stepValue}>
      {value}
      <Text style={styles.stepSuffix}>{suffix}</Text>
    </Text>

    <TouchableOpacity
      style={styles.stepButton}
      onPress={() => onChange(Math.min(max, value + step))}
      disabled={value >= max}
    >
      <Ionicons
        name="add"
        size={17}
        color={value >= max ? COLORS.outlineVariant : COLORS.primary}
      />
    </TouchableOpacity>
  </View>
);

const Setting = ({ title, body, children }) => (
  <View style={styles.setting}>
    <Text style={styles.settingTitle}>{title}</Text>

    <Text style={styles.settingBody}>{body}</Text>

    {children}
  </View>
);

export default function GroundPoliciesScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { groundId } = route.params || {};

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [units, setUnits] = useState([]);

  const [form, setForm] = useState({
    bufferMatchMinutes: 30,
    bufferNetMinutes: 5,
    graceMinutes: 15,
    overtimeMultiplier: 1.5,
    cancellationCutoffHours: 6,
    requestExpiryHours: 12,
    instantBooking: false,
  });

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const load = useCallback(async () => {
    try {
      const [ground, unitList] = await Promise.all([
        getGroundByIdApi(groundId),
        getUnitsApi(groundId).catch(() => []),
      ]);

      setForm({
        bufferMatchMinutes: ground.bufferMatchMinutes ?? 30,
        bufferNetMinutes: ground.bufferNetMinutes ?? 5,
        graceMinutes: ground.graceMinutes ?? 15,
        overtimeMultiplier: ground.overtimeMultiplier ?? 1.5,
        cancellationCutoffHours: ground.cancellationCutoffHours ?? 6,
        requestExpiryHours: ground.requestExpiryHours ?? 12,
        instantBooking: !!ground.instantBooking,
      });

      setUnits(Array.isArray(unitList) ? unitList : []);
    } catch (error) {
      Alert.alert(
        "Load nahi hua",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );
    } finally {
      setLoading(false);
    }
  }, [groundId]);

  useEffect(() => {
    load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | What this buffer actually costs
  |--------------------------------------------------------------------------
  |
  | Measured against this ground's own pitch: its real opening window and its
  | real slot lengths, not a made-up example. A ground whose blocks do not
  | tile the day gets no estimate rather than a wrong one.
  */

  const impact = useMemo(() => {
    const pitch = units.find((u) => u.unitType === "match");

    if (!pitch) return null;

    const blocks = (pitch.matchBlocks || []).filter((b) => b.isActive !== false);

    if (!blocks.length) return null;

    const toMin = (t) => {
      const [h, m] = String(t || "").split(":");

      return (Number(h) || 0) * 60 + (Number(m) || 0);
    };

    /* A representative slot length - the most common one this pitch sells. */
    const lengths = blocks.map((b) => toMin(b.end) - toMin(b.start));

    const slotLength = Math.round(
      lengths.reduce((a, b) => a + b, 0) / lengths.length,
    );

    if (slotLength <= 0) return null;

    const hours = (pitch.weeklyHours || []).find((h) => !h.closed);

    if (!hours) return null;

    const dayMinutes = toMin(hours.close) - toMin(hours.open);

    if (dayMinutes <= 0) return null;

    /*
    | n slots need n lengths plus (n-1) gaps. Solving for the largest n that
    | fits the day gives the honest count at each buffer.
    */
    const fits = (buffer) =>
      Math.max(
        0,
        Math.floor((dayMinutes + buffer) / (slotLength + buffer)),
      );

    const current = fits(form.bufferMatchMinutes);

    const rates = blocks
      .map((b) => Number(b.weekdayRate) || 0)
      .filter((r) => r > 0);

    const avgRate = rates.length
      ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
      : 0;

    return {
      slotLength,
      dayMinutes,
      current,
      atFifteen: fits(15),
      atThirty: fits(30),
      atFortyFive: fits(45),
      avgRate,
      pitchName: pitch.name,
    };
  }, [units, form.bufferMatchMinutes]);

  const save = async () => {
    setSaving(true);

    try {
      await updateGroundApi(groundId, form);

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Save nahi hua",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );
    } finally {
      setSaving(false);
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.intro}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />

          <Text style={styles.introText}>
            Ye saare rules aapki listing par player ko booking se pehle dikhte
            hain. Isliye gate par bahas nahi hoti — sab pehle hi likha hota hai.
          </Text>
        </View>

        {/*
        |--------------------------------------------------------------------
        | The buffer, with its price tag
        |--------------------------------------------------------------------
        */}

        <Setting
          title="Do match ke beech ka gap"
          body="Ek team ko nikalne, stumps aur crease theek karne, aur agli team ko knock lene ka time. Iske andar koi booking nahi ho sakti."
        >
          <Stepper
            value={form.bufferMatchMinutes}
            onChange={(v) => set({ bufferMatchMinutes: v })}
            step={5}
            min={0}
            max={120}
            suffix=" min"
          />

          {impact ? (
            <View style={styles.impact}>
              <Text style={styles.impactHead}>
                {impact.pitchName} par — {Math.round(impact.slotLength / 60)} ghante
                ke slot, {Math.round(impact.dayMinutes / 60)} ghante ka din
              </Text>

              <View style={styles.impactRow}>
                {[
                  [15, impact.atFifteen],
                  [30, impact.atThirty],
                  [45, impact.atFortyFive],
                ].map(([mins, count]) => (
                  <View
                    key={mins}
                    style={[
                      styles.impactTile,
                      form.bufferMatchMinutes === mins && styles.impactTileActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.impactMins,
                        form.bufferMatchMinutes === mins &&
                          styles.impactTextActive,
                      ]}
                    >
                      {mins} min
                    </Text>

                    <Text
                      style={[
                        styles.impactCount,
                        form.bufferMatchMinutes === mins &&
                          styles.impactTextActive,
                      ]}
                    >
                      {count} match
                    </Text>
                  </View>
                ))}
              </View>

              {/*
              | The rupee line only when a slot rate exists, and only when the
              | two options genuinely differ. Printing "₹0 kam" would be noise.
              */}
              {impact.avgRate > 0 && impact.atFifteen !== impact.atThirty ? (
                <Text style={styles.impactMoney}>
                  15 se 30 min karne par roz {impact.atFifteen - impact.atThirty}{" "}
                  match kam —{" "}
                  {money((impact.atFifteen - impact.atThirty) * impact.avgRate)} roz,
                  lagbhag{" "}
                  {money(
                    (impact.atFifteen - impact.atThirty) * impact.avgRate * 30,
                  )}{" "}
                  mahina.
                </Text>
              ) : null}

              <Text style={styles.impactNote}>
                Phir bhi 30 min sabse safe hai. 15 min par ek team ke late hone
                se poora din pichad jaata hai — aur us deri ka record ground par
                aata hai, team par nahi.
              </Text>
            </View>
          ) : (
            <Text style={styles.settingHint}>
              Pitch aur uske slots add karne ke baad yahan dikhega ki is gap se
              din me kitne match fit honge.
            </Text>
          )}
        </Setting>

        <Setting
          title="Do net session ke beech ka gap"
          body="Net ka changeover sirf ek banda nikalne aur doosre ke aane ka hai — isliye ye chhota rakhna theek hai."
        >
          <Stepper
            value={form.bufferNetMinutes}
            onChange={(v) => set({ bufferNetMinutes: v })}
            step={5}
            min={0}
            max={60}
            suffix=" min"
          />
        </Setting>

        {/*
        |--------------------------------------------------------------------
        | Grace
        |--------------------------------------------------------------------
        */}

        <Setting
          title="Late aane ki chhoot"
          body="Itni der tak late aana kisi ke record me nahi jaayega. Iske baad system khud dekh leta hai ki deri team ki thi ya ground ki — pichli booking kab khatam hui, usse."
        >
          <Stepper
            value={form.graceMinutes}
            onChange={(v) => set({ graceMinutes: v })}
            step={5}
            min={0}
            max={60}
            suffix=" min"
          />

          <View style={styles.faultNote}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.primary} />

            <Text style={styles.faultNoteText}>
              Agar pichli team late tak ruki, to agli booking ka time apne aap
              utna aage badh jaata hai aur uska overtime maaf ho jaata hai. Ye
              aapko decide nahi karna padta.
            </Text>
          </View>
        </Setting>

        {/*
        |--------------------------------------------------------------------
        | Overtime
        |--------------------------------------------------------------------
        */}

        <Setting
          title="Overtime rate"
          body="Slot ke baad khelte rahe to har shuru hue aadhe ghante ka charge, isi slot ke apne rate ke hisaab se."
        >
          <View style={styles.chipRow}>
            {[1, 1.25, 1.5, 2].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.chip,
                  form.overtimeMultiplier === m && styles.chipActive,
                ]}
                activeOpacity={0.85}
                onPress={() => set({ overtimeMultiplier: m })}
              >
                <Text
                  style={[
                    styles.chipText,
                    form.overtimeMultiplier === m && styles.chipTextActive,
                  ]}
                >
                  {m}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {impact?.avgRate > 0 ? (
            <Text style={styles.settingHint}>
              Aapke {money(impact.avgRate)} wale{" "}
              {Math.round(impact.slotLength / 60)}-ghante slot par aadha ghanta
              overtime ={" "}
              {money(
                Math.round(
                  ((impact.avgRate / impact.slotLength) *
                    60 *
                    form.overtimeMultiplier) /
                    2,
                ),
              )}
              .
            </Text>
          ) : null}
        </Setting>

        {/*
        |--------------------------------------------------------------------
        | Cancellation and expiry
        |--------------------------------------------------------------------
        */}

        <Setting
          title="Free cancellation window"
          body="Isse pehle cancel karna normal hai. Iske baad cancel hua to booking par nishaan lag jaata hai — koi charge nahi, sirf record."
        >
          <Stepper
            value={form.cancellationCutoffHours}
            onChange={(v) => set({ cancellationCutoffHours: v })}
            step={1}
            min={0}
            max={72}
            suffix=" ghante pehle"
          />
        </Setting>

        <Setting
          title="Request kitni der tak valid"
          body="Itni der me jawab na do to request apne aap expire ho jaati hai aur slot free ho jaata hai. Team ko bhi pata chal jaata hai, taaki wo Sunday ka wait na karti rahe."
        >
          <Stepper
            value={form.requestExpiryHours}
            onChange={(v) => set({ requestExpiryHours: v })}
            step={1}
            min={1}
            max={72}
            suffix=" ghante"
          />

          <Text style={styles.settingHint}>
            Expire hui request aapke response rate ko neeche le jaati hai —
            isliye jawab dena, chahe "nahi" hi kyun na ho, behtar hai.
          </Text>
        </Setting>

        {/*
        |--------------------------------------------------------------------
        | Instant booking
        |--------------------------------------------------------------------
        |
        | Off by default, and the copy says both sides of it. An owner should
        | turn this on because they decided to, not discover afterwards that
        | strangers have been taking their Sunday mornings unsupervised.
        */}

        <View style={styles.setting}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.settingTitle}>Instant booking</Text>

              <Text style={styles.settingBody}>
                Team ko approval ka wait nahi karna padega — slot free hai to
                seedha confirm. Zyada bookings aati hain, par aap har ek dekh
                nahi paoge.
              </Text>
            </View>

            <Switch
              value={form.instantBooking}
              onValueChange={(v) => set({ instantBooking: v })}
              trackColor={{ true: COLORS.primaryContainer }}
              thumbColor={form.instantBooking ? COLORS.primary : undefined}
            />
          </View>

          {form.instantBooking ? (
            <View style={styles.instantWarn}>
              <Ionicons name="flash" size={13} color="#8f4e00" />

              <Text style={styles.instantWarnText}>
                Ab koi bhi khaali slot seedha book kar sakta hai. Band karna ho
                to calendar se us din ko block kar dena.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.noPenalty}>
          <Text style={styles.noPenaltyTitle}>Penalty kyun nahi hai</Text>

          <Text style={styles.noPenaltyBody}>
            App ke paas paisa nahi hota, to wo na fine wasool kar sakti hai na
            de sakti hai. Jo wo kar sakti hai wo ye — kisne kab check-in kiya,
            kaun intezaar karta raha, kisne request ka jawab diya. Yahi numbers
            aapki listing par dikhte hain, har booking se pehle. Aur wo ek baar
            ke fine se zyada asar karte hain.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, saving && styles.ctaDisabled]}
          activeOpacity={0.9}
          disabled={saving}
          onPress={save}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.onPrimary} />
          ) : (
            <>
              <Ionicons name="checkmark" size={17} color={COLORS.onPrimary} />

              <Text style={styles.ctaText}>Rules save karo</Text>
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

  scroll: { padding: 16, paddingBottom: 110, gap: 13 },

  intro: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 11,
    padding: 12,
  },

  introText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  setting: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    gap: 9,
  },

  settingTitle: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  settingBody: { fontSize: 11.5, lineHeight: 17, color: COLORS.onSurfaceVariant },

  settingHint: { fontSize: 11, lineHeight: 16, color: COLORS.outline },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    padding: 4,
  },

  stepButton: {
    width: 36,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainer,
  },

  stepValue: {
    minWidth: 96,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.onSurface,
  },

  stepSuffix: { fontSize: 11, fontWeight: "700", color: COLORS.onSurfaceVariant },

  impact: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 11,
    padding: 11,
    gap: 8,
  },

  impactHead: { fontSize: 11, fontWeight: "800", color: COLORS.onSurfaceVariant },

  impactRow: { flexDirection: "row", gap: 7 },

  impactTile: {
    flex: 1,
    alignItems: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingVertical: 8,
    gap: 2,
  },

  impactTileActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  impactMins: { fontSize: 10.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  impactCount: { fontSize: 13.5, fontWeight: "900", color: COLORS.onSurface },

  impactTextActive: { color: COLORS.onPrimary },

  impactMoney: { fontSize: 11.5, lineHeight: 17, fontWeight: "700", color: COLORS.secondary },

  impactNote: { fontSize: 11, lineHeight: 16, color: COLORS.onSurfaceVariant },

  faultNote: {
    flexDirection: "row",
    gap: 7,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 10,
    padding: 10,
  },

  faultNoteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  chipRow: { flexDirection: "row", gap: 7 },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 12.5, fontWeight: "800", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  switchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  switchText: { flex: 1, gap: 4 },

  instantWarn: {
    flexDirection: "row",
    gap: 7,
    backgroundColor: "#fff1d6",
    borderRadius: 10,
    padding: 10,
  },

  instantWarnText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: "#8f4e00",
  },

  noPenalty: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    padding: 13,
    gap: 5,
  },

  noPenaltyTitle: { fontSize: 12.5, fontWeight: "900", color: COLORS.onSurface },

  noPenaltyBody: {
    fontSize: 11.5,
    lineHeight: 17.5,
    color: COLORS.onSurfaceVariant,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingVertical: 15,
  },

  ctaDisabled: { opacity: 0.6 },

  ctaText: { fontSize: 14.5, fontWeight: "900", color: COLORS.onPrimary },
});
