import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../../features/auth/screens/LoginScreen';
import OtpScreen from '../../features/auth/screens/OtpScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
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