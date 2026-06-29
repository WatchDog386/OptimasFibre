import React, { createContext, useContext, useState } from "react";
import translations from "../data/translations";

const LanguageContext = createContext();

/**
 * Splits keys like "navbar.home" and returns the translated value from translations[language].
 * Fallbacks to key itself if not found.
 */
const createTranslator = (language) => (key) => {
  const keys = key.split(".");
  const value = keys.reduce(
    (obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined),
    translations[language]
  );

  if (value === undefined) {
    console.warn(
      `[i18n] Missing translation for key "${key}" in "${language}"`
    );
  }

  return value || key;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("EN");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "EN" ? "SW" : "EN"));
  };

  const t = createTranslator(language);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
