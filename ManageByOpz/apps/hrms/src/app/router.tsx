import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HrmsShell } from '../platform/HrmsShell';
import { Dashboard } from '../features/dashboard/Dashboard';
import { EmployeeDirectory } from '../features/employees/EmployeeDirectory';
import { OrgDnaScreen } from '../features/org-dna/OrgDnaScreen';
import { LeaveScreen } from '../features/leave/LeaveScreen';
import { RecognitionScreen } from '../features/recognition/RecognitionScreen';
import { RecruitmentScreen } from '../features/recruitment/RecruitmentScreen';
import { Login } from '../features/auth/Login';
import { ActivateAccount } from '../features/auth/ActivateAccount';
import { ForgotPassword } from '../features/auth/ForgotPassword';
import { ResetPassword } from '../features/auth/ResetPassword';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { RoleGuard } from '../features/auth/RoleGuard';
import { PlatformDashboard } from '../features/dashboard/PlatformDashboard';
import { MyProfileScreen } from '../features/employees/MyProfileScreen';
import { OnboardingDashboard } from '../features/employees/OnboardingDashboard';
import { EmployeeOnboardingWizard } from '../features/employees/EmployeeOnboardingWizard';
import { MockScreen } from '../features/dashboard/MockScreen';
import { ApprovalsScreen } from '../features/workflow/ApprovalsScreen';
import { ShieldAlert, FileText, Settings, HelpCircle, GitPullRequest } from 'lucide-react';

// Ticketing Page Imports
import { TicketingProviderWrapper } from '../features/ticketing/TicketingProviderWrapper';
import { Tickets } from '../features/ticketing/pages/Tickets';
import { TicketDetail } from '../features/ticketing/pages/TicketDetail';
import { SLAManagementPremium } from '../features/ticketing/pages/SLAManagementPremium';
import { Timesheet } from '../features/ticketing/pages/Timesheet';
import { CallLogs } from '../features/ticketing/pages/calls/CallLogs';
import { CreateCall } from '../features/ticketing/pages/calls/CreateCall';
import { CallDetail } from '../features/ticketing/pages/calls/CallDetail';
import { ProblemManagement } from '../features/ticketing/pages/ProblemManagement';
import { ChangeManagement } from '../features/ticketing/pages/ChangeManagement';
import { KnowledgeBase } from '../features/ticketing/pages/KnowledgeBase';
import { ServiceCatalog } from '../features/ticketing/pages/ServiceCatalog';
import { Groups } from '../features/ticketing/pages/Groups';
import { Dashboard as TicketingDashboard } from '../features/ticketing/pages/Dashboard';
import { Approvals as TicketingApprovals } from '../features/ticketing/pages/Approvals';
import { TimesheetApprovals } from '../features/ticketing/pages/TimesheetApprovals';
import { ApprovedTickets } from '../features/ticketing/pages/ApprovedTickets';
import { IncidentCategoryManagement } from '../features/ticketing/pages/IncidentCategoryManagement';
import { EmailIntegrations } from '../features/ticketing/pages/EmailIntegrations';
import { Settings as TicketingSettings } from '../features/ticketing/pages/Settings';
import { ActivityTracker } from '../features/ticketing/pages/ActivityTracker';
import { DataAnalytics } from '../features/ticketing/pages/DataAnalytics';
import { GlobalSearch } from '../features/ticketing/pages/GlobalSearch';

/**
 * Router — Feature-sliced routing for the HR Platform.
 *
 * Each module registers its routes here. HrmsShell (backed by @managemyopz/platform-shell)
 * wraps all authenticated routes with the unified enterprise sidebar, header, and content area.
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/activate-account',
    element: <ActivateAccount />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HrmsShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      // Platform Dashboard (Ultra Super Admin)
      {
        path: 'platform/dashboard',
        element: (
          <RoleGuard allowedRoles={['ROLE_ULTRA_SUPER_ADMIN']} fallback={<Navigate to="/403" replace />}>
            <PlatformDashboard />
          </RoleGuard>
        ),
      },
      // Super Admin Dashboard
      {
        path: 'dashboard',
        element: (
          <RoleGuard minRole="ROLE_SUPER_ADMIN" fallback={<Navigate to="/403" replace />}>
            <Dashboard />
          </RoleGuard>
        ),
      },
      {
        path: 'employees',
        element: (
          <RoleGuard minRole="ROLE_ADMIN" fallback={<Navigate to="/403" replace />}>
            <EmployeeDirectory />
          </RoleGuard>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <RoleGuard minRole="ROLE_ADMIN" fallback={<Navigate to="/403" replace />}>
            <OnboardingDashboard />
          </RoleGuard>
        ),
      },
      {
        path: 'onboarding/new',
        element: (
          <RoleGuard minRole="ROLE_ADMIN" fallback={<Navigate to="/403" replace />}>
            <EmployeeOnboardingWizard
              onClose={() => window.history.back()}
              onSuccess={() => window.location.href = '/employees'}
            />
          </RoleGuard>
        ),
      },
      {
        path: 'org-dna',
        element: (
          <RoleGuard minRole="ROLE_SUPER_ADMIN" fallback={<Navigate to="/403" replace />}>
            <OrgDnaScreen />
          </RoleGuard>
        ),
      },
      {
        path: 'leave',
        element: (
          <RoleGuard minRole="ROLE_EMPLOYEE" fallback={<Navigate to="/403" replace />}>
            <LeaveScreen />
          </RoleGuard>
        ),
      },
      {
        path: 'recognition',
        element: <RecognitionScreen />, // accessible by all employees
      },
      {
        path: 'recruitment',
        element: (
          <RoleGuard allowedRoles={['ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN']} fallback={<Navigate to="/403" replace />}>
            <RecruitmentScreen />
          </RoleGuard>
        ),
      },
      {
        path: 'approvals',
        element: (
          <RoleGuard minRole="ROLE_ADMIN" fallback={<Navigate to="/403" replace />}>
            <ApprovalsScreen />
          </RoleGuard>
        ),
      },
      {
        path: 'my-profile',
        element: <MyProfileScreen />,
      },
      // Mock routes for sidebar navigation
      {
        path: 'rbac',
        element: (
          <RoleGuard allowedRoles={['ROLE_ULTRA_SUPER_ADMIN']} fallback={<Navigate to="/403" replace />}>
            <MockScreen title="Global RBAC Schema" description="Define and assign system-wide permissions and security profiles." icon={<ShieldAlert size={24} />} />
          </RoleGuard>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <RoleGuard minRole="ROLE_ADMIN" fallback={<Navigate to="/403" replace />}>
            <MockScreen title="Onboarding Orchestrator" description="Automate employee digital twin creation and setup checklists." icon={<GitPullRequest size={24} />} />
          </RoleGuard>
        ),
      },
      {
        path: 'documents',
        element: (
          <RoleGuard minRole="ROLE_ADMIN" fallback={<Navigate to="/403" replace />}>
            <MockScreen title="Documents Library" description="Access contract templates, policies, and tenant documents." icon={<FileText size={24} />} />
          </RoleGuard>
        ),
      },
      {
        path: 'settings',
        element: <MockScreen title="Account Settings" description="Configure user preferences, security credentials, and application themes." icon={<Settings size={24} />} />,
      },
      {
        path: 'help',
        element: <MockScreen title="Help & Support" description="Access system manuals, contact support, and submit feature requests." icon={<HelpCircle size={24} />} />,
      },
      {
        path: '403',
        element: <MockScreen title="Access Denied (403)" description="You do not have the required role or permission to view this module." icon={<ShieldAlert size={24} className="text-red-500" />} />,
      },
      // Ticketing routes
      {
        path: 'tickets',
        element: <TicketingProviderWrapper><Tickets /></TicketingProviderWrapper>,
      },
      {
        path: 'tickets/:id',
        element: <TicketingProviderWrapper><TicketDetail /></TicketingProviderWrapper>,
      },
      {
        path: 'sla',
        element: <TicketingProviderWrapper><SLAManagementPremium /></TicketingProviderWrapper>,
      },
      {
        path: 'timesheet',
        element: <TicketingProviderWrapper><Timesheet /></TicketingProviderWrapper>,
      },
      {
        path: 'timesheet/:weekStart',
        element: <TicketingProviderWrapper><Timesheet /></TicketingProviderWrapper>,
      },
      {
        path: 'calls',
        element: <TicketingProviderWrapper><CallLogs /></TicketingProviderWrapper>,
      },
      {
        path: 'calls/new',
        element: <TicketingProviderWrapper><CreateCall /></TicketingProviderWrapper>,
      },
      {
        path: 'calls/:id',
        element: <TicketingProviderWrapper><CallDetail /></TicketingProviderWrapper>,
      },
      {
        path: 'problem',
        element: <TicketingProviderWrapper><ProblemManagement /></TicketingProviderWrapper>,
      },
      {
        path: 'change',
        element: <TicketingProviderWrapper><ChangeManagement /></TicketingProviderWrapper>,
      },
      {
        path: 'kb',
        element: <TicketingProviderWrapper><KnowledgeBase /></TicketingProviderWrapper>,
      },
      {
        path: 'catalog',
        element: <TicketingProviderWrapper><ServiceCatalog /></TicketingProviderWrapper>,
      },
      {
        path: 'groups',
        element: <TicketingProviderWrapper><Groups /></TicketingProviderWrapper>,
      },
      {
        path: 'it-dashboard',
        element: <TicketingProviderWrapper><TicketingDashboard /></TicketingProviderWrapper>,
      },
      {
        path: 'it-approvals',
        element: <TicketingProviderWrapper><TicketingApprovals /></TicketingProviderWrapper>,
      },
      {
        path: 'timesheet-approvals',
        element: <TicketingProviderWrapper><TimesheetApprovals /></TicketingProviderWrapper>,
      },
      {
        path: 'approved-tickets',
        element: <TicketingProviderWrapper><ApprovedTickets /></TicketingProviderWrapper>,
      },
      {
        path: 'incident-categories',
        element: <TicketingProviderWrapper><IncidentCategoryManagement /></TicketingProviderWrapper>,
      },
      {
        path: 'email-integrations',
        element: <TicketingProviderWrapper><EmailIntegrations /></TicketingProviderWrapper>,
      },
      {
        path: 'it-settings',
        element: <TicketingProviderWrapper><TicketingSettings /></TicketingProviderWrapper>,
      },
      {
        path: 'activity-tracker',
        element: <TicketingProviderWrapper><ActivityTracker /></TicketingProviderWrapper>,
      },
      {
        path: 'data-analytics',
        element: <TicketingProviderWrapper><DataAnalytics /></TicketingProviderWrapper>,
      },
      {
        path: 'global-search',
        element: <TicketingProviderWrapper><GlobalSearch /></TicketingProviderWrapper>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
