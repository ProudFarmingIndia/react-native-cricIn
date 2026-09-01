import { createNavigationContainerRef } from "@react-navigation/native";

/*
|--------------------------------------------------------------------------
| Navigation Ref
|--------------------------------------------------------------------------
|
| For navigating from OUTSIDE the navigation tree - components that
| aren't a registered Screen (like Sidebar, which sits as a sibling to
| RootNavigator/AuthNavigator, not inside either of them). useNavigation()
| only resolves inside a Screen's render tree, so this ref-based approach
| is the officially correct pattern here, not a workaround.
|
*/

export const navigationRef = createNavigationContainerRef();

export const navigate = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};
