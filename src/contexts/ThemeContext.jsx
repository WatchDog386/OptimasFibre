// src/contexts/ThemeContext.js
import React, { createContext, useContext } from "react";

// Empty context (theme system is disabled)
export const ThemeContext = createContext(null);

// Minimal provider – keeps structure so imports don't break
export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook returns empty object to avoid breaking components
export const useTheme = () => {
  return {};
};
