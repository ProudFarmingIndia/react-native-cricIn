import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

import apiClient from "../../services/api/apiClient";
import { ENDPOINTS } from "../../services/api/endpoints";

import {
  connectSocket,
  disconnectSocket,
  onNotification,
  offNotification,
} from "../../services/socket/socket.service";

import {
  fetchUnreadCount,
  notificationReceived,
} from "../../features/notifications/store/notificationSlice";

import { navigate } from "../navigation/navigationRef";

/*
|--------------------------------------------------------------------------
| Notification Provider
|--------------------------------------------------------------------------
|
| Two delivery paths, deliberately independent:
|
|   SOCKET  - live updates while the app is open. Works everywhere,
|             including web. No permissions, no build, no project id.
|
|   PUSH    - OS notifications in the tray when the app is backgrounded or
|             closed. Device only, and only in a development/production
|             build: remote push on Android was removed from Expo Go in
|             SDK 53, and browsers have no Expo push at all.
|
| Either can fail without taking the other down.
|
*/

/*
|--------------------------------------------------------------------------
| Foreground Presentation
|--------------------------------------------------------------------------
|
| shouldShowBanner / shouldShowList are the SDK 51+ keys; shouldShowAlert
| is the pre-51 name, kept alongside them so this behaves the same
| whichever the installed version reads.
|
*/

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/*
|--------------------------------------------------------------------------
| Project Id
|--------------------------------------------------------------------------
|
| Expo push tokens are issued per EAS project, so getExpoPushTokenAsync
| throws without one. It is written into app.json by `eas init`.
|
| Warned about once, clearly, rather than thrown - the socket path and the
| rest of the app work fine without push.
|
*/

let warnedAboutProjectId = false;

const resolveProjectId = () =>
  Constants?.expoConfig?.extra?.eas?.projectId ||
  Constants?.easConfig?.projectId ||
  null;

const registerForPushNotificationsAsync = async () => {
  // Browsers have no Expo push. Skip silently; the socket covers web.
  if (Platform.OS === "web") {
    return null;
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#00490e",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[push] Permission not granted - tray notifications off.");
      return null;
    }

    const projectId = resolveProjectId();

    if (!projectId) {
      if (!warnedAboutProjectId) {
        warnedAboutProjectId = true;

        console.warn(
          "[push] No EAS projectId in app.json (extra.eas.projectId). " +
            "Run `eas init` in cricin-app to create one. In-app and socket " +
            "notifications still work; only tray notifications are off.",
        );
      }

      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenResponse?.data || null;
  } catch (error) {
    console.log("[push] Registration failed:", error?.message);
    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Where A Tapped Notification Should Land
|--------------------------------------------------------------------------
|
| A push payload carries only `data` (ids), not the notification document,
| so a tap cannot open the detail screen directly - that needs the full
| object. Match confirmation has a dedicated review screen keyed by
| matchId, so it goes straight there; everything else opens the
| notification list, where the row is one tap from its detail.
|
*/

const openFromPush = (data = {}) => {
  if (data?.matchId && data?.type === "MATCH_CONFIRMATION_REQUIRED") {
    /*
    | QuickScoreFlow is a root route now, so this is a two-level target
    | instead of a three-level one through MainTabs > Matches.
    */

    navigate("QuickScoreFlow", {
      screen: "MatchApprovalScreen",
      params: { matchId: data.matchId },
    });

    return;
  }

  navigate("NotificationScreen");
};

export default function NotificationProvider({ children }) {
  const token = useSelector((state) => state.auth?.token);
  const dispatch = useDispatch();

  const notificationListener = useRef();
  const responseListener = useRef();

  /*
  |--------------------------------------------------------------------------
  | Push: Register Token + Listeners
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isMounted = true;

    (async () => {
      const pushToken = await registerForPushNotificationsAsync();

      if (!isMounted || !pushToken) return;

      try {
        await apiClient.put(ENDPOINTS.USER.PUSH_TOKEN, {
          expoPushToken: pushToken,
        });
      } catch (error) {
        console.log(
          "[push] Failed to persist token:",
          error?.response?.data?.message || error?.message,
        );
      }
    })();

    /*
    | Arrived while the app is open. The socket has usually beaten it here,
    | so this only refreshes the badge rather than refetching the list.
    */
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        dispatch(fetchUnreadCount());
      });

    /*
    | The user tapped the tray notification. This used to discard the
    | payload entirely and just refetch, so a tap opened nothing.
    */
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response?.notification?.request?.content?.data || {};

        dispatch(fetchUnreadCount());

        openFromPush(data);
      });

    return () => {
      isMounted = false;

      notificationListener.current?.remove?.();
      responseListener.current?.remove?.();
    };
  }, [token, dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Socket: Live In-App Delivery
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return undefined;
    }

    connectSocket(token);

    /*
    | The server emits the whole notification document, so it goes straight
    | into the list - no refetch, and the badge moves the instant it lands.
    */
    onNotification((notification) => {
      dispatch(notificationReceived(notification));
    });

    // Catch up on anything that arrived while the socket was down.
    dispatch(fetchUnreadCount());

    return () => {
      offNotification();
      disconnectSocket();
    };
  }, [token, dispatch]);

  return children;
}
