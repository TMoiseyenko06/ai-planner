import { useState } from "react";
import { Context } from "../types/task";

export function useOrganizeDump(refreshTasks: () => Promise<void>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const organize = async (
    text: string,
    context?: Context | null
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context }),
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
