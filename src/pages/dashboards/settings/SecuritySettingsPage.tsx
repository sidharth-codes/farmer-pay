import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock, Eye, EyeOff, Shield, KeyRound, History, CheckCircle2,
  Smartphone, Globe, Clock,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, Label, FormError, Badge,
} from '../../../components/ui';
import { PageHeader } from '../../../components/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { auth } from '../../../services/auth';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../constants';

export function SecuritySettingsPage() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: auditLogs } = useQuery({
    queryKey: QUERY_KEYS.auditLogs,
    queryFn: () => (user ? auth.getAuditLogs(user.id, 10) : Promise.resolve([])),
    enabled: !!user,
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await auth.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const auditIcon = (action: string) => {
    if (action.includes('LOGIN')) return <KeyRound size={16} className="text-success" />;
    if (action.includes('LOGOUT')) return <KeyRound size={16} className="text-muted-foreground" />;
    if (action.includes('PASSWORD')) return <Lock size={16} className="text-warning" />;
    if (action.includes('REGISTER')) return <Shield size={16} className="text-primary" />;
    return <History size={16} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Settings"
        description="Manage your password, view account activity, and review security logs."
      />

      {/* Security overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Shield size={20} className="text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Verification</p>
              <p className="text-sm font-semibold">{user.verificationStatus}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last login</p>
              <p className="text-sm font-semibold">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Just now'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Globe size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Timezone</p>
              <p className="text-sm font-semibold">{user.timezone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <KeyRound size={18} />
              Change Password
            </span>
          </CardTitle>
          <CardDescription>Use a strong, unique password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <FormError>{error}</FormError>}
          <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  className="pl-11 pr-11"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowCurrent((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    className="pl-11 pr-11"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowNew((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type={showNew ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={loading}>
                Update password
              </Button>
              {success && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-sm text-success"
                >
                  <CheckCircle2 size={16} />
                  Password updated
                </motion.span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Smartphone size={18} />
              Active Sessions
            </span>
          </CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">This device</p>
              <p className="text-xs text-muted-foreground">
                {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} · {navigator.platform || 'Unknown'}
              </p>
            </div>
            <Badge variant="success">Current</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Audit log */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <History size={18} />
              Recent Activity
            </span>
          </CardTitle>
          <CardDescription>Security-relevant actions on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {!auditLogs || auditLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  {auditIcon(log.action)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {log.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                      {log.ipAddress && ` · ${log.ipAddress}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Sign Out</CardTitle>
          <CardDescription>Sign out of your account on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={async () => { await logout(); }}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
