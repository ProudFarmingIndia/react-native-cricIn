import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import GroundCard from "../components/GroundCard";

import {
  getMyGroundsApi,
  setGroundPausedApi,
  deleteGroundApi,
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
| MyGroundsScreen.js
|
| Description:
| The owner's own listings, and the four things they do to one.
|
| WHY EVERY CARD SAYS LIVE / DRAFT / PAUSED
|
| A draft ground is invisible to every player, and an owner who does not know
| that will wait weeks for a booking that cannot arrive. The state is on the
| card, and a draft card says what is missing.
|
| PAUSE VERSUS DELETE
|
| Pause is the one owners actually want - the off-season, a monsoon month,
| repairs. It keeps the listing and every booking that ever happened on it,
| and takes it out of discovery. Delete is for a listing made by mistake, and
| the server refuses it outright while future bookings exist: somebody has
| planned a Sunday around that slot.
|
| Offering only delete would mean owners deleting a ground for the winter and
| losing their whole rating history with it.
|
|--------------------------------------------------------------------------
*/

const Separator = () => <View style={styles.gap} />;

export default function MyGroundsScreen() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const data = await getMyGroundsApi();

      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load]),
  );

  const togglePause = async (ground) => {
    setBusyId(String(ground._id));

    try {
      await setGroundPausedApi(ground._id, ground.status !== "paused");

      await load(true);
    } catch (error) {
      Alert.alert(
        "Nahi ho paaya",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const remove = (ground) =>
    Alert.alert(
      "Ground delete karein?",
      "Ye wapas nahi aayega. Sirf season ke liye band karna hai to Pause use karo.",
      [
        { text: "Rehne do", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setBusyId(String(ground._id));

            try {
              await deleteGroundApi(ground._id);

              await load(true);
            } catch (error) {
              /*
              | The server refuses while future bookings exist and says so.
              | Showing its own message means the owner learns the reason -
              | somebody has a slot booked - rather than that it "failed".
              */
              Alert.alert(
                "Delete nahi ho sakta",
                error?.response?.data?.message || "Kuch galat ho gaya.",
              );
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item._id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => {
          const draft = item.status === "draft";

          const paused = item.status === "paused";

          const busy = busyId === String(item._id);

          const needsPin = !item.latitude || !item.longitude;

          return (
            <View style={styles.wrapper}>
              <GroundCard
                ground={item}
                showOwnerState
                onPress={(g) =>
                  navigation.navigate("GroundUnitsScreen", {
                    groundId: g._id,
                    groundName: g.groundName,
                  })
                }
              />

              {/*
              | A draft card says exactly what is missing. "Not live" on its
              | own is a problem statement with no next step.
              */}
              {draft ? (
                <View style={styles.draftNote}>
                  <Ionicons name="alert-circle" size={13} color="#8f4e00" />

                  <Text style={styles.draftNoteText}>
                    {needsPin
                      ? "Map location add karo, phir ek pitch ya net — tab live hoga"
                      : "Kam se kam ek pitch ya net add karo — tab live hoga"}
                  </Text>
                </View>
              ) : null}

              {paused ? (
                <View style={styles.pausedNote}>
                  <Ionicons name="pause-circle" size={13} color={COLORS.outline} />

                  <Text style={styles.pausedNoteText}>
                    Paused — discovery me nahi dikh raha
                  </Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.action}
                  disabled={busy}
                  onPress={() =>
                    navigation.navigate("GroundFormScreen", { groundId: item._id })
                  }
                >
                  <Ionicons name="create-outline" size={15} color={COLORS.primary} />

                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.action}
                  disabled={busy}
                  onPress={() =>
                    navigation.navigate("GroundUnitsScreen", {
                      groundId: item._id,
                      groundName: item.groundName,
                    })
                  }
                >
                  <Ionicons name="grid-outline" size={15} color={COLORS.primary} />

                  <Text style={styles.actionText}>Pitches / nets</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.action}
                  disabled={busy}
                  onPress={() =>
                    navigation.navigate("GroundPoliciesScreen", {
                      groundId: item._id,
                    })
                  }
                >
                  <Ionicons name="options-outline" size={15} color={COLORS.primary} />

                  <Text style={styles.actionText}>Rules</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.action}
                  disabled={busy}
                  onPress={() =>
                    navigation.navigate("OwnerCalendarScreen", {
                      groundId: item._id,
                      groundName: item.groundName,
                    })
                  }
                >
                  <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />

                  <Text style={styles.actionText}>Calendar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionsSecondary}>
                <TouchableOpacity
                  style={styles.pauseButton}
                  disabled={busy || draft}
                  onPress={() => togglePause(item)}
                >
                  {busy ? (
                    <ActivityIndicator size="small" color={COLORS.onSurfaceVariant} />
                  ) : (
                    <>
                      <Ionicons
                        name={paused ? "play-circle-outline" : "pause-circle-outline"}
                        size={15}
                        color={draft ? COLORS.outlineVariant : COLORS.onSurfaceVariant}
                      />

                      <Text
                        style={[
                          styles.pauseText,
                          draft && styles.pauseTextDisabled,
                        ]}
                      >
                        {paused ? "Wapas live karo" : "Pause"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  disabled={busy}
                  onPress={() => remove(item)}
                >
                  <Ionicons name="trash-outline" size={14} color={COLORS.error} />

                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);

              load(true);
            }}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={30} color={COLORS.outline} />

            <Text style={styles.emptyTitle}>Koi ground list nahi kiya</Text>

            <Text style={styles.emptyBody}>
              Ek baar details daal do — phir teams khud slot maangengi.
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("GroundFormScreen")}
      >
        <Ionicons name="add" size={17} color={COLORS.onPrimary} />

        <Text style={styles.fabText}>Ground add karo</Text>
      </TouchableOpacity>
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

  list: { padding: 16, paddingBottom: 100, flexGrow: 1 },

  gap: { height: 16 },

  wrapper: { gap: 8 },

  draftNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff1d6",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  draftNoteText: { flex: 1, fontSize: 11.5, fontWeight: "700", color: "#8f4e00" },

  pausedNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  pausedNoteText: { flex: 1, fontSize: 11.5, fontWeight: "700", color: COLORS.outline },

  actions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  actionText: { fontSize: 11.5, fontWeight: "800", color: COLORS.primary },

  actionsSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pauseButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 4 },

  pauseText: { fontSize: 11.5, fontWeight: "800", color: COLORS.onSurfaceVariant },

  pauseTextDisabled: { color: COLORS.outlineVariant },

  deleteButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },

  deleteText: { fontSize: 11.5, fontWeight: "800", color: COLORS.error },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    gap: 7,
  },

  emptyTitle: { fontSize: 15, fontWeight: "800", color: COLORS.onSurface },

  emptyBody: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 46,
    paddingHorizontal: 17,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  fabText: { fontSize: 13.5, fontWeight: "800", color: COLORS.onPrimary },
});
