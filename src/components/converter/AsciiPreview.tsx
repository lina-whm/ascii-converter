"use client";

import { useRef, useState, useEffect, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { AsciiSettings, AsciiLine } from "@/lib/ascii-converter";
import { sanitizeHtml } from "@/lib/utils";

interface AsciiPreviewProps {
  ascii: string;
  settings: AsciiSettings;
  isLoading?: boolean;
  isGif?: boolean;
  gifFrames?: string[];
  coloredFrames?: AsciiLine[][];
  currentFrame?: number;
  isPlaying?: boolean;
  onFrameChange?: (frame: number) => void;
  onPlayPause?: () => void;
}

const ColoredAsciiRenderer = memo(function ColoredAsciiRenderer({
  lines,
  fontSize,
  textColor,
  useGlow
}: {
  lines: AsciiLine[];
  fontSize: number;
  textColor: string;
  useGlow: boolean;
}) {
  return (
    <div
      className="font-mono"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: "1.2",
        whiteSpace: "pre",
      }}
    >
      {lines.map((line, y) => (
        <div key={y} style={{ height: `${fontSize}px` }}>
          {line.chars.map((char, x) => (
            <span
              key={x}
              style={{
                color: char.color,
                textShadow: useGlow ? "0 0 5px rgba(0,255,65,0.5)" : "none",
              }}
            >
              {char.char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
});

function AsciiPreviewInner({
  ascii,
  settings,
  isLoading,
  isGif,
  gifFrames,
  coloredFrames,
  currentFrame = 0,
  isPlaying,
  onFrameChange,
  onPlayPause,
}: AsciiPreviewProps) {
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewFontSize, setPreviewFontSize] = useState(8);
  const lastCalcRef = useRef<{ width: number; height: number; fontSize: number }>({ width: 0, height: 0, fontSize: 0 });

  const displayAscii = isGif && gifFrames ? gifFrames[currentFrame] : ascii;
  const showControls = isGif && gifFrames && gifFrames.length > 1;

  const useColored = settings.colorMode === "original";
  const coloredLines = useColored && coloredFrames
    ? (isGif ? coloredFrames[currentFrame] : coloredFrames[0])
    : null;

  const backgroundColor = settings.invertBrightness ? "#FFFFFF" : "#0D0D0D";
  const textColor = settings.invertBrightness ? "#000000" : settings.colorMode === "green" ? "#00FF41" : settings.colorMode === "white" ? "#FFFFFF" : "#888888";
  const useGlow = !settings.invertBrightness && settings.colorMode === "green";

  const calculateFit = useCallback(() => {
    if (!containerRef.current || !displayAscii) {
      setPreviewFontSize(settings.fontSize);
      return;
    }

    const container = containerRef.current;
    const padding = 32;
    const availW = container.clientWidth - padding;
    const availH = container.clientHeight - padding;

    if (availW <= 0 || availH <= 0) return;

    const lines = displayAscii.split('\n');
    const contentWidth = lines[0]?.length || 1;
    const contentHeight = lines.length;

    if (contentWidth === lastCalcRef.current.width && contentHeight === lastCalcRef.current.height && lastCalcRef.current.fontSize > 0) {
      return;
    }

    const charWidth = settings.fontSize * 0.6;
    const charHeight = settings.fontSize;

    const scaleX = availW / (contentWidth * charWidth);
    const scaleY = availH / (contentHeight * charHeight);

    let newSize = settings.fontSize * Math.min(scaleX, scaleY, 1);
    newSize = Math.max(2, Math.min(newSize, settings.fontSize));

    lastCalcRef.current = { width: contentWidth, height: contentHeight, fontSize: newSize };
    setPreviewFontSize(newSize);
  }, [displayAscii, settings.fontSize]);

  useEffect(() => {
    const timeoutId = setTimeout(calculateFit, 100);
    return () => clearTimeout(timeoutId);
  }, [calculateFit]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      lastCalcRef.current = { width: 0, height: 0, fontSize: 0 };
      calculateFit();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [calculateFit]);

  return (
    <div className="panel flex flex-col min-h-[300px] md:min-h-0 md:h-full">
      <div className="panel-header flex items-center justify-between shrink-0">
        <span>{t("preview.title")}</span>
        {showControls && (
          <span className="text-xs text-[var(--text-muted)]">
            {t("gif.frame", { current: currentFrame + 1, total: gifFrames.length })}
          </span>
        )}
      </div>

      <div
        className="flex-1 overflow-auto relative rounded min-h-0"
        style={{ backgroundColor }}
        ref={containerRef}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="animate-pulse text-[var(--accent-green)]">{t("preview.loading")}</span>
          </div>
        ) : !displayAscii ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[var(--text-muted)] text-sm">{t("preview.noFile")}</span>
          </div>
        ) : coloredLines ? (
          <div className="flex items-center justify-center w-full h-full p-4">
            <ColoredAsciiRenderer lines={coloredLines} fontSize={previewFontSize} textColor={textColor} useGlow={useGlow} />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full p-4">
            <pre
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(displayAscii) }}
              className="font-mono text-center"
              style={{
                fontSize: `${previewFontSize}px`,
                lineHeight: "1.2",
                whiteSpace: "pre",
                color: textColor,
                textShadow: useGlow ? "0 0 5px rgba(0,255,65,0.5)" : "none",
              }}
            />
          </div>
        )}

        {showControls && (
          <div className="sticky bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full px-3 py-1">
            <button type="button" onClick={() => onFrameChange?.(Math.max(0, currentFrame - 1))} disabled={currentFrame === 0} className="text-[var(--accent-green)] hover:text-[var(--accent-orange)] disabled:opacity-30 text-xs">◀</button>
            <button type="button" onClick={onPlayPause} className="text-[var(--accent-green)] hover:text-[var(--accent-orange)] text-xs min-w-[30px]">{isPlaying ? "⏸" : "▶"}</button>
            <button type="button" onClick={() => onFrameChange?.(Math.min(gifFrames.length - 1, currentFrame + 1))} disabled={currentFrame === gifFrames.length - 1} className="text-[var(--accent-green)] hover:text-[var(--accent-orange)] disabled:opacity-30 text-xs">▶</button>
          </div>
        )}
      </div>
    </div>
  );
}

export const AsciiPreview = memo(AsciiPreviewInner);