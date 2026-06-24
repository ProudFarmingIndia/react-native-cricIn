import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { COLORS } from "../../constants/colors";

// Restore token into Redux on app launch
import { createAction } from "@reduxjs/toolkit";
const restoreToken = createAction("auth/restoreToken");

export default function AppNavigator() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem("accessToken");
        if (stored) {
          // Put the token back into Redux so the selector works
          dispatch(restoreToken(stored));
        }
      } catch (e) {
        console.error("Auth bootstrap error", e);
      } finally {
        setChecking(false);
      }
    };

    bootstrapAuth();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}