import React from 'react';

import '../../services/api/interceptors';

import { Provider } from 'react-redux';

import { store } from '../../store/store';

import AuthProvider from './AuthProvider';
import ThemeProvider from './ThemeProvider';

export default function AppProvider({
  children,
}) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}