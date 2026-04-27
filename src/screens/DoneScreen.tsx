import { Task } from "../types/task";
import ContextTag from "../components/ContextTag";
import BottomNav from "../components/BottomNav";
import { formatDate, formatTime } from "../utils/dateHelpers";

interface Props {
  tasks: Task[];
}

export default function DoneScreen({ tasks }: Props) {
  const doneTasks = tasks
    .filter((t) => t.completed && t.completed_at)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    );

  const grouped = doneTasks.reduce<Record<string, Task[]>>((acc, task) => {
    const day = task.completed_at!.split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(task);
    return acc;
  }, {});

  const days = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Done</h1>
      </header>

      {days.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
          <p className="text-2xl font-bold text-gray-200">Nothing yet</p>
          <p className="text-sm text-brand-gray mt-2">
            Completed tasks show up here.
          </p>
        </div>
      )}

      <div className="px-4">
        {days.map((day) => (
          <section key={day} className="mb-8">
            <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-3">
              {formatDate(day)}
            </p>
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              {grouped[day].map((task, idx) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    idx < grouped[day].length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-brand-green flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-gray-500 line-through truncate">
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.completed_at && (
                      <span className="text-xs text-brand-gray">
                        {formatTime(task.completed_at)}
                      </span>
                    )}
                    <ContextTag context={task.context} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
