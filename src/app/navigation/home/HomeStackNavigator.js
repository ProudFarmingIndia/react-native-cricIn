import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../../features/home/screens/HomeScreen";
import NavigationHeader from "../../../components/common/NavigationHeader";
const Stack = createNativeStackNavigator();

const renderHeader = ({ route }) => {
  return <NavigationHeader route={route} />;
};
export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: renderHeader,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      {/* NotificationScreen is registered on RootNavigator instead, so the
          header bell resolves from every tab and not just Home. */}
    </Stack.Navigator>
  );
}
