import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Task } from "../types/task";
import StepList from "../components/StepList";
import ContextTag from "../components/ContextTag";
import { formatElapsed, formatMinutes } from "../utils/dateHelpers";

interface Props {
  tasks: Task[];
  patchTask: (id: string, patch: Partial<Task>) => Promise<void>;
}

export default function FocusScreen({ tasks, patchTask }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const task = tasks.find((t) => t.id === id);

  const [elapsed, setElapsed] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>([]);

  useEffect(() => {
    if (task) {
      setCheckedSteps(new Array(task.steps.length).fill(false));
    }
  }, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-gray text-lg">Task not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-brand-purple text-sm font-semibold"
          >
            Back to Today
          </button>
        </div>
      </div>
    );
  }

  const allStepsDone =
    task.steps.length > 0 && checkedSteps.every(Boolean);

  const handleDone = async () => {
    await patchTask(task.id, {
      completed: true,
      completed_at: new Date().toISOString(),
    });
    navigate("/");
  };

  const handleSnooze = async () => {
    await patchTask(task.id, {
      snoozed_until: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    navigate("/");
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center px-4 pt-8 pb-2 flex-shrink-0">
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
        <div className="ml-auto font-mono text-xl text-brand-gray tabular-nums">
          {formatElapsed(elapsed)}
        </div>
      </div>

      <div className="flex-1 px-4 pt-2 pb-4 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ContextTag context={task.context} size="md" />
          {task.estimated_minutes !== null && (
            <span className="text-sm text-brand-gray font-medium">
              {formatMinutes(task.estimated_minutes)}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-6">
          {task.title}
        </h1>

        {task.steps.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-4">
              Steps
            </p>
            <StepList
              steps={task.steps}
              checked={checkedSteps}
              onToggle={toggleStep}
            />
          </div>
        )}

        {task.note && (
          <div className="rounded-2xl bg-brand-gray-light p-4">
            <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-2">
              Note
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              {task.note}
            </p>
          </div>
        )}
      </div>

      <div className="px-4 pb-10 pt-2 flex gap-3 flex-shrink-0 border-t border-gray-100">
        <button
          onClick={handleSnooze}
          className="flex-1 py-4 rounded-2xl border-2 border-brand-gray/25 text-brand-gray font-semibold text-base active:bg-brand-gray-light transition-colors"
        >
          Snooze 10 min
        </button>
        <button
          onClick={handleDone}
          className={`flex-1 py-4 rounded-2xl font-semibold text-base text-white transition-all active:opacity-80 ${
            allStepsDone
              ? "bg-brand-green animate-pulse-gentle"
              : "bg-brand-purple"
          }`}
        >
          Done
        </button>
      </div>
    </div>
  );
}
