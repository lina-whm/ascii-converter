"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { FileUploader } from "@/components/converter/FileUploader";
import { SettingsPanel } from "@/components/converter/SettingsPanel";
import { AdjustmentsPanel } from "@/components/converter/AdjustmentsPanel";
import { AsciiPreview } from "@/components/converter/AsciiPreview";
import { ExportPanel } from "@/components/converter/ExportPanel";
import { AsciiSettings, DEFAULT_SETTINGS, imageDataToAscii, imageDataToColoredAscii, AsciiLine, ImageAdjustments } from "@/lib/ascii-converter";
import { extractGifFrames } from "@/lib/gif-processor";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  file: File;
  dataUrl: string;
  isGif: boolean;
  settings: AsciiSettings;
  adjustments: ImageAdjustments;
  ascii: string;
  coloredAscii?: AsciiLine[];
  gifFrames?: string[];
  coloredGifFrames?: AsciiLine[][];
  gifDelays?: number[];
}

export default function Home() {
  const { settings, adjustments, updateSettings, updateAdjustments } = useSettings();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [gifFrames, setGifFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const animationRef = useRef<number | null>(null);

  // Console welcome message
  useEffect(() => {
    console.log(
      "%c🚀 ASCII Converter v1.0",
      "color: #00FF41; font-weight: bold; font-size: 16px;"
    );
    console.log(
      "%c🔒 All files are processed locally. No pixel leaves your browser.",
      "color: #888; font-size: 12px;"
    );
    console.log(
      "%c📂 Source code: https://github.com/lina-whm/ascii-converter",
      "color: #888; font-size: 12px;"
    );
  }, []);

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
  const currentAdjustments = activeFile?.adjustments || adjustments;
  const currentAscii = activeFile?.ascii || "";

  const convertToAscii = useCallback(
    async (dataUrl: string, convertSettings: AsciiSettings, imgAdjustments: ImageAdjustments): Promise<{ ascii: string; colored: AsciiLine[]; settings: AsciiSettings }> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

          const aspectRatio = img.width / img.height;
          const targetWidth = convertSettings.width;
          const targetHeight = Math.round(targetWidth / aspectRatio / 2);

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          ctx.imageSmoothingEnabled = convertSettings.smoothing;
          ctx.imageSmoothingQuality = "high";

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          const settings = { ...convertSettings, width: targetWidth };
          const ascii = imageDataToAscii(imageData, settings, imgAdjustments);
          const colored = imageDataToColoredAscii(imageData, settings);
          resolve({ ascii, colored, settings });
        };
        img.onerror = () => resolve({ ascii: "", colored: [], settings: convertSettings });
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
      let coloredAscii: AsciiLine[] = [];
      let gifFrames: string[] | undefined;
      let coloredGifFrames: AsciiLine[][] | undefined;
      let gifDelays: number[] | undefined;

      if (isGif) {
        const result = await extractGifFrames(dataUrl, newSettings.width);
        
        if (!result.success || !result.frames) {
          setIsConverting(false);
          toast.error(result.error || "Failed to process GIF");
          return;
        }
        
        const frames = result.frames;
        gifFrames = frames.map((frame) => imageDataToAscii(frame.imageData, newSettings, adjustments));
        coloredGifFrames = frames.map((frame) => imageDataToColoredAscii(frame.imageData, newSettings));
        gifDelays = frames.map((frame) => frame.delay);
        ascii = gifFrames[0] || "";
        coloredAscii = coloredGifFrames[0] || [];
      } else {
        const result = await convertToAscii(dataUrl, newSettings, adjustments);
        ascii = result.ascii;
        coloredAscii = result.colored;
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
        adjustments,
        ascii,
        coloredAscii,
        gifFrames,
        coloredGifFrames,
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
    [files.length, settings, adjustments, convertToAscii]
  );

  const handleAdjustmentsChange = useCallback(
    async (newAdjustments: Partial<ImageAdjustments>) => {
      const updated = { ...currentAdjustments, ...newAdjustments };

      if (activeFile) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === activeFileId ? { ...f, adjustments: updated } : f
          )
        );
      } else {
        updateAdjustments(newAdjustments);
      }

      if (activeFile?.dataUrl) {
        setIsConverting(true);

        if (activeFile.isGif) {
          const result = await extractGifFrames(activeFile.dataUrl, activeFile.settings.width);
          
          if (!result.success || !result.frames) {
            setIsConverting(false);
            toast.error(result.error || "Failed to process GIF");
            return;
          }
          
          const frames = result.frames;
          const frameWidth = frames[0].imageData.width;
          const settingsWithWidth = { ...activeFile.settings, width: frameWidth };
          const newGifFrames = frames.map((frame) => imageDataToAscii(frame.imageData, settingsWithWidth, updated));
          const newColoredGifFrames = frames.map((frame) => imageDataToColoredAscii(frame.imageData, settingsWithWidth));
          const newGifDelays = frames.map((frame) => frame.delay);
          
          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeFileId 
                ? { ...f, ascii: newGifFrames[0], coloredAscii: newColoredGifFrames[0], gifFrames: newGifFrames, coloredGifFrames: newColoredGifFrames, gifDelays: newGifDelays, adjustments: updated } 
                : f
            )
          );
          setGifFrames(newGifFrames);
          setCurrentFrame(0);
        } else {
          const result = await convertToAscii(activeFile.dataUrl, activeFile.settings, updated);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeFileId ? { ...f, ascii: result.ascii, coloredAscii: result.colored, adjustments: updated } : f
            )
          );
        }

        setIsConverting(false);
      }
    },
    [activeFile, activeFileId, currentAdjustments, convertToAscii, updateAdjustments]
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
          const result = await extractGifFrames(activeFile.dataUrl, updated.width);
          
          if (!result.success || !result.frames) {
            setIsConverting(false);
            toast.error(result.error || "Failed to process GIF");
            return;
          }
          
          const frames = result.frames;
          const frameWidth = frames[0].imageData.width;
          const settingsWithWidth = { ...updated, width: frameWidth };
          const newGifFrames = frames.map((frame) => imageDataToAscii(frame.imageData, settingsWithWidth, activeFile.adjustments));
          const newColoredGifFrames = frames.map((frame) => imageDataToColoredAscii(frame.imageData, settingsWithWidth));
          const newGifDelays = frames.map((frame) => frame.delay);
          
          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeFileId 
                ? { ...f, ascii: newGifFrames[0], coloredAscii: newColoredGifFrames[0], gifFrames: newGifFrames, coloredGifFrames: newColoredGifFrames, gifDelays: newGifDelays, settings: settingsWithWidth } 
                : f
            )
          );
          setGifFrames(newGifFrames);
          setCurrentFrame(0);
        } else {
          const result = await convertToAscii(activeFile.dataUrl, updated, activeFile.adjustments);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeFileId ? { ...f, ascii: result.ascii, coloredAscii: result.colored, settings: result.settings } : f
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
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    const delays = activeFile?.gifDelays || gifFrames.map(() => 80);
    let frameIndex = 0;

    const animate = (time: number) => {
      const delay = delays[frameIndex] || 80;
      if (time - lastTime >= delay) {
        frameIndex = (frameIndex + 1) % gifFrames.length;
        setCurrentFrame(frameIndex);
        lastTime = time;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, gifFrames, activeFile?.gifDelays, isTabVisible]);

  // Cleanup on unmount - intentionally runs only once
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        clearTimeout(animationRef.current);
      }
      files.forEach((f) => {
        if (f.dataUrl.startsWith("data:")) {
          URL.revokeObjectURL(f.dataUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 min-h-0 flex flex-col">
      <div className="max-w-6xl mx-auto w-full min-h-0 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="space-y-4">
            <FileUploader onFileLoad={handleFileLoad} />
            
            <SettingsPanel
              settings={currentSettings}
              onSettingsChange={handleSettingsChange}
            />

            <AdjustmentsPanel
              adjustments={currentAdjustments}
              onAdjustmentsChange={handleAdjustmentsChange}
            />
            
            {activeFile && (
              <ExportPanel
                ascii={currentAscii}
                isGif={activeFile.isGif}
                canExport={!!currentAscii}
                gifFrames={activeFile.gifFrames}
                coloredGifFrames={activeFile.coloredGifFrames}
                fontSize={currentSettings.fontSize}
                invertBrightness={currentSettings.invertBrightness}
                gifDelays={activeFile.gifDelays}
                colorMode={currentSettings.colorMode}
                coloredAscii={activeFile.coloredAscii}
              />
            )}
          </div>

          <div className="lg:col-span-2 min-h-[300px] lg:min-h-0">
            <AsciiPreview
              ascii={currentAscii}
              settings={currentSettings}
              isLoading={isConverting}
              isGif={activeFile?.isGif}
              gifFrames={gifFrames}
              coloredFrames={activeFile?.coloredGifFrames}
              coloredAscii={activeFile?.coloredAscii}
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