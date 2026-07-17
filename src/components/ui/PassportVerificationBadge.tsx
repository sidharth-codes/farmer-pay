import { forwardRef } from 'react';
import { cn } from '../../utils';
import type { PassportVerificationStatus } from '../../types';
import {
  PASSPORT_VERIFICATION_STATUS_LABELS,
  PASSPORT_VERIFICATION_STATUS_VARIANTS,
} from '../../constants';
import { ShieldCheck, Clock, Ban, XCircle, AlertTriangle } from 'lucide-react';

interface PassportVerificationBadgeProps {
  status: PassportVerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3.5 py-1.5 text-sm',
};

const iconSizes = {
  sm: 10,
  md: 12,
  lg: 16,
};

const variantStyles: Record<string, string> = {
  success: 'bg-success/15 text-success border-success/30',
  secondary: 'bg-secondary text-muted-foreground border-border',
  warning: 'bg-warning/15 text-warning border-warning/30',
  destructive: 'bg-destructive/15 text-destructive border-destructive/30',
};

const statusIcons: Record<string, typeof ShieldCheck> = {
  VERIFIED: ShieldCheck,
  PENDING_VERIFICATION: Clock,
  SUSPENDED: Ban,
  EXPIRED: AlertTriangle,
  REJECTED: XCircle,
};

export const PassportVerificationBadge = forwardRef<HTMLSpanElement, PassportVerificationBadgeProps>(
  ({ status, size = 'md', className }, ref) => {
    const Icon = statusIcons[status] ?? Clock;
    const variant = PASSPORT_VERIFICATION_STATUS_VARIANTS[status] ?? 'secondary';
    const label = PASSPORT_VERIFICATION_STATUS_LABELS[status] ?? 'Unknown';

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
          sizeClasses[size],
          variantStyles[variant],
          className,
        )}
      >
        <Icon size={iconSizes[size]} />
        {label}
      </span>
    );
  },
);
PassportVerificationBadge.displayName = 'PassportVerificationBadge';
