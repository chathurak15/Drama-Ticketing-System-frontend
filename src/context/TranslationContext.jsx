import React, { createContext, useState, useEffect } from "react";
import i18nTexts from "../i18nTexts";
import axiosInstance from "../api/axiosInstance";

export const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [translatedTexts, setTranslatedTexts] = useState(i18nTexts);
  const [loading, setLoading] = useState(false);

  const fetchTranslation = async (text, lang) => {
    try {
      const response = await axiosInstance.get("/translate", {
        params: {
          text,
          lang,
        },
      });
      return response.data; // assuming response is plain text
    } catch (error) {
      console.error("Translation error:", error);
      return text; // fallback to original
    }
  };

  const translateAllTexts = async (lang) => {
    setLoading(true);
    if (lang === "en") {
      setTranslatedTexts(i18nTexts);
      setLoading(false);
      return;
    }

    const traverseAndTranslate = async (obj) => {
      const entries = Object.entries(obj);
      const translated = {};

      for (const [key, value] of entries) {
        if (typeof value === "object") {
          translated[key] = await traverseAndTranslate(value);
        } else {
          translated[key] = await fetchTranslation(value, lang);
        }
      }
      return translated;
    };

    const translated = await traverseAndTranslate(i18nTexts);
    setTranslatedTexts(translated);
    setLoading(false);
  };

  useEffect(() => {
    translateAllTexts(language);
  }, [language]);

  return (
    <TranslationContext.Provider
      value={{ language, setLanguage, translatedTexts, loading }}
    >
      {children}
    </TranslationContext.Provider>
  );
};
