import { DashboardOverview } from './DashboardOverview';
import { DashboardPlaceholder } from './DashboardPlaceholder';

export function FarmerDashboard() {
  return <DashboardOverview role="FARMER" />;
}
export function WholesalerDashboard() {
  return <DashboardOverview role="WHOLESALER" />;
}
export function RetailerDashboard() {
  return <DashboardOverview role="RETAILER" />;
}
export function AdminDashboard() {
  return <DashboardOverview role="ADMIN" />;
}

export function BatchesPage() {
  return (
    <DashboardPlaceholder
      title="Batches"
      description="Register, track, and manage product batches across the custody chain."
    />
  );
}
export function VerificationPage() {
  return (
    <DashboardPlaceholder
      title="Verification"
      description="Issue and verify QR identities for batches in your custody."
    />
  );
}
export function WalletPage() {
  return (
    <DashboardPlaceholder
      title="Wallet"
      description="Your Stellar wallet balance, transaction history, and settlement status."
    />
  );
}
export function ParticipantsPage() {
  return (
    <DashboardPlaceholder
      title="Participants"
      description="Manage farmers, wholesalers, and retailers across the FarmerPay network."
    />
  );
}
export function SettingsPage() {
  return (
    <DashboardPlaceholder
      title="Settings"
      description="Manage your profile, organization, and notification preferences."
    />
  );
}
