const MAX_LINES = 1000;
const lines: string[] = [];

function addLine(text: string): void {
  const stripped = text.replace(/\n$/, "");
  if (!stripped) return;
  const ts = new Date().toISOString().replace("T", " ").slice(0, 23);
  for (const line of stripped.split("\n")) {
    if (line.trim()) lines.push(`${ts}  ${line}`);
  }
  while (lines.length > MAX_LINES) lines.shift();
}

export function startCapture(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function tap(stream: NodeJS.WriteStream): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orig = (stream.write as any).bind(stream);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stream as any).write = (...args: any[]): boolean => {
      const chunk = args[0];
      const text =
        typeof chunk === "string"
          ? chunk
          : Buffer.isBuffer(chunk)
          ? chunk.toString("utf8")
          : "";
      addLine(text);
      return orig(...args);
    };
  }
  tap(process.stdout);
  tap(process.stderr);
}

export function getLogs(): string[] {
  return [...lines].reverse();
}

export function clearLogs(): void {
  lines.length = 0;
}
