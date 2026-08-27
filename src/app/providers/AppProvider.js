import React from 'react';

import '../../services/api/interceptors';

import { Provider } from 'react-redux';

import { store } from '../../store/store';

import AuthProvider from './AuthProvider';
import ThemeProvider from './ThemeProvider';
import NotificationProvider from './NotificationProvider';

export default function AppProvider({
  children,
}) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}