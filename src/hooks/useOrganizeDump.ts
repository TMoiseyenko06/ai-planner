import { useState } from "react";
import { Context, List, Task } from "../types/task";

export function useOrganizeDump(refreshTasks: () => Promise<void>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const organize = async (
    text: string,
    context?: Context | null,
    list?: List,
    existingTasks?: Task[]
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    // Send compact representation to keep payload small
    const compact = existingTasks?.map((t) => ({
      id: t.id,
      title: t.title,
      bucket: t.bucket,
      scheduled_date: t.scheduled_date,
      context: t.context,
      estimated_minutes: t.estimated_minutes,
      energy: t.energy,
      note: t.note,
    }));

    try {
      const res = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          context,
          list: list ?? "personal",
          existingTasks: compact ?? [],
        }),
      });

      if (!res.ok) throw new Error("organize failed");

      await refreshTasks();
      return true;
    } catch {
      setError("Couldn't organize — your dump is saved, try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { organize, loading, error, setError };
}
