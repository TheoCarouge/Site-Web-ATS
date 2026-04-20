import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Je personnalise", href: "/customize", important: true },
  { name: "Cadeaux de Saint-Valentin", href: "/valentines" },
  { name: "T-shirts", href: "/t-shirts" },
  { name: "Sweats", href: "/hoodies" },
  { name: "Polos", href: "/polos" },
  { name: "Vestes", href: "/jackets" },
  { name: "Sport", href: "/sport" },
  { name: "Mugs", href: "/mugs" },
  { name: "Casquettes", href: "/hats" },
];

export default function CategoryTabs() {
  return (
    <div className="w-full border-b border-gray-200 bg-gray-100">
      <div className="flex items-center gap-2 px-4 py-2 md:px-6">
        {/* Scrollable Tabs */}
        <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.href}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition hover:bg-gray-200",
                cat.important
                  ? "bg-transparent font-bold text-black"
                  : "bg-white text-gray-700 shadow-sm"
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Small Search Button (as seen in design) */}
        <button className="hidden items-center gap-2 rounded bg-zinc-700 px-3 py-2 text-xs font-bold text-white md:flex">
          Rechercher
        </button>
      </div>
    </div>
  );
}
