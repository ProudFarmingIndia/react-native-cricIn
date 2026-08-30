import React from 'react';

/*
| There used to be an `import '../../services/api/interceptors'` here.
| That file does not exist - services/api/ holds only apiClient.js,
| apiConstants.js and endpoints.js - so mounting this provider would have
| failed to bundle. The auth interceptor lives inside apiClient.js.
*/

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