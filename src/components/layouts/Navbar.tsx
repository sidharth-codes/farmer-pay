import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button, ThemeSwitch, ProfileAvatar, NotificationBell } from '../ui';
import { Logo } from '../ui/Logo';
import { ROUTES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils';

const NAV_LINKS = [
  { label: 'About', to: ROUTES.ABOUT },
  { label: 'Features', to: ROUTES.FEATURES },
  { label: 'How It Works', to: ROUTES.HOW_IT_WORKS },
  { label: 'Contact', to: ROUTES.CONTACT },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'glass-strong border-b border-border/60 shadow-soft'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeSwitch />
          {user ? (
            <>
              <NotificationBell count={0} />
              <Link to={ROUTES.DASHBOARD} className="ml-1">
                <ProfileAvatar name={user.name} size="sm" />
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.LOGIN}>Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={ROUTES.REGISTER}>Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="glass-strong border-b border-border/60 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-4">
                <ThemeSwitch />
                {user ? (
                  <Button variant="outline" size="sm" onClick={logout} className="flex-1">
                    Sign out
                  </Button>
                ) : (
                  <div className="flex flex-1 gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link to={ROUTES.LOGIN}>Sign in</Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link to={ROUTES.REGISTER}>Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
