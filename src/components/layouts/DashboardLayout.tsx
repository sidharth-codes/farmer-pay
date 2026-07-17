import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  QrCode,
  Wallet,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sprout,
  Leaf,
  CalendarDays,
  UserCircle,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ThemeSwitch, ProfileAvatar, NotificationBell, Breadcrumb } from '../ui';
import type { BreadcrumbItem } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_DASHBOARD, ROUTES, ROLE_LABELS } from '../../constants';
import type { UserRole } from '../../types';
import { cn } from '../../utils';

interface NavItem {
  label: string;
  to: string;
  Icon: LucideIcon;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', to: '', Icon: LayoutDashboard },
  { label: 'Farms', to: '/farms', Icon: Sprout },
  { label: 'Products', to: '/products', Icon: Leaf },
  { label: 'Harvests', to: '/harvests', Icon: CalendarDays },
  { label: 'Batches', to: '/batches', Icon: Package },
  { label: 'Verification', to: '/verification', Icon: QrCode },
  { label: 'Wallet', to: '/wallet', Icon: Wallet },
  { label: 'Participants', to: '/participants', Icon: Users, roles: ['ADMIN'] },
  { label: 'Settings', to: '/settings', Icon: Settings },
  { label: 'Profile', to: '/profile', Icon: UserCircle },
  { label: 'Security', to: '/security', Icon: ShieldCheck },
];

function resolveBase(role: UserRole): string {
  return ROLE_DASHBOARD[role as Exclude<UserRole, 'CONSUMER'>] ?? ROUTES.DASHBOARD;
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const base = user ? resolveBase(user.role) : ROUTES.DASHBOARD;

  const items = useMemo(
    () =>
      NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map(
        (item) => ({
          ...item,
          to: item.to === '' ? base : `${base}${item.to}`,
        }),
      ),
    [base, user],
  );

  const crumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const list: BreadcrumbItem[] = [{ label: 'Dashboard', href: base }];
    // segments: ['dashboard', '<role>', '<page>', ...rest]
    if (segments.length > 2) {
      const page = segments[2];
      const label = page.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      list.push({ label, href: `${base}/${page}` });
    }
    if (segments.length > 3) {
      // Detail pages (e.g. farms/:id, batches/:id)
      list.push({ label: segments.slice(3).join(' / ') });
    }
    return list;
  }, [location.pathname, base]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === base}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <item.Icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <button
            onClick={() => {
              logout();
              navigate(ROUTES.HOME);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Sidebar - mobile */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === base}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )
                    }
                  >
                    <item.Icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
          <Breadcrumb items={crumbs} className="hidden sm:flex" />
          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitch />
            <NotificationBell count={0} />
            <Link to={base} className="ml-1 flex items-center gap-2.5">
              <ProfileAvatar name={user?.name ?? 'User'} size="sm" />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user ? ROLE_LABELS[user.role] : ''}
                </p>
              </div>
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
