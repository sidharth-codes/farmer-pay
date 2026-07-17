import { AlertCircle, RefreshCw, type LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ErrorScreen({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  icon: Icon = AlertCircle,
  actionLabel = 'Try again',
  onAction,
  className,
}: ErrorScreenProps) {
  return (
    <div
      className={cn(
        'flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center',
        className,
      )}
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <Icon size={28} aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      {onAction ? (
        <Button variant="outline" onClick={onAction}>
          <RefreshCw size={16} />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
