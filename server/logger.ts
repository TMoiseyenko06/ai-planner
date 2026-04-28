export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

const MAX = 500;
const buffer: LogEntry[] = [];

export function log(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
  buffer.push(entry);
  if (buffer.length > MAX) buffer.shift();

  const prefix = `[${level.toUpperCase()}]`;
  if (level === "error") console.error(prefix, message, data ?? "");
  else if (level === "warn") console.warn(prefix, message, data ?? "");
  else console.log(prefix, message, data ?? "");
}

export function getLogs(): LogEntry[] {
  return [...buffer].reverse();
}

export function clearLogs(): void {
  buffer.length = 0;
}
