import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils';

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-foreground/5 after:to-transparent',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  ),
);
Skeleton.displayName = 'Skeleton';
