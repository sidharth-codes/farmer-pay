import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { queryClient } from './store/queryClient';
import { PublicLayout } from './components/layouts/PublicLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { FullPageLoader } from './components/ui/Spinner';
import { ROUTES } from './constants';

// Public pages
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const VerifyPage = lazy(() => import('./pages/VerifyPage').then((m) => ({ default: m.VerifyPage })));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('./pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const VerifyEmailPage = lazy(() =>
  import('./pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })),
);

// Dashboard pages
const DashboardIndex = lazy(() =>
  import('./pages/dashboards/DashboardIndex').then((m) => ({ default: m.DashboardIndex })),
);
const FarmerDashboard = lazy(() =>
  import('./pages/dashboards').then((m) => ({ default: m.FarmerDashboard })),
);
const WholesalerDashboard = lazy(() =>
  import('./pages/dashboards').then((m) => ({ default: m.WholesalerDashboard })),
);
const RetailerDashboard = lazy(() =>
  import('./pages/dashboards').then((m) => ({ default: m.RetailerDashboard })),
);
const AdminDashboard = lazy(() =>
  import('./pages/dashboards').then((m) => ({ default: m.AdminDashboard })),
);
const VerificationPage = lazy(() =>
  import('./pages/dashboards').then((m) => ({ default: m.VerificationPage })),
);
const WalletPage = lazy(() => import('./pages/dashboards').then((m) => ({ default: m.WalletPage })));
const ParticipantsPage = lazy(() =>
  import('./pages/dashboards').then((m) => ({ default: m.ParticipantsPage })),
);
const SettingsPage = lazy(() => import('./pages/dashboards').then((m) => ({ default: m.SettingsPage })));
const ProfileSettingsPage = lazy(() =>
  import('./pages/dashboards/settings/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage })),
);
const SecuritySettingsPage = lazy(() =>
  import('./pages/dashboards/settings/SecuritySettingsPage').then((m) => ({ default: m.SecuritySettingsPage })),
);
const AdminUsersPage = lazy(() =>
  import('./pages/dashboards/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
);

// Agricultural domain pages
const FarmListPage = lazy(() =>
  import('./pages/dashboards/agriculture').then((m) => ({ default: m.FarmListPage })),
);
const FarmCreatePage = lazy(() =>
  import('./pages/dashboards/agriculture').then((m) => ({ default: m.FarmCreatePage })),
);
const FarmDetailPage = lazy(() =>
  import('./pages/dashboards/agriculture').then((m) => ({ default: m.FarmDetailPage })),
);
const ProductsPage = lazy(() =>
  import('./pages/dashboards/agriculture').then((m) => ({ default: m.ProductsPage })),
);
const HarvestsPage = lazy(() =>
  import('./pages/dashboards/agriculture').then((m) => ({ default: m.HarvestsPage })),
);
const BatchesListPage = lazy(() =>
  import('./pages/dashboards/agriculture').then((m) => ({ default: m.BatchesPage })),
);
const BatchDetailPage = lazy(() =>
  import('./pages/dashboards/agriculture').then((m) => ({ default: m.BatchDetailPage })),
);
const BatchPassportPage = lazy(() =>
  import('./pages/dashboards/agriculture').then((m) => ({ default: m.BatchPassportPage })),
);

// Error pages
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() =>
  import('./pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })),
);
const ServerErrorPage = lazy(() =>
  import('./pages/ServerErrorPage').then((m) => ({ default: m.ServerErrorPage })),
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<FullPageLoader />}>{element}</Suspense>
);

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.HOME, element: withSuspense(<LandingPage />) },
      { path: ROUTES.ABOUT, element: withSuspense(<AboutPage />) },
      { path: ROUTES.FEATURES, element: withSuspense(<FeaturesPage />) },
      { path: ROUTES.HOW_IT_WORKS, element: withSuspense(<HowItWorksPage />) },
      { path: ROUTES.CONTACT, element: withSuspense(<ContactPage />) },
      { path: ROUTES.VERIFY, element: withSuspense(<VerifyPage />) },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: withSuspense(<GuestRoute><LoginPage /></GuestRoute>),
  },
  {
    path: ROUTES.REGISTER,
    element: withSuspense(<GuestRoute><RegisterPage /></GuestRoute>),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: withSuspense(<GuestRoute><ForgotPasswordPage /></GuestRoute>),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: withSuspense(<ResetPasswordPage />),
  },
  {
    path: ROUTES.VERIFY_EMAIL,
    element: withSuspense(<VerifyEmailPage />),
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(<DashboardIndex />) },
      {
        path: 'farmer',
        element: (
          <ProtectedRoute roles={['FARMER']}>
            {withSuspense(<FarmerDashboard />)}
          </ProtectedRoute>
        ),
        children: [
          { path: 'batches', element: withSuspense(<BatchesListPage />) },
          { path: 'batches/:batchId', element: withSuspense(<BatchDetailPage />) },
          { path: 'batches/:batchId/passport', element: withSuspense(<BatchPassportPage />) },
          { path: 'farms', element: withSuspense(<FarmListPage />) },
          { path: 'farms/create', element: withSuspense(<FarmCreatePage />) },
          { path: 'farms/:farmId', element: withSuspense(<FarmDetailPage />) },
          { path: 'products', element: withSuspense(<ProductsPage />) },
          { path: 'harvests', element: withSuspense(<HarvestsPage />) },
          { path: 'verification', element: withSuspense(<VerificationPage />) },
          { path: 'wallet', element: withSuspense(<WalletPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
          { path: 'profile', element: withSuspense(<ProfileSettingsPage />) },
          { path: 'security', element: withSuspense(<SecuritySettingsPage />) },
        ],
      },
      {
        path: 'wholesaler',
        element: (
          <ProtectedRoute roles={['WHOLESALER']}>
            {withSuspense(<WholesalerDashboard />)}
          </ProtectedRoute>
        ),
        children: [
          { path: 'batches', element: withSuspense(<BatchesListPage />) },
          { path: 'batches/:batchId', element: withSuspense(<BatchDetailPage />) },
          { path: 'batches/:batchId/passport', element: withSuspense(<BatchPassportPage />) },
          { path: 'farms', element: withSuspense(<FarmListPage />) },
          { path: 'farms/:farmId', element: withSuspense(<FarmDetailPage />) },
          { path: 'products', element: withSuspense(<ProductsPage />) },
          { path: 'harvests', element: withSuspense(<HarvestsPage />) },
          { path: 'verification', element: withSuspense(<VerificationPage />) },
          { path: 'wallet', element: withSuspense(<WalletPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
          { path: 'profile', element: withSuspense(<ProfileSettingsPage />) },
          { path: 'security', element: withSuspense(<SecuritySettingsPage />) },
        ],
      },
      {
        path: 'retailer',
        element: (
          <ProtectedRoute roles={['RETAILER']}>
            {withSuspense(<RetailerDashboard />)}
          </ProtectedRoute>
        ),
        children: [
          { path: 'batches', element: withSuspense(<BatchesListPage />) },
          { path: 'batches/:batchId', element: withSuspense(<BatchDetailPage />) },
          { path: 'batches/:batchId/passport', element: withSuspense(<BatchPassportPage />) },
          { path: 'farms', element: withSuspense(<FarmListPage />) },
          { path: 'farms/:farmId', element: withSuspense(<FarmDetailPage />) },
          { path: 'products', element: withSuspense(<ProductsPage />) },
          { path: 'harvests', element: withSuspense(<HarvestsPage />) },
          { path: 'verification', element: withSuspense(<VerificationPage />) },
          { path: 'wallet', element: withSuspense(<WalletPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
          { path: 'profile', element: withSuspense(<ProfileSettingsPage />) },
          { path: 'security', element: withSuspense(<SecuritySettingsPage />) },
        ],
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {withSuspense(<AdminDashboard />)}
          </ProtectedRoute>
        ),
        children: [
          { path: 'batches', element: withSuspense(<BatchesListPage />) },
          { path: 'batches/:batchId', element: withSuspense(<BatchDetailPage />) },
          { path: 'batches/:batchId/passport', element: withSuspense(<BatchPassportPage />) },
          { path: 'farms', element: withSuspense(<FarmListPage />) },
          { path: 'farms/create', element: withSuspense(<FarmCreatePage />) },
          { path: 'farms/:farmId', element: withSuspense(<FarmDetailPage />) },
          { path: 'products', element: withSuspense(<ProductsPage />) },
          { path: 'harvests', element: withSuspense(<HarvestsPage />) },
          { path: 'verification', element: withSuspense(<VerificationPage />) },
          { path: 'wallet', element: withSuspense(<WalletPage />) },
          { path: 'participants', element: withSuspense(<AdminUsersPage />) },
          { path: 'users', element: withSuspense(<AdminUsersPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
          { path: 'profile', element: withSuspense(<ProfileSettingsPage />) },
          { path: 'security', element: withSuspense(<SecuritySettingsPage />) },
        ],
      },
    ],
  },
  { path: ROUTES.UNAUTHORIZED, element: withSuspense(<UnauthorizedPage />) },
  { path: '/500', element: withSuspense(<ServerErrorPage />) },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
