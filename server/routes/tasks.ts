import { Router, Request, Response } from "express";
import { readTasks, writeTasks } from "../data";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json(readTasks());
});

router.post("/", (req: Request, res: Response) => {
  const tasks = readTasks();
  const task = { ...req.body, id: req.body.id ?? crypto.randomUUID() };
  tasks.push(task);
  writeTasks(tasks);
  res.status(201).json(task);
});

router.put("/:id", (req: Request, res: Response) => {
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "not found" });
    return;
  }
  tasks[idx] = { ...tasks[idx], ...req.body };
  writeTasks(tasks);
  res.json(tasks[idx]);
});

router.delete("/:id", (req: Request, res: Response) => {
  const tasks = readTasks().filter((t) => t.id !== req.params.id);
  writeTasks(tasks);
  res.status(204).end();
});

export default router;
