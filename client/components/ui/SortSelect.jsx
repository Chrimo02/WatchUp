import { Popover } from "@headlessui/react";
import { ChevronDown } from "lucide-react";


const options = [
  { value: "date_desc", label: "Date ↓" },
  { value: "date_asc", label: "Date ↑" },
  { value: "name_asc", label: "Name A→Z" },
  { value: "name_desc", label: "Name Z→A" },
  { value: "rating_desc", label: "Rating ↓" },
  { value: "rating_asc", label: "Rating ↑" },
  { value: "popularity_desc", label: "Popular ↓" },
  { value: "popularity_asc", label: "Popular ↑" },
  { value: "trending", label: "Trending" },
];

export function SortSelect({ value, onChange }) {
  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600">
        <span>{options.find((o) => o.value === value)?.label}</span>
        <ChevronDown className="w-4 h-4 text-white" />
      </Popover.Button>

      <Popover.Panel className="absolute right-[-40px] w-[180px] rounded-[10px] bg-[#141414] border-2 border-movie-card border-red-600 shadow-lg z-50">
        <ul className="py-2">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`px-4 py-2 cursor-pointer text-white hover:bg-red-700/30 ${
                option.value === value ? "font-semibold text-red-400" : ""
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </Popover.Panel>
    </Popover>
  );
}
