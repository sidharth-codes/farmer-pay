import { Bell } from 'lucide-react';
import { Badge } from './Badge';
import { cn } from '../../utils';

interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ count = 0, onClick, className }: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
        className,
      )}
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
    >
      <Bell size={20} />
      {count > 0 ? (
        <Badge
          variant="destructive"
          className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center px-1 text-[10px]"
        >
          {count > 9 ? '9+' : count}
        </Badge>
      ) : null}
    </button>
  );
}
