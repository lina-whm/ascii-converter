import { parseGIF, decompressFrames } from "gifuct-js";

export interface GifFrame {
  imageData: ImageData;
  delay: number;
}

export async function extractGifFrames(
  dataUrl: string,
  targetWidth: number
): Promise<GifFrame[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const gifData = atob(dataUrl.split(",")[1]);
        const bytes = new Uint8Array(gifData.length);
        for (let i = 0; i < gifData.length; i++) {
          bytes[i] = gifData.charCodeAt(i);
        }

        const gif = parseGIF(bytes.buffer as ArrayBuffer);
        const frames = decompressFrames(gif, true);

        if (!frames || frames.length === 0) {
          resolve([createFrameFromImage(img, targetWidth)]);
          return;
        }

        const gifWidth = img.width;
        const gifHeight = img.height;
        const aspectRatio = gifWidth / gifHeight;
        const targetHeight = Math.round(targetWidth / aspectRatio / 2);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d")!;

        const result: GifFrame[] = [];

        for (const frame of frames) {
          const patchCanvas = document.createElement("canvas");
          patchCanvas.width = gifWidth;
          patchCanvas.height = gifHeight;
          const patchCtx = patchCanvas.getContext("2d")!;

          patchCtx.fillStyle = "transparent";
          patchCtx.fillRect(0, 0, patchCanvas.width, patchCanvas.height);

          const imgData = patchCtx.createImageData(
            frame.dims.width,
            frame.dims.height
          );
          imgData.data.set(frame.patch);
          patchCtx.putImageData(imgData, frame.dims.left, frame.dims.top);

          ctx.clearRect(0, 0, targetWidth, targetHeight);
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
            delay: frame.delay || 100,
          });
        }

        resolve(result);
      } catch {
        resolve([createFrameFromImage(img, targetWidth)]);
      }
    };
    img.onerror = () => reject(new Error("Failed to load GIF"));
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