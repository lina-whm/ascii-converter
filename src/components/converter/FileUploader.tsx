"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload, Link, Image, X } from "lucide-react";
import { toast } from "sonner";
import { validateFileSync, ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/validators";
import { validateUrl } from "@/lib/security";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileLoad: (file: File, dataUrl: string, isGif: boolean) => void;
}

export function FileUploader({ onFileLoad }: FileUploaderProps) {
  const t = useTranslations("upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      const validation = validateFileSync(file);
      if (!validation.valid || !validation.mimeType) {
        toast.error(t("error.invalid"));
        return;
      }

      if (!ALLOWED_TYPES.includes(validation.mimeType)) {
        toast.error(t("error.invalid"));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(t("error.size"));
        return;
      }

      const isGif = validation.mimeType === "image/gif";
      const reader = new FileReader();

      reader.onload = () => {
        onFileLoad(file, reader.result as string, isGif);
      };

      reader.onerror = () => {
        toast.error(t("error.parse"));
      };

      reader.readAsDataURL(file);
    },
    [onFileLoad, t]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await processFile(file);
      }
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await processFile(file);
      }
      e.target.value = "";
    },
    [processFile]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            await processFile(file);
            return;
          }
        }
      }
    },
    [processFile]
  );

  const handleUrlLoad = useCallback(async () => {
    if (!urlInput.trim()) return;

    setIsLoading(true);
    try {
      const urlValidation = await validateUrl(urlInput);
      if (!urlValidation.valid) {
        toast.error(urlValidation.error || "Invalid URL");
        setIsLoading(false);
        return;
      }

      const response = await fetch(urlInput, {
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const mimeType = blob.type;

      if (!ALLOWED_TYPES.includes(mimeType)) {
        toast.error(t("error.invalid"));
        setIsLoading(false);
        return;
      }

      const file = new File([blob], "url-image", { type: mimeType });
      const reader = new FileReader();

      reader.onload = () => {
        const isGif = mimeType === "image/gif";
        onFileLoad(file, reader.result as string, isGif);
        setShowUrlInput(false);
        setUrlInput("");
        setIsLoading(false);
      };

      reader.onerror = () => {
        toast.error(t("error.parse"));
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("Failed to fetch") || message.includes("CORS") || message.includes("NetworkError")) {
        toast.error("CORS error: Cannot load image from this URL. Try downloading the image first.");
      } else {
        toast.error(t("error.parse"));
      }
      setIsLoading(false);
    }
  }, [urlInput, onFileLoad, t]);

  return (
    <div
      className={cn(
        "drop-zone p-4 rounded-lg cursor-pointer",
        isDragOver && "drag-over"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onPaste={handlePaste}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3 text-center">
        <Upload className="w-10 h-10 text-[var(--accent-green)]" />
        <div>
          <p className="text-sm font-medium">{t("dropTitle")}</p>
          <p className="text-xs text-[var(--text-muted)]">{t("dropSubtitle")}</p>
        </div>
        <p className="text-xs text-[var(--text-muted)]">{t("supported")}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
        <button
          type="button"
          className="w-full text-xs text-[var(--text-secondary)] hover:text-[var(--accent-green)] flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.read().then(async () => {
              const items = await navigator.clipboard.read();
              for (const item of items) {
                for (const type of item.types) {
                  if (type.startsWith("image/")) {
                    const blob = await item.getType(type);
                    const file = new File([blob], "clipboard-image", { type });
                    await processFile(file);
                    return;
                  }
                }
              }
            }).catch(() => {
              toast.info(t("paste"));
            });
          }}
        >
          <Image className="w-4 h-4" />
          {t("paste")}
        </button>

        <button
          type="button"
          className="w-full text-xs text-[var(--text-secondary)] hover:text-[var(--accent-orange)] flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            setShowUrlInput(!showUrlInput);
          }}
        >
          <Link className="w-4 h-4" />
          {t("url")}
        </button>

        {showUrlInput && (
          <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t("urlPlaceholder")}
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={handleUrlLoad}
              disabled={isLoading || !urlInput.trim()}
              className="btn-primary text-xs"
            >
              {t("loadBtn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}