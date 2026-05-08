export interface AsciiSettings {
  width: number;
  charset: string;
  invertBrightness: boolean;
  fontSize: number;
  smoothing: boolean;
}

export const DEFAULT_CHARSETS = {
  dense: "█▓▒░ ",
  classic: " .:-=+*#%@",
  braille: " ⣿⣾⣽⣻⢿⡿⣟⣯⣷",
} as const;

export const DEFAULT_SETTINGS: AsciiSettings = {
  width: 150,
  charset: DEFAULT_CHARSETS.classic,
  invertBrightness: false,
  fontSize: 8,
  smoothing: true,
};

export function getCharForBrightness(
  brightness: number,
  charset: string,
  invert: boolean
): string {
  const clamped = Math.max(0, Math.min(255, brightness));
  const normalized = invert ? 255 - clamped : clamped;
  const index = Math.floor((normalized / 255) * (charset.length - 1));
  return charset[index] || " ";
}

export function imageDataToAscii(
  imageData: ImageData,
  settings: AsciiSettings
): string {
  const { width: targetWidth, charset, invertBrightness, smoothing } = settings;
  const srcWidth = imageData.width;
  const srcHeight = imageData.height;
  
  const aspectRatio = srcWidth / srcHeight;
  const targetHeight = Math.round(targetWidth / aspectRatio / 2);
  
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  const ctx = tempCanvas.getContext("2d")!;
  
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = srcWidth;
  srcCanvas.height = srcHeight;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.putImageData(imageData, 0, 0);
  
  if (smoothing) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  } else {
    ctx.imageSmoothingEnabled = false;
  }
  
  ctx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight);
  
  const scaledData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const pixels = scaledData.data;
  
  let result = "";
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      result += getCharForBrightness(brightness, charset, invertBrightness);
    }
    if (y < targetHeight - 1) result += "\n";
  }
  
  return result;
}

export function asciiToImage(
  ascii: string,
  fontSize: number,
  invert: boolean,
  charset: string
): string {
  const lines = ascii.split("\n");
  const height = lines.length;
  const width = lines.reduce((max, line) => Math.max(max, line.length), 0);
  
  const canvas = document.createElement("canvas");
  canvas.width = width * fontSize * 0.6;
  canvas.height = height * fontSize;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = invert ? "#FFFFFF" : "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `${fontSize}px JetBrains Mono, monospace`;
  ctx.fillStyle = invert ? "#000000" : "#00FF41";
  ctx.textBaseline = "top";
  
  lines.forEach((line, y) => {
    ctx.fillText(line, 0, y * fontSize);
  });
  
  return canvas.toDataURL("image/png");
}