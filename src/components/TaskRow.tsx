import { useNavigate } from "react-router-dom";
import { Task } from "../types/task";
import ContextTag from "./ContextTag";
import EnergyTag from "./EnergyTag";
import { formatMinutes, formatTime } from "../utils/dateHelpers";

interface Props {
  task: Task;
  onComplete?: () => void;
  showCompletedTime?: boolean;
}

export default function TaskRow({
  task,
  onComplete,
  showCompletedTime = false,
}: Props) {
  const navigate = useNavigate();
  const isDone = task.completed;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {onComplete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          aria-label={isDone ? "Completed" : "Complete task"}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            isDone ? "bg-brand-green border-brand-green" : "border-brand-gray"
          }`}
        >
          {isDone && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      )}

      <button
        onClick={() => !isDone && navigate(`/focus/${task.id}`)}
        disabled={isDone}
        className="flex-1 flex items-center gap-2 text-left min-w-0"
      >
        <span
          className={`flex-1 text-base truncate ${
            isDone ? "line-through text-brand-gray" : "text-gray-900"
          }`}
        >
          {task.title}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {showCompletedTime && task.completed_at && (
            <span className="text-xs text-brand-gray">
              {formatTime(task.completed_at)}
            </span>
          )}
          {task.energy && !showCompletedTime && (
            <EnergyTag energy={task.energy} />
          )}
          {task.estimated_minutes !== null && !showCompletedTime && (
            <span className="text-xs text-brand-gray font-medium bg-brand-gray-light rounded-full px-2 py-0.5">
              {formatMinutes(task.estimated_minutes)}
            </span>
          )}
          <ContextTag context={task.context} />
        </div>
      </button>
    </div>
  );
}
