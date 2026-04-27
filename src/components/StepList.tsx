interface Props {
  steps: string[];
  checked: boolean[];
  onToggle: (index: number) => void;
}

export default function StepList({ steps, checked, onToggle }: Props) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <button
          key={i}
          onClick={() => onToggle(i)}
          className="flex items-start gap-3 w-full text-left"
        >
          <div
            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              checked[i]
                ? "bg-brand-green border-brand-green"
                : "border-brand-gray"
            }`}
          >
            {checked[i] && (
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span
            className={`text-base leading-relaxed ${
              checked[i] ? "line-through text-brand-gray" : "text-gray-900"
            }`}
          >
            {step}
          </span>
        </button>
      ))}
    </div>
  );
}
