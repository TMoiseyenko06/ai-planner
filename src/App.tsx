import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTasks } from "./hooks/useTasks";
import TodayScreen from "./screens/TodayScreen";
import FocusScreen from "./screens/FocusScreen";
import DumpScreen from "./screens/DumpScreen";
import WeekScreen from "./screens/WeekScreen";
import DoneScreen from "./screens/DoneScreen";
import LogsScreen from "./screens/LogsScreen";

export default function App() {
  const { tasks, patchTask, refreshTasks } = useTasks();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<TodayScreen tasks={tasks} patchTask={patchTask} />}
        />
        <Route
          path="/focus/:id"
          element={<FocusScreen tasks={tasks} patchTask={patchTask} />}
        />
        <Route
          path="/dump"
          element={<DumpScreen refreshTasks={refreshTasks} />}
        />
        <Route path="/week" element={<WeekScreen tasks={tasks} />} />
        <Route path="/done" element={<DoneScreen tasks={tasks} />} />
        <Route path="/logs" element={<LogsScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
