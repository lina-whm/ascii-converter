"use client";

import { useRef, useMemo, useState, useEffect } from "react";
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

function ColoredAsciiRenderer({
  lines,
  fontSize,
  scale = 1
}: {
  lines: AsciiLine[];
  fontSize: number;
  scale?: number;
}) {
  const displayFontSize = Math.max(4, Math.round(fontSize * scale));
  return (
    <div
      className="font-mono inline-block"
      style={{
        fontSize: `${displayFontSize}px`,
        lineHeight: "1.2",
        whiteSpace: "pre",
      }}
    >
      {lines.map((line, y) => (
        <div key={y} style={{ height: `${displayFontSize}px` }}>
          {line.chars.map((char, x) => (
            <span
              key={x}
              style={{
                color: char.color,
                textShadow: char.color === "#00FF41" ? "0 0 5px rgba(0,255,65,0.5)" : "none",
              }}
            >
              {char.char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AsciiPreview({
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const displayAscii = isGif && gifFrames ? gifFrames[currentFrame] : ascii;
  const showControls = isGif && gifFrames && gifFrames.length > 1;

  const useColored = settings.colorMode !== "green" && settings.colorMode !== "white" && settings.colorMode !== "gray";
  const coloredLines = useColored && coloredFrames
    ? (isGif ? coloredFrames[currentFrame] : coloredFrames[0])
    : null;

  const backgroundColor = settings.invertBrightness ? "#FFFFFF" : "#0D0D0D";
  const textColor = settings.invertBrightness
    ? "#000000"
    : settings.colorMode === "green"
      ? "#00FF41"
      : settings.colorMode === "white"
        ? "#FFFFFF"
        : "#888888";

  const lines = displayAscii ? displayAscii.split('\n') : [];
  const contentWidth = lines.length > 0 ? lines[0].length : 0;
  const contentHeight = lines.length;

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current || !contentRef.current) return;

      const container = containerRef.current;
      const content = contentRef.current;

      const containerWidth = container.clientWidth - 16;
      const containerHeight = container.clientHeight - 16;

      const charWidth = settings.fontSize * 0.6;
      const charHeight = settings.fontSize;

      const scaleX = containerWidth / (contentWidth * charWidth);
      const scaleY = containerHeight / (contentHeight * charHeight);

      const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 1);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [contentWidth, contentHeight, settings.fontSize, displayAscii]);

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
        className="flex-1 overflow-hidden relative rounded min-h-0 flex items-center justify-center"
        style={{ backgroundColor }}
        ref={containerRef}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[var(--accent-green)]">
              <span className="animate-pulse">{t("preview.loading")}</span>
            </div>
          </div>
        ) : !displayAscii ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[var(--text-muted)] text-sm">{t("preview.noFile")}</span>
          </div>
        ) : coloredLines ? (
          <div className="overflow-auto p-2 flex items-center justify-center" ref={contentRef}>
            <ColoredAsciiRenderer lines={coloredLines} fontSize={settings.fontSize} scale={scale} />
          </div>
        ) : (
          <div
            className="overflow-auto p-2 flex items-center justify-center"
            ref={contentRef}
          >
            <pre
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(displayAscii),
              }}
              className="font-mono inline-block"
              style={{
                fontSize: `${Math.max(4, Math.round(settings.fontSize * scale))}px`,
                lineHeight: "1.2",
                whiteSpace: "pre",
                color: textColor,
                textShadow: !settings.invertBrightness && settings.colorMode === "green"
                  ? "0 0 5px rgba(0,255,65,0.5)"
                  : "none",
              }}
            />
          </div>
        )}

        {showControls && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full px-3 py-1">
            <button
              type="button"
              onClick={() => onFrameChange?.(Math.max(0, currentFrame - 1))}
              disabled={currentFrame === 0}
              className="text-[var(--accent-green)] hover:text-[var(--accent-orange)] disabled:opacity-30 text-xs"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={onPlayPause}
              className="text-[var(--accent-green)] hover:text-[var(--accent-orange)] text-xs min-w-[30px]"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              onClick={() => onFrameChange?.(Math.min(gifFrames.length - 1, currentFrame + 1))}
              disabled={currentFrame === gifFrames.length - 1}
              className="text-[var(--accent-green)] hover:text-[var(--accent-orange)] disabled:opacity-30 text-xs"
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}