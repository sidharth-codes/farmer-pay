import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { SearchBox, Button } from './';
import { cn } from '../../utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  search: string;
  onSearch: (value: string) => void;
  filters?: FilterConfig[];
  activeFilters?: Record<string, string>;
  onFilter?: (key: string, value: string) => void;
  onClear?: () => void;
  searchPlaceholder?: string;
  className?: string;
  actions?: ReactNode;
}

export function FilterBar({
  search,
  onSearch,
  filters,
  activeFilters,
  onFilter,
  onClear,
  searchPlaceholder = 'Search…',
  className,
  actions,
}: FilterBarProps) {
  const hasActiveFilters = activeFilters
    ? Object.values(activeFilters).some((v) => v && v !== 'all')
    : false;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox
          value={search}
          onSearch={onSearch}
          placeholder={searchPlaceholder}
          containerClassName="flex-1"
        />
        {actions}
      </div>
      {filters && filters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={activeFilters?.[filter.key] ?? 'all'}
              onChange={(e) => onFilter?.(filter.key, e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={filter.label}
            >
              <option value="all">{filter.label}: All</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {filter.label}: {opt.label}
                </option>
              ))}
            </select>
          ))}
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// Re-export Search icon for convenience
void Search;
