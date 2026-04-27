import { Context } from "../types/task";

const LABELS: Record<Context, string> = {
  home: "Home",
  desk: "Desk",
  phone: "Phone",
  errand: "Errand",
  other: "Other",
};

interface Props {
  context: Context;
  size?: "sm" | "md";
}

export default function ContextTag({ context, size = "sm" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-brand-gray-light text-brand-gray font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      {LABELS[context]}
    </span>
  );
}
