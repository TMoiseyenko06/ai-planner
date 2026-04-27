import { useState, useEffect, useCallback } from "react";
import { Task } from "../types/task";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const refreshTasks = useCallback(async () => {
    const fetched = await fetchTasks();
    setTasks(fetched);
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const addTask = async (task: Task) => {
    const saved = await createTask(task);
    setTasks((prev) => [...prev, saved]);
  };

  const patchTask = async (id: string, patch: Partial<Task>) => {
    const updated = await updateTask(id, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const removeTask = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, addTask, patchTask, removeTask, refreshTasks };
}
