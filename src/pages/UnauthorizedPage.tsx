import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';
import { ROUTES } from '../constants';

export function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="absolute inset-0 -z-10 bg-hero-radial" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldOff size={32} />
        </div>
        <p className="mt-6 font-display text-5xl font-extrabold tracking-tight">403</p>
        <h1 className="mt-2 font-display text-2xl font-bold">Access restricted</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Your role doesn't have permission to view this page. If this seems wrong, contact your
          network admin.
        </p>
        <Button className="mt-8" asChild>
          <Link to={ROUTES.HOME}>
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
