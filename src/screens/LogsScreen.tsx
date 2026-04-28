import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../utils/dateHelpers";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

const LEVEL_STYLES: Record<LogLevel, string> = {
  info: "bg-brand-gray-light text-brand-gray",
  warn: "bg-brand-amber-light text-brand-amber",
  error: "bg-brand-coral-light text-brand-coral",
};

export default function LogsScreen() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      const data: LogEntry[] = await res.json();
      setLogs(data);
    } catch {
      // keep stale data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClear = async () => {
    setClearing(true);
    await fetch("/api/logs", { method: "DELETE" });
    setLogs([]);
    setClearing(false);
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const errorCount = logs.filter((l) => l.level === "error").length;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center gap-3 px-4 pt-8 pb-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="text-brand-gray p-2 -ml-2 rounded-xl active:bg-brand-gray-light"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Server Logs</h1>
          {!loading && (
            <p className="text-xs text-brand-gray mt-0.5">
              {logs.length} entries
              {errorCount > 0 && (
                <span className="text-brand-coral font-semibold">
                  {" "}· {errorCount} error{errorCount !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={fetchLogs}
          aria-label="Refresh"
          className="p-2 text-brand-gray rounded-xl active:bg-brand-gray-light"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4v5h5M20 20v-5h-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 9a8 8 0 0 1 14.93-2M20 15a8 8 0 0 1-14.93 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {logs.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="text-xs font-semibold text-brand-gray px-3 py-1.5 rounded-xl border border-brand-gray/25 active:bg-brand-gray-light disabled:opacity-40"
          >
            Clear
          </button>
        )}
      </div>

      <div className="px-4 py-4">
        {loading && (
          <p className="text-brand-gray text-sm text-center py-12">
            Loading…
          </p>
        )}

        {!loading && logs.length === 0 && (
          <p className="text-brand-gray text-sm text-center py-12">
            No log entries yet.
          </p>
        )}

        {!loading && logs.length > 0 && (
          <div className="space-y-2">
            {logs.map((entry) => {
              const isOpen = expanded.has(entry.id);
              const hasData = entry.data !== undefined;
              return (
                <div
                  key={entry.id}
                  className="rounded-xl border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => hasData && toggleExpanded(entry.id)}
                    disabled={!hasData}
                    className="w-full flex items-start gap-3 px-3 py-3 text-left"
                  >
                    <span
                      className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 ${
                        LEVEL_STYLES[entry.level]
                      }`}
                    >
                      {entry.level}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-snug break-words">
                        {entry.message}
                      </p>
                      <p className="text-xs text-brand-gray mt-0.5 tabular-nums">
                        {formatTime(entry.timestamp)}
                      </p>
                    </div>
                    {hasData && (
                      <span className="text-brand-gray/40 text-xs flex-shrink-0 mt-1">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    )}
                  </button>

                  {isOpen && hasData && (
                    <pre className="px-3 pb-3 text-xs text-brand-gray bg-brand-gray-light overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                      {JSON.stringify(entry.data, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
