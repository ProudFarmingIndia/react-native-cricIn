import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

// import { COLORS } from "../../../constants/colors";

export default function TeamSuccessBanner({
  teamName,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons
          name="checkmark-circle"
          size={34}
          color="#16A34A"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Team Created Successfully
        </Text>

        <Text style={styles.subtitle}>
          {teamName
            ? `${teamName} is ready. Now build your squad.`
            : "Now let's add players to your team."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#ECFDF3",

    borderRadius: 18,

    padding: 18,

    marginBottom: 24,

    borderWidth: 1,

    borderColor: "#BBF7D0",
  },

  icon: {
    width: 56,

    height: 56,

    borderRadius: 28,

    backgroundColor: "#DCFCE7",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 16,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 18,

    fontWeight: "700",

    color: "#166534",
  },

  subtitle: {
    marginTop: 4,

    fontSize: 14,

    color: "#166534",

    lineHeight: 20,
  },
});