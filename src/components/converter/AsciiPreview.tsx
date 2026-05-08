"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AsciiSettings } from "@/lib/ascii-converter";
import { sanitizeHtml } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AsciiPreviewProps {
  ascii: string;
  settings: AsciiSettings;
  isLoading?: boolean;
  isGif?: boolean;
  gifFrames?: string[];
  currentFrame?: number;
  isPlaying?: boolean;
  onFrameChange?: (frame: number) => void;
  onPlayPause?: () => void;
}

export function AsciiPreview({
  ascii,
  settings,
  isLoading,
  isGif,
  gifFrames,
  currentFrame = 0,
  isPlaying,
  onFrameChange,
  onPlayPause,
}: AsciiPreviewProps) {
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const displayAscii = isGif && gifFrames ? gifFrames[currentFrame] : ascii;
  const lineCount = displayAscii.split("\n").length;
  const showControls = isGif && gifFrames && gifFrames.length > 1;

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

      <div className="flex-1 overflow-hidden relative bg-[var(--bg-primary)] rounded">
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
        ) : (
          <>
            <div
              ref={containerRef}
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
                className={cn(
                  "text-[var(--accent-green)]",
                  settings.invertBrightness && "text-[var(--bg-primary)]"
                )}
                style={{
                  textShadow: settings.invertBrightness ? "none" : "0 0 5px rgba(0,255,65,0.5)",
                }}
              />
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}