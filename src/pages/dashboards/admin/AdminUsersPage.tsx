import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, Search, ShieldCheck, ShieldAlert, Ban, CheckCircle2,
  Filter, Mail, Phone,
} from 'lucide-react';
import {
  Card, CardContent, Button, Input, Badge, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  EmptyState, PageHeader, StatusBadge,
} from '../../../components/ui';
import { auth } from '../../../services/auth';
import { QUERY_KEYS, ROLE_LABELS, VERIFICATION_STATUS_LABELS, VERIFICATION_STATUS_VARIANTS } from '../../../constants';
import type { AccountVerificationStatus, User, UserRole } from '../../../types';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<AccountVerificationStatus | 'ALL'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: QUERY_KEYS.adminUsers,
    queryFn: auth.adminGetUsers,
  });

  const filtered = (users ?? []).filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.verificationStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAction = async (
    userId: string,
    action: 'verify' | 'reject' | 'suspend' | 'unsuspend',
  ) => {
    setActionLoading(true);
    try {
      if (action === 'verify') {
        await auth.adminUpdateUserStatus(userId, { verificationStatus: 'VERIFIED' });
      } else if (action === 'reject') {
        await auth.adminUpdateUserStatus(userId, { verificationStatus: 'REJECTED' });
      } else if (action === 'suspend') {
        await auth.adminUpdateUserStatus(userId, { isSuspended: true });
      } else if (action === 'unsuspend') {
        await auth.adminUpdateUserStatus(userId, { isSuspended: false });
      }
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers });
      setSelectedUser(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all FarmerPay participants — farmers, wholesalers, and retailers."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total users', value: users?.length ?? 0, Icon: Users, color: 'text-primary' },
          { label: 'Verified', value: (users ?? []).filter((u) => u.verificationStatus === 'VERIFIED').length, Icon: ShieldCheck, color: 'text-success' },
          { label: 'Pending', value: (users ?? []).filter((u) => u.verificationStatus === 'PENDING').length, Icon: ShieldAlert, color: 'text-warning' },
          { label: 'Suspended', value: (users ?? []).filter((u) => u.isSuspended).length, Icon: Ban, color: 'text-destructive' },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
            >
              <option value="ALL">All roles</option>
              <option value="FARMER">Farmers</option>
              <option value="WHOLESALER">Wholesalers</option>
              <option value="RETAILER">Retailers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <select
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AccountVerificationStatus | 'ALL')}
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Loading users...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.name}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail size={12} />
                          {u.email}
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone size={12} />
                            {u.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={VERIFICATION_STATUS_VARIANTS[u.verificationStatus] ?? 'secondary'}>
                        {VERIFICATION_STATUS_LABELS[u.verificationStatus] ?? 'Pending'}
                      </Badge>
                      {u.isSuspended && (
                        <Badge variant="destructive" className="ml-1">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {[u.state, u.country].filter(Boolean).join(', ') || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User management modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)}>
        {selectedUser && (
          <>
            <ModalHeader>
              <ModalTitle>{selectedUser.name}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{ROLE_LABELS[selectedUser.role]}</Badge>
                  <Badge variant={VERIFICATION_STATUS_VARIANTS[selectedUser.verificationStatus] ?? 'secondary'}>
                    {VERIFICATION_STATUS_LABELS[selectedUser.verificationStatus] ?? 'Pending'}
                  </Badge>
                  {selectedUser.isSuspended && <Badge variant="destructive">Suspended</Badge>}
                </div>
                {selectedUser.companyName && (
                  <p className="text-sm">Company: {selectedUser.companyName}</p>
                )}
                {selectedUser.businessRegistrationNumber && (
                  <p className="text-sm">Reg #: {selectedUser.businessRegistrationNumber}</p>
                )}
                {selectedUser.warehouseAddress && (
                  <p className="text-sm">Warehouse: {selectedUser.warehouseAddress}</p>
                )}
                {selectedUser.storeName && (
                  <p className="text-sm">Store: {selectedUser.storeName}</p>
                )}
                {selectedUser.storeAddress && (
                  <p className="text-sm">Store address: {selectedUser.storeAddress}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              {selectedUser.verificationStatus !== 'VERIFIED' && (
                <Button
                  variant="default"
                  loading={actionLoading}
                  onClick={() => handleAction(selectedUser.id, 'verify')}
                >
                  <CheckCircle2 size={16} />
                  Verify
                </Button>
              )}
              {selectedUser.verificationStatus === 'PENDING' && (
                <Button
                  variant="outline"
                  loading={actionLoading}
                  onClick={() => handleAction(selectedUser.id, 'reject')}
                >
                  Reject
                </Button>
              )}
              {selectedUser.isSuspended ? (
                <Button
                  variant="outline"
                  loading={actionLoading}
                  onClick={() => handleAction(selectedUser.id, 'unsuspend')}
                >
                  Unsuspend
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  loading={actionLoading}
                  onClick={() => handleAction(selectedUser.id, 'suspend')}
                >
                  <Ban size={16} />
                  Suspend
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
