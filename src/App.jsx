import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectListPage from './pages/dashboard/projects/ProjectListPage';
import CreateProjectPage from './pages/dashboard/projects/CreateProjectPage';
import ProjectDetailsPage from './pages/dashboard/projects/ProjectDetailsPage';
import AddStepPage from './pages/dashboard/projects/AddStepPage';
import StepDetailsPage from './pages/dashboard/projects/StepDetailsPage';
import AddProofPage from './pages/dashboard/projects/AddProofPage';
import AcceptInvitePage from './pages/dashboard/projects/AcceptInvitePage';
import PropertyListPage from './pages/dashboard/properties/PropertyListPage';
import CreatePropertyPage from './pages/dashboard/properties/CreatePropertyPage';
import PropertyDetailsPage from './pages/dashboard/properties/PropertyDetailsPage';
import EditPropertyPage from './pages/dashboard/properties/EditPropertyPage';
import WalletPage from './pages/dashboard/WalletPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import LeaseList from './pages/dashboard/LeaseList';
import LeaseForm from './pages/dashboard/LeaseForm';
import LeaseDetailsPage from './pages/dashboard/LeaseDetailsPage';
import TenantsList from './pages/dashboard/TenantsList';
import PaymentHistory from './pages/dashboard/PaymentHistory';
import PaymentForm from './pages/dashboard/PaymentForm';
import PaymentDetailsPage from './pages/dashboard/PaymentDetailsPage';
import UnpaidRentsPage from './pages/dashboard/UnpaidRentsPage';
import IncidentList from './pages/dashboard/incidents/IncidentList';
import IncidentForm from './pages/dashboard/incidents/IncidentForm';
import IncidentDetails from './pages/dashboard/incidents/IncidentDetails';
import InventoryList from './pages/dashboard/inventory/InventoryList';
import InventoryForm from './pages/dashboard/inventory/InventoryForm';
import AgencySettingsPage from './pages/dashboard/AgencySettingsPage';
import CommissionsPage from './pages/dashboard/admin/CommissionsPage';
import CustomPlanRequestsPage from './pages/dashboard/admin/CustomPlanRequestsPage';
import ContactMessagesPage from './pages/dashboard/admin/ContactMessagesPage';
import AdminPlansPage from './pages/dashboard/admin/AdminPlansPage';
import AgencyDetailsAdminPage from './pages/dashboard/admin/AgencyDetailsAdminPage';
import TestAdminPage from './pages/dashboard/admin/TestAdminPage';
import LandlordListPage from './pages/dashboard/landlords/LandlordListPage';
import LandlordDetailsPage from './pages/dashboard/landlords/LandlordDetailsPage';
import EditLandlord from './pages/dashboard/landlords/EditLandlord';
import BailleurForm from './pages/dashboard/bailleurs/BailleurForm';
import BuildingList from './pages/dashboard/immeubles/BuildingList';
import BuildingForm from './pages/dashboard/immeubles/BuildingForm';
import BuildingDetails from './pages/dashboard/immeubles/BuildingDetails';
import CreateTenant from './pages/dashboard/tenants/CreateTenant';
import EditTenant from './pages/dashboard/tenants/EditTenant';
import TenantDetailsPage from './pages/dashboard/tenants/TenantDetailsPage';
import TenantPaymentsPage from './pages/dashboard/tenant/TenantPaymentsPage';
import TenantLeasePage from './pages/dashboard/tenant/TenantLeasePage';
import TeamPage from './pages/dashboard/team/TeamPage';
import DashboardLayout from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import PortalLayout from './components/portal/PortalLayout';
import LandingPage from './pages/portal/LandingPage';
import PricingPage from './pages/portal/PricingPage';
import CustomPlanRequestPage from './pages/portal/CustomPlanRequestPage';
import ContactPage from './pages/portal/ContactPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import NotificationDetailsPage from './pages/dashboard/NotificationDetailsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Portal Routes (Public) */}
          {/* Landing Page (Standalone - has its own navbar) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Portal Routes (Shared Layout for generic pages) */}
          <Route element={<PortalLayout />}>
            <Route path="/custom-plan-request" element={<CustomPlanRequestPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes Protégées */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectListPage />} />
              <Route path="/projects/create" element={<CreateProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/projects/:id/steps/new" element={<AddStepPage />} />
              <Route path="/projects/:id/steps/:stepId" element={<StepDetailsPage />} />
              <Route path="/projects/:id/steps/:stepId/proofs/new" element={<AddProofPage />} />
              <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
              <Route path="/biens" element={<PropertyListPage />} />
              <Route path="/biens/create" element={<CreatePropertyPage />} />
              <Route path="/biens/:id" element={<PropertyDetailsPage />} />
              <Route path="/biens/:id/edit" element={<EditPropertyPage />} />

              {/* Gestion Locative Routes */}
              <Route path="/leases" element={<LeaseList />} />
              <Route path="/leases/new" element={<LeaseForm />} />
              <Route path="/leases/:id" element={<LeaseDetailsPage />} />
              <Route path="/tenants" element={<TenantsList />} />
              <Route path="/tenants/:id" element={<TenantDetailsPage />} />
              <Route path="/tenants/edit/:id" element={<EditTenant />} />

              <Route path="/payments" element={<PaymentHistory />} />
              <Route path="/payments/new" element={<PaymentForm />} />
              <Route path="/payments/:id" element={<PaymentDetailsPage />} />
              <Route path="/payments/unpaid" element={<UnpaidRentsPage />} />

              <Route path="/incidents" element={<IncidentList />} />
              <Route path="/incidents/new" element={<IncidentForm />} />
              <Route path="/incidents/:id" element={<IncidentDetails />} />

              <Route path="/dashboard/inventory" element={<InventoryList />} />
              <Route path="/dashboard/inventory/new" element={<InventoryForm />} />

              {/* Bailleurs */}
              {/* Bailleurs */}
              <Route path="/bailleurs" element={<LandlordListPage />} />
              <Route path="/bailleurs/create" element={<BailleurForm />} /> {/* Keep existing form if valid or rename */}
              <Route path="/bailleurs/:id" element={<LandlordDetailsPage />} />
              <Route path="/bailleurs/edit/:id" element={<EditLandlord />} />

              {/* Immeubles */}
              <Route path="/immeubles" element={<BuildingList />} />
              <Route path="/immeubles/new" element={<BuildingForm />} />
              <Route path="/immeubles/:id" element={<BuildingDetails />} />

              {/* Admin Routes */}
              <Route path="/admin/test" element={<TestAdminPage />} />
              <Route path="/admin/plans" element={<AdminPlansPage />} />
              <Route path="/admin/agencies/:id" element={<AgencyDetailsAdminPage />} />
              <Route path="/admin/commissions" element={<CommissionsPage />} />
              <Route path="/admin/custom-plan-requests" element={<CustomPlanRequestsPage />} />
              <Route path="/admin/contact-messages" element={<ContactMessagesPage />} />

              {/* Agency Settings */}
              <Route path="/agency/settings" element={<AgencySettingsPage />} />
              <Route path="/agency/team" element={<TeamPage />} />

              {/* Baux */}
              <Route path="/dashboard/tenants/new" element={<CreateTenant />} />

              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/notifications/:id" element={<NotificationDetailsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Tenant Special Routes */}
              <Route path="/my-payments" element={<TenantPaymentsPage />} />
              <Route path="/my-lease" element={<TenantLeasePage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
