import { Task } from "../types/task";

const BASE = "/api/tasks";

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(BASE);
  return res.json();
}

export async function createTask(task: Task): Promise<Task> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function updateTask(
  id: string,
  patch: Partial<Task>
): Promise<Task> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  await fetch(`${BASE}/${id}`, { method: "DELETE" });
}
