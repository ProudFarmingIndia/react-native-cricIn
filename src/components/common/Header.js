import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

export default function Header({
  title = "CricIn",
  showMenu = false,
  showBack = false,
  ShowCricInICon = false,
  showSearch = false,
  showChat = false,
  showNotification = false,
  onMenuPress,
  onBackPress,
  onSearchPress,
  onChatPress,
  onNotificationPress,
}) {
  console.log(
  "Header Rendered"
);
  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        {showMenu && (
          <TouchableOpacity onPress={onMenuPress} style={styles.leftIcon}>
            <MaterialIcons name="menu" size={26} color="#222" />
          </TouchableOpacity>
        )}
        {showBack && (
          <TouchableOpacity onPress={onBackPress} style={styles.showbck}>
            <MaterialIcons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
        )}

        {ShowCricInICon && (
          <TouchableOpacity onPress={onBackPress} >
            <MaterialIcons
              name="sports-cricket"
              size={26}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}

        <Text style={styles.logoText}>{title}</Text>
      </View>

      <View style={styles.headerIcons}>
        {showSearch && (
          <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
            <MaterialIcons name="search" size={20} color="#222" />
          </TouchableOpacity>
        )}

        {showChat && (
          <TouchableOpacity style={styles.iconButton} onPress={onChatPress}>
            <MaterialIcons name="chat-bubble" size={20} color="#222" />
          </TouchableOpacity>
        )}

        {showNotification && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationPress}
          >
            <MaterialIcons name="notifications" size={20} color="#222" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 55,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  leftIcon: {
    marginRight: 10,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: 8,
  },

  headerIcons: {
    flexDirection: "row",
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  showbck : {
    marginRight : 10
  }
});
