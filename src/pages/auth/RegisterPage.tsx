import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  Sprout,
  Truck,
  Store,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, Button, Input, Label, FormError } from '../../components/ui';
import { Logo } from '../../components/ui/Logo';
import { useAuth, type RegisterInput } from '../../contexts/AuthContext';
import { ROUTES, ROLE_DASHBOARD, ROLE_LABELS } from '../../constants';
import type { UserRole } from '../../types';
import { cn } from '../../utils';

type RegRole = Exclude<UserRole, 'CONSUMER' | 'ADMIN'>;

const ROLE_OPTIONS: { value: RegRole; Icon: typeof Sprout; blurb: string }[] = [
  { value: 'FARMER', Icon: Sprout, blurb: 'Register harvests, get paid instantly.' },
  { value: 'WHOLESALER', Icon: Truck, blurb: 'Move bulk batches with provenance.' },
  { value: 'RETAILER', Icon: Store, blurb: 'Receive batches for your storefront.' },
];

const STEPS = ['Account', 'Profile', 'Business', 'Review'] as const;

const schema = z
  .object({
    role: z.enum(['FARMER', 'WHOLESALER', 'RETAILER']),
    name: z.string().min(2, 'Please enter your name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    country: z.string().min(2, 'Country is required'),
    state: z.string().min(2, 'State/province is required'),
    district: z.string().optional(),
    companyName: z.string().optional(),
    businessRegistrationNumber: z.string().optional(),
    warehouseAddress: z.string().optional(),
    storeName: z.string().optional(),
    storeAddress: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((d) => d.role !== 'WHOLESALER' || (d.companyName && d.companyName.length >= 2), {
    message: 'Company name is required for wholesalers',
    path: ['companyName'],
  })
  .refine((d) => d.role !== 'RETAILER' || (d.storeName && d.storeName.length >= 2), {
    message: 'Store name is required for retailers',
    path: ['storeName'],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [values, setValues] = useState<Partial<FormValues>>({
    role: 'FARMER',
  });

  const update = (patch: Partial<FormValues>) => setValues((v) => ({ ...v, ...patch }));

  const validateStep = (currentStep: number): string | null => {
    if (currentStep === 0) {
      if (!values.role) return 'Please select an account type';
      if (!values.name || values.name.length < 2) return 'Please enter your name';
      if (!values.email || !z.string().email().safeParse(values.email).success) return 'Enter a valid email';
      if (!values.password || values.password.length < 8) return 'Password must be at least 8 characters';
      if (values.password !== values.confirmPassword) return 'Passwords do not match';
    }
    if (currentStep === 1) {
      if (!values.country || values.country.length < 2) return 'Country is required';
      if (!values.state || values.state.length < 2) return 'State/province is required';
    }
    if (currentStep === 2) {
      if (values.role === 'WHOLESALER' && (!values.companyName || values.companyName.length < 2))
        return 'Company name is required for wholesalers';
      if (values.role === 'RETAILER' && (!values.storeName || values.storeName.length < 2))
        return 'Store name is required for retailers';
    }
    return null;
  };

  const next = () => {
    const error = validateStep(step);
    if (error) {
      setServerError(error);
      return;
    }
    setServerError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => {
    setServerError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setServerError(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? 'Please fix the errors');
      return;
    }
    try {
      const input: RegisterInput = {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        role: parsed.data.role,
        phone: parsed.data.phone,
        country: parsed.data.country,
        state: parsed.data.state,
        district: parsed.data.district,
        companyName: parsed.data.companyName,
        businessRegistrationNumber: parsed.data.businessRegistrationNumber,
        warehouseAddress: parsed.data.warehouseAddress,
        storeName: parsed.data.storeName,
        storeAddress: parsed.data.storeAddress,
      };
      const user = await registerUser(input);
      const dest = ROLE_DASHBOARD[user.role as keyof typeof ROLE_DASHBOARD] ?? ROUTES.DASHBOARD;
      navigate(dest, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setServerError(message.includes('already') ? 'An account with this email already exists' : message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-hero-radial" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:32px_32px] opacity-30 [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]"
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardContent className="p-7">
            {/* Progress indicator */}
            <div className="mb-6 flex items-center justify-between">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                        i < step && 'bg-primary text-primary-foreground',
                        i === step && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                        i > step && 'bg-secondary text-muted-foreground',
                      )}
                    >
                      {i < step ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <span className={cn('text-[10px] font-medium', i === step ? 'text-foreground' : 'text-muted-foreground')}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('mx-2 h-0.5 flex-1 rounded transition-colors', i < step ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
              ))}
            </div>

            {serverError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive" role="alert">
                <AlertCircle size={16} className="shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* Step 0: Account */}
              {step === 0 && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h1 className="font-display text-xl font-bold tracking-tight">Create your account</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Choose your role in the FarmerPay network.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {ROLE_OPTIONS.map(({ value, Icon, blurb }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update({ role: value })}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all',
                          values.role === value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:border-primary/40 hover:bg-secondary',
                        )}
                        aria-pressed={values.role === value}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{ROLE_LABELS[value]}</p>
                          <p className="text-xs text-muted-foreground">{blurb}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <div className="relative">
                      <User size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="name" placeholder="Jane Farmer" className="pl-11" value={values.name ?? ''} onChange={(e) => update({ name: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@farm.com" className="pl-11" value={values.email ?? ''} onChange={(e) => update({ email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-11 pr-11" value={values.password ?? ''} onChange={(e) => update({ password: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm</Label>
                      <div className="relative">
                        <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-11" value={values.confirmPassword ?? ''} onChange={(e) => update({ confirmPassword: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Profile */}
              {step === 1 && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h1 className="font-display text-xl font-bold tracking-tight">Profile details</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Tell us where you're based.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <div className="relative">
                      <Phone size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="phone" placeholder="+1 415 555 0142" className="pl-11" value={values.phone ?? ''} onChange={(e) => update({ phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country</Label>
                      <div className="relative">
                        <MapPin size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input id="country" placeholder="United States" className="pl-11" value={values.country ?? ''} onChange={(e) => update({ country: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state">State / Province</Label>
                      <Input id="state" placeholder="California" value={values.state ?? ''} onChange={(e) => update({ state: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="district">District (optional)</Label>
                    <Input id="district" placeholder="Bay Area" value={values.district ?? ''} onChange={(e) => update({ district: e.target.value })} />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Business */}
              {step === 2 && (
                <motion.div
                  key="business"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h1 className="font-display text-xl font-bold tracking-tight">Business details</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {values.role === 'FARMER' && 'Tell us about your farm (optional).'}
                      {values.role === 'WHOLESALER' && 'Tell us about your wholesale business.'}
                      {values.role === 'RETAILER' && 'Tell us about your retail store.'}
                    </p>
                  </div>

                  {values.role === 'WHOLESALER' && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="companyName">Company name</Label>
                        <div className="relative">
                          <Building2 size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="companyName" placeholder="Acme Produce Co." className="pl-11" value={values.companyName ?? ''} onChange={(e) => update({ companyName: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="businessRegistrationNumber">Business registration number</Label>
                        <Input id="businessRegistrationNumber" placeholder="BR-12345678" value={values.businessRegistrationNumber ?? ''} onChange={(e) => update({ businessRegistrationNumber: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="warehouseAddress">Warehouse address</Label>
                        <Input id="warehouseAddress" placeholder="123 Industrial Blvd, Oakland, CA" value={values.warehouseAddress ?? ''} onChange={(e) => update({ warehouseAddress: e.target.value })} />
                      </div>
                    </>
                  )}

                  {values.role === 'RETAILER' && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="storeName">Store name</Label>
                        <div className="relative">
                          <Store size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="storeName" placeholder="Fresh Market" className="pl-11" value={values.storeName ?? ''} onChange={(e) => update({ storeName: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="storeAddress">Store address</Label>
                        <Input id="storeAddress" placeholder="456 Main St, San Francisco, CA" value={values.storeAddress ?? ''} onChange={(e) => update({ storeAddress: e.target.value })} />
                      </div>
                    </>
                  )}

                  {values.role === 'FARMER' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName">Farm name (optional)</Label>
                      <div className="relative">
                        <Sprout size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input id="companyName" placeholder="Green Valley Farm" className="pl-11" value={values.companyName ?? ''} onChange={(e) => update({ companyName: e.target.value })} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h1 className="font-display text-xl font-bold tracking-tight">Review & confirm</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Please verify your details before creating the account.</p>
                  </div>
                  <dl className="space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Role</dt>
                      <dd className="font-medium">{ROLE_LABELS[values.role as RegRole]}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="font-medium">{values.name}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium">{values.email}</dd>
                    </div>
                    {values.phone && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd className="font-medium">{values.phone}</dd>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium">{[values.state, values.country].filter(Boolean).join(', ')}</dd>
                    </div>
                    {values.companyName && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-muted-foreground">{values.role === 'RETAILER' ? 'Store' : 'Company'}</dt>
                        <dd className="font-medium">{values.companyName}</dd>
                      </div>
                    )}
                    {values.storeName && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-muted-foreground">Store</dt>
                        <dd className="font-medium">{values.storeName}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 p-3.5 text-xs text-muted-foreground">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
                    <p>By creating an account, you agree to FarmerPay's Terms of Service and Privacy Policy. Your account will be pending verification until an admin approves it.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="mt-6 flex items-center gap-3">
              {step > 0 && (
                <Button variant="outline" onClick={prev} type="button">
                  <ArrowLeft size={18} />
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button onClick={next} type="button" className="flex-1">
                  Continue
                  <ArrowRight size={18} />
                </Button>
              ) : (
                <Button onClick={submit} type="button" className="flex-1">
                  Create account
                  <CheckCircle2 size={18} />
                </Button>
              )}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
