"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, FileText, Image, Film } from "lucide-react";
import { downloadTxt } from "@/lib/export-tools";
import { AsciiLine, ColorMode } from "@/lib/ascii-converter";

interface ExportPanelProps {
  ascii: string;
  isGif?: boolean;
  canExport?: boolean;
  gifFrames?: string[];
  coloredGifFrames?: AsciiLine[][];
  fontSize?: number;
  invertBrightness?: boolean;
  gifDelays?: number[];
  colorMode?: ColorMode;
  coloredAscii?: AsciiLine[];
}

function getColorForMode(colorMode: ColorMode, r: number, g: number, b: number): string {
  switch (colorMode) {
    case "green": return "#00FF41";
    case "white": return "#FFFFFF";
    case "gray": {
      const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
      const hex = gray.toString(16).padStart(2, "0");
      return `#${hex}${hex}${hex}`;
    }
    case "original": return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    default: return "#00FF41";
  }
}

export function ExportPanel({ 
  ascii, 
  isGif, 
  canExport, 
  gifFrames,
  coloredGifFrames,
  fontSize = 10,
  invertBrightness = false,
  gifDelays = [],
  colorMode = "green",
  coloredAscii,
}: ExportPanelProps) {
  const t = useTranslations("export");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ascii);
      toast.success(t("copied"));
    } catch {
      toast.error(t("error.copy"));
    }
  };

  const handleDownloadTxt = () => {
    try {
      downloadTxt(ascii);
      toast.success(t("saved"));
    } catch {
      toast.error(t("error.save"));
    }
  };

  const handleDownloadPng = () => {
    try {
      const lines = ascii.split("\n");
      const height = lines.length;
      const width = Math.max(...lines.map((l) => l.length));
      
      const scale = 2;
      const charWidth = fontSize * 0.6;
      const charHeight = fontSize;
      
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(width * charWidth * scale);
      canvas.height = Math.ceil(height * charHeight * scale);
      const ctx = canvas.getContext("2d")!;
      
      ctx.fillStyle = invertBrightness ? "#FFFFFF" : "#0D0D0D";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = `${fontSize * scale}px monospace`;
      ctx.textBaseline = "top";

      if (coloredAscii && colorMode === "original") {
        coloredAscii.forEach((line, y) => {
          line.chars.forEach((charData, x) => {
            ctx.fillStyle = charData.color;
            ctx.fillText(charData.char, x * charWidth * scale, y * charHeight * scale);
          });
        });
      } else {
        ctx.fillStyle = invertBrightness ? "#000000" : getColorForMode(colorMode, 0, 255, 65);
        lines.forEach((line, y) => {
          for (let x = 0; x < line.length; x++) {
            ctx.fillText(line[x], x * charWidth * scale, y * charHeight * scale);
          }
        });
      }
      
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "ascii-art.png";
      a.click();
      toast.success(t("saved"));
    } catch {
      toast.error(t("error.save"));
    }
  };

  const handleDownloadGif = async () => {
    if (!gifFrames || gifFrames.length === 0) return;

    const useColored = coloredGifFrames && colorMode === "original";
    const lines = useColored 
      ? coloredGifFrames[0].map(l => l.chars.map(c => c.char).join("")).join("\n").split("\n")
      : gifFrames[0].split("\n");
    const height = lines.length;
    const width = Math.max(...lines.map((l) => l.length));
    
    const scale = 2;
    const charWidth = fontSize * 0.6;
    const charHeight = fontSize;
    
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width * charWidth * scale);
    canvas.height = Math.ceil(height * charHeight * scale);
    const ctx = canvas.getContext("2d")!;

    const GIF = (await import("gif.js")).default;

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript: "/gif.worker.js",
    });

    const renderFrame = (frameIndex: number) => {
      ctx.fillStyle = invertBrightness ? "#FFFFFF" : "#0D0D0D";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = `${fontSize * scale}px monospace`;
      ctx.textBaseline = "top";

      if (useColored && coloredGifFrames) {
        const coloredLines = coloredGifFrames[frameIndex];
        coloredLines.forEach((line, y) => {
          line.chars.forEach((charData, x) => {
            ctx.fillStyle = charData.color;
            ctx.fillText(charData.char, x * charWidth * scale, y * charHeight * scale);
          });
        });
      } else {
        const frameAscii = gifFrames[frameIndex];
        const frameLines = frameAscii.split("\n");
        ctx.fillStyle = invertBrightness ? "#000000" : getColorForMode(colorMode, 0, 255, 65);
        
        frameLines.forEach((line, y) => {
          for (let x = 0; x < line.length; x++) {
            ctx.fillText(line[x], x * charWidth * scale, y * charHeight * scale);
          }
        });
      }

      const delay = Math.max(Math.round((gifDelays[frameIndex] || 80) / 10), 20);
      gif.addFrame(ctx, { copy: true, delay });
    };

    try {
      const frameCount = useColored ? coloredGifFrames.length : gifFrames.length;
      for (let i = 0; i < frameCount; i++) {
        renderFrame(i);
      }

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "ascii-animation.gif";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(t("saved"));
      });

      gif.render();
    } catch (error) {
      console.error("GIF export error:", error);
      toast.error(t("error.save"));
    }
  };

  if (!canExport) return null;

  return (
    <div className="panel space-y-3">
      <h2 className="panel-header">{t("title")}</h2>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!ascii}
          className="btn-primary text-xs flex items-center justify-center gap-1"
        >
          <Copy className="w-3 h-3" />
          {t("copy")}
        </button>

        <button
          type="button"
          onClick={handleDownloadTxt}
          disabled={!ascii}
          className="btn-primary text-xs flex items-center justify-center gap-1"
        >
          <FileText className="w-3 h-3" />
          {t("downloadTxt")}
        </button>

        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!ascii}
          className="btn-secondary text-xs flex items-center justify-center gap-1"
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="w-3 h-3" />
          {t("downloadPng")}
        </button>

        {isGif && gifFrames && gifFrames.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadGif}
            className="btn-secondary text-xs flex items-center justify-center gap-1"
          >
            <Film className="w-3 h-3" />
            {t("downloadGif")}
          </button>
        )}
      </div>
    </div>
  );
}