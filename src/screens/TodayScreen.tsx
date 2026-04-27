import { useState } from "react";
import { Task } from "../types/task";
import { resolveEffectiveBucket } from "../utils/bucketResolver";
import TaskCard from "../components/TaskCard";
import TaskRow from "../components/TaskRow";
import BottomNav from "../components/BottomNav";

interface Props {
  tasks: Task[];
  patchTask: (id: string, patch: Partial<Task>) => Promise<void>;
}

export default function TodayScreen({ tasks, patchTask }: Props) {
  const [doneExpanded, setDoneExpanded] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  const complete = (id: string) =>
    patchTask(id, { completed: true, completed_at: new Date().toISOString() });

  const activeTasks = tasks.filter((t) => {
    if (t.completed) return false;
    if (t.snoozed_until && new Date(t.snoozed_until) > now) return false;
    return true;
  });

  const doneTodayTasks = tasks.filter(
    (t) =>
      t.completed &&
      t.completed_at &&
      t.completed_at.startsWith(today)
  );

  const nowTasks = activeTasks.filter(
    (t) => resolveEffectiveBucket(t) === "now"
  );
  const nextTasks = activeTasks.filter(
    (t) => resolveEffectiveBucket(t) === "next"
  );
  const laterTasks = activeTasks.filter(
    (t) => resolveEffectiveBucket(t) === "later"
  );

  const [primaryNow, ...stackedNow] = nowTasks;

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Today</h1>
        <p className="text-sm text-brand-gray mt-0.5">{dateLabel}</p>
      </header>

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
              <TaskRow
                key={task.id}
                task={task}
                showCompletedTime
              />
            ))}
        </section>
      )}

      {activeTasks.length === 0 && doneTodayTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
          <p className="text-2xl font-bold text-gray-200">All clear</p>
          <p className="text-sm text-brand-gray mt-2">
            Head to Dump to capture new tasks.
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
