import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PlatformLayout } from '../platform/PlatformLayout';
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

/**
 * Router — Feature-sliced routing for the HR Platform.
 *
 * Each module registers its routes here. The PlatformLayout
 * wraps all authenticated routes with sidebar, header, and content area.
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
        <PlatformLayout />
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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
