import { Router, Request, Response } from "express";
import { readTasks, writeTasks } from "../data";
import { Task } from "../types";

const router = Router();

router.post("/organize", async (req: Request, res: Response) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const SYSTEM_PROMPT = `You are a task organizer for someone with ADHD.
Today's date is ${today}.

Given raw brain dump text, return ONLY a valid JSON array.
No explanation, no markdown fences, no wrapping object — just the array.

Each item in the array must have exactly these fields:
- title: string — concise, starts with an action verb
- bucket: "now" | "next" | "later"
- scheduled_date: "YYYY-MM-DD" or null
  Resolve ALL relative date references to exact dates:
  "tomorrow" → tomorrow's date, "in 2 days" → 2 days from today,
  "next friday" → the coming Friday, "this weekend" → the coming Saturday.
  If no time reference exists, return null.
- context: "home" | "desk" | "phone" | "errand" | "other"
- estimated_minutes: number or null
- steps: string[] — 2 to 4 sub-steps if the task is complex, otherwise empty array
- note: string or null — any context worth remembering about why this task exists`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemma-3-27b-it",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const raw = JSON.parse(content);
    const items: unknown[] = Array.isArray(raw)
      ? raw
      : (raw as { tasks?: unknown[] }).tasks ?? [];

    const tasks: Task[] = (items as Record<string, unknown>[]).map((item) => ({
      id: crypto.randomUUID(),
      title: String(item.title ?? "Untitled task"),
      bucket: (["now", "next", "later"].includes(String(item.bucket))
        ? item.bucket
        : "later") as Task["bucket"],
      scheduled_date:
        typeof item.scheduled_date === "string" ? item.scheduled_date : null,
      context: (["home", "desk", "phone", "errand", "other"].includes(
        String(item.context)
      )
        ? item.context
        : "other") as Task["context"],
      estimated_minutes:
        typeof item.estimated_minutes === "number"
          ? item.estimated_minutes
          : null,
      steps: Array.isArray(item.steps)
        ? (item.steps as unknown[]).map(String)
        : [],
      note: typeof item.note === "string" ? item.note : null,
      completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
      snoozed_until: null,
    }));

    const existing = readTasks();
    writeTasks([...existing, ...tasks]);

    res.json(tasks);
  } catch (_err) {
    res.status(500).json({ error: "organize failed" });
  }
});

export default router;
