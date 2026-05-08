"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, Download, FileText, Image, Film } from "lucide-react";
import { downloadTxt, downloadPng } from "@/lib/export-tools";
import { cn } from "@/lib/utils";

interface ExportPanelProps {
  ascii: string;
  isGif?: boolean;
  canExport?: boolean;
  gifFrames?: string[];
  fontSize?: number;
  invertBrightness?: boolean;
}

export function ExportPanel({ 
  ascii, 
  isGif, 
  canExport, 
  gifFrames,
  fontSize = 10,
  invertBrightness = false,
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
      downloadPng(ascii);
      toast.success(t("saved"));
    } catch {
      toast.error(t("error.save"));
    }
  };

  const handleDownloadGif = () => {
    if (!gifFrames || gifFrames.length === 0) return;

    const lines = gifFrames[0].split("\n");
    const height = lines.length;
    const width = Math.max(...lines.map((l) => l.length));
    
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * fontSize * 0.6 * scale;
    canvas.height = height * fontSize * scale;
    const ctx = canvas.getContext("2d")!;

    const frames: string[] = [];

    const delays = Array(gifFrames.length).fill(100);

    const renderFrame = (frameIndex: number): string => {
      const frameAscii = gifFrames[frameIndex];
      const frameLines = frameAscii.split("\n");
      
      ctx.fillStyle = invertBrightness ? "#FFFFFF" : "#0D0D0D";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = `${fontSize * scale}px JetBrains Mono, monospace`;
      ctx.fillStyle = invertBrightness ? "#000000" : "#00FF41";
      ctx.textBaseline = "top";
      
      frameLines.forEach((line, y) => {
        ctx.fillText(line, 0, y * fontSize * scale);
      });
      
      return canvas.toDataURL("image/png");
    };

    try {
      for (let i = 0; i < gifFrames.length; i++) {
        frames.push(renderFrame(i));
      }

      const link = document.createElement("a");
      link.download = "ascii-animation.gif";
      link.href = frames[0];
      link.click();

      toast.success(t("saved"));
    } catch {
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