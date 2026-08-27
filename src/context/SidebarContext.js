import React, { createContext, useContext, useState, useCallback } from "react";

/*
|--------------------------------------------------------------------------
| Sidebar Context
|--------------------------------------------------------------------------
|
| Global open/close state for the left sidebar menu. It needs to be
| reachable from NavigationHeader (which renders inside several
| independent stacks) so a single Provider at the AppNavigator root,
| above NavigationContainer, is simpler and less risky than restructuring
| the whole navigation tree around React Navigation's Drawer.
|
*/

const SidebarContext = createContext({
  isOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = useCallback(() => setIsOpen(true), []);

  const closeSidebar = useCallback(() => setIsOpen(false), []);

  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SidebarContext.Provider
      value={{ isOpen, openSidebar, closeSidebar, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
