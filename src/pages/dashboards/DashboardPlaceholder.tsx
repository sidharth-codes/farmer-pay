import { Construction } from 'lucide-react';
import { Card, CardContent, Badge } from '../../components/ui';

// Placeholder for dashboard sub-routes (batches, wallet, settings, etc.)
// These routes are wired in Phase 1 so navigation works end-to-end; their
// business logic lands in Phase 2 alongside Stellar + QR integration.
export function DashboardPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <Construction size={28} />
          </div>
          <h2 className="font-display text-lg font-semibold">Ships in Phase 2</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            This screen is scaffolded and routed in Phase 1. Its business logic — Stellar
            payments, QR minting, and the custody ledger — arrives in Phase 2.
          </p>
          <Badge variant="warning">Phase 2</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
