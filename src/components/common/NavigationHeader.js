import React, { useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import { HEADER_CONFIG } from "../../constants/headerConstant";
import { COLORS } from "../../constants/colors";
import { useSidebar } from "../../context/SidebarContext";
import { fetchUnreadCount } from "../../features/notifications/store/notificationSlice";

export default function NavigationHeader({ route }) {
  const navigation = useNavigation();

  const { openSidebar } = useSidebar();

  const dispatch = useDispatch();

  const config = HEADER_CONFIG?.[route?.name] || {};

  /*
  |--------------------------------------------------------------------------
  | Unread Badge
  |--------------------------------------------------------------------------
  |
  | Refreshed whenever a screen that shows the bell comes into focus. This
  | is the count-only endpoint, not the full list, so it stays cheap even
  | though the header renders on nearly every screen.
  |
  */

  const unreadCount = useSelector(
    (state) => state.notifications?.unreadCount ?? 0,
  );

  useFocusEffect(
    useCallback(() => {
      if (config.showNotification) {
        dispatch(fetchUnreadCount());
      }
    }, [dispatch, config.showNotification]),
  );

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
        notificationCount={unreadCount}
        onMenuPress={openSidebar}
        onBackPress={() => navigation.goBack()}
        onSearchPress={handleSearchPress}
        onChatPress={() => console.log("Chat")}
        onNotificationPress={handleNotificationPress}
      />
    </SafeAreaView>
  );
}