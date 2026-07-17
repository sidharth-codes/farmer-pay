import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

interface SpinnerProps {
  size?: number;
  className?: string;
  icon?: LucideIcon;
}

export function Spinner({ size = 20, className, icon: Icon = Loader2 }: SpinnerProps) {
  return (
    <Icon
      className={cn('animate-spin text-primary', className)}
      size={size}
      aria-hidden="true"
    />
  );
}

export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <Spinner size={32} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
