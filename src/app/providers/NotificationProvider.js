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

import { fetchNotifications } from "../../features/notifications/store/notificationSlice";

/*
|--------------------------------------------------------------------------
| Notification Handler
|--------------------------------------------------------------------------
|
| Controls how a push notification is presented while the app is in the
| foreground.
|
*/

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/*
|--------------------------------------------------------------------------
| Register For Push Notifications
|--------------------------------------------------------------------------
|
| Requests OS permission, resolves the Expo push token, and persists it on
| the backend so the server can deliver Expo pushes to this device. Wrapped
| so a permission denial / simulator with no push support never crashes the
| app.
|
*/

const registerForPushNotificationsAsync = async () => {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#1B5E20",
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
      console.log("Push notification permission not granted.");
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    return tokenResponse?.data || null;
  } catch (error) {
    console.log("Failed to register for push notifications:", error?.message);
    return null;
  }
};

export default function NotificationProvider({ children }) {
  const token = useSelector((state) => state.auth?.token);
  const dispatch = useDispatch();

  const notificationListener = useRef();
  const responseListener = useRef();

  /*
  |--------------------------------------------------------------------------
  | Register Expo Push Token + Foreground Listeners
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isMounted = true;

    (async () => {
      const pushToken = await registerForPushNotificationsAsync();

      if (isMounted && pushToken) {
        try {
          await apiClient.put(ENDPOINTS.USER.PUSH_TOKEN, {
            expoPushToken: pushToken,
          });
        } catch (error) {
          console.log(
            "Failed to persist push token:",
            error?.response?.data?.message || error?.message,
          );
        }
      }
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // Keep the in-app notification list in sync when a push arrives.
        dispatch(fetchNotifications());
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        dispatch(fetchNotifications());
      });

    return () => {
      isMounted = false;

      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }

      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [token, dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Real-Time Socket Connection
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return undefined;
    }

    connectSocket(token);

    onNotification(() => {
      dispatch(fetchNotifications());
    });

    return () => {
      offNotification();
      disconnectSocket();
    };
  }, [token, dispatch]);

  return children;
}
