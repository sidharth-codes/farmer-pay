import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, Button, Input, Label, FormError } from '../../components/ui';
import { Logo } from '../../components/ui/Logo';
import { ROUTES } from '../../constants';
import { auth } from '../../services/auth';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await auth.requestPasswordReset(email);
      setSent(true);
    } catch {
      // Always show success to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

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
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
                  <CheckCircle2 size={28} />
                </div>
                <h1 className="font-display text-xl font-semibold">Check your inbox</h1>
                <p className="max-w-sm text-sm text-muted-foreground">
                  If an account exists for <span className="font-medium text-foreground">{email}</span>, we've sent a password reset link. Click the link in the email to set a new password.
                </p>
                <Button variant="outline" asChild className="mt-2">
                  <Link to={ROUTES.LOGIN}>Back to sign in</Link>
                </Button>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold tracking-tight">Reset password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter your email and we'll send you a secure reset link.
                </p>
                {error && <FormError>{error}</FormError>}
                <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@farm.com"
                        className="pl-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" loading={loading} className="w-full">
                    Send reset link
                    <ArrowRight size={18} />
                  </Button>
                </form>
                <Link
                  to={ROUTES.LOGIN}
                  className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  Back to sign in
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
