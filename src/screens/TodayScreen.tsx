import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Task, List } from "../types/task";
import { resolveEffectiveBucket } from "../utils/bucketResolver";
import TaskCard from "../components/TaskCard";
import TaskRow from "../components/TaskRow";
import BottomNav from "../components/BottomNav";
import ListToggle from "../components/ListToggle";

interface Props {
  tasks: Task[];
  patchTask: (id: string, patch: Partial<Task>) => Promise<void>;
  activeList: List;
  onChangeList: (list: List) => void;
}

export default function TodayScreen({
  tasks,
  patchTask,
  activeList,
  onChangeList,
}: Props) {
  const navigate = useNavigate();
  const [doneExpanded, setDoneExpanded] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  const complete = (id: string) =>
    patchTask(id, { completed: true, completed_at: new Date().toISOString() });

  const listTasks = tasks.filter(
    (t) => (t.list ?? "personal") === activeList
  );

  const activeTasks = listTasks.filter((t) => {
    if (t.completed) return false;
    if (t.snoozed_until && new Date(t.snoozed_until) > now) return false;
    return true;
  });

  // In exhausted mode: only tasks explicitly tagged low, or untagged (backward compat)
  const visibleTasks = exhausted
    ? activeTasks.filter((t) => !t.energy || t.energy === "low")
    : activeTasks;

  const doneTodayTasks = listTasks.filter(
    (t) => t.completed && t.completed_at && t.completed_at.startsWith(today)
  );

  const nowTasks = visibleTasks.filter(
    (t) => resolveEffectiveBucket(t) === "now"
  );
  const nextTasks = visibleTasks.filter(
    (t) => resolveEffectiveBucket(t) === "next"
  );
  const laterTasks = visibleTasks.filter(
    (t) => resolveEffectiveBucket(t) === "later"
  );

  const [primaryNow, ...stackedNow] = nowTasks;

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hiddenCount = exhausted ? activeTasks.length - visibleTasks.length : 0;

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-8 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today</h1>
          <p className="text-sm text-brand-gray mt-0.5">{dateLabel}</p>
        </div>
        <button
          onClick={() => navigate("/logs")}
          aria-label="View logs"
          className="p-2 -mr-1 text-brand-gray/40 rounded-xl active:bg-brand-gray-light active:text-brand-gray"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <ListToggle value={activeList} onChange={onChangeList} />

      {exhausted ? (
        <div className="mx-4 mb-4 rounded-2xl bg-brand-green-light px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-green">Low energy mode</p>
            {hiddenCount > 0 && (
              <p className="text-xs text-brand-green/70 mt-0.5">
                {hiddenCount} higher-energy task{hiddenCount !== 1 ? "s" : ""} hidden
              </p>
            )}
          </div>
          <button
            onClick={() => setExhausted(false)}
            className="text-xs font-semibold text-brand-green underline underline-offset-2"
          >
            Clear
          </button>
        </div>
      ) : (
        <button
          onClick={() => setExhausted(true)}
          className="mx-4 mb-4 w-[calc(100%-2rem)] py-2.5 rounded-2xl border-2 border-brand-gray/20 text-brand-gray text-sm font-semibold active:bg-brand-gray-light"
        >
          I'm exhausted — show easy tasks only
        </button>
      )}

      {nowTasks.length > 0 && (
        <section className="px-4 mb-6">
          <p className="text-xs font-bold text-brand-coral uppercase tracking-widest mb-3">
            Now
          </p>
          {primaryNow && (
            <TaskCard
              task={primaryNow}
              onComplete={() => complete(primaryNow.id)}
            />
          )}
          {stackedNow.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={() => complete(task.id)}
            />
          ))}
        </section>
      )}

      {nextTasks.length > 0 && (
        <section className="px-4 mb-6">
          <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-2">
            Next
          </p>
          {nextTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={() => complete(task.id)}
            />
          ))}
        </section>
      )}

      {laterTasks.length > 0 && (
        <section className="px-4 mb-6">
          <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-2">
            Later
          </p>
          {laterTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={() => complete(task.id)}
            />
          ))}
        </section>
      )}

      {doneTodayTasks.length > 0 && (
        <section className="px-4 mb-6">
          <button
            onClick={() => setDoneExpanded((x) => !x)}
            className="flex items-center gap-2 text-xs font-bold text-brand-gray uppercase tracking-widest mb-2"
          >
            Done today ({doneTodayTasks.length})
            <span className="text-brand-gray/60">
              {doneExpanded ? "▲" : "▼"}
            </span>
          </button>
          {doneExpanded &&
            doneTodayTasks.map((task) => (
              <TaskRow key={task.id} task={task} showCompletedTime />
            ))}
        </section>
      )}

      {visibleTasks.length === 0 && doneTodayTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-16 px-8 text-center">
          <p className="text-2xl font-bold text-gray-200">
            {exhausted ? "No easy tasks right now" : "All clear"}
          </p>
          <p className="text-sm text-brand-gray mt-2">
            {exhausted
              ? "Everything left needs more energy. Rest first."
              : "Head to Dump to capture new tasks."}
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
