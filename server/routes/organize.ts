import { Router, Request, Response } from "express";
import { readTasks, writeTasks } from "../data";
import { Task } from "../types";

const router = Router();

router.post("/organize", async (req: Request, res: Response) => {
  const { text, list, existingTasks } = req.body;
  const taskList: "work" | "personal" =
    list === "work" || list === "personal" ? list : "personal";

  if (!text || typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const hasExisting =
    Array.isArray(existingTasks) && existingTasks.length > 0;

  const SYSTEM_PROMPT = hasExisting
    ? `You are a task organizer for someone with ADHD.
Today's date is ${today}.

The user gives you two things:
1. CURRENT TASKS — their active task list as JSON
2. BRAIN DUMP — raw new thoughts, updates, and reminders

Reconcile the dump against the current tasks and return a JSON object with exactly these three keys:
{
  "create": [ ...new task objects... ],
  "update": [ { "id": "...", ...only the changed fields... } ],
  "delete": [ "id1", "id2", ... ]
}

Rules:
- If the dump mentions something new that is NOT already in current tasks → add to "create"
- If the dump changes, reschedules, or adds detail to an existing task → add to "update" with only the fields that changed plus the id
- If the dump says something is cancelled, already done, or no longer needed → add its id to "delete"
- Do NOT create duplicates of existing tasks
- If nothing belongs in a list use []

Each object in "create" must have:
- title: string — concise, starts with an action verb
- bucket: "now" | "next" | "later"
- scheduled_date: "YYYY-MM-DD" or null — resolve ALL relative dates ("tomorrow", "next friday", "this weekend", etc.)
- context: "home" | "desk" | "phone" | "errand" | "other"
- estimated_minutes: number or null
- steps: string[] — 2–4 sub-steps if complex, otherwise []
- note: string or null`
    : `You are a task organizer for someone with ADHD.
Today's date is ${today}.

Given raw brain dump text, return a JSON object with a single key "tasks" whose value is an array.
Example shape: {"tasks": [{...}, {...}]}

Each item in the array must have exactly these fields:
- title: string — concise, starts with an action verb
- bucket: "now" | "next" | "later"
- scheduled_date: "YYYY-MM-DD" or null — resolve ALL relative dates ("tomorrow", "next friday", "this weekend", etc.)
- context: "home" | "desk" | "phone" | "errand" | "other"
- estimated_minutes: number or null
- steps: string[] — 2–4 sub-steps if complex, otherwise []
- note: string or null`;

  const userMessage = hasExisting
    ? `CURRENT TASKS:\n${JSON.stringify(existingTasks, null, 2)}\n\nBRAIN DUMP:\n${text}`
    : text;

  console.log(
    `[INFO ] Organize: ${text.length} chars, ${hasExisting ? (existingTasks as unknown[]).length : 0} existing tasks`
  );

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
            { role: "user", content: userMessage },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      console.error(`[ERROR] OpenRouter HTTP ${response.status}: ${body}`);
      throw new Error(`OpenRouter HTTP ${response.status}`);
    }

    const data = await response.json();
    const content: string = data.choices[0].message.content;
    console.log(`[INFO ] OpenRouter raw: ${content.slice(0, 400)}`);

    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(content);
    } catch (parseErr) {
      console.error(`[ERROR] JSON parse failed. Full content: ${content}`);
      throw parseErr;
    }

    const allTasks = readTasks();

    if (hasExisting) {
      // Three-way reconcile: create / update / delete
      const toCreate: Record<string, unknown>[] = Array.isArray(raw.create)
        ? (raw.create as Record<string, unknown>[])
        : [];
      const toUpdate: Record<string, unknown>[] = Array.isArray(raw.update)
        ? (raw.update as Record<string, unknown>[])
        : [];
      const toDelete = new Set<string>(
        Array.isArray(raw.delete) ? (raw.delete as string[]) : []
      );

      // Apply deletes
      let updated = allTasks.filter((t) => !toDelete.has(t.id));

      // Apply updates
      const patchMap = new Map(
        toUpdate.map((u) => [String(u.id), u])
      );
      updated = updated.map((t) => {
        const patch = patchMap.get(t.id);
        if (!patch) return t;
        return {
          ...t,
          title: typeof patch.title === "string" ? patch.title : t.title,
          bucket: (["now", "next", "later"].includes(String(patch.bucket))
            ? patch.bucket
            : t.bucket) as Task["bucket"],
          scheduled_date:
            "scheduled_date" in patch
              ? (typeof patch.scheduled_date === "string"
                  ? patch.scheduled_date
                  : null)
              : t.scheduled_date,
          context: (["home", "desk", "phone", "errand", "other"].includes(
            String(patch.context)
          )
            ? patch.context
            : t.context) as Task["context"],
          estimated_minutes:
            "estimated_minutes" in patch
              ? (typeof patch.estimated_minutes === "number"
                  ? patch.estimated_minutes
                  : null)
              : t.estimated_minutes,
          note:
            "note" in patch
              ? (typeof patch.note === "string" ? patch.note : null)
              : t.note,
          steps: Array.isArray(patch.steps)
            ? (patch.steps as unknown[]).map(String)
            : t.steps,
        };
      });

      // Create new tasks
      const created: Task[] = toCreate.map((item) => ({
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
        list: taskList,
        completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        snoozed_until: null,
      }));

      writeTasks([...updated, ...created]);

      console.log(
        `[INFO ] Organize: +${created.length} created, ~${toUpdate.length} updated, -${toDelete.size} deleted`
      );
      res.json({ created, updated: toUpdate.length, deleted: toDelete.size });
    } else {
      // Simple create-only path (no existing tasks sent)
      const arrayVal = Array.isArray(raw)
        ? (raw as unknown[])
        : (Object.values(raw).find((v) => Array.isArray(v)) as unknown[]) ?? [];

      const created: Task[] = (arrayVal as Record<string, unknown>[]).map(
        (item) => ({
          id: crypto.randomUUID(),
          title: String(item.title ?? "Untitled task"),
          bucket: (["now", "next", "later"].includes(String(item.bucket))
            ? item.bucket
            : "later") as Task["bucket"],
          scheduled_date:
            typeof item.scheduled_date === "string"
              ? item.scheduled_date
              : null,
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
          list: taskList,
          completed: false,
          completed_at: null,
          created_at: new Date().toISOString(),
          snoozed_until: null,
        })
      );

      writeTasks([...allTasks, ...created]);
      console.log(`[INFO ] Organize: created ${created.length} task(s)`);
      res.json({ created, updated: 0, deleted: 0 });
    }
  } catch (err) {
    const msg =
      err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
    console.error(`[ERROR] Organize failed: ${msg}`);
    res.status(500).json({ error: "organize failed" });
  }
});

export default router;
