export type Bucket = "now" | "next" | "later";
export type Context = "home" | "desk" | "phone" | "errand" | "other";
export type List = "work" | "personal";

export interface Task {
  id: string;
  title: string;
  bucket: Bucket;
  list?: List;
  scheduled_date: string | null;
  context: Context;
  estimated_minutes: number | null;
  steps: string[];
  note: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  snoozed_until: string | null;
}
