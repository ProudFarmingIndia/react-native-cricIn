import React from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import { HEADER_CONFIG } from "../../constants/headerConstant";
import { COLORS } from "../../constants/colors";
import { useSidebar } from "../../context/SidebarContext";

export default function NavigationHeader({ route }) {
  const navigation = useNavigation();

  const { openSidebar } = useSidebar();

  const config = HEADER_CONFIG?.[route?.name] || {};

  const handleNotificationPress = () => {
    navigation.navigate("NotificationScreen");
  };

  const handleSearchPress = () => {
    navigation.navigate("SearchScreen");
  }

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
        onMenuPress={openSidebar}
        onBackPress={() => navigation.goBack()}
        onSearchPress={handleSearchPress}
        onChatPress={() => console.log("Chat")}
        onNotificationPress={handleNotificationPress}
      />
    </SafeAreaView>
  );
}