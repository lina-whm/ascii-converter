export type ColorMode = "green" | "white" | "gray" | "original";

export interface AsciiSettings {
  width: number;
  charset: string;
  invertBrightness: boolean;
  fontSize: number;
  smoothing: boolean;
  colorMode: ColorMode;
}

export interface AsciiChar {
  char: string;
  color: string;
}

export interface AsciiLine {
  chars: AsciiChar[];
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
  colorMode: "green",
};

export const COLOR_MODES: { value: ColorMode; label: string; color: string }[] = [
  { value: "green", label: "Terminal Green", color: "#00FF41" },
  { value: "white", label: "White", color: "#FFFFFF" },
  { value: "gray", label: "Grayscale", color: "#888888" },
  { value: "original", label: "Original Colors", color: "#FF0000" },
];

function getCharForBrightness(
  brightness: number,
  charset: string,
  invert: boolean
): string {
  const clamped = Math.max(0, Math.min(255, brightness));
  const normalized = invert ? 255 - clamped : clamped;
  const index = Math.floor((normalized / 255) * (charset.length - 1));
  return charset[index] || " ";
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function getGrayscale(r: number, g: number, b: number): number {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

function getColor(colorMode: ColorMode, r: number, g: number, b: number): string {
  switch (colorMode) {
    case "green":
      return "#00FF41";
    case "white":
      return "#FFFFFF";
    case "gray": {
      const gray = getGrayscale(r, g, b);
      const hex = gray.toString(16).padStart(2, "0");
      return `#${hex}${hex}${hex}`;
    }
    case "original":
      return rgbToHex(r, g, b);
    default:
      return "#00FF41";
  }
}

export function imageDataToAscii(
  imageData: ImageData,
  settings: AsciiSettings
): string {
  const { width: targetWidth, charset, invertBrightness, smoothing, colorMode } = settings;
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
      const brightness = getGrayscale(r, g, b);
      result += getCharForBrightness(brightness, charset, invertBrightness);
    }
    if (y < targetHeight - 1) result += "\n";
  }
  
  return result;
}

export function imageDataToColoredAscii(
  imageData: ImageData,
  settings: AsciiSettings
): AsciiLine[] {
  const { width: targetWidth, charset, invertBrightness, smoothing, colorMode } = settings;
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
  
  const result: AsciiLine[] = [];
  
  for (let y = 0; y < targetHeight; y++) {
    const line: AsciiLine = { chars: [] };
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = getGrayscale(r, g, b);
      const char = getCharForBrightness(brightness, charset, invertBrightness);
      const color = getColor(colorMode, r, g, b);
      line.chars.push({ char, color });
    }
    result.push(line);
  }
  
  return result;
}

export function asciiToImage(
  ascii: string,
  fontSize: number,
  invert: boolean,
  charset: string,
  colorMode: ColorMode = "green",
  coloredData?: AsciiLine[]
): string {
  const lines = coloredData || ascii.split("\n").map((l) => ({
    chars: l.split("").map((c) => ({ char: c, color: "#00FF41" })),
  }));
  const height = lines.length;
  const width = Math.max(...lines.map((l) => l.chars.length));
  
  const canvas = document.createElement("canvas");
  canvas.width = width * fontSize * 0.6;
  canvas.height = height * fontSize;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = invert ? "#FFFFFF" : "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `${fontSize}px JetBrains Mono, monospace`;
  ctx.textBaseline = "top";
  
  if (colorMode === "original" && coloredData) {
    lines.forEach((line, y) => {
      let xPos = 0;
      line.chars.forEach(({ char, color }) => {
        ctx.fillStyle = color;
        ctx.fillText(char, xPos, y * fontSize);
        xPos += ctx.measureText(char).width;
      });
    });
  } else {
    const textColor = invert ? "#000000" : getColor(colorMode, 0, 255, 65).replace("#", "");
    ctx.fillStyle = invert ? "#000000" : "#00FF41";
    lines.forEach((line, y) => {
      if (typeof line === "string") {
        ctx.fillText(line, 0, y * fontSize);
      } else {
        let xPos = 0;
        line.chars.forEach(({ char, color }) => {
          ctx.fillStyle = color;
          ctx.fillText(char, xPos, y * fontSize);
          xPos += ctx.measureText(char).width;
        });
      }
    });
  }
  
  return canvas.toDataURL("image/png");
}