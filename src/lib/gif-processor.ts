import { parseGIF, decompressFrames } from "gifuct-js";
import { MAX_GIF_FRAMES, MAX_GIF_TOTAL_PIXELS, MAX_IMAGE_PIXELS } from "./security";

export interface GifFrame {
  imageData: ImageData;
  delay: number;
}

export interface GifProcessingResult {
  success: boolean;
  frames?: GifFrame[];
  error?: string;
}

function resizeImageIfNeeded(
  img: HTMLImageElement,
  maxPixels: number
): HTMLCanvasElement {
  const { width, height } = img;
  const currentPixels = width * height;
  
  if (currentPixels <= maxPixels) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    return canvas;
  }
  
  const scale = Math.sqrt(maxPixels / currentPixels);
  const newWidth = Math.floor(width * scale);
  const newHeight = Math.floor(height * scale);
  
  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  
  return canvas;
}

export async function extractGifFrames(
  dataUrl: string,
  targetWidth: number
): Promise<GifProcessingResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    const timeout = setTimeout(() => {
      resolve({ success: false, error: "GIF processing timed out" });
    }, 10000);
    
    img.onload = () => {
      try {
        if (img.width * img.height > MAX_IMAGE_PIXELS) {
          clearTimeout(timeout);
          resolve({ 
            success: false, 
            error: `Image too large (max ${Math.round(MAX_IMAGE_PIXELS / 1000000)}MP)` 
          });
          return;
        }
        
        const gifData = atob(dataUrl.split(",")[1]);
        const bytes = new Uint8Array(gifData.length);
        for (let i = 0; i < gifData.length; i++) {
          bytes[i] = gifData.charCodeAt(i);
        }

        const gif = parseGIF(bytes.buffer as ArrayBuffer);
        const frames = decompressFrames(gif, true);

        if (!frames || frames.length === 0) {
          clearTimeout(timeout);
          const fallback = createFrameFromImage(img, targetWidth);
          resolve({ success: true, frames: [fallback] });
          return;
        }

        if (frames.length > MAX_GIF_FRAMES) {
          clearTimeout(timeout);
          resolve({ 
            success: false, 
            error: `Too many frames (${frames.length}, max ${MAX_GIF_FRAMES})` 
          });
          return;
        }

        let totalPixels = 0;
        for (const frame of frames) {
          totalPixels += frame.dims.width * frame.dims.height;
        }
        
        if (totalPixels > MAX_GIF_TOTAL_PIXELS) {
          clearTimeout(timeout);
          resolve({ 
            success: false, 
            error: "GIF too complex" 
          });
          return;
        }

        const resizedCanvas = resizeImageIfNeeded(img, MAX_IMAGE_PIXELS);
        const gifWidth = resizedCanvas.width;
        const gifHeight = resizedCanvas.height;
        const aspectRatio = gifWidth / gifHeight;
        const targetHeight = Math.round(targetWidth / aspectRatio / 2);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d")!;
        
        ctx.fillStyle = "#0D0D0D";
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        const result: GifFrame[] = [];
        const maxFrames = Math.min(frames.length, MAX_GIF_FRAMES);

        for (let i = 0; i < maxFrames; i++) {
          const frame = frames[i];
          
          const patchCanvas = document.createElement("canvas");
          patchCanvas.width = gifWidth;
          patchCanvas.height = gifHeight;
          const patchCtx = patchCanvas.getContext("2d")!;

          patchCtx.fillStyle = "#0D0D0D";
          patchCtx.fillRect(0, 0, patchCanvas.width, patchCanvas.height);

          const imgData = patchCtx.createImageData(
            frame.dims.width,
            frame.dims.height
          );
          imgData.data.set(frame.patch);
          patchCtx.putImageData(imgData, frame.dims.left, frame.dims.top);

          if (frame.disposalType === 2) {
            ctx.fillStyle = "#0D0D0D";
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }

          ctx.drawImage(
            patchCanvas,
            0,
            0,
            targetWidth,
            targetHeight
          );

          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          result.push({
            imageData,
            delay: Math.max(frame.delay || 100, 50),
          });
        }

        clearTimeout(timeout);
        resolve({ success: true, frames: result });
      } catch {
        clearTimeout(timeout);
        const fallback = createFrameFromImage(img, targetWidth);
        resolve({ success: true, frames: [fallback] });
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve({ success: false, error: "Failed to load GIF" });
    };
    
    img.src = dataUrl;
  });
}

function createFrameFromImage(img: HTMLImageElement, targetWidth: number): GifFrame {
  const aspectRatio = img.width / img.height;
  const targetHeight = Math.round(targetWidth / aspectRatio / 2);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

  return { imageData, delay: 100 };
}