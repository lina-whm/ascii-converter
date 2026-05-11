interface ASCIIBoxProps {
  lines: string[];
  className?: string;
  fontSize?: string;
}

export function ASCIIBox({ lines, className = "", fontSize = "12px" }: ASCIIBoxProps) {
  const maxLen = Math.max(...lines.map((l) => l.length));
  const horizontal = "─".repeat(maxLen + 2);
  
  const parts: string[] = [];
  parts.push("┌" + horizontal + "┐");
  for (const line of lines) {
    parts.push("│ " + line + " ".repeat(maxLen - line.length) + " │");
  }
  parts.push("└" + horizontal + "┘");

  return (
    <span className={className} style={{ 
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: fontSize,
      lineHeight: "1.2",
      color: "#00FF41",
    }}>
      {parts.map((part, i) => (
        <span key={i}>{part}{i < parts.length - 1 ? <br /> : null}</span>
      ))}
    </span>
  );
}