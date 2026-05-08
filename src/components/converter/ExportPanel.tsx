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
}

export function ExportPanel({ ascii, isGif, canExport }: ExportPanelProps) {
  const t = useTranslations("export");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ascii);
      toast.success(t("copied"));
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownloadTxt = () => {
    downloadTxt(ascii);
  };

  const handleDownloadPng = () => {
    downloadPng(ascii);
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

        {isGif && (
          <button
            type="button"
            disabled
            className="btn-secondary text-xs flex items-center justify-center gap-1 opacity-50"
            title="Coming soon"
          >
            <Film className="w-3 h-3" />
            {t("downloadGif")}
          </button>
        )}
      </div>
    </div>
  );
}