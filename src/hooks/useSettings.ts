"use client";

import { useState, useEffect, useCallback } from "react";
import { AsciiSettings, DEFAULT_SETTINGS } from "@/lib/ascii-converter";

const SETTINGS_KEY = "ascii-converter-settings";
const LANGUAGE_KEY = "ascii-converter-language";

interface StoredSettings {
  settings: AsciiSettings;
  language: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<AsciiSettings>(DEFAULT_SETTINGS);
  const [language, setLanguage] = useState<string>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredSettings;
        setSettings(parsed.settings);
        setLanguage(parsed.language);
      } catch {
        const browserLang = navigator.language.split("-")[0];
        setLanguage(["en", "ru"].includes(browserLang) ? browserLang : "en");
      }
    } else {
      const browserLang = navigator.language.split("-")[0];
      setLanguage(["en", "ru"].includes(browserLang) ? browserLang : "en");
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AsciiSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ settings: updated, language } as StoredSettings)
      );
      return updated;
    });
  }, [language]);

  const updateLanguage = useCallback((newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ settings, language: newLang } as StoredSettings)
    );
  }, [settings]);

  return { settings, language, updateSettings, updateLanguage };
}

export function useSettingsStore() {
  return useSettings();
}