import { Search, type LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';
import { Input } from './Input';
import { cn } from '../../utils';

interface SearchBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  icon?: LucideIcon;
  containerClassName?: string;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ onSearch, onChange, icon: Icon = Search, containerClassName, className, ...props }, ref) => (
    <div className={cn('relative', containerClassName)}>
      <Icon
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        ref={ref}
        type="search"
        onChange={(e) => {
          onChange?.(e);
          onSearch?.(e.target.value);
        }}
        className={cn('pl-11', className)}
        {...props}
      />
    </div>
  ),
);
SearchBox.displayName = 'SearchBox';
