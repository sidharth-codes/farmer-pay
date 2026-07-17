import { Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils';
import { APP_NAME } from '../../constants';

interface LogoProps {
  className?: string;
  showText?: boolean;
  to?: string;
}

export function Logo({ className, showText = true, to = '/' }: LogoProps) {
  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label={`${APP_NAME} home`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
        <Sprout size={20} strokeWidth={2.25} />
      </span>
      {showText ? (
        <span className="font-display text-lg font-bold tracking-tight">
          Farmer<span className="text-primary">Pay</span>
        </span>
      ) : null}
    </Link>
  );
}
