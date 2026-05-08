"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef, useEffect } from "react";
import { AsciiSettings, DEFAULT_CHARSETS } from "@/lib/ascii-converter";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  settings: AsciiSettings;
  onSettingsChange: (settings: Partial<AsciiSettings>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const t = useTranslations("settings");
  const debouncedOnChange = useDebounceCallback(onSettingsChange, 150);

  return (
    <div className="panel space-y-4">
      <h2 className="panel-header">{t("title")}</h2>

      <div className="space-y-2">
        <label className="text-xs text-[var(--text-secondary)]">{t("width")}</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={40}
            max={300}
            value={settings.width}
            onChange={(e) => debouncedOnChange({ width: parseInt(e.target.value) })}
            className="flex-1"
            style={{
              appearance: "none",
              height: "4px",
              background: "var(--bg-tertiary)",
              borderRadius: "2px",
            }}
          />
          <span className="text-xs text-[var(--accent-green)] w-10 text-right">
            {settings.width}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[var(--text-secondary)]">{t("charset")}</label>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            className={cn(
              "text-xs p-2 border transition-all",
              settings.charset === DEFAULT_CHARSETS.dense
                ? "border-[var(--accent-green)] text-[var(--accent-green)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
            )}
            onClick={() => onSettingsChange({ charset: DEFAULT_CHARSETS.dense })}
          >
            {t("presets.dense")}
          </button>
          <button
            type="button"
            className={cn(
              "text-xs p-2 border transition-all",
              settings.charset === DEFAULT_CHARSETS.classic
                ? "border-[var(--accent-green)] text-[var(--accent-green)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
            )}
            onClick={() => onSettingsChange({ charset: DEFAULT_CHARSETS.classic })}
          >
            {t("presets.classic")}
          </button>
          <button
            type="button"
            className={cn(
              "text-xs p-2 border transition-all",
              settings.charset === DEFAULT_CHARSETS.braille
                ? "border-[var(--accent-green)] text-[var(--accent-green)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
            )}
            onClick={() => onSettingsChange({ charset: DEFAULT_CHARSETS.braille })}
          >
            {t("presets.braille")}
          </button>
          <input
            type="text"
            placeholder={t("charsetCustom")}
            value={
              settings.charset.length > 15 ? settings.charset : ""
            }
            maxLength={20}
            onChange={(e) =>
              onSettingsChange({ charset: e.target.value.slice(0, 20) })
            }
            className="input-field text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs text-[var(--text-secondary)]">{t("invert")}</label>
        <button
          type="button"
          onClick={() => onSettingsChange({ invertBrightness: !settings.invertBrightness })}
          className={cn(
            "w-12 h-6 rounded-full border transition-all",
            settings.invertBrightness
              ? "bg-[var(--accent-green)] border-[var(--accent-green)]"
              : "bg-[var(--bg-tertiary)] border-[var(--border)]"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full bg-white transition-transform",
              settings.invertBrightness ? "translate-x-6" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[var(--text-secondary)]">{t("fontSize")}</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={4}
            max={16}
            value={settings.fontSize}
            onChange={(e) => debouncedOnChange({ fontSize: parseInt(e.target.value) })}
            className="flex-1"
            style={{
              appearance: "none",
              height: "4px",
              background: "var(--bg-tertiary)",
              borderRadius: "2px",
            }}
          />
          <span className="text-xs text-[var(--accent-orange)] w-8 text-right">
            {settings.fontSize}px
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs text-[var(--text-secondary)]">{t("smoothing")}</label>
        <button
          type="button"
          onClick={() => onSettingsChange({ smoothing: !settings.smoothing })}
          className={cn(
            "w-12 h-6 rounded-full border transition-all",
            settings.smoothing
              ? "bg-[var(--accent-green)] border-[var(--accent-green)]"
              : "bg-[var(--bg-tertiary)] border-[var(--border)]"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full bg-white transition-transform",
              settings.smoothing ? "translate-x-6" : "translate-x-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}