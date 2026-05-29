/*
|--------------------------------------------------------------------------
| AppProvider.js
|--------------------------------------------------------------------------
|
| MASTER PROVIDER WRAPPER
|
| PURPOSE:
| This file wraps the entire application with all global providers.
|
| WHY IMPORTANT?
| Instead of adding many providers inside App.js,
| we keep everything centralized here.
|
| CURRENTLY USING:
| - AuthProvider
| - ThemeProvider
|
| FUTURE PROVIDERS:
| - SocketProvider
| - QueryProvider
| - NotificationProvider
|
|--------------------------------------------------------------------------
*/

import React from 'react';

/*
|--------------------------------------------------------------------------
| PROVIDERS
|--------------------------------------------------------------------------
*/

import AuthProvider from './AuthProvider';

import ThemeProvider from './ThemeProvider';

/*
|--------------------------------------------------------------------------
| APP PROVIDER
|--------------------------------------------------------------------------
*/

export default function AppProvider({
  children,
}) {
  return (
    /*
    |--------------------------------------------------------------------------
    | AUTH PROVIDER
    |--------------------------------------------------------------------------
    |
    | Handles:
    | - login state
    | - user data
    | - logout
    | - token/session
    |
    */
    <AuthProvider>
      {/*
      |--------------------------------------------------------------------------
      | THEME PROVIDER
      |--------------------------------------------------------------------------
      |
      | Handles:
      | - dark mode
      | - light mode
      | - colors
      | - global theme
      |
      */}
      <ThemeProvider>
        {/*
        |--------------------------------------------------------------------------
        | APP CONTENT
        |--------------------------------------------------------------------------
        */}
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}