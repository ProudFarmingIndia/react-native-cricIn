import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import {
  restoreToken,
  TOKEN_KEY,
  USER_KEY,
} from "./../../features/auth/store/authSlice";
import AuthNavigator from "./AuthNavigator";
import { COLORS } from "./../../constants/colors";
import RootNavigator from "./RootNavigator";
import { SidebarProvider } from "../../context/SidebarContext";
import Sidebar from "../../components/common/Sidebar";
import { navigationRef } from "./navigationRef";

export default function AppNavigator() {
  const dispatch = useDispatch();

  const token = useSelector(
    (state) => state.auth.token
  );

  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        /*
        | Restore the USER as well as the token. Every ownership check in
        | the app (team.userId, match.userId) compares against
        | state.auth.user._id, and restoring only the token left it null -
        | so after a reload the team owner was treated as a non-owner and
        | lost Delete Team, among other owner-only controls.
        */

        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (storedToken) {
          let user = null;

          try {
            user = storedUser ? JSON.parse(storedUser) : null;
          } catch {
            // Corrupted entry - not worth blocking launch over. The user
            // object refills on the next login.
            user = null;
          }

          dispatch(restoreToken({ token: storedToken, user }));
        }
      } catch (e) {
        console.error("Auth bootstrap error", e);
      } finally {
        setChecking(false);
      }
    };

    bootstrapAuth();
  }, [dispatch]);

  if (checking) {
    return (
      <View
        style={styles.checkBar}
      >
        <ActivityIndicator
          size="large"
          color={
            COLORS.primary
          }
        />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <SidebarProvider>
        {token ? (
          <RootNavigator />
        ) : (
          <AuthNavigator />
        )}

        <Sidebar />
      </SidebarProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  checkBar : {
    flex : 1,
    justifyContent : "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  }
})