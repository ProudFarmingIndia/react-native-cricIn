import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  Image,
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

import useGroundOptions from "../hooks/useGroundOptions";

import useUserLocation from "../hooks/useUserLocation";

import useUpload from "../../upload/hooks/useUpload";

import {
  createGroundApi,
  updateGroundApi,
  getGroundByIdApi,
} from "../services/ground.service";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| GroundFormScreen.js
|
| Description:
| Add or edit a ground. Same screen for both - `groundId` in the route
| params decides.
|
| WHAT THIS FORM DOES *NOT* ASK
|
| No prices, no timings, no slots. Those belong to a UNIT - one pitch, one
| net - and a ground with two pitches at different rates cannot express that
| on a single form. So this screen is the PLACE, and the next one is what is
| bookable at it.
|
| Splitting it also makes the first save short enough that people finish it.
| An owner faced with forty fields on one screen abandons it; an owner who
| saves a ground in six fields and then adds a pitch has already committed.
|
| THE PIN IS THE ONE THING THAT MATTERS MOST
|
| Without coordinates the ground cannot appear in any distance search, which
| is how virtually every player will look. The server keeps it as `draft`
| until there is a pin AND one unit, so the banner here says so plainly
| rather than letting somebody discover it from silence.
|
| "Use my location" is offered because an owner filling this in is almost
| always standing at the ground - which makes the most accurate pin also the
| easiest one to get.
|
| FACILITIES VERSUS PROMISES
|
| Two lists, and the difference is the whole point of the promise score.
| Facilities is "we have parking". A promise is "we guarantee parking for
| your booking", and it is the only thing players are asked about afterwards.
| So promises can only be chosen from what was already ticked as a facility,
| and the copy says what ticking one costs you.
|
|--------------------------------------------------------------------------
*/

const Field = ({ label, hint, children, required }) => (
  <View style={styles.field}>
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>

    {hint ? <Text style={styles.hint}>{hint}</Text> : null}

    {children}
  </View>
);

const Block = ({ title, children }) => (
  <View style={styles.block}>
    <Text style={styles.blockTitle}>{title}</Text>

    {children}
  </View>
);

export default function GroundFormScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const groundId = route.params?.groundId || null;

  const editing = !!groundId;

  const { options, facilityMap } = useGroundOptions();

  const { request: requestLocation, status: locationStatus } = useUserLocation({
    auto: false,
  });

  const { pickImage, uploading } = useUpload();

  const [loading, setLoading] = useState(editing);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    groundName: "",
    description: "",
    address: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    latitude: null,
    longitude: null,
    contactPerson: "",
    contactNumber: "",
    photos: [],
    pitchTypes: [],
    totalPitches: "1",
    totalNets: "0",
    boundaryYards: "",
    facilities: [],
    promises: [],
    hasFloodlights: false,
    rules: "",
  });

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const load = useCallback(async () => {
    try {
      const data = await getGroundByIdApi(groundId);

      setForm({
        groundName: data.groundName || "",
        description: data.description || "",
        address: data.address || "",
        area: data.area || "",
        landmark: data.landmark || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        contactPerson: data.contactPerson || "",
        contactNumber: data.contactNumber || "",
        photos: data.photos || [],
        pitchTypes: data.pitchTypes || [],
        totalPitches: String(data.totalPitches ?? 1),
        totalNets: String(data.totalNets ?? 0),
        boundaryYards: data.boundaryYards ? String(data.boundaryYards) : "",
        facilities: data.facilities || [],
        promises: data.promises || [],
        hasFloodlights: !!data.hasFloodlights,
        rules: data.rules || "",
      });
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
    if (editing) load();
  }, [editing, load]);

  const toggleIn = (key, value) =>
    setForm((prev) => {
      const list = prev[key] || [];

      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];

      /*
      | Untick a facility and any promise about it goes with it. A ground
      | cannot promise something it no longer claims to have, and leaving the
      | orphan would be rejected by the server's enum anyway.
      */
      if (key === "facilities") {
        return {
          ...prev,
          facilities: next,
          promises: (prev.promises || []).filter((p) => next.includes(p)),
        };
      }

      return { ...prev, [key]: next };
    });

  /*
  | Floodlights is both a facility and its own boolean on the ground, because
  | it is the one facility filtered on by itself and a dedicated indexed
  | field answers that far faster than an array membership test. Keeping the
  | two in step here means the owner ticks it once.
  */
  const toggleFacility = (key) => {
    toggleIn("facilities", key);

    if (key === "floodlights") {
      set({ hasFloodlights: !(form.facilities || []).includes("floodlights") });
    }
  };

  const useMyLocation = async () => {
    const coords = await requestLocation();

    if (!coords) {
      Alert.alert(
        "Location nahi mili",
        "Phone ki location permission do, ya neeche latitude/longitude khud daal do.",
      );

      return;
    }

    set({ latitude: coords.latitude, longitude: coords.longitude });
  };

  const addPhoto = async () => {
    const result = await pickImage("grounds");

    if (!result) return;

    const url =
      typeof result === "string" ? result : result?.url || result?.secure_url;

    if (!url) return;

    set({ photos: [...(form.photos || []), url].slice(0, 8) });
  };

  const save = async () => {
    if (!form.groundName.trim()) {
      Alert.alert("Naam zaroori hai", "Ground ka naam daal dijiye.");

      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,

        totalPitches: Number(form.totalPitches) || 1,

        totalNets: Number(form.totalNets) || 0,

        boundaryYards: form.boundaryYards ? Number(form.boundaryYards) : null,

        image: form.photos?.[0] || "",
      };

      const saved = editing
        ? await updateGroundApi(groundId, payload)
        : await createGroundApi(payload);

      /*
      | Straight to the units screen after a first save, because a ground
      | with no pitch is a draft nobody can see. Sending them back to the
      | list would leave the most important step as something they have to
      | remember.
      */
      if (editing) {
        Alert.alert("Save ho gaya", "Ground ki details update ho gayi.", [
          { text: "Theek hai", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(
          "Ground ban gaya",
          "Ab ek pitch ya net add karo — tabhi ye live hoga aur log book kar payenge.",
          [
            {
              text: "Pitch add karo",
              onPress: () =>
                navigation.replace("GroundUnitsScreen", {
                  groundId: saved?._id,
                  groundName: saved?.groundName,
                }),
            },
          ],
        );
      }
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

  const hasPin = form.latitude != null && form.longitude != null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/*
        | Said once, at the top, and it is the single most useful sentence on
        | the screen.
        */}
        {!hasPin ? (
          <View style={styles.pinWarn}>
            <Ionicons name="location" size={16} color="#8f4e00" />

            <Text style={styles.pinWarnText}>
              Map location ke bina ground kisi bhi "nearby" search me nahi
              aayega — aur log wahi se dhoondhte hain.
            </Text>
          </View>
        ) : null}

        <Block title="Basic">
          <Field label="Ground ka naam" required>
            <TextInput
              style={styles.input}
              value={form.groundName}
              onChangeText={(t) => set({ groundName: t })}
              placeholder="Jaise: Shivalik Cricket Ground"
              placeholderTextColor={COLORS.outline}
            />
          </Field>

          <Field
            label="Description"
            hint="Do line me bata do — kya khaas hai"
          >
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.description}
              onChangeText={(t) => set({ description: t })}
              multiline
              maxLength={1000}
              placeholder="Turf pitch, full boundary, subah 6 baje se khula"
              placeholderTextColor={COLORS.outline}
            />
          </Field>
        </Block>

        <Block title="Photos">
          <Text style={styles.hint}>
            Pehli photo listing par dikhegi. Pitch ki photo sabse zyada kaam
            aati hai.
          </Text>

          <View style={styles.photoRow}>
            {(form.photos || []).map((uri, i) => (
              <View key={`${uri}-${i}`} style={styles.photoWrap}>
                <Image source={{ uri }} style={styles.photo} />

                <TouchableOpacity
                  style={styles.photoRemove}
                  hitSlop={6}
                  onPress={() =>
                    set({ photos: form.photos.filter((_, idx) => idx !== i) })
                  }
                >
                  <Ionicons name="close" size={12} color={COLORS.onError} />
                </TouchableOpacity>

                {i === 0 ? (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>COVER</Text>
                  </View>
                ) : null}
              </View>
            ))}

            {(form.photos || []).length < 8 ? (
              <TouchableOpacity
                style={styles.photoAdd}
                onPress={addPhoto}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={20} color={COLORS.primary} />

                    <Text style={styles.photoAddText}>Add</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </Block>

        <Block title="Location">
          <TouchableOpacity
            style={[styles.locationButton, hasPin && styles.locationButtonDone]}
            activeOpacity={0.85}
            onPress={useMyLocation}
            disabled={locationStatus === "asking"}
          >
            {locationStatus === "asking" ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons
                name={hasPin ? "checkmark-circle" : "navigate"}
                size={17}
                color={hasPin ? COLORS.success : COLORS.primary}
              />
            )}

            <View style={styles.locationText}>
              <Text style={styles.locationTitle}>
                {hasPin ? "Location set hai" : "Meri current location use karo"}
              </Text>

              <Text style={styles.locationHint}>
                {hasPin
                  ? `${Number(form.latitude).toFixed(5)}, ${Number(
                      form.longitude,
                    ).toFixed(5)}`
                  : "Ground par khade ho to yahi sabse sahi rahega"}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.twoCol}>
            <Field label="Latitude">
              <TextInput
                style={styles.input}
                value={form.latitude != null ? String(form.latitude) : ""}
                onChangeText={(t) =>
                  set({ latitude: t === "" ? null : Number(t) })
                }
                keyboardType="numbers-and-punctuation"
                placeholder="28.6139"
                placeholderTextColor={COLORS.outline}
              />
            </Field>

            <Field label="Longitude">
              <TextInput
                style={styles.input}
                value={form.longitude != null ? String(form.longitude) : ""}
                onChangeText={(t) =>
                  set({ longitude: t === "" ? null : Number(t) })
                }
                keyboardType="numbers-and-punctuation"
                placeholder="77.2090"
                placeholderTextColor={COLORS.outline}
              />
            </Field>
          </View>

          <Field
            label="Area / Sector"
            hint="Log isi se dhoondhte hain — jaise 'Sector 62'"
          >
            <TextInput
              style={styles.input}
              value={form.area}
              onChangeText={(t) => set({ area: t })}
              placeholder="Sector 62"
              placeholderTextColor={COLORS.outline}
            />
          </Field>

          <View style={styles.twoCol}>
            <Field label="City">
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={(t) => set({ city: t })}
                placeholder="Noida"
                placeholderTextColor={COLORS.outline}
              />
            </Field>

            <Field label="State">
              <TextInput
                style={styles.input}
                value={form.state}
                onChangeText={(t) => set({ state: t })}
                placeholder="Uttar Pradesh"
                placeholderTextColor={COLORS.outline}
              />
            </Field>
          </View>

          <Field label="Poora pata">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.address}
              onChangeText={(t) => set({ address: t })}
              multiline
              placeholder="Plot no, road, sector"
              placeholderTextColor={COLORS.outline}
            />
          </Field>

          <View style={styles.twoCol}>
            <Field label="Landmark">
              <TextInput
                style={styles.input}
                value={form.landmark}
                onChangeText={(t) => set({ landmark: t })}
                placeholder="Metro ke paas"
                placeholderTextColor={COLORS.outline}
              />
            </Field>

            <Field label="Pincode">
              <TextInput
                style={styles.input}
                value={form.pincode}
                onChangeText={(t) => set({ pincode: t.replace(/[^0-9]/g, "") })}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="201309"
                placeholderTextColor={COLORS.outline}
              />
            </Field>
          </View>
        </Block>

        <Block title="Ground ki detail">
          <Field label="Pitch type" hint="Ek se zyada bhi ho sakte hain">
            <View style={styles.chipRow}>
              {(options.pitchTypes || []).map((p) => {
                const on = (form.pitchTypes || []).includes(p.key);

                return (
                  <TouchableOpacity
                    key={p.key}
                    style={[styles.chip, on && styles.chipActive]}
                    activeOpacity={0.85}
                    onPress={() => toggleIn("pitchTypes", p.key)}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Field>

          <View style={styles.twoCol}>
            <Field label="Kitne pitch">
              <TextInput
                style={styles.input}
                value={form.totalPitches}
                onChangeText={(t) =>
                  set({ totalPitches: t.replace(/[^0-9]/g, "") })
                }
                keyboardType="number-pad"
              />
            </Field>

            <Field label="Kitne nets">
              <TextInput
                style={styles.input}
                value={form.totalNets}
                onChangeText={(t) => set({ totalNets: t.replace(/[^0-9]/g, "") })}
                keyboardType="number-pad"
              />
            </Field>
          </View>

          <Field
            label="Boundary (yards)"
            hint="Captain ka doosra sawaal hi yahi hota hai"
          >
            <TextInput
              style={styles.input}
              value={form.boundaryYards}
              onChangeText={(t) =>
                set({ boundaryYards: t.replace(/[^0-9]/g, "") })
              }
              keyboardType="number-pad"
              placeholder="60"
              placeholderTextColor={COLORS.outline}
            />
          </Field>
        </Block>

        <Block title="Facilities">
          <Text style={styles.hint}>
            Jo hai wo tick karo. Log inhi par filter lagate hain.
          </Text>

          <View style={styles.chipRow}>
            {(options.facilities || []).map((f) => {
              const on = (form.facilities || []).includes(f.key);

              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.chip, on && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => toggleFacility(f.key)}
                >
                  <Ionicons
                    name={f.icon}
                    size={12}
                    color={on ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                  />

                  <Text style={[styles.chipText, on && styles.chipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Block>

        {/*
        |--------------------------------------------------------------------
        | Promises
        |--------------------------------------------------------------------
        |
        | The copy here is deliberately honest about the cost. An owner who
        | ticks everything and delivers nothing will have a promise score in
        | the thirties within a month, and that is a worse listing than one
        | that promised three things and kept all three.
        */}

        {(form.facilities || []).length ? (
          <Block title="Kya guarantee karte ho">
            <Text style={styles.hint}>
              Facilities me se chuno. Match ke baad players sirf inhi par poochhe
              jaayenge — "ground ne kaha tha lights honge, the?" Isse aapka
              "promises kept" score banta hai, jo listing par dikhta hai.
            </Text>

            <View style={styles.promiseList}>
              {(form.facilities || []).map((key) => {
                const f = facilityMap(key);

                const on = (form.promises || []).includes(key);

                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.promiseRow, on && styles.promiseRowOn]}
                    activeOpacity={0.85}
                    onPress={() => toggleIn("promises", key)}
                  >
                    <Ionicons
                      name={on ? "checkbox" : "square-outline"}
                      size={18}
                      color={on ? COLORS.success : COLORS.outline}
                    />

                    <Ionicons
                      name={f.icon}
                      size={14}
                      color={COLORS.onSurfaceVariant}
                    />

                    <Text style={styles.promiseLabel}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.promiseWarn}>
              Kam promise karo aur poora karo — ye zyada promise karke tod dene
              se behtar dikhta hai.
            </Text>
          </Block>
        ) : null}

        <Block title="Contact">
          <Text style={styles.hint}>
            Number sirf confirmed booking wale player ko dikhega — listing par
            nahi.
          </Text>

          <View style={styles.twoCol}>
            <Field label="Naam">
              <TextInput
                style={styles.input}
                value={form.contactPerson}
                onChangeText={(t) => set({ contactPerson: t })}
                placeholder="Manager ka naam"
                placeholderTextColor={COLORS.outline}
              />
            </Field>

            <Field label="Number">
              <TextInput
                style={styles.input}
                value={form.contactNumber}
                onChangeText={(t) =>
                  set({ contactNumber: t.replace(/[^0-9+]/g, "") })
                }
                keyboardType="phone-pad"
                maxLength={15}
                placeholder="98xxxxxxxx"
                placeholderTextColor={COLORS.outline}
              />
            </Field>
          </View>
        </Block>

        <Block title="Ground ke niyam">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.rules}
            onChangeText={(t) => set({ rules: t })}
            multiline
            maxLength={1000}
            placeholder="Spikes allowed nahi, sharab mana hai, apna kit laao..."
            placeholderTextColor={COLORS.outline}
          />
        </Block>
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

              <Text style={styles.ctaText}>
                {editing ? "Save karo" : "Ground banao"}
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

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  scroll: { padding: 16, paddingBottom: 110, gap: 13 },

  pinWarn: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: "#fff1d6",
    borderRadius: 12,
    padding: 12,
  },

  pinWarnText: { flex: 1, fontSize: 11.5, lineHeight: 17, fontWeight: "700", color: "#8f4e00" },

  block: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    gap: 11,
  },

  blockTitle: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  field: { gap: 5, flex: 1 },

  label: { fontSize: 12.5, fontWeight: "800", color: COLORS.onSurface },

  required: { color: COLORS.error },

  hint: { fontSize: 11.5, lineHeight: 16.5, color: COLORS.onSurfaceVariant },

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

  twoCol: { flexDirection: "row", gap: 9 },

  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  photoWrap: { width: 74, height: 74, borderRadius: 10, overflow: "hidden" },

  photo: { width: 74, height: 74 },

  photoRemove: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },

  coverBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingVertical: 2,
  },

  coverBadgeText: { fontSize: 8, fontWeight: "900", color: "#fff" },

  photoAdd: {
    width: 74,
    height: 74,
    borderRadius: 10,
    borderWidth: 1.4,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },

  photoAddText: { fontSize: 10.5, fontWeight: "800", color: COLORS.primary },

  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.4,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  locationButtonDone: { borderColor: COLORS.success, backgroundColor: "#f0f9f0" },

  locationText: { flex: 1, gap: 1 },

  locationTitle: { fontSize: 13, fontWeight: "800", color: COLORS.onSurface },

  locationHint: { fontSize: 11, color: COLORS.onSurfaceVariant },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  chipText: { fontSize: 11.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  chipTextActive: { color: COLORS.onPrimary },

  promiseList: { gap: 7 },

  promiseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },

  promiseRowOn: { borderColor: COLORS.success, backgroundColor: "#f0f9f0" },

  promiseLabel: { flex: 1, fontSize: 12.5, fontWeight: "700", color: COLORS.onSurface },

  promiseWarn: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.outline,
    fontStyle: "italic",
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
