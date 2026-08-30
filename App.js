import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Side-effect import: makes Alert.alert / Alert.prompt work on
// react-native-web, where React Native ships them as no-ops.
// Completely inert on iOS and Android.
import "./src/utils/webAlert";

/*
| AppProvider owns the redux Provider plus Auth/Theme/Notification.
|
| The provider tree used to be orphaned: this file wrapped the navigator in
| a bare redux Provider and nothing imported AppProvider, so
| NotificationProvider never mounted - which is why push registration and
| the socket connection never ran, and PUT /users/push-token was never
| called.
*/

import AppProvider from "./src/app/providers/AppProvider";
import AppNavigator from "./src/app/navigation/AppNavigator";

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </AppProvider>
  );
}