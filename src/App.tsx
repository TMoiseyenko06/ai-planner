import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTasks } from "./hooks/useTasks";
import { List } from "./types/task";
import TodayScreen from "./screens/TodayScreen";
import FocusScreen from "./screens/FocusScreen";
import DumpScreen from "./screens/DumpScreen";
import WeekScreen from "./screens/WeekScreen";
import DoneScreen from "./screens/DoneScreen";
import LogsScreen from "./screens/LogsScreen";

function loadList(): List {
  const saved = localStorage.getItem("activeList");
  return saved === "work" || saved === "personal" ? saved : "personal";
}

export default function App() {
  const { tasks, patchTask, refreshTasks } = useTasks();
  const [activeList, setActiveList] = useState<List>(loadList);

  const changeList = (list: List) => {
    setActiveList(list);
    localStorage.setItem("activeList", list);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <TodayScreen
              tasks={tasks}
              patchTask={patchTask}
              activeList={activeList}
              onChangeList={changeList}
            />
          }
        />
        <Route
          path="/focus/:id"
          element={<FocusScreen tasks={tasks} patchTask={patchTask} />}
        />
        <Route
          path="/dump"
          element={
            <DumpScreen
              refreshTasks={refreshTasks}
              activeList={activeList}
              tasks={tasks}
            />
          }
        />
        <Route
          path="/week"
          element={
            <WeekScreen
              tasks={tasks}
              activeList={activeList}
              onChangeList={changeList}
            />
          }
        />
        <Route
          path="/done"
          element={
            <DoneScreen
              tasks={tasks}
              activeList={activeList}
              onChangeList={changeList}
            />
          }
        />
        <Route path="/logs" element={<LogsScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
