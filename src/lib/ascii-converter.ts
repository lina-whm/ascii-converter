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

export const CHARSET_OPTIONS: { value: string; label: string; chars: string }[] = [
  { value: DEFAULT_CHARSETS.classic, label: "Classic", chars: DEFAULT_CHARSETS.classic },
  { value: DEFAULT_CHARSETS.dense, label: "Dense", chars: DEFAULT_CHARSETS.dense },
  { value: DEFAULT_CHARSETS.braille, label: "Braille", chars: DEFAULT_CHARSETS.braille },
  { value: DEFAULT_CHARSETS.alphanumeric, label: "Alphanumeric", chars: DEFAULT_CHARSETS.alphanumeric },
  { value: DEFAULT_CHARSETS.minimal, label: "Minimal", chars: DEFAULT_CHARSETS.minimal },
  { value: DEFAULT_CHARSETS.binary, label: "Binary", chars: DEFAULT_CHARSETS.binary },
  { value: DEFAULT_CHARSETS.blocks, label: "Blocks", chars: DEFAULT_CHARSETS.blocks },
];

function adjustContrast(value: number, contrast: number): number {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  return Math.max(0, Math.min(255, factor * (value - 128) + 128));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function applyAdjustments(
  r: number, g: number, b: number,
  adjustments: ImageAdjustments
): [number, number, number] {
  let { brightness, contrast, saturation, hue, grayscale, sepia, invert, threshold, sharpness, edgeDetection } = adjustments;

  brightness = brightness / 100 * 255;
  
  r += brightness;
  g += brightness;
  b += brightness;

  r = adjustContrast(r, contrast);
  g = adjustContrast(g, contrast);
  b = adjustContrast(b, contrast);

  if (saturation !== 0 || hue !== 0) {
    let [h, s, l] = rgbToHsl(r, g, b);
    s = Math.max(0, Math.min(100, s + saturation));
    h = (h + hue) % 360;
    if (h < 0) h += 360;
    [r, g, b] = hslToRgb(h, s, l);
  }

  if (grayscale > 0) {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const amount = grayscale / 100;
    r = Math.round(r + (gray - r) * amount);
    g = Math.round(g + (gray - g) * amount);
    b = Math.round(b + (gray - b) * amount);
  }

  if (sepia > 0) {
    const amount = sepia / 100;
    const newR = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
    const newG = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
    const newB = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
    r = Math.round(r + (newR - r) * amount);
    g = Math.round(g + (newG - g) * amount);
    b = Math.round(b + (newB - b) * amount);
  }

  if (invert > 0) {
    const amount = invert / 100;
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);
  }

  return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
}

function getGrayscale(r: number, g: number, b: number): number {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

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
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
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

function applySharpen(pixels: Uint8ClampedArray, width: number, height: number, amount: number): Uint8ClampedArray {
  if (amount === 0) return pixels;

  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  const factor = amount / 10;

  const result = new Uint8ClampedArray(pixels.length);
  result.set(pixels);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += pixels[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * width + x) * 4 + c;
        result[idx] = Math.round(pixels[idx] * (1 - factor) + sum * factor);
      }
    }
  }

  return result;
}

function applyEdgeDetection(pixels: Uint8ClampedArray, width: number, height: number, amount: number): Uint8ClampedArray {
  if (amount === 0) return pixels;

  const kernel = [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1
  ];
  const factor = amount / 10;

  const result = new Uint8ClampedArray(pixels.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += getGrayscale(pixels[idx], pixels[idx + 1], pixels[idx + 2]) * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * width + x) * 4 + c;
        result[idx] = Math.min(255, Math.max(0, Math.round(128 + sum * factor)));
        result[idx + 1] = result[idx];
        result[idx + 2] = result[idx];
        result[idx + 3] = 255;
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        result[idx] = pixels[idx];
        result[idx + 1] = pixels[idx + 1];
        result[idx + 2] = pixels[idx + 2];
        result[idx + 3] = 255;
      }
    }
  }

  return result;
}

function applyThreshold(pixels: Uint8ClampedArray, width: number, height: number, threshold: number): Uint8ClampedArray {
  const result = new Uint8ClampedArray(pixels.length);

  for (let i = 0; i < pixels.length; i += 4) {
    const gray = getGrayscale(pixels[i], pixels[i + 1], pixels[i + 2]);
    const value = gray >= threshold ? 255 : 0;
    result[i] = value;
    result[i + 1] = value;
    result[i + 2] = value;
    result[i + 3] = 255;
  }

  return result;
}

export function imageDataToAscii(
  imageData: ImageData,
  settings: AsciiSettings,
  adjustments: ImageAdjustments = DEFAULT_ADJUSTMENTS
): string {
  const { charset, invertBrightness, smoothing } = settings;
  const srcWidth = imageData.width;
  const srcHeight = imageData.height;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = srcWidth;
  tempCanvas.height = srcHeight;
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

  ctx.drawImage(srcCanvas, 0, 0, srcWidth, srcHeight);

  let pixels = ctx.getImageData(0, 0, srcWidth, srcHeight).data;

  if (adjustments.threshold < 128) {
    pixels = applyThreshold(new Uint8ClampedArray(pixels), srcWidth, srcHeight, adjustments.threshold);
  } else {
    for (let i = 0; i < pixels.length; i += 4) {
      let [r, g, b] = applyAdjustments(
        pixels[i], pixels[i + 1], pixels[i + 2],
        adjustments
      );
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
    }
  }

  if (adjustments.sharpness > 0) {
    pixels = applySharpen(pixels, srcWidth, srcHeight, adjustments.sharpness);
  }

  if (adjustments.edgeDetection > 0) {
    pixels = applyEdgeDetection(pixels, srcWidth, srcHeight, adjustments.edgeDetection);
  }

  let result = "";
  for (let y = 0; y < srcHeight; y++) {
    for (let x = 0; x < srcWidth; x++) {
      const i = (y * srcWidth + x) * 4;
      const brightness = getGrayscale(pixels[i], pixels[i + 1], pixels[i + 2]);
      result += getCharForBrightness(brightness, charset, invertBrightness);
    }
    if (y < srcHeight - 1) result += "\n";
  }

  return result;
}

export function imageDataToColoredAscii(
  imageData: ImageData,
  settings: AsciiSettings,
  adjustments: ImageAdjustments = DEFAULT_ADJUSTMENTS
): AsciiLine[] {
  const { charset, invertBrightness, smoothing, colorMode } = settings;
  const srcWidth = imageData.width;
  const srcHeight = imageData.height;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = srcWidth;
  tempCanvas.height = srcHeight;
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

  ctx.drawImage(srcCanvas, 0, 0, srcWidth, srcHeight);

  let pixels = ctx.getImageData(0, 0, srcWidth, srcHeight).data;

  if (adjustments.threshold < 128) {
    pixels = applyThreshold(new Uint8ClampedArray(pixels), srcWidth, srcHeight, adjustments.threshold);
  } else {
    for (let i = 0; i < pixels.length; i += 4) {
      let [r, g, b] = applyAdjustments(
        pixels[i], pixels[i + 1], pixels[i + 2],
        adjustments
      );
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
    }
  }

  if (adjustments.sharpness > 0) {
    pixels = applySharpen(pixels, srcWidth, srcHeight, adjustments.sharpness);
  }

  if (adjustments.edgeDetection > 0) {
    pixels = applyEdgeDetection(pixels, srcWidth, srcHeight, adjustments.edgeDetection);
  }

  const result: AsciiLine[] = [];

  for (let y = 0; y < srcHeight; y++) {
    const line: AsciiLine = { chars: [] };
    for (let x = 0; x < srcWidth; x++) {
      const i = (y * srcWidth + x) * 4;
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