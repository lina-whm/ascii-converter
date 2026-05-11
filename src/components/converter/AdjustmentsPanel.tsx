"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef, useEffect } from "react";
import { ImageAdjustments, DEFAULT_ADJUSTMENTS } from "@/lib/ascii-converter";

interface AdjustmentsPanelProps {
  adjustments: ImageAdjustments;
  onAdjustmentsChange: (adjustments: Partial<ImageAdjustments>) => void;
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

function Slider({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const debouncedOnChange = useDebounceCallback(onChange, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-[var(--text-secondary)]">{label}</label>
        <span className="text-xs text-[var(--accent-orange)]">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => debouncedOnChange(parseFloat(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, var(--accent-green) ${((value - min) / (max - min)) * 100}%, var(--bg-tertiary) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </div>
  );
}

export function AdjustmentsPanel({ adjustments, onAdjustmentsChange }: AdjustmentsPanelProps) {
  const t = useTranslations("settings");

  const handleChange = (key: keyof ImageAdjustments, value: number) => {
    onAdjustmentsChange({ [key]: value });
  };

  const handleReset = () => {
    onAdjustmentsChange(DEFAULT_ADJUSTMENTS);
  };

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="panel-header m-0">{t("adjustments") || "Adjustments"}</h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
        >
          {t("reset") || "Reset"}
        </button>
      </div>

      <details className="group">
        <summary className="text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] list-inside">
          {t("basicAdjustments") || "Basic Image"}
        </summary>
        <div className="mt-3 space-y-3">
          <Slider
            label={t("brightness") || "Brightness"}
            value={adjustments.brightness}
            min={-100}
            max={100}
            onChange={(v) => handleChange("brightness", v)}
          />
          <Slider
            label={t("contrast") || "Contrast"}
            value={adjustments.contrast}
            min={-100}
            max={100}
            onChange={(v) => handleChange("contrast", v)}
          />
          <Slider
            label={t("saturation") || "Saturation"}
            value={adjustments.saturation}
            min={-100}
            max={100}
            onChange={(v) => handleChange("saturation", v)}
          />
          <Slider
            label={t("hue") || "Hue"}
            value={adjustments.hue}
            min={-180}
            max={180}
            unit="°"
            onChange={(v) => handleChange("hue", v)}
          />
          <Slider
            label={t("grayscale") || "Grayscale"}
            value={adjustments.grayscale}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => handleChange("grayscale", v)}
          />
          <Slider
            label={t("sepia") || "Sepia"}
            value={adjustments.sepia}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => handleChange("sepia", v)}
          />
          <Slider
            label={t("invertColors") || "Invert Colors"}
            value={adjustments.invert}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => handleChange("invert", v)}
          />
        </div>
      </details>

      <details className="group">
        <summary className="text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] list-inside">
          {t("advancedAdjustments") || "Advanced"}
        </summary>
        <div className="mt-3 space-y-3">
          <Slider
            label={t("threshold") || "Threshold"}
            value={adjustments.threshold}
            min={0}
            max={255}
            onChange={(v) => handleChange("threshold", v)}
          />
          <Slider
            label={t("sharpness") || "Sharpness"}
            value={adjustments.sharpness}
            min={0}
            max={20}
            onChange={(v) => handleChange("sharpness", v)}
          />
          <Slider
            label={t("edgeDetection") || "Edge Detection"}
            value={adjustments.edgeDetection}
            min={0}
            max={20}
            onChange={(v) => handleChange("edgeDetection", v)}
          />
        </div>
      </details>
    </div>
  );
}