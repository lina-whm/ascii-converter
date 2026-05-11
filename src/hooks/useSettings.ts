"use client";

import { useState, useEffect, useCallback } from "react";
import { AsciiSettings, DEFAULT_SETTINGS, ImageAdjustments, DEFAULT_ADJUSTMENTS } from "@/lib/ascii-converter";

const SETTINGS_KEY = "ascii-converter-settings";
const LANGUAGE_KEY = "ascii-converter-language";

interface StoredSettings {
  settings: AsciiSettings;
  adjustments: ImageAdjustments;
  language: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<AsciiSettings>(DEFAULT_SETTINGS);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [language, setLanguage] = useState<string>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredSettings;
        setSettings(parsed.settings);
        setAdjustments(parsed.adjustments || DEFAULT_ADJUSTMENTS);
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
        JSON.stringify({ settings: updated, adjustments, language } as StoredSettings)
      );
      return updated;
    });
  }, [adjustments, language]);

  const updateAdjustments = useCallback((newAdjustments: Partial<ImageAdjustments>) => {
    setAdjustments((prev) => {
      const updated = { ...prev, ...newAdjustments };
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ settings, adjustments: updated, language } as StoredSettings)
      );
      return updated;
    });
  }, [settings, language]);

  const updateLanguage = useCallback((newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ settings, adjustments, language: newLang } as StoredSettings)
    );
  }, [settings, adjustments]);

  return { settings, adjustments, language, updateSettings, updateAdjustments, updateLanguage };
}

export function useSettingsStore() {
  return useSettings();
}