import { motion } from 'framer-motion';
import {
  Package,
  QrCode,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../../components/ui';
import type { UserRole } from '../../types';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '../../constants';

interface StatCard {
  label: string;
  value: string;
  delta?: { value: string; up: boolean };
  Icon: LucideIcon;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  status: 'success' | 'warning' | 'info';
  timestamp: string;
}

const STAT_CARDS: Record<Exclude<UserRole, 'CONSUMER'>, StatCard[]> = {
  FARMER: [
    { label: 'Active batches', value: '14', delta: { value: '+3', up: true }, Icon: Package },
    { label: 'QRs issued', value: '42', delta: { value: '+8', up: true }, Icon: QrCode },
    { label: 'Pending payments', value: '$1,240', delta: { value: '-12%', up: false }, Icon: Wallet },
    { label: 'Avg settlement', value: '4.2s', delta: { value: '-0.3s', up: true }, Icon: TrendingUp },
  ],
  WHOLESALER: [
    { label: 'Batches in transit', value: '8', delta: { value: '+2', up: true }, Icon: Package },
    { label: 'Custody transfers', value: '126', delta: { value: '+14', up: true }, Icon: QrCode },
    { label: 'Outstanding payable', value: '$8,920', delta: { value: '+4%', up: false }, Icon: Wallet },
    { label: 'Avg settlement', value: '4.8s', delta: { value: '-0.2s', up: true }, Icon: TrendingUp },
  ],
  RETAILER: [
    { label: 'Batches received', value: '23', delta: { value: '+5', up: true }, Icon: Package },
    { label: 'Consumer scans', value: '1,402', delta: { value: '+18%', up: true }, Icon: QrCode },
    { label: 'Settled this week', value: '$3,210', delta: { value: '+6%', up: true }, Icon: Wallet },
    { label: 'Avg settlement', value: '4.1s', delta: { value: '-0.1s', up: true }, Icon: TrendingUp },
  ],
  ADMIN: [
    { label: 'Network batches', value: '12,480', delta: { value: '+312', up: true }, Icon: Package },
    { label: 'Active participants', value: '384', delta: { value: '+12', up: true }, Icon: QrCode },
    { label: 'Settlement volume', value: '$1.2M', delta: { value: '+8%', up: true }, Icon: Wallet },
    { label: 'Avg settlement', value: '4.3s', delta: { value: '-0.2s', up: true }, Icon: TrendingUp },
  ],
};

const ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    title: 'Batch #B-2048 custody transferred',
    description: 'GreenSavanna Coop → Mercado Norte',
    status: 'success',
    timestamp: '2m ago',
  },
  {
    id: '2',
    title: 'Payment settled for Batch #B-2046',
    description: '$420.00 on Stellar · 4.1s',
    status: 'success',
    timestamp: '18m ago',
  },
  {
    id: '3',
    title: 'QR verification by consumer',
    description: 'Batch #B-2031 scanned in Lisbon',
    status: 'info',
    timestamp: '1h ago',
  },
  {
    id: '4',
    title: 'Batch #B-2042 flagged for review',
    description: 'Certification document pending',
    status: 'warning',
    timestamp: '3h ago',
  },
];

const STATUS_BADGE: Record<ActivityItem['status'], { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  success: { label: 'Settled', variant: 'success' },
  warning: { label: 'Review', variant: 'warning' },
  info: { label: 'Scan', variant: 'secondary' },
};

export function DashboardOverview({ role }: { role: Exclude<UserRole, 'CONSUMER'> }) {
  const stats = STAT_CARDS[role];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-border bg-gradient-to-br from-primary-500/10 to-primary-700/5 p-6"
      >
        <Badge variant="default" className="mb-2">
          {ROLE_LABELS[role]} dashboard
        </Badge>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Welcome back to FarmerPay
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          {ROLE_DESCRIPTIONS[role]}
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <stat.Icon size={20} />
                  </div>
                  {stat.delta ? (
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                        stat.delta.up ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {stat.delta.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {stat.delta.value}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 font-display text-2xl font-bold">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {ACTIVITY.map((item) => {
              const badge = STATUS_BADGE[item.status];
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="mt-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      <Badge variant={badge.variant} className="text-[10px]">
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phase 1 status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Traceability foundation" value="Ready" status="success" />
            <Row label="Auth & roles" value="Ready" status="success" />
            <Row label="Dashboard shells" value="Ready" status="success" />
            <Row label="Stellar payments" value="Phase 2" status="warning" />
            <Row label="QR minting" value="Phase 2" status="warning" />
            <Row label="Batch custody ledger" value="Phase 2" status="warning" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'success' | 'warning';
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={status === 'success' ? 'success' : 'warning'}>{value}</Badge>
    </div>
  );
}
