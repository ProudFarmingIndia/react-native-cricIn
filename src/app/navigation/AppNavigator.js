import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { restoreToken } from "./../../features/auth/store/authSlice";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { COLORS } from "./../../constants/colors";

export default function AppNavigator() {
  const dispatch = useDispatch();

  const token = useSelector(
    (state) => state.auth.token
  );

  const [checking, setChecking] =
    useState(true);

  // TEMPORARY TEST ONLY
  useEffect(() => {
    AsyncStorage.clear();
  }, []);

  useEffect(() => {
    const bootstrapAuth =
      async () => {
        try {
          const stored =
            await AsyncStorage.getItem(
              "accessToken"
            );

          console.log(
            "RESTORED TOKEN =>",
            stored
          );

          if (stored) {
            dispatch(
              restoreToken(
                stored
              )
            );
          }
        } catch (e) {
          console.error(
            "Auth bootstrap error",
            e
          );
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
    <NavigationContainer>
      {token ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
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