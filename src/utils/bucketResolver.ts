import { Bucket, Task } from "../types/task";

export function resolveEffectiveBucket(task: Task): Bucket {
  if (!task.scheduled_date) return task.bucket;

  const today = new Date().toISOString().split("T")[0];
  const diff = Math.ceil(
    (new Date(task.scheduled_date).getTime() - new Date(today).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diff <= 0) return "now";
  if (diff === 1) return "next";
  return "later";
}
