import React from "react";

import {
  View,
  TextInput,
  StyleSheet,
} from "react-native";

export default function MatchDetailsForm({
  challengeData,
  updateField,
}) {
  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Match Date"
        value={
          challengeData.date
        }
        onChangeText={text =>
          updateField(
            "date",
            text
          )
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Start Time"
        value={
          challengeData.time
        }
        onChangeText={text =>
          updateField(
            "time",
            text
          )
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Venue"
        value={
          challengeData.venue
        }
        onChangeText={text =>
          updateField(
            "venue",
            text
          )
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Match Type"
        value={
          challengeData.matchType
        }
        onChangeText={text =>
          updateField(
            "matchType",
            text
          )
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    input: {
      backgroundColor:
        "#fff",

      height: 55,

      borderRadius: 12,

      paddingHorizontal:
        16,

      marginBottom: 12,
    },
  });