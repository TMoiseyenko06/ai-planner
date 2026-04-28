import { Energy } from "../types/task";

const STYLES: Record<Energy, string> = {
  low: "bg-brand-green-light text-brand-green",
  medium: "bg-brand-amber-light text-brand-amber",
  high: "bg-brand-coral-light text-brand-coral",
};

const LABELS: Record<Energy, string> = {
  low: "Low",
  medium: "Med",
  high: "High",
};

interface Props {
  energy: Energy;
}

export default function EnergyTag({ energy }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[energy]}`}
    >
      {LABELS[energy]}
    </span>
  );
}
