/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| AssignBroadcasterScreen.js
|
| Description:
| The scorer picks who films one angle.
|
| WHY IT IS BUILT ON THE SAME PIECES AS InvitePlayerScreen
| Searching CricIn for a person and sending them something to accept is
| exactly the flow the team invite already has - SearchInput,
| SearchSkeleton, SearchResultCard, EmptySearchState, the 3-character
| minimum and the 400ms debounce. Reusing them means one search UI in the
| app rather than two that drift apart, and a scorer who has invited a
| player to a team already knows how this screen works.
|
| WHAT IS DELIBERATELY DIFFERENT
| The search is NOT limited to the two squads. The person holding the
| phone is often a friend, a younger brother, or somebody's cousin who is
| in neither team - restricting it to squad members would rule out most of
| the people who actually film these matches.
|
| That openness is why the invite has an accept step and why the server
| rotates the Mux key whenever the holder changes: a stranger cannot be
| given a broadcast slot silently, and taking it back actually takes it
| back.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Alert,
  Keyboard,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import SearchInput from "../../search/components/SearchInput";
import SearchSkeleton from "../../search/components/SearchSkeleton";
import SearchResultCard from "../../search/components/SearchResultCard";
import EmptySearchState from "../../search/components/EmptySearchState";

import useSearch from "../../search/hooks/useSearch";

import { assignBroadcasterApi } from "../services/liveStream.service";

import { ANGLE_LABEL, ANGLE_HINT } from "../constants/streamConstants";

export default function AssignBroadcasterScreen() {
  const route = useRoute();

  const navigation = useNavigation();

  const { matchId, angle, currentName } = route.params || {};

  const { players, loading, searchPlayers, clearSearchResults } = useSearch();

  const searchTimeout = useRef(null);

  const [keyword, setKeyword] = useState("");

  const [searched, setSearched] = useState(false);

  const [assigning, setAssigning] = useState(false);

  const onSearch = useCallback(
    (text) => {
      setKeyword(text);

      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      /*
      | Same 3-character floor as the team invite. Below that the result
      | set is the whole app and the request is wasted.
      */

      if (text.trim().length < 3) {
        setSearched(false);

        clearSearchResults();

        return;
      }

      searchTimeout.current = setTimeout(async () => {
        setSearched(true);

        await searchPlayers(text.trim());
      }, 400);
    },
    [searchPlayers, clearSearchResults],
  );

  /*
  |--------------------------------------------------------------------------
  | Assign
  |--------------------------------------------------------------------------
  |
  | The server sends the invite notification and, when this angle already
  | had somebody, rotates the Mux stream key so the previous holder's
  | copied key stops working immediately.
  |
  | The confirmation says that out loud. A scorer who has just realised
  | they gave the camera to the wrong person needs to know the old key is
  | dead, not merely that a name changed on a screen.
  |
  */

  const assign = async (player) => {
    Keyboard.dismiss();

    const userId = player?.userId?._id || player?.userId;

    if (!userId) {
      Alert.alert(
        "Can't assign",
        "Ye player abhi CricIn account se linked nahi hai, isliye inhe camera nahi de sakte.",
      );

      return;
    }

    setAssigning(true);

    try {
      await assignBroadcasterApi(matchId, angle, userId);

      Alert.alert(
        "Invite sent",
        `${player.playerName} ko ${ANGLE_LABEL[angle] || angle} camera ka invite chala gaya. Jab wo accept karenge, unhe stream key milegi.${
          currentName
            ? `\n\n${currentName} ki purani key ab kaam nahi karegi.`
            : ""
        }`,
      );

      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Failed",
        err?.response?.data?.message || "Could not assign this camera.",
      );
    } finally {
      setAssigning(false);
    }
  };

  const renderItem = ({ item }) => (
    <SearchResultCard
      item={{ ...item, phone: item.userId?.phone }}
      loading={assigning}
      onPress={() => assign(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.heading}>
          Who is filming the {ANGLE_LABEL[angle] || angle} camera?
        </Text>

        <Text style={styles.subheading}>{ANGLE_HINT[angle] || ""}</Text>

        {!!currentName && (
          <View style={styles.currentRow}>
            <Ionicons
              name="swap-horizontal-outline"
              size={14}
              color={COLORS.secondary}
            />

            <Text style={styles.currentText} numberOfLines={1}>
              Abhi {currentName} ke paas hai — change karne par unki key
              turant band ho jayegi.
            </Text>
          </View>
        )}
      </View>

      <SearchInput
        value={keyword}
        placeholder="Search name or mobile"
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="search"
        onChangeText={onSearch}
      />

      {/*
      | Said plainly, because it is the question every scorer asks at this
      | point: no, they do not have to be in either squad.
      */}

      <View style={styles.noteRow}>
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={COLORS.onSurfaceVariant}
        />

        <Text style={styles.noteText}>
          Koi bhi CricIn user ho sakta hai — dono team ke bahar ka bhi.
        </Text>
      </View>

      {loading && <SearchSkeleton />}

      {assigning && (
        <View style={styles.assigningRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.assigningText}>Sending invite…</Text>
        </View>
      )}

      {!loading && searched && players.length === 0 && (
        <View style={styles.emptyContainer}>
          <EmptySearchState
            title="No CricIn player found"
            subtitle="Camera sirf CricIn account wale ko de sakte ho — unhe pehle app par sign up karne ko bolo."
          />
        </View>
      )}

      {!loading && players.length > 0 && (
        <FlatList
          data={players}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 18,
  },

  headerCard: {
    marginBottom: 14,
  },

  heading: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  subheading: {
    marginTop: 4,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },

  currentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff8ef",
  },

  currentText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.secondary,
    fontWeight: "600",
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
  },

  noteText: {
    flex: 1,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  assigningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },

  assigningText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  list: {
    paddingTop: 8,
    paddingBottom: 40,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 18,
  },
});