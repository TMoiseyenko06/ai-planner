import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Today" },
  { path: "/dump", label: "Dump" },
  { path: "/week", label: "Week" },
  { path: "/done", label: "Done" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-inset-bottom">
      <div className="flex max-w-[480px] mx-auto">
        {NAV_ITEMS.map(({ path, label }) => {
          const active =
            path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 py-3 text-center text-xs font-semibold tracking-wide transition-colors ${
                active ? "text-brand-purple" : "text-brand-gray"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
