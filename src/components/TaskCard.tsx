import { useNavigate } from "react-router-dom";
import { Task } from "../types/task";
import ContextTag from "./ContextTag";
import EnergyTag from "./EnergyTag";
import { formatMinutes } from "../utils/dateHelpers";

interface Props {
  task: Task;
  onComplete: () => void;
}

export default function TaskCard({ task, onComplete }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-brand-coral-light border border-brand-coral/20 p-5 mb-3">
      <div className="flex items-start gap-3 mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          aria-label="Complete task"
          className="mt-1 w-6 h-6 rounded-full border-2 border-brand-coral flex-shrink-0 flex items-center justify-center"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ContextTag context={task.context} />
            {task.energy && <EnergyTag energy={task.energy} />}
            {task.estimated_minutes !== null && (
              <span className="text-xs text-brand-coral font-semibold">
                {formatMinutes(task.estimated_minutes)}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 leading-snug">
            {task.title}
          </h3>
        </div>
      </div>

      {task.note && (
        <p className="text-sm text-gray-600 mb-4 bg-white/70 rounded-xl p-3 leading-relaxed">
          {task.note}
        </p>
      )}

      {task.steps.length > 0 && (
        <div className="mb-4 space-y-1">
          {task.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-brand-coral mt-0.5">&#x2022;</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate(`/focus/${task.id}`)}
        className="w-full py-3 rounded-xl bg-brand-coral text-white font-semibold text-base active:opacity-80 transition-opacity"
      >
        Start focus mode
      </button>
    </div>
  );
}
