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

import StarRating from "../components/StarRating";

import { getReviewFormApi, createReviewApi } from "../services/ground.service";

import { fmtSlot } from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| RateGroundScreen.js
|
| Description:
| Rate a ground you actually played at.
|
| WHY THE PROMISE QUESTIONS COME FROM THE SERVER
|
| They are not a fixed list. The owner ticks what they are committing to -
| floodlights working, parking available, water there - and this screen asks
| about those items ONLY.
|
| That is what makes them answerable. "Rate the facilities out of five" gets
| a shrug and a 4; "the ground said there would be floodlights - were there?"
| gets a yes or a no. A ground that promised nothing is asked nothing, which
| is also correct: it has not been measured, and the discovery screen says so
| rather than crediting it with 100%.
|
| WHY ONLY ONE STAR RATING IS REQUIRED
|
| Five required scores is how a review form gets abandoned. Overall is
| required because without it there is no review; the other four are offered
| and skipped freely, and the server's averages simply ignore the blanks
| rather than treating a skip as a zero.
|
| WHY THIS SCREEN CANNOT BE REACHED WITHOUT A COMPLETED BOOKING
|
| The server refuses a review whose booking is not `completed` and enforces
| one review per booking with a unique index. That single constraint does
| what a moderation system would otherwise have to: a rival owner has no
| booking, so he cannot leave ten one-stars, and nobody can be asked to
| leave five.
|
|--------------------------------------------------------------------------
*/

const SCORES = [
  {
    key: "overall",
    label: "Overall",
    hint: "Sab milake kaisa tha?",
    required: true,
  },
  { key: "pitch", label: "Pitch", hint: "Khelne layak thi?" },
  { key: "hygiene", label: "Safai", hint: "Washroom, paani, ground ki halat" },
  { key: "facilities", label: "Facilities", hint: "Parking, seating, changing room" },
  { key: "valueForMoney", label: "Paise ki value", hint: "Jitna diya, utna mila?" },
];

export default function RateGroundScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { bookingId } = route.params || {};

  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [scores, setScores] = useState({
    overall: 0,
    pitch: 0,
    hygiene: 0,
    facilities: 0,
    valueForMoney: 0,
  });

  /* Which promises were actually kept. Starts empty - nothing is assumed. */
  const [kept, setKept] = useState([]);

  const [comment, setComment] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getReviewFormApi(bookingId);

      setForm(data);
    } catch (error) {
      Alert.alert(
        "Rating form nahi khula",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );

      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!scores.overall) {
      Alert.alert("Overall rating", "Kam se kam overall rating de dijiye.");

      return;
    }

    setSubmitting(true);

    try {
      await createReviewApi({
        bookingId,

        ...scores,

        /*
        | Only the keys with a value. A 0 would be rejected by the server's
        | min:1 validator, and sending it would fail the whole review over a
        | question the user deliberately skipped.
        */
        pitch: scores.pitch || undefined,
        hygiene: scores.hygiene || undefined,
        facilities: scores.facilities || undefined,
        valueForMoney: scores.valueForMoney || undefined,

        promisesKept: kept,

        comment: comment.trim(),
      });

      Alert.alert(
        "Shukriya!",
        "Aapki rating live ho gayi. Isse doosri teams ko ground chunne me madad milegi.",
        [{ text: "Theek hai", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert(
        "Rating submit nahi hui",
        error?.response?.data?.message || "Kuch galat ho gaya.",
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

  if (!form) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={28} color={COLORS.outline} />

        <Text style={styles.errorText}>Ye form load nahi ho paaya.</Text>
      </View>
    );
  }

  /*
  | Already rated, or the session is not finished. Both are dead ends, so the
  | screen says which one it is rather than showing a form that cannot be
  | submitted.
  */
  if (!form.canReview) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name={form.alreadyReviewed ? "checkmark-circle" : "time-outline"}
          size={30}
          color={form.alreadyReviewed ? COLORS.success : COLORS.outline}
        />

        <Text style={styles.blockedTitle}>
          {form.alreadyReviewed ? "Rating already di hui hai" : "Abhi rating nahi"}
        </Text>

        <Text style={styles.blockedBody}>{form.reason}</Text>

        {form.alreadyReviewed && form.review ? (
          <View style={styles.existing}>
            <StarRating value={form.review.overall} size={17} />

            {form.review.comment ? (
              <Text style={styles.existingComment}>“{form.review.comment}”</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }

  const promises = form.promiseQuestions || [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.head}>
          <Text style={styles.groundName}>{form.ground?.groundName}</Text>

          <Text style={styles.when}>
            {fmtSlot(form.booking?.startTime, form.booking?.endTime)}
          </Text>
        </View>

        <View style={styles.block}>
          {SCORES.map((s) => (
            <View key={s.key} style={styles.scoreRow}>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreLabel}>
                  {s.label}
                  {s.required ? (
                    <Text style={styles.required}> *</Text>
                  ) : (
                    <Text style={styles.optional}> (optional)</Text>
                  )}
                </Text>

                <Text style={styles.scoreHint}>{s.hint}</Text>
              </View>

              <StarRating
                value={scores[s.key]}
                size={22}
                onChange={(v) =>
                  setScores((prev) => ({
                    ...prev,

                    /* Tapping the same star again clears it - the only way to
                    | un-answer an optional question once it has been touched.
                    */
                    [s.key]: prev[s.key] === v ? 0 : v,
                  }))
                }
              />
            </View>
          ))}
        </View>

        {/*
        |--------------------------------------------------------------------
        | Promises
        |--------------------------------------------------------------------
        |
        | The part that produces the number people actually choose grounds on.
        | Nothing is pre-ticked: an untouched list means nothing was delivered,
        | which is the honest default for a question nobody answered.
        */}

        {promises.length ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Ground ne ye promise kiya tha</Text>

            <Text style={styles.blockHint}>
              Jo actually mila, us par tick karo. Yahi se ground ka "promises
              kept" score banta hai.
            </Text>

            {promises.map((p) => {
              const on = kept.includes(p.key);

              return (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.promiseRow, on && styles.promiseRowOn]}
                  activeOpacity={0.85}
                  onPress={() =>
                    setKept((prev) =>
                      on ? prev.filter((k) => k !== p.key) : [...prev, p.key],
                    )
                  }
                >
                  <Ionicons
                    name={on ? "checkmark-circle" : "close-circle-outline"}
                    size={19}
                    color={on ? COLORS.success : COLORS.outline}
                  />

                  <Text style={[styles.promiseLabel, on && styles.promiseLabelOn]}>
                    {p.label}
                  </Text>

                  <Text style={[styles.promiseState, on && styles.promiseStateOn]}>
                    {on ? "Mila" : "Nahi mila"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Kuch likhna hai?</Text>

          <Text style={styles.blockHint}>
            Agli team ke kaam aa jaayega — jaise "outfield thoda uneven hai" ya
            "owner bahut cooperative hai"
          </Text>

          <TextInput
            style={styles.textarea}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={600}
            placeholder="Optional"
            placeholderTextColor={COLORS.outline}
          />

          <Text style={styles.counter}>{comment.length}/600</Text>
        </View>

        <View style={styles.fairNote}>
          <Ionicons name="information-circle-outline" size={15} color={COLORS.primary} />

          <Text style={styles.fairNoteText}>
            Owner aapki rating par ek reply de sakta hai. Rating 48 ghante tak
            edit ho sakti hai.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.cta,
            (!scores.overall || submitting) && styles.ctaDisabled,
          ]}
          activeOpacity={0.9}
          disabled={!scores.overall || submitting}
          onPress={submit}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.onPrimary} />
          ) : (
            <>
              <Ionicons name="send" size={16} color={COLORS.onPrimary} />

              <Text style={styles.ctaText}>Rating submit karo</Text>
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
    gap: 8,
    paddingHorizontal: 30,
    backgroundColor: COLORS.background,
  },

  errorText: { fontSize: 13.5, color: COLORS.onSurfaceVariant },

  blockedTitle: {
    fontSize: 15.5,
    fontWeight: "900",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  blockedBody: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  existing: {
    marginTop: 12,
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  existingComment: {
    fontSize: 12.5,
    fontStyle: "italic",
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  scroll: { padding: 16, paddingBottom: 110, gap: 13 },

  head: { gap: 3 },

  groundName: { fontSize: 18, fontWeight: "900", color: COLORS.onSurface },

  when: { fontSize: 12.5, color: COLORS.onSurfaceVariant },

  block: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    gap: 9,
  },

  blockTitle: { fontSize: 13.5, fontWeight: "900", color: COLORS.onSurface },

  blockHint: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: COLORS.onSurfaceVariant,
    marginTop: -4,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },

  scoreInfo: { flex: 1, gap: 1 },

  scoreLabel: { fontSize: 13, fontWeight: "800", color: COLORS.onSurface },

  required: { color: COLORS.error },

  optional: { fontSize: 10.5, fontWeight: "600", color: COLORS.outline },

  scoreHint: { fontSize: 11, color: COLORS.onSurfaceVariant },

  promiseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 11,
  },

  promiseRowOn: { borderColor: COLORS.success, backgroundColor: "#f0f9f0" },

  promiseLabel: { flex: 1, fontSize: 13, fontWeight: "700", color: COLORS.onSurface },

  promiseLabelOn: { color: "#1b5e20" },

  promiseState: { fontSize: 11, fontWeight: "800", color: COLORS.outline },

  promiseStateOn: { color: COLORS.success },

  textarea: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    minHeight: 90,
    textAlignVertical: "top",
    fontSize: 13,
    color: COLORS.onSurface,
  },

  counter: {
    alignSelf: "flex-end",
    fontSize: 10.5,
    color: COLORS.outline,
    marginTop: -4,
  },

  fairNote: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 11,
    padding: 12,
  },

  fairNoteText: {
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

  ctaDisabled: { backgroundColor: COLORS.outlineVariant },

  ctaText: { fontSize: 14.5, fontWeight: "900", color: COLORS.onPrimary },
});
