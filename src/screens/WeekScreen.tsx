import { useNavigate } from "react-router-dom";
import { Task, List } from "../types/task";
import ContextTag from "../components/ContextTag";
import BottomNav from "../components/BottomNav";
import ListToggle from "../components/ListToggle";
import { getNext7Days, getDayLabel, formatMinutes } from "../utils/dateHelpers";

interface Props {
  tasks: Task[];
  activeList: List;
  onChangeList: (list: List) => void;
}

function WeekTaskItem({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left mb-2 p-2.5 rounded-xl bg-brand-gray-light active:bg-brand-purple-light transition-colors"
    >
      <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">
        {task.title}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <ContextTag context={task.context} />
        {task.estimated_minutes !== null && (
          <span className="text-xs text-brand-gray">
            {formatMinutes(task.estimated_minutes)}
          </span>
        )}
      </div>
    </button>
  );
}

export default function WeekScreen({ tasks, activeList, onChangeList }: Props) {
  const navigate = useNavigate();
  const days = getNext7Days();
  const today = days[0];

  const listTasks = tasks.filter(
    (t) => !t.completed && (t.list ?? "personal") === activeList
  );
  const scheduled = listTasks.filter((t) => t.scheduled_date !== null);
  const unscheduled = listTasks.filter((t) => t.scheduled_date === null);

  const tasksByDay = (day: string) =>
    scheduled.filter((t) => t.scheduled_date === day);

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Week</h1>
      </header>

      <ListToggle value={activeList} onChange={onChangeList} />

      <div className="overflow-x-auto pb-4">
        <div
          className="flex gap-3 px-4"
          style={{ width: "max-content", minWidth: "100%" }}
        >
          {days.map((day) => {
            const dayTasks = tasksByDay(day);
            const isToday = day === today;
            return (
              <div key={day} className="w-40 flex-shrink-0">
                <div
                  className={`text-center mb-3 pb-2 border-b ${
                    isToday ? "border-brand-purple" : "border-gray-100"
                  }`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-widest ${
                      isToday ? "text-brand-purple" : "text-brand-gray"
                    }`}
                  >
                    {getDayLabel(day)}
                  </p>
                </div>
                {dayTasks.length > 0 ? (
                  dayTasks.map((task) => (
                    <WeekTaskItem
                      key={task.id}
                      task={task}
                      onClick={() => navigate(`/focus/${task.id}`)}
                    />
                  ))
                ) : (
                  <p className="text-xs text-brand-gray/50 text-center mt-4">—</p>
                )}
              </div>
            );
          })}

          {unscheduled.length > 0 && (
            <div className="w-40 flex-shrink-0">
              <div className="text-center mb-3 pb-2 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gray">
                  Unscheduled
                </p>
              </div>
              {unscheduled.map((task) => (
                <WeekTaskItem
                  key={task.id}
                  task={task}
                  onClick={() => navigate(`/focus/${task.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
