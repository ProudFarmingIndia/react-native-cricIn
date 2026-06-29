import React, {
  createContext,
  useContext,
  useState,
} from 'react';

import { COLORS } from '../../constants/colors';

const ThemeContext =
  createContext();

export default function ThemeProvider({
  children,
}) {
  const [isDark, setIsDark] =
    useState(false);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const theme = {
    colors: COLORS,
    isDark,
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used inside ThemeProvider'
    );
  }

  return context;
};