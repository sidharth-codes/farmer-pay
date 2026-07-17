import { motion } from 'framer-motion';
import { Sprout, Truck, Store, User, Clock, Lock } from 'lucide-react';
import { Badge } from './Badge';

interface TimelineEntry {
  Icon: typeof Sprout;
  actor: string;
  role: string;
  location?: string;
  timestamp?: string;
  note: string;
  isPlaceholder?: boolean;
}

interface TimelinePlaceholderProps {
  entries: TimelineEntry[];
  className?: string;
}

export function TimelinePlaceholder({ entries, className }: TimelinePlaceholderProps) {
  return (
    <div className={className}>
      <ol className="space-y-5">
        {entries.map((entry, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            className="relative flex gap-4"
          >
            {i < entries.length - 1 ? (
              <span
                className="absolute left-5 top-11 h-[calc(100%-1rem)] w-px bg-border"
                aria-hidden="true"
              />
            ) : null}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${entry.isPlaceholder ? 'bg-secondary/50 text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
              <entry.Icon size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${entry.isPlaceholder ? 'text-muted-foreground' : ''}`}>{entry.actor}</p>
                <Badge variant={entry.isPlaceholder ? 'outline' : 'secondary'} className="text-[10px]">{entry.role}</Badge>
                {entry.isPlaceholder && (
                  <Lock size={10} className="text-muted-foreground/50" />
                )}
              </div>
              <p className={`mt-0.5 text-sm ${entry.isPlaceholder ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>{entry.note}</p>
              {(entry.location || entry.timestamp) && (
                <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {entry.location && <span>{entry.location}</span>}
                  {entry.timestamp && <span>{entry.timestamp}</span>}
                </div>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export function buildPassportTimeline(batchInternalId: string, currentHolder?: { name: string; role: string } | null): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    {
      Icon: Sprout,
      actor: 'Farm Origin',
      role: 'Farmer',
      note: 'Batch registered and harvest recorded',
      timestamp: 'Phase 1',
    },
  ];

  if (currentHolder) {
    const Icon = currentHolder.role === 'WHOLESALER' ? Truck : currentHolder.role === 'RETAILER' ? Store : Sprout;
    entries.push({
      Icon,
      actor: currentHolder.name,
      role: currentHolder.role,
      note: 'Current custody holder',
      timestamp: 'Active',
    });
  }

  entries.push(
    {
      Icon: Truck,
      actor: 'Wholesaler Transfer',
      role: 'Future',
      note: 'Ownership transfer to wholesaler — available in Phase 5',
      isPlaceholder: true,
    },
    {
      Icon: Store,
      actor: 'Retailer Transfer',
      role: 'Future',
      note: 'Ownership transfer to retailer — available in Phase 5',
      isPlaceholder: true,
    },
    {
      Icon: User,
      actor: 'Consumer Verification',
      role: 'Future',
      note: 'End-to-end consumer transparency — available in Phase 5',
      isPlaceholder: true,
    },
  );

  return entries;
}
