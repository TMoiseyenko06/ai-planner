import fs from "fs";
import path from "path";
import { Task } from "./types";

const DATA_FILE = process.env.DATA_FILE ?? "/data/tasks.json";

export function readTasks(): Task[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function writeTasks(tasks: Task[]): void {
  fs.mkdirSync(path.dirname(path.resolve(DATA_FILE)), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}
