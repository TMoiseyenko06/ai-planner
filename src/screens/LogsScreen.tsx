import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function LogsScreen() {
  const navigate = useNavigate();
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      const data: string[] = await res.json();
      setLines(data);
    } catch {
      // keep stale data
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
    setLines([]);
    setClearing(false);
  };

  const lineColor = (line: string): string => {
    if (line.includes("[ERROR]")) return "text-red-400";
    if (line.includes("[WARN ") || line.includes("[WARN]")) return "text-yellow-400";
    return "text-green-300";
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-8 pb-3 border-b border-white/10 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="text-gray-400 p-2 -ml-2 rounded-xl active:bg-white/10"
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
          <h1 className="text-base font-bold text-white font-mono">
            server logs
          </h1>
          {!loading && (
            <p className="text-xs text-gray-500 font-mono">{lines.length} lines</p>
          )}
        </div>
        <button
          onClick={fetchLogs}
          aria-label="Refresh"
          className="p-2 text-gray-400 rounded-xl active:bg-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 9a8 8 0 0 1 14.93-2M20 15a8 8 0 0 1-14.93 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {lines.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="text-xs font-mono text-gray-400 px-3 py-1.5 rounded-lg border border-white/10 active:bg-white/10 disabled:opacity-40"
          >
            clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && (
          <p className="text-gray-500 font-mono text-xs py-8 text-center">loading…</p>
        )}
        {!loading && lines.length === 0 && (
          <p className="text-gray-600 font-mono text-xs py-8 text-center">
            no log output yet
          </p>
        )}
        {!loading && lines.length > 0 && (
          <div className="space-y-0.5">
            {lines.map((line, i) => (
              <p
                key={i}
                className={`font-mono text-xs leading-5 whitespace-pre-wrap break-all ${lineColor(line)}`}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
