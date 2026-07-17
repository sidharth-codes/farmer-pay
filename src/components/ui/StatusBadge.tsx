import { Badge } from './Badge';
import { BATCH_STATUS_LABELS, BATCH_STATUS_VARIANTS, VERIFICATION_STATUS_LABELS, VERIFICATION_STATUS_VARIANTS } from '../../constants';

export function BatchStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={BATCH_STATUS_VARIANTS[status] ?? 'secondary'}>
      {BATCH_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function VerificationStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VERIFICATION_STATUS_VARIANTS[status] ?? 'secondary'}>
      {VERIFICATION_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
