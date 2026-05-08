"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { FileUploader } from "@/components/converter/FileUploader";
import { SettingsPanel } from "@/components/converter/SettingsPanel";
import { AsciiPreview } from "@/components/converter/AsciiPreview";
import { ExportPanel } from "@/components/converter/ExportPanel";
import { AsciiSettings, DEFAULT_SETTINGS, imageDataToAscii } from "@/lib/ascii-converter";
import { extractGifFrames } from "@/lib/gif-processor";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  file: File;
  dataUrl: string;
  isGif: boolean;
  settings: AsciiSettings;
  ascii: string;
  gifFrames?: string[];
  gifDelays?: number[];
}

export default function Home() {
  const { settings, updateSettings } = useSettings();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [gifFrames, setGifFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const animationRef = useRef<number | null>(null);

  // Pause animation when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setIsTabVisible(visible);
      if (!visible) {
        setIsPlaying(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const activeFile = files.find((f) => f.id === activeFileId);
  const currentSettings = activeFile?.settings || settings;
  const currentAscii = activeFile?.ascii || "";

  useEffect(() => {
    if (activeFile?.isGif && activeFile.gifFrames) {
      setGifFrames(activeFile.gifFrames);
      setCurrentFrame(0);
      setIsPlaying(true);
    } else {
      setGifFrames([]);
      setIsPlaying(false);
    }
  }, [activeFile?.gifFrames]);

  const convertToAscii = useCallback(
    async (dataUrl: string, convertSettings: AsciiSettings): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          
          const aspectRatio = img.width / img.height;
          const targetWidth = convertSettings.width;
          const targetHeight = Math.round(targetWidth / aspectRatio / 2);
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          if (convertSettings.smoothing) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
          } else {
            ctx.imageSmoothingEnabled = false;
          }
          
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          const ascii = imageDataToAscii(imageData, convertSettings);
          resolve(ascii);
        };
        img.onerror = () => resolve("");
        img.src = dataUrl;
      });
    },
    []
  );

  const handleFileLoad = useCallback(
    async (file: File, dataUrl: string, isGif: boolean) => {
      const id = `${file.name}-${Date.now()}`;
      const newSettings = { ...settings, charset: settings.charset || DEFAULT_SETTINGS.charset };
      
      setIsConverting(true);

      let ascii = "";
      let gifFrames: string[] | undefined;
      let gifDelays: number[] | undefined;

      if (isGif) {
        const frames = await extractGifFrames(dataUrl, newSettings.width);
        gifFrames = frames.map((frame) => imageDataToAscii(frame.imageData, newSettings));
        gifDelays = frames.map((frame) => frame.delay);
        ascii = gifFrames[0] || "";
      } else {
        ascii = await convertToAscii(dataUrl, newSettings);
      }

      setIsConverting(false);

      if (files.length >= 5) {
        setFiles((prev) => prev.slice(1));
      }

      const newFile: FileItem = {
        id,
        file,
        dataUrl,
        isGif,
        settings: newSettings,
        ascii,
        gifFrames,
        gifDelays,
      };

      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(id);

      if (isGif && gifFrames) {
        setGifFrames(gifFrames);
        setCurrentFrame(0);
        setIsPlaying(true);
      }
    },
    [files.length, settings, convertToAscii]
  );

  const handleSettingsChange = useCallback(
    async (newSettings: Partial<AsciiSettings>) => {
      const updated = { ...currentSettings, ...newSettings };
      
      if (activeFile) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === activeFileId ? { ...f, settings: updated } : f
          )
        );
      } else {
        updateSettings(newSettings);
      }

      if (activeFile?.dataUrl) {
        setIsConverting(true);

        if (activeFile.isGif) {
          const frames = await extractGifFrames(activeFile.dataUrl, updated.width);
          const newGifFrames = frames.map((frame) => imageDataToAscii(frame.imageData, updated));
          const newGifDelays = frames.map((frame) => frame.delay);
          
          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeFileId 
                ? { ...f, ascii: newGifFrames[0], gifFrames: newGifFrames, gifDelays: newGifDelays, settings: updated } 
                : f
            )
          );
          setGifFrames(newGifFrames);
          setCurrentFrame(0);
        } else {
          const ascii = await convertToAscii(activeFile.dataUrl, updated);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeFileId ? { ...f, ascii, settings: updated } : f
            )
          );
        }

        setIsConverting(false);
      }
    },
    [activeFile, activeFileId, currentSettings, convertToAscii, updateSettings]
  );

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        if (fileToRemove.dataUrl.startsWith("data:")) {
          URL.revokeObjectURL(fileToRemove.dataUrl);
        }
      }
      const remaining = prev.filter((f) => f.id !== id);
      if (activeFileId === id) {
        setActiveFileId(remaining[0]?.id || null);
        setGifFrames([]);
        setIsPlaying(false);
      }
      return remaining;
    });
  }, [activeFileId]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleFrameChange = useCallback((frame: number) => {
    setCurrentFrame(frame);
  }, []);

  useEffect(() => {
    if (!isPlaying || gifFrames.length <= 1 || !isTabVisible) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let lastTime = performance.now();
    const delays = activeFile?.gifDelays || Array(gifFrames.length).fill(100);
    let frameIndex = 0;

    const animate = (time: number) => {
      const delay = delays[frameIndex] || 100;
      if (time - lastTime >= delay) {
        frameIndex = (frameIndex + 1) % gifFrames.length;
        setCurrentFrame(frameIndex);
        lastTime = time;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, gifFrames.length, activeFile?.gifDelays, isTabVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      files.forEach((f) => {
        if (f.dataUrl.startsWith("data:")) {
          URL.revokeObjectURL(f.dataUrl);
        }
      });
    };
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-4">
            <FileUploader onFileLoad={handleFileLoad} />
            
            <SettingsPanel
              settings={currentSettings}
              onSettingsChange={handleSettingsChange}
            />
            
            {activeFile && (
              <ExportPanel
                ascii={currentAscii}
                isGif={activeFile.isGif}
                canExport={!!currentAscii}
                gifFrames={activeFile.gifFrames}
                fontSize={currentSettings.fontSize}
                invertBrightness={currentSettings.invertBrightness}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            <AsciiPreview
              ascii={currentAscii}
              settings={currentSettings}
              isLoading={isConverting}
              isGif={activeFile?.isGif}
              gifFrames={gifFrames}
              currentFrame={currentFrame}
              isPlaying={isPlaying}
              onFrameChange={handleFrameChange}
              onPlayPause={handlePlayPause}
            />
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <ImagePlus className="w-4 h-4" />
                <span>Files:</span>
              </div>
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 border rounded text-xs whitespace-nowrap",
                    activeFileId === file.id
                      ? "border-[var(--accent-green)] text-[var(--accent-green)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  )}
                >
                  <span className="max-w-[100px] truncate">{file.file.name}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        handleRemoveFile(file.id);
                      }
                    }}
                    className="text-[var(--text-muted)] hover:text-[var(--error)] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}