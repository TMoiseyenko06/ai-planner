import { List } from "../types/task";

interface Props {
  value: List;
  onChange: (v: List) => void;
}

export default function ListToggle({ value, onChange }: Props) {
  return (
    <div className="flex bg-brand-gray-light rounded-2xl p-1 mx-4 mb-4">
      {(["work", "personal"] as List[]).map((list) => (
        <button
          key={list}
          onClick={() => onChange(list)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
            value === list
              ? "bg-white text-gray-900"
              : "text-brand-gray"
          }`}
        >
          {list === "work" ? "Work" : "Personal"}
        </button>
      ))}
    </div>
  );
}
