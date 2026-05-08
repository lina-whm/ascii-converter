export const MAGIC_BYTES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46],
  webp: [0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50],
} as const;

export const MAX_FILE_SIZE = 30 * 1024 * 1024;

export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function getMimeFromExtension(filename: string): string | null {
  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeFromExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return extension ? mimeFromExt[extension] || null : null;
}

export function validateFileSync(file: File): { valid: boolean; error?: string; mimeType?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File too large (max 30MB)" };
  }
  
  const mimeType = getMimeFromExtension(file.name);
  if (!mimeType) {
    return { valid: false, error: "Invalid file extension" };
  }
  
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return { valid: false, error: "Unsupported file format" };
  }
  
  return { valid: true, mimeType };
}

export function sanitizeCharset(input: string): string {
  return input
    .slice(0, 20)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;");
}