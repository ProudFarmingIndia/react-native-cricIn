import React, { useEffect, useState } from "react";

import SplashScreen from "../screens/splash/SplashScreen";
import StackNavigator from "./StackNavigator";

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isSplashVisible, setIsSplashVisible] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // SHOW SPLASH FIRST
  if (isSplashVisible) {
    return <SplashScreen />;
  }

  // THEN LOAD APP
  return (
    <StackNavigator
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
    />
  );
}