import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context, List } from "../types/task";
import BottomNav from "../components/BottomNav";
import ListToggle from "../components/ListToggle";
import { useOrganizeDump } from "../hooks/useOrganizeDump";
import { formatRelativeTime } from "../utils/dateHelpers";

interface RawDump {
  id: string;
  text: string;
  context: Context | null;
  list: List;
  capturedAt: string;
}

function loadDumps(): RawDump[] {
  try {
    return JSON.parse(localStorage.getItem("rawDumps") ?? "[]");
  } catch {
    return [];
  }
}

function saveDumps(dumps: RawDump[]) {
  localStorage.setItem("rawDumps", JSON.stringify(dumps));
}

const CONTEXTS: { value: Context; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "desk", label: "Desk" },
  { value: "phone", label: "Phone" },
  { value: "errand", label: "Errand" },
];

interface Props {
  refreshTasks: () => Promise<void>;
  activeList: List;
}

export default function DumpScreen({ refreshTasks, activeList }: Props) {
  const navigate = useNavigate();
  const { organize, loading, error, setError } = useOrganizeDump(refreshTasks);

  const [text, setText] = useState("");
  const [selectedContext, setSelectedContext] = useState<Context | null>(null);
  const [selectedList, setSelectedList] = useState<List>(activeList);
  const [rawDumps, setRawDumps] = useState<RawDump[]>(loadDumps);

  const updateDumps = (dumps: RawDump[]) => {
    setRawDumps(dumps);
    saveDumps(dumps);
  };

  const handleOrganize = async () => {
    if (!text.trim()) return;
    const ok = await organize(text.trim(), selectedContext, selectedList);
    if (ok) {
      setText("");
      setSelectedContext(null);
      navigate("/");
    }
  };

  const handleSaveForLater = () => {
    if (!text.trim()) return;
    const dump: RawDump = {
      id: crypto.randomUUID(),
      text: text.trim(),
      context: selectedContext,
      list: selectedList,
      capturedAt: new Date().toISOString(),
    };
    updateDumps([...rawDumps, dump]);
    setText("");
    setSelectedContext(null);
  };

  const handleOrganizeDump = async (dump: RawDump) => {
    const ok = await organize(dump.text, dump.context, dump.list);
    if (ok) {
      updateDumps(rawDumps.filter((d) => d.id !== dump.id));
    }
  };

  const handleDiscardDump = (id: string) => {
    updateDumps(rawDumps.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Brain Dump</h1>
      </header>

      <ListToggle value={selectedList} onChange={setSelectedList} />

      <div className="px-4">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Dump everything — don't sort, just get it out"
          className="w-full h-44 rounded-2xl bg-brand-gray-light text-gray-900 p-4 text-base resize-none outline-none placeholder:text-brand-gray leading-relaxed"
          autoFocus
        />

        <div className="flex gap-2 mt-3 flex-wrap">
          {CONTEXTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                setSelectedContext((prev) => (prev === value ? null : value))
              }
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                selectedContext === value
                  ? "bg-brand-purple text-white border-brand-purple"
                  : "bg-white text-brand-gray border-brand-gray/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-sm text-brand-coral font-medium">{error}</p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSaveForLater}
            disabled={!text.trim()}
            className="flex-1 py-3.5 rounded-2xl border-2 border-brand-gray/25 text-brand-gray font-semibold text-base disabled:opacity-40"
          >
            Save for later
          </button>
          <button
            onClick={handleOrganize}
            disabled={!text.trim() || loading}
            className="flex-1 py-3.5 rounded-2xl bg-brand-purple text-white font-semibold text-base disabled:opacity-50 active:opacity-80"
          >
            {loading ? "Organizing…" : "Organize with AI"}
          </button>
        </div>

        {rawDumps.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-4">
              Not yet organized
            </p>
            <div className="space-y-3">
              {rawDumps.map((dump) => (
                <div
                  key={dump.id}
                  className="rounded-2xl bg-brand-amber-light border border-brand-amber/20 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-brand-amber flex-shrink-0" />
                    <span className="text-xs text-brand-amber font-medium">
                      {dump.list} &middot; not sorted yet &middot; captured{" "}
                      {formatRelativeTime(dump.capturedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3 leading-relaxed">
                    {dump.text}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOrganizeDump(dump)}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-brand-amber text-white text-sm font-semibold disabled:opacity-50"
                    >
                      Organize
                    </button>
                    <button
                      onClick={() => handleDiscardDump(dump.id)}
                      className="py-2 px-4 rounded-xl border border-brand-gray/30 text-brand-gray text-sm font-medium"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
