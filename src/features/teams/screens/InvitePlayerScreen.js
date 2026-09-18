import React, {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Alert,
  Keyboard,
  FlatList,
} from "react-native";

import { COLORS } from "../../../constants/colors";

import SearchInput from "../../search/components/SearchInput";
import SearchSkeleton from "../../search/components/SearchSkeleton";
import SearchResultCard from "../../search/components/SearchResultCard";
import EmptySearchState from "../../search/components/EmptySearchState";

import PrimaryButton from "../../../components/Button/PrimaryButton";

import useInvitation from "../../teamInvitations/hooks/useInvitation";
import useSearch from "../../search/hooks/useSearch";

export default function InvitePlayerScreen({
  navigation,
  route,
}) {
  /*
  |--------------------------------------------------------------------------
  | Route
  |--------------------------------------------------------------------------
  */

  const { teamId } = route.params;

  /*
  |--------------------------------------------------------------------------
  | Hooks
  |--------------------------------------------------------------------------
  */

  const {
    players,
    loading,
    searchPlayers,
    clearSearchResults,
  } = useSearch();

  const {
    sendInvitation,
    loading: invitationLoading,
  } = useInvitation();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const searchTimeout = useRef(null);

  const [keyword, setKeyword] = useState("");

  const [searched, setSearched] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const onSearch = useCallback(
    (text) => {
      setKeyword(text);

      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      if (text.trim().length < 3) {
        setSearched(false);

        clearSearchResults();

        return;
      }

      searchTimeout.current =
        setTimeout(async () => {
          setSearched(true);

          await searchPlayers(
            text.trim()
          );
        }, 400);
    },
    [
      searchPlayers,
      clearSearchResults,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | Invite Player
  |--------------------------------------------------------------------------
  */

  const invitePlayer =
    async (player) => {
      Keyboard.dismiss();

      const response =
        await sendInvitation({
          teamId,
          playerId: player._id,
        });

      if (response.success) {
        Alert.alert(
          "Invitation Sent",
          "Invitation sent successfully."
        );

        navigation.goBack();

        return;
      }

      Alert.alert(
        "Failed",
        response.error ||
          "Unable to send invitation."
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Add Local Player
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | Add Local Player
  |--------------------------------------------------------------------------
  |
  | The route is "AddLocalPlayerScreen" - that is the name it is
  | registered under in TeamStackNavigator. This said "AddLocalPlayer",
  | so the one button on the "no CricIn player found" empty state did
  | nothing at all: React Navigation logs a warning to the console and
  | swallows the tap, with no visible error.
  |
  | That is the worst possible place for it to break. A captain reaches
  | this button precisely when the person they are adding is NOT on
  | CricIn - which is most of a local team - and the dead button reads as
  | "you cannot add them", not "this is broken".
  |
  | The params were already right: AddLocalPlayerScreen reads
  | { teamId, mobile } and pre-fills the number when the search term was
  | all digits, so somebody who typed a phone number does not type it
  | twice.
  |
  */

  const addLocalPlayer = () => {
    navigation.navigate(
      "AddLocalPlayerScreen",
      {
        teamId,

        mobile:
          /^\d+$/.test(keyword)
            ? keyword
            : "",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render Player
  |--------------------------------------------------------------------------
  */

  const renderItem = ({
    item,
  }) => (
    <SearchResultCard
      item={{
        ...item,

        phone:
          item.userId?.phone,
      }}
      loading={
        invitationLoading
      }
      onPress={() =>
        invitePlayer(item)
      }
    />
  );

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Invite CricIn Player
      </Text>

      <SearchInput
        value={keyword}
        placeholder="Search Name or Mobile"
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="search"
        onChangeText={onSearch}
      />

      {loading && (
        <SearchSkeleton />
      )}

      {!loading &&
        searched &&
        players.length ===
          0 && (
          <View
            style={
              styles.emptyContainer
            }
          >
            <EmptySearchState
              title="No CricIn Player Found"
              subtitle="Create a Local Player and continue building your team."
            />

            <PrimaryButton
              title="Add Local Player"
              onPress={
                addLocalPlayer
              }
            />
          </View>
        )}

      {!loading &&
        players.length >
          0 && (
          <FlatList
            data={players}
            keyExtractor={(
              item
            ) => item._id}
            renderItem={
              renderItem
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.list
            }
            showsVerticalScrollIndicator={
              false
            }
          />
        )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        COLORS.background,

      padding: 20,
    },

    heading: {
      fontSize: 24,

      fontWeight: "700",

      color:
        COLORS.primary,

      marginBottom: 20,
    },

    list: {
      paddingBottom: 40,
    },

    emptyContainer: {
      flex: 1,

      justifyContent:
        "center",

      gap: 20,
    },
  });