const BLOCKED_IP_PATTERNS = [
  /^10\./i,
  /^172\.(1[6-9]|2\d|3[01])\./i,
  /^192\.168\./i,
  /^127\./i,
  /^0\.0\.0\.0$/i,
  /^169\.254\./i,
  /^224\./i,
  /^239\./i,
  /^::1$/i,
  /^fc00:/i,
  /^fd00:/i,
  /^fe80:/i,
  /^ff00:/i,
];

function isPrivateIP(ip: string): boolean {
  return BLOCKED_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

function isValidHostname(hostname: string): boolean {
  const invalidHostnames = [
    "localhost",
    "localhost.localdomain",
    "metadata.google.internal",
    "metadata.internal",
    "169.254.169.254",
    "metadata.azure.com",
    "metadata.cloud.internal",
  ];
  
  if (invalidHostnames.includes(hostname.toLowerCase())) {
    return false;
  }
  
  try {
    const ipParts = hostname.split(".").map(Number);
    if (ipParts.length === 4 && ipParts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
      return !isPrivateIP(hostname);
    }
  } catch {
    return true;
  }
  
  return true;
}

export async function validateUrl(urlString: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const parsed = new URL(urlString);
    
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "Only HTTP and HTTPS protocols are allowed" };
    }
    
    const hostname = parsed.hostname;
    
    if (!isValidHostname(hostname)) {
      return { valid: false, error: "This URL points to a private or protected address" };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

export function sanitizeCharset(input: string): string {
  return input
    .slice(0, 20)
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code <= 126;
    })
    .join("");
}

export const MAX_IMAGE_PIXELS = 1920 * 1920;
export const MAX_GIF_FRAMES = 500;
export const MAX_GIF_TOTAL_PIXELS = 100_000_000;

export function validateImageDimensions(width: number, height: number): boolean {
  return width * height <= MAX_IMAGE_PIXELS;
}

export function validateGifFrames(
  frameCount: number,
  totalPixels: number
): { valid: boolean; error?: string } {
  if (frameCount > MAX_GIF_FRAMES) {
    return { valid: false, error: `GIF has too many frames (max ${MAX_GIF_FRAMES})` };
  }
  
  if (totalPixels > MAX_GIF_TOTAL_PIXELS) {
    return { valid: false, error: "GIF is too complex (max 100 million pixels total)" };
  }
  
  return { valid: true };
}