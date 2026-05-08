export function downloadTxt(content: string, filename: string = "ascii-art.txt") {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPng(ascii: string, filename: string = "ascii-art.png") {
  const lines = ascii.split("\n");
  const height = lines.length;
  const width = Math.max(...lines.map((l) => l.length));
  
  const fontSize = 10;
  const canvas = document.createElement("canvas");
  canvas.width = width * fontSize * 0.6;
  canvas.height = height * fontSize;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#0D0D0D";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `${fontSize}px JetBrains Mono, monospace`;
  ctx.fillStyle = "#00FF41";
  ctx.textBaseline = "top";
  
  lines.forEach((line, y) => {
    ctx.fillText(line, 0, y * fontSize);
  });
  
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}