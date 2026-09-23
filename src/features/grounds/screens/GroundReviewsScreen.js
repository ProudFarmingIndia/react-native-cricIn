import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";

import { useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import StarRating from "../components/StarRating";

import {
  getGroundReviewsApi,
  replyToReviewApi,
} from "../services/ground.service";

import { fmtDate } from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| GroundReviewsScreen.js
|
| Description:
| Every review of one ground, with the two breakdowns that make an average
| mean something.
|
| WHY THE DISTRIBUTION IS SHOWN
|
| "4.2 from 30" and "4.2 from 30 where eight people gave 1" are different
| grounds, and the average hides the second one. The bar chart is the fastest
| way to see which kind you are looking at, and the star filter above it
| exists because "show me the complaints" is the most-used action on any
| review list.
|
| WHY THE PER-PROMISE BREAKDOWN IS THE MOST USEFUL THING HERE
|
| A promise score of 83% tells you something is being missed but not what.
| The breakdown says "floodlights: 12 of 20" - and that is a fact a captain
| can act on, either by avoiding the ground for an evening game or by asking
| about it when they book.
|
| It is also the fairest thing on the screen for the OWNER. A ground missing
| one promise out of six is not a bad ground, and a single percentage makes
| it look like one.
|
| WHY THE OWNER CAN REPLY BUT NOT HIDE
|
| One reply, no thread, and no ability to hide anything. A ground that can
| remove its own bad reviews has a review system that means nothing - and
| tying every review to a completed booking is what made moderation
| unnecessary in the first place.
|
|--------------------------------------------------------------------------
*/

const STAR_FILTERS = [
  { key: "", label: "Sab" },
  { key: "5", label: "5★", min: 5, max: 5 },
  { key: "4", label: "4★", min: 4, max: 4 },
  { key: "low", label: "3★ aur neeche", min: 1, max: 3 },
  { key: "photos", label: "Photos wale" },
];

const Separator = () => <View style={styles.gap} />;

export default function GroundReviewsScreen() {
  const route = useRoute();

  const { groundId, groundName, isOwner } = route.params || {};

  const [filter, setFilter] = useState("");

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [replyTo, setReplyTo] = useState(null);

  const [replyText, setReplyText] = useState("");

  const load = useCallback(
    async (key, silent = false) => {
      if (!silent) setLoading(true);

      const preset = STAR_FILTERS.find((f) => f.key === key);

      try {
        const result = await getGroundReviewsApi(groundId, {
          minStars: preset?.min,
          maxStars: preset?.max,
          withPhotos: key === "photos" ? "true" : undefined,
          limit: 50,
        });

        setData(result);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [groundId],
  );

  useFocusEffect(
    useCallback(() => {
      load(filter, true);
    }, [load, filter]),
  );

  const submitReply = async () => {
    if (!replyText.trim()) return;

    try {
      await replyToReviewApi(replyTo._id, replyText.trim());

      setReplyTo(null);

      setReplyText("");

      load(filter, true);
    } catch (error) {
      Alert.alert(
        "Reply nahi gaya",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );
    }
  };

  const total = data?.total || 0;

  const distribution = data?.distribution || [];

  const maxBar = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={data?.reviews || []}
          keyExtractor={(item) => String(item._id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={
            <View style={styles.header}>
              {groundName ? (
                <Text style={styles.groundName}>{groundName}</Text>
              ) : null}

              {/*
              |------------------------------------------------------------
              | Distribution
              |------------------------------------------------------------
              */}

              {total > 0 ? (
                <View style={styles.card}>
                  {distribution.map((d) => (
                    <View key={d.stars} style={styles.barRow}>
                      <Text style={styles.barStar}>{d.stars}★</Text>

                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { width: `${(d.count / maxBar) * 100}%` },
                            d.stars <= 2 && styles.barFillLow,
                          ]}
                        />
                      </View>

                      <Text style={styles.barCount}>{d.count}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/*
              |------------------------------------------------------------
              | Per-promise breakdown
              |------------------------------------------------------------
              |
              | The most actionable thing on the screen - see the note at the
              | top of the file.
              */}

              {data?.promiseBreakdown?.length ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Promises - kitne baar mile</Text>

                  {data.promiseBreakdown.map((p) => (
                    <View key={p.key} style={styles.promiseRow}>
                      <Text style={styles.promiseLabel} numberOfLines={1}>
                        {p.label}
                      </Text>

                      <View style={styles.promiseTrack}>
                        <View
                          style={[
                            styles.promiseFill,
                            { width: `${p.percent}%` },
                            p.percent < 70 && styles.promiseFillLow,
                          ]}
                        />
                      </View>

                      <Text
                        style={[
                          styles.promisePercent,
                          p.percent < 70 && styles.promisePercentLow,
                        ]}
                      >
                        {p.percent}%
                      </Text>

                      <Text style={styles.promiseCount}>
                        {p.kept}/{p.asked}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.filterBar}>
                {STAR_FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.key || "all"}
                    style={[styles.chip, filter === f.key && styles.chipActive]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setFilter(f.key);

                      setLoading(true);

                      load(f.key);
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filter === f.key && styles.chipTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.review}>
              <View style={styles.reviewHead}>
                <View style={styles.reviewWho}>
                  <Text style={styles.reviewer} numberOfLines={1}>
                    {item.userId?.fullName || "Player"}
                  </Text>

                  {item.teamId?.teamName ? (
                    <Text style={styles.reviewTeam} numberOfLines={1}>
                      {item.teamId.teamName}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.reviewMeta}>
                  <StarRating value={item.overall} size={12} />

                  <Text style={styles.reviewDate}>{fmtDate(item.createdAt)}</Text>
                </View>
              </View>

              {/*
              | The sub-scores, only the ones this reviewer answered. Showing
              | a skipped question as 0 would read as a one-star judgement of
              | something they never rated.
              */}
              <View style={styles.subScores}>
                {[
                  ["Pitch", item.pitch],
                  ["Safai", item.hygiene],
                  ["Facilities", item.facilities],
                  ["Value", item.valueForMoney],
                ]
                  .filter(([, v]) => Number(v) > 0)
                  .map(([label, value]) => (
                    <View key={label} style={styles.subScore}>
                      <Text style={styles.subScoreLabel}>{label}</Text>

                      <Text style={styles.subScoreValue}>{value}★</Text>
                    </View>
                  ))}
              </View>

              {item.comment ? (
                <Text style={styles.reviewBody}>{item.comment}</Text>
              ) : null}

              {/*
              | What this reviewer said about the promises. A review that
              | reports a missed promise is worth far more than its star
              | rating, so it is called out rather than folded into a number.
              */}
              {item.promisesChecked?.length ? (
                <View style={styles.promiseSummary}>
                  <Ionicons
                    name={
                      item.promisesKept?.length === item.promisesChecked.length
                        ? "checkmark-done-circle"
                        : "alert-circle"
                    }
                    size={13}
                    color={
                      item.promisesKept?.length === item.promisesChecked.length
                        ? COLORS.success
                        : COLORS.secondary
                    }
                  />

                  <Text style={styles.promiseSummaryText}>
                    {item.promisesKept?.length || 0}/{item.promisesChecked.length}{" "}
                    promises mile
                  </Text>
                </View>
              ) : null}

              {item.ownerReply ? (
                <View style={styles.reply}>
                  <Text style={styles.replyLabel}>Owner ka jawab</Text>

                  <Text style={styles.replyBody}>{item.ownerReply}</Text>
                </View>
              ) : isOwner ? (
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => setReplyTo(item)}
                >
                  <Ionicons name="chatbubble-outline" size={13} color={COLORS.primary} />

                  <Text style={styles.replyButtonText}>Reply do</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="star-outline" size={28} color={COLORS.outline} />

              <Text style={styles.emptyTitle}>
                {filter ? "Is filter par koi review nahi" : "Abhi koi review nahi"}
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={!!replyTo}
        transparent
        animationType="fade"
        onRequestClose={() => setReplyTo(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Review ka jawab</Text>

            <Text style={styles.modalHint}>
              Ek hi reply mil sakta hai. Shaanti se likhiye — sabko dikhega.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={400}
              placeholder="Jaise: us hafte lights repair par thi, sorry."
              placeholderTextColor={COLORS.outline}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setReplyTo(null)}
              >
                <Text style={styles.modalCancelText}>Rehne do</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirm} onPress={submitReply}>
                <Text style={styles.modalConfirmText}>Bhejo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  list: { padding: 16, paddingBottom: 40, flexGrow: 1 },

  gap: { height: 11 },

  header: { gap: 12, marginBottom: 12 },

  groundName: { fontSize: 17, fontWeight: "900", color: COLORS.onSurface },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    gap: 8,
  },

  cardTitle: { fontSize: 13, fontWeight: "900", color: COLORS.onSurface },

  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  barStar: { width: 22, fontSize: 11, fontWeight: "800", color: COLORS.onSurfaceVariant },

  barTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceContainerHigh,
    overflow: "hidden",
  },

  barFill: { height: 7, borderRadius: 4, backgroundColor: COLORS.secondaryContainer },

  barFillLow: { backgroundColor: COLORS.error },

  barCount: {
    width: 26,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  promiseRow: { flexDirection: "row", alignItems: "center", gap: 7 },

  promiseLabel: { width: 92, fontSize: 11.5, color: COLORS.onSurfaceVariant },

  promiseTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceContainerHigh,
    overflow: "hidden",
  },

  promiseFill: { height: 7, borderRadius: 4, backgroundColor: COLORS.success },

  promiseFillLow: { backgroundColor: COLORS.warning },

  promisePercent: {
    width: 34,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.success,
  },

  promisePercentLow: { color: COLORS.secondary },

  promiseCount: {
    width: 34,
    textAlign: "right",
    fontSize: 10,
    color: COLORS.outline,
  },

  filterBar: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 11.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  review: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
    gap: 7,
  },

  reviewHead: { flexDirection: "row", alignItems: "flex-start", gap: 8 },

  reviewWho: { flex: 1, gap: 1 },

  reviewer: { fontSize: 13, fontWeight: "800", color: COLORS.onSurface },

  reviewTeam: { fontSize: 11, color: COLORS.primary, fontWeight: "700" },

  reviewMeta: { alignItems: "flex-end", gap: 2 },

  reviewDate: { fontSize: 10.5, color: COLORS.outline },

  subScores: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  subScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  subScoreLabel: { fontSize: 10, color: COLORS.onSurfaceVariant },

  subScoreValue: { fontSize: 10, fontWeight: "800", color: COLORS.onSurface },

  reviewBody: { fontSize: 12.5, lineHeight: 18.5, color: COLORS.onSurfaceVariant },

  promiseSummary: { flexDirection: "row", alignItems: "center", gap: 5 },

  promiseSummaryText: { fontSize: 11, fontWeight: "700", color: COLORS.onSurfaceVariant },

  reply: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 9,
    padding: 9,
    gap: 2,
  },

  replyLabel: { fontSize: 9.5, fontWeight: "900", color: COLORS.primary },

  replyBody: { fontSize: 12, lineHeight: 17, color: COLORS.onSurfaceVariant },

  replyButton: { flexDirection: "row", alignItems: "center", gap: 5 },

  replyButtonText: { fontSize: 12, fontWeight: "800", color: COLORS.primary },

  empty: { alignItems: "center", paddingTop: 40, gap: 7 },

  emptyTitle: { fontSize: 14, fontWeight: "800", color: COLORS.onSurface },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },

  modal: {
    width: "100%",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 17,
    gap: 10,
  },

  modalTitle: { fontSize: 15, fontWeight: "900", color: COLORS.onSurface },

  modalHint: {
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
    marginTop: -4,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 76,
    textAlignVertical: "top",
    fontSize: 12.5,
    color: COLORS.onSurface,
  },

  modalActions: { flexDirection: "row", gap: 9 },

  modalCancel: { flex: 1, alignItems: "center", paddingVertical: 13 },

  modalCancelText: { fontSize: 13, fontWeight: "800", color: COLORS.onSurfaceVariant },

  modalConfirm: {
    flex: 1.3,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
  },

  modalConfirmText: { fontSize: 13, fontWeight: "900", color: COLORS.onPrimary },
});
