import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Building2, Save, CheckCircle2, Bell } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, Label, Badge, FormError,
} from '../../../components/ui';
import { PageHeader } from '../../../components/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { auth } from '../../../services/auth';
import { ROLE_LABELS, VERIFICATION_STATUS_LABELS, VERIFICATION_STATUS_VARIANTS } from '../../../constants';
import type { NotificationPreferences } from '../../../types';

export function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
    country: user?.country ?? '',
    state: user?.state ?? '',
    district: user?.district ?? '',
    timezone: user?.timezone ?? 'UTC',
    preferredLanguage: user?.preferredLanguage ?? 'en',
    companyName: user?.companyName ?? '',
    businessRegistrationNumber: user?.businessRegistrationNumber ?? '',
    warehouseAddress: user?.warehouseAddress ?? '',
    storeName: user?.storeName ?? '',
    storeAddress: user?.storeAddress ?? '',
  });

  // Load notification preferences
  useState(() => {
    if (!user) return;
    (async () => {
      try {
        const p = await auth.getNotificationPreferences(user.id);
        setPrefs(p);
      } finally {
        setPrefsLoading(false);
      }
    })();
  });

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      await auth.updateProfile(user.id, form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePrefToggle = (key: keyof NotificationPreferences) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: !prefs[key] });
    setPrefsSaved(false);
  };

  const handlePrefsSave = async () => {
    if (!user || !prefs) return;
    setPrefsSaving(true);
    try {
      await auth.updateNotificationPreferences(user.id, prefs);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 3000);
    } finally {
      setPrefsSaving(false);
    }
  };

  if (!user) return null;

  const isFarmer = user.role === 'FARMER';
  const isWholesaler = user.role === 'WHOLESALER';
  const isRetailer = user.role === 'RETAILER';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your personal information, business details, and notification preferences."
      />

      {/* Verification status banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Account Verification</p>
                <p className="text-xs text-muted-foreground">
                  Role: {ROLE_LABELS[user.role]} · Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge variant={VERIFICATION_STATUS_VARIANTS[user.verificationStatus] ?? 'secondary'}>
              {VERIFICATION_STATUS_LABELS[user.verificationStatus] ?? 'Pending'}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {error && <FormError>{error}</FormError>}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" className="pl-11" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email (read-only)</Label>
            <div className="relative">
              <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" className="pl-11 bg-secondary/50" value={user.email} readOnly />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Your geographic details for traceability.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <div className="relative">
                <MapPin size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="country" className="pl-11" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">District</Label>
              <Input id="district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preferredLanguage">Preferred language</Label>
              <Input id="preferredLanguage" value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business details (role-specific) */}
      {(isFarmer || isWholesaler || isRetailer) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isFarmer && 'Farm Details'}
              {isWholesaler && 'Wholesale Business'}
              {isRetailer && 'Retail Store'}
            </CardTitle>
            <CardDescription>
              {isFarmer && 'Information about your farm operation.'}
              {isWholesaler && 'Your wholesale company and warehouse details.'}
              {isRetailer && 'Your store information for the marketplace.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(isFarmer || isWholesaler) && (
              <div className="space-y-1.5">
                <Label htmlFor="companyName">
                  {isFarmer ? 'Farm name' : 'Company name'}
                </Label>
                <div className="relative">
                  <Building2 size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="companyName" className="pl-11" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                </div>
              </div>
            )}
            {isWholesaler && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="businessRegistrationNumber">Business registration number</Label>
                  <Input id="businessRegistrationNumber" value={form.businessRegistrationNumber} onChange={(e) => setForm({ ...form, businessRegistrationNumber: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="warehouseAddress">Warehouse address</Label>
                  <Input id="warehouseAddress" value={form.warehouseAddress} onChange={(e) => setForm({ ...form, warehouseAddress: e.target.value })} />
                </div>
              </>
            )}
            {isRetailer && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="storeName">Store name</Label>
                  <Input id="storeName" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="storeAddress">Store address</Label>
                  <Input id="storeAddress" value={form.storeAddress} onChange={(e) => setForm({ ...form, storeAddress: e.target.value })} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={saving}>
          <Save size={18} />
          Save changes
        </Button>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-sm text-success"
          >
            <CheckCircle2 size={16} />
            Saved
          </motion.div>
        )}
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Bell size={18} />
              Notification Preferences
            </span>
          </CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {prefsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : prefs ? (
            <>
              {[
                { key: 'emailEnabled' as const, label: 'Email notifications', desc: 'Receive updates via email' },
                { key: 'pushEnabled' as const, label: 'Push notifications', desc: 'Browser and mobile push' },
                { key: 'smsEnabled' as const, label: 'SMS notifications', desc: 'Text message alerts' },
                { key: 'batchUpdates' as const, label: 'Batch updates', desc: 'Changes to batch status and custody' },
                { key: 'paymentAlerts' as const, label: 'Payment alerts', desc: 'Incoming and outgoing payments' },
                { key: 'verificationUpdates' as const, label: 'Verification updates', desc: 'Account and batch verification changes' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between rounded-lg border border-border p-3.5 cursor-pointer hover:bg-secondary/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrefToggle(key)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${prefs[key] ? 'bg-primary' : 'bg-secondary'}`}
                    aria-pressed={prefs[key]}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ${prefs[key] ? 'left-[22px]' : 'left-0.5'}`}
                    />
                  </button>
                </label>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handlePrefsSave} loading={prefsSaving} variant="outline">
                  Save preferences
                </Button>
                {prefsSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-success">
                    <CheckCircle2 size={16} />
                    Saved
                  </span>
                )}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
