import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";

import { COLORS } from "../constants/colors";

export default function TeamCard({
  team,
}) {
  return (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            team?.logo ||
            "https://placehold.co/100",
        }}
        style={styles.logo}
      />

      <Text style={styles.name}>
        {team?.teamName}
      </Text>

      <Text style={styles.city}>
        {team?.city}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      COLORS.surfaceContainerLowest,

    marginHorizontal: 16,
    marginTop: 12,

    borderRadius: 16,

    padding: 16,

    alignItems: "center",

    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  name: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
  },

  city: {
    marginTop: 4,
    color: COLORS.onSurfaceVariant,
  },
});