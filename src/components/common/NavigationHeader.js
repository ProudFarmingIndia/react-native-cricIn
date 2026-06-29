import React from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import { HEADER_CONFIG } from "../../constants/headerConstant";
import { COLORS } from "../../constants/colors";

export default function NavigationHeader({ route }) {
  const navigation = useNavigation();

  const config = HEADER_CONFIG?.[route?.name] || {};

  console.log(
  "NavigationHeader Rendered"
);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        backgroundColor: COLORS.background,
      }}
    >
      <Header
        title={config.title}
        showMenu={config.showMenu}
        showBack={config.showBack}
        showSearch={config.showSearch}
        showChat={config.showChat}
        ShowCricInICon={config.ShowCricInICon}
        showNotification={config.showNotification}
        onBackPress={() => navigation.goBack()}
        onSearchPress={() => console.log("Search")}
        onChatPress={() => console.log("Chat")}
        onNotificationPress={() => console.log("Notification")}
      />
    </SafeAreaView>
  );
}
