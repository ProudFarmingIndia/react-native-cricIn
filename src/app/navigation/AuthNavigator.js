import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import SplashScreen
  from '../splash/SplashScreen';

import LoginScreen
  from '../../features/auth/screens/LoginScreen';

import OtpScreen
  from '../../features/auth/screens/OtpScreen';

const Stack =
  createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="OtpScreen"
        component={OtpScreen}
      />
    </Stack.Navigator>
  );
}