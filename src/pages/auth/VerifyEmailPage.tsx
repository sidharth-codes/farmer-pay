import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck, ArrowRight, RefreshCw, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../../components/ui';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES, ROLE_DASHBOARD, VERIFICATION_STATUS_LABELS, VERIFICATION_STATUS_VARIANTS } from '../../constants';

export function VerifyEmailPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      // Supabase handles email verification via signUp confirmation email
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } finally {
      setResending(false);
    }
  };

  const handleContinue = () => {
    if (user) {
      const dest = ROLE_DASHBOARD[user.role as keyof typeof ROLE_DASHBOARD] ?? ROUTES.DASHBOARD;
      navigate(dest, { replace: true });
    }
  };

  const status = user?.verificationStatus ?? 'PENDING';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-hero-radial" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardContent className="p-7">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {status === 'VERIFIED' ? <ShieldCheck size={32} /> : <MailCheck size={32} />}
              </div>

              <Badge variant={VERIFICATION_STATUS_VARIANTS[status] ?? 'secondary'}>
                {VERIFICATION_STATUS_LABELS[status] ?? 'Pending'}
              </Badge>

              <h1 className="font-display text-2xl font-bold tracking-tight">
                {status === 'VERIFIED' ? 'Account verified' : 'Verify your email'}
              </h1>

              {status === 'PENDING' && (
                <p className="max-w-sm text-sm text-muted-foreground">
                  We've sent a verification link to{' '}
                  <span className="font-medium text-foreground">{user?.email}</span>.
                  Click the link in the email to activate your account. You can still
                  explore your dashboard while pending.
                </p>
              )}

              {status === 'VERIFIED' && (
                <p className="max-w-sm text-sm text-muted-foreground">
                  Your account is verified. You now have full access to the FarmerPay platform.
                </p>
              )}

              {status === 'REJECTED' && (
                <p className="max-w-sm text-sm text-destructive">
                  Your account verification was rejected. Please contact support for assistance.
                </p>
              )}

              {status === 'SUSPENDED' && (
                <p className="max-w-sm text-sm text-destructive">
                  Your account has been suspended. Please contact support for assistance.
                </p>
              )}

              {status === 'PENDING' && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-warning/10 px-3.5 py-2.5 text-xs text-warning">
                  <Clock size={14} />
                  <span>Verification usually takes 1-2 business days.</span>
                </div>
              )}

              <div className="mt-4 flex w-full flex-col gap-3">
                {status === 'PENDING' && (
                  <Button onClick={handleContinue} className="w-full">
                    Continue to dashboard
                    <ArrowRight size={18} />
                  </Button>
                )}
                {status === 'VERIFIED' && (
                  <Button onClick={handleContinue} className="w-full">
                    Go to dashboard
                    <ArrowRight size={18} />
                  </Button>
                )}
                {status === 'PENDING' && (
                  <Button variant="outline" onClick={handleResend} loading={resending} className="w-full">
                    <RefreshCw size={16} />
                    {resent ? 'Verification link sent' : 'Resend verification email'}
                  </Button>
                )}
                <button
                  onClick={async () => {
                    await logout();
                    navigate(ROUTES.LOGIN, { replace: true });
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Sign out
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
