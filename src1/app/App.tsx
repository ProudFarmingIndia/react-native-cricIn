import 'react-native-gesture-handler';

import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import AppProvider from './providers/AppProvider';

import RootNavigation from './navigation/RootNavigation';

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
    </AppProvider>
  );
}