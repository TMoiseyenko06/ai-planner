import { Router, Request, Response } from "express";

const router = Router();

router.post("/suggest-steps", async (req: Request, res: Response) => {
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title is required" });
    return;
  }

  console.log(`[INFO ] Suggest steps for: "${title}"`);

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
            {
              role: "system",
              content: `Break down a task for someone with ADHD into 2–4 concrete, specific sub-steps.
Return a JSON object: {"steps": ["step 1", "step 2", ...]}
Rules: each step starts with a verb, is under 10 words, and is physically actionable right now.`,
            },
            { role: "user", content: title },
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
    const raw = JSON.parse(content) as Record<string, unknown>;

    const steps: string[] = (
      Array.isArray(raw.steps)
        ? raw.steps
        : (Object.values(raw).find((v) => Array.isArray(v)) ?? [])
    )
      .map(String)
      .slice(0, 4);

    console.log(`[INFO ] Suggested ${steps.length} steps`);
    res.json({ steps });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[ERROR] Suggest steps failed: ${msg}`);
    res.status(500).json({ error: "suggest failed" });
  }
});

export default router;
