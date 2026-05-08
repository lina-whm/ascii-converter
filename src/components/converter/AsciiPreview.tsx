"use client";

import { useRef, useMemo } from "react";
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
  fontSize 
}: { 
  lines: AsciiLine[]; 
  fontSize: number; 
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

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <span>{t("preview.title")}</span>
        {showControls && (
          <span className="text-xs text-[var(--text-muted)]">
            {t("gif.frame", { current: currentFrame + 1, total: gifFrames.length })}
          </span>
        )}
      </div>

      <div 
        className="flex-1 overflow-hidden relative rounded"
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
          <div className="absolute inset-0 overflow-auto p-2">
            <ColoredAsciiRenderer lines={coloredLines} fontSize={settings.fontSize} />
          </div>
        ) : (
          <div 
            className="absolute inset-0 overflow-auto p-2 font-mono"
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: "1.2",
              whiteSpace: "pre",
            }}
          >
            <pre
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(displayAscii),
              }}
              style={{
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