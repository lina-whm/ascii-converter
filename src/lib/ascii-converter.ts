export type ColorMode = "green" | "white" | "gray" | "original";

export interface AsciiSettings {
  width: number;
  charset: string;
  invertBrightness: boolean;
  fontSize: number;
  smoothing: boolean;
  colorMode: ColorMode;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  grayscale: number;
  sepia: number;
  invert: number;
  threshold: number;
  sharpness: number;
  edgeDetection: number;
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  threshold: 128,
  sharpness: 0,
  edgeDetection: 0,
};

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
  alphanumeric: " .,:;i1tfLCG08@",
  minimal: " .oO",
  binary: "01",
  blocks: " ░▒▓█",
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

const CHAR_LOOKUP: string[] = [];
const CHAR_LOOKUP_INVERT: string[] = [];

function buildCharLookup() {
  if (CHAR_LOOKUP.length > 0) return;
  for (let i = 0; i <= 255; i++) {
    CHAR_LOOKUP[i] = String.fromCharCode(i);
    CHAR_LOOKUP_INVERT[i] = String.fromCharCode(255 - i);
  }
}
buildCharLookup();

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function getColor(colorMode: ColorMode, r: number, g: number, b: number): string {
  switch (colorMode) {
    case "green": return "#00FF41";
    case "white": return "#FFFFFF";
    case "gray": {
      const gray = (r * 4896 + g * 9632 + b * 1868) >> 14;
      const hex = gray.toString(16).padStart(2, "0");
      return `#${hex}${hex}${hex}`;
    }
    case "original": return rgbToHex(r, g, b);
    default: return "#00FF41";
  }
}

export function imageDataToAscii(
  imageData: ImageData,
  settings: AsciiSettings,
  adjustments: ImageAdjustments = DEFAULT_ADJUSTMENTS
): string {
  const { charset } = settings;
  const { width, height, data: pixels } = imageData;
  
  const charsetLen = charset.length;
  
  let result = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];

      if (adjustments.brightness !== 0) {
        const delta = adjustments.brightness * 2.55;
        r = Math.max(0, Math.min(255, r + delta));
        g = Math.max(0, Math.min(255, g + delta));
        b = Math.max(0, Math.min(255, b + delta));
      }

      if (adjustments.contrast !== 0) {
        const factor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
        r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
        g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
        b = Math.max(0, Math.min(255, factor * (b - 128) + 128));
      }

      const gray = (r * 4896 + g * 9632 + b * 1868) >> 14;
      const idx = (gray * (charsetLen - 1) + 127) >> 8;
      result += charset[idx] || " ";
    }
    if (y < height - 1) result += "\n";
  }

  return result;
}

export function imageDataToColoredAscii(
  imageData: ImageData,
  settings: AsciiSettings
): AsciiLine[] {
  const { charset, colorMode } = settings;
  const { width, height, data: pixels } = imageData;

  const useColored = colorMode === "original";
  
  if (!useColored) {
    const result: AsciiLine[] = [];
    for (let y = 0; y < height; y++) {
      const line: AsciiLine = { chars: [] };
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const gray = (pixels[i] * 4896 + pixels[i + 1] * 9632 + pixels[i + 2] * 1868) >> 14;
        const idx = (gray * (charset.length - 1) + 127) >> 8;
        line.chars.push({ char: charset[idx] || " ", color: getColor(colorMode, pixels[i], pixels[i + 1], pixels[i + 2]) });
      }
      result.push(line);
    }
    return result;
  }

  const result: AsciiLine[] = [];
  for (let y = 0; y < height; y++) {
    const line: AsciiLine = { chars: [] };
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const gray = (pixels[i] * 4896 + pixels[i + 1] * 9632 + pixels[i + 2] * 1868) >> 14;
      const idx = (gray * (charset.length - 1) + 127) >> 8;
      line.chars.push({ char: charset[idx] || " ", color: rgbToHex(pixels[i], pixels[i + 1], pixels[i + 2]) });
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
  _colorMode: ColorMode = "green",
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

  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = "top";

  lines.forEach((line, y) => {
    let xPos = 0;
    line.chars.forEach(({ char, color }) => {
      ctx.fillStyle = color;
      ctx.fillText(char, xPos, y * fontSize);
      xPos += ctx.measureText(char).width;
    });
  });

  return canvas.toDataURL("image/png");
}