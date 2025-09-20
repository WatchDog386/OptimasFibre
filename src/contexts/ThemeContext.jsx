// src/contexts/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

// ✅ Export ThemeContext if you need to consume it directly
export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference first
    try {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) {
        return saved === "true";
      }
    } catch (e) {
      console.warn("Failed to read theme preference from localStorage:", e);
    }

    // Fallback to system preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Default to light mode if window is not available (SSR)
    return false;
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e) => {
      // Only update if user hasn't explicitly set a preference
      try {
        const saved = localStorage.getItem("darkMode");
        if (saved === null) {
          setDarkMode(e.matches);
        }
      } catch (err) {
        console.warn("Failed to read theme preference during system change:", err);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  // Apply theme to document and persist to storage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    try {
      localStorage.setItem("darkMode", String(darkMode));
    } catch (err) {
      console.warn("Failed to save theme preference to localStorage:", err);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    try {
      localStorage.setItem("darkMode", String(!darkMode));
    } catch (err) {
      console.warn("Failed to save theme preference after toggle:", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Hook to consume the context safely
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
