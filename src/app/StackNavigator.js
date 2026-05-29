import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";

import LoginScreen from "../screens/auth/LoginScreen";
import OtpScreen from "../screens/auth/OtpScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigator({
  isLoggedIn,
  setIsLoggedIn,
}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          <Stack.Screen name="OtpScreen">
            {(props) => (
              <OtpScreen
                {...props}
                setIsLoggedIn={setIsLoggedIn}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen
          name="MainTabs"
          component={BottomTabs}
        />
      )}
    </Stack.Navigator>
  );
}