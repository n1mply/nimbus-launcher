import type { ReactNode } from "react";
import { Search } from "lucide-react";
import CustomSelect from "./CustomSelect";

export type FilterOption = { value: string; label: string };
export type FilterDef = {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
};

type Props = {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters: FilterDef[];
  onFilterChange?: (key: string, value: string) => void;
  extraFilters?: ReactNode;
};

function FilterButton({
  label,
  value,
  options,
  onChange,
}: Omit<FilterDef, "key"> & { onChange?: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-[13px] text-gray-500">{label}:</span>
      <CustomSelect value={value} options={options} onChange={(v) => onChange?.(v)} />
    </div>
  );
}

export default function ContentFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  onFilterChange,
  extraFilters,
}: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-2.5 pl-10 pr-3 text-[14px] text-white placeholder:text-gray-500 outline-none transition-colors focus:border-white/10 focus:bg-white/[0.05]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <FilterButton key={f.key} {...f} onChange={(v) => onFilterChange?.(f.key, v)} />
        ))}
        {extraFilters}
      </div>
    </div>
  );
}