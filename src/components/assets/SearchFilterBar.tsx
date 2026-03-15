import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterOption[];
  resultCount?: number;
  totalCount?: number;
}

export function SearchFilterBar({ searchValue, onSearchChange, placeholder = "Search assets...", filters = [], resultCount, totalCount }: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-8 h-9 text-sm"
        />
      </div>
      {filters.map((f) => (
        <select
          key={f.label}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ))}
      {resultCount !== undefined && totalCount !== undefined && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Showing {resultCount} of {totalCount}
        </span>
      )}
    </div>
  );
}
