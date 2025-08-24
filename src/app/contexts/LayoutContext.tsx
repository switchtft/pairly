// src/contexts/LayoutContext.tsx

import React, { createContext, useContext, ReactNode, useState } from 'react';

interface LayoutContextType {
  hideNavbar: boolean;
  hideFooter: boolean;
  setLayoutVisibility: (navbar: boolean, footer: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  // Domyślnie navbar i footer są widoczne
  const [hideNavbar, setHideNavbar] = useState(false); // False = widoczny
  const [hideFooter, setHideFooter] = useState(false); // False = widoczny

  const setLayoutVisibility = (navbar: boolean, footer: boolean) => {
    setHideNavbar(navbar);
    setHideFooter(footer);
  };

  return (
    <LayoutContext.Provider value={{ hideNavbar, hideFooter, setLayoutVisibility }}>
      {children}  
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};
