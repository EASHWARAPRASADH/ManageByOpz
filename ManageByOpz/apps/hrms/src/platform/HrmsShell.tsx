/**
 * HrmsShell — HRMS-specific AppShell adapter.
 *
 * This component acts as the bridge between the generic @managemyopz/platform-shell
 * and the HRMS application. It:
 *   1. Reads HRMS auth state (user, role)
 *   2. Builds the role-based navigation tree
 *   3. Fetches dynamic navigation from backend (if available)
 *   4. Passes everything to <AppShell> as a typed config object
 *
 * The platform-shell package renders the actual sidebar, topbar, and outlet —
 * this file is ONLY responsible for app-specific configuration.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Award, Building2, FileText,
  Settings, BarChart3, GitPullRequest, User, ClipboardCheck, Briefcase,
  LifeBuoy, PhoneCall, Clock, BookOpen, Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { AppShell } from '@managemyopz/platform-shell';
import type { NavEntry, AppShellConfig, SearchResult } from '@managemyopz/platform-shell';

import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useTheme } from '../app/ThemeContext';
import { useGetMyNavigationQuery } from '../features/security/securityApi';
import {
  useGetCandidatesQuery,
  useGetJobPostingsQuery,
  useGetRequisitionsQuery,
} from '../features/recruitment/recruitmentApi';
import { useGetEmployeesQuery } from '../features/employees/employeesApi';

// ─── Icon registry (used for dynamic backend navigation) ────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Calendar,
  Award,
  Building2,
  Shield,
  FileText,
  Settings,
  BarChart3,
  GitPullRequest,
  User,
  ClipboardCheck,
  Briefcase,
};

// ─── Static nav per role ─────────────────────────────────────────────────────

const TICKETING_SECTION: NavEntry = {
  id: 'ticketing',
  section: 'TICKETING & ITSM',
  items: [
    { id: 'it-dashboard', name: 'IT Dashboard', icon: LayoutDashboard, path: '/it-dashboard' },
    { id: 'tickets', name: 'Tickets & Incidents', icon: LifeBuoy, path: '/tickets' },
    { id: 'calls', name: 'Call Logs', icon: PhoneCall, path: '/calls' },
    { id: 'timesheet', name: 'Timesheets', icon: Clock, path: '/timesheet' },
    { id: 'sla', name: 'SLA Policies', icon: ClipboardCheck, path: '/sla' },
    { id: 'kb', name: 'Knowledge Base', icon: BookOpen, path: '/kb' },
  ],
};

const EMPLOYEE_TICKETING_SECTION: NavEntry = {
  id: 'it-service-desk',
  section: 'IT SERVICE DESK',
  items: [
    { id: 'support-tickets', name: 'Support Tickets', icon: LifeBuoy, path: '/tickets' },
    { id: 'my-timesheet', name: 'My Timesheet', icon: Clock, path: '/timesheet' },
    { id: 'kb-employee', name: 'Knowledge Base', icon: BookOpen, path: '/kb' },
  ],
};

function getStaticNav(role: string): NavEntry[] {
  switch (role) {
    case 'ROLE_ULTRA_SUPER_ADMIN':
      return [
        { id: 'platform-dashboard', name: 'Platform Dashboard', icon: LayoutDashboard, path: '/platform/dashboard' },
        {
          id: 'platform-management',
          section: 'PLATFORM MANAGEMENT',
          items: [
            { id: 'org-dna', name: 'Organizations', icon: Building2, path: '/org-dna' },
            { id: 'analytics', name: 'Global Analytics', icon: BarChart3, path: '/analytics' },
            { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
          ],
        },
        TICKETING_SECTION,
      ];

    case 'ROLE_SUPER_ADMIN':
      return [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        {
          id: 'employee-management',
          section: 'EMPLOYEE MANAGEMENT',
          items: [
            { id: 'employees', name: 'Employee Directory', icon: Users, path: '/employees' },
            { id: 'org-dna-sa', name: 'Organization DNA', icon: Building2, path: '/org-dna' },
            { id: 'onboarding', name: 'Onboarding', icon: GitPullRequest, path: '/onboarding' },
          ],
        },
        {
          id: 'workforce-ops',
          section: 'WORKFORCE OPS',
          items: [
            { id: 'leave', name: 'Leave Management', icon: Calendar, path: '/leave' },
            { id: 'approvals', name: 'My Approvals', icon: ClipboardCheck, path: '/approvals' },
            { id: 'recognition', name: 'Recognition', icon: Award, path: '/recognition' },
            { id: 'analytics-sa', name: 'Analytics', icon: BarChart3, path: '/analytics' },
          ],
        },
        TICKETING_SECTION,
      ];

    case 'ROLE_ADMIN':
      return [
        {
          id: 'emp-mgmt-admin',
          section: 'EMPLOYEE MANAGEMENT',
          items: [
            { id: 'employees-admin', name: 'Employee Directory', icon: Users, path: '/employees' },
            { id: 'onboarding-admin', name: 'Onboarding', icon: GitPullRequest, path: '/onboarding' },
          ],
        },
        {
          id: 'workforce-ops-admin',
          section: 'WORKFORCE OPS',
          items: [
            { id: 'leave-admin', name: 'Leave Management', icon: Calendar, path: '/leave' },
            { id: 'approvals-admin', name: 'My Approvals', icon: ClipboardCheck, path: '/approvals' },
            { id: 'recognition-admin', name: 'Recognition', icon: Award, path: '/recognition' },
            { id: 'documents-admin', name: 'Documents', icon: FileText, path: '/documents' },
          ],
        },
        TICKETING_SECTION,
      ];

    case 'ROLE_EMPLOYEE':
    default:
      return [
        { id: 'my-profile', name: 'My Profile', icon: User, path: '/my-profile' },
        {
          id: 'my-workspace',
          section: 'MY WORKSPACE',
          items: [
            { id: 'my-leave', name: 'My Leave', icon: Calendar, path: '/leave' },
            { id: 'my-documents', name: 'My Documents', icon: FileText, path: '/documents' },
            { id: 'recognition-emp', name: 'Recognition', icon: Award, path: '/recognition' },
          ],
        },
        EMPLOYEE_TICKETING_SECTION,
      ];
  }
}

// ─── Recruitment sub-menu extra renderer ────────────────────────────────────

function RecruitmentSubMenu() {
  const location = useLocation();
  if (!location.pathname.startsWith('/recruitment')) return null;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Reports', icon: BarChart3 },
    { id: 'requisitions', label: 'Requisitions', icon: FileText },
    { id: 'positions', label: 'Positions', icon: Building2 },
    { id: 'postings', label: 'Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'pipeline', label: 'Pipeline', icon: GitPullRequest },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'offers', label: 'Offers', icon: ClipboardCheck },
  ];

  const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  return (
    <div className="pl-6 mt-1 space-y-0.5 border-l border-slate-150 dark:border-slate-800 ml-5">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <a
            key={tab.id}
            href={`/recruitment?tab=${tab.id}`}
            className={[
              'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150',
              isActive
                ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60',
            ].join(' ')}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{tab.label}</span>
          </a>
        );
      })}
    </div>
  );
}

// ─── Main HrmsShell component ─────────────────────────────────────────────────

export function HrmsShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state: any) => state.auth.user);
  const { theme, toggleTheme } = useTheme();

  // Dynamic nav from backend
  const { data: dynamicNavData } = useGetMyNavigationQuery(undefined, { skip: !user });

  // Search data (fetched lazily by AppShell's command palette)
  const { data: allCandidates } = useGetCandidatesQuery(undefined, { skip: !user });
  const { data: allJobs } = useGetJobPostingsQuery(undefined, { skip: !user });
  const { data: allRequisitions } = useGetRequisitionsQuery(undefined, { skip: !user });
  const { data: allEmployees } = useGetEmployeesQuery(undefined, { skip: !user });

  // Build nav
  function buildNav(): NavEntry[] {
    let nav: NavEntry[] = [];

    // Try dynamic nav from API
    if (dynamicNavData?.modules?.length) {
      dynamicNavData.modules.forEach((mod: any) => {
        const visiblePages = mod.pages.filter((p: any) => p.menuVisible);
        if (!visiblePages.length) return;

        if (
          visiblePages.length === 1 &&
          ['DASHBOARD', 'PAYROLL', 'LMS'].includes(mod.moduleCode)
        ) {
          const page = visiblePages[0];
          nav.push({
            id: `mod-${mod.moduleCode}`,
            name: page.pageName,
            icon: ICON_MAP[mod.icon] || FileText,
            path: page.routePath,
          });
        } else {
          nav.push({
            id: `mod-section-${mod.moduleCode}`,
            section: mod.moduleName.toUpperCase(),
            items: visiblePages.map((page: any) => ({
              id: `page-${page.routePath}`,
              name: page.pageName,
              icon: ICON_MAP[mod.icon] || FileText,
              path: page.routePath,
            })),
          });
        }
      });
    } else {
      // Fallback to static nav
      nav = getStaticNav(user?.role || 'ROLE_EMPLOYEE');
    }

    // Inject recruitment section for admins if missing
    const adminRoles = ['ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN'];
    if (user && adminRoles.includes(user.role)) {
      const hasRecruitment = nav.some(entry =>
        ('path' in entry && entry.path === '/recruitment') ||
        ('items' in entry && entry.items.some((sub: any) => sub.path === '/recruitment'))
      );

      if (!hasRecruitment) {
        const workforceSection = nav.find(
          e => 'section' in e && (e.section === 'WORKFORCE OPS' || e.section.includes('WORKFORCE'))
        ) as any;

        if (workforceSection) {
          workforceSection.items = [
            ...workforceSection.items,
            { id: 'recruitment', name: 'Recruitment (ATS)', icon: Briefcase, path: '/recruitment' },
          ];
        } else {
          nav.push({
            id: 'recruitment-platform',
            section: 'RECRUITMENT PLATFORM',
            items: [
              { id: 'recruitment', name: 'Recruitment (ATS)', icon: Briefcase, path: '/recruitment' },
            ],
          });
        }
      }
    }

    // Remove security/rbac items
    nav = nav
      .map(entry => {
        if ('items' in entry) {
          return {
            ...entry,
            items: entry.items.filter(
              (i: any) => i.path !== '/security' && i.path !== '/rbac'
            ),
          };
        }
        return entry;
      })
      .filter(entry => {
        if ('path' in entry) return entry.path !== '/security' && entry.path !== '/rbac';
        if ('items' in entry) return entry.items.length > 0;
        return true;
      });

    return nav;
  }

  // Search handler
  async function onSearch(query: string): Promise<SearchResult[]> {
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    (allCandidates || []).forEach((c: any) => {
      if (c.fullName?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) {
        results.push({
          id: `cand-${c.id}`,
          label: c.fullName,
          description: c.email,
          category: 'Candidates',
          categoryColor: '#6366F1',
          path: `/recruitment?tab=candidates&candidateId=${c.id}`,
          icon: User,
        });
      }
    });

    (allJobs || []).forEach((j: any) => {
      if (j.jobTitle?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q)) {
        results.push({
          id: `job-${j.id}`,
          label: j.jobTitle,
          description: j.location,
          category: 'Job Postings',
          categoryColor: '#10B981',
          path: '/recruitment?tab=postings',
          icon: Briefcase,
        });
      }
    });

    (allRequisitions || []).forEach((r: any) => {
      if (r.title?.toLowerCase().includes(q)) {
        results.push({
          id: `req-${r.id}`,
          label: r.title,
          description: r.status,
          category: 'Requisitions',
          categoryColor: '#F59E0B',
          path: '/recruitment?tab=requisitions',
          icon: FileText,
        });
      }
    });

    (allEmployees || []).forEach((e: any) => {
      const fullName = `${e.firstName} ${e.lastName}`;
      if (fullName.toLowerCase().includes(q) || e.workEmail?.toLowerCase().includes(q)) {
        results.push({
          id: `emp-${e.id}`,
          label: fullName,
          description: e.workEmail,
          category: 'Employees',
          categoryColor: '#3B82F6',
          path: '/employees',
          icon: Users,
        });
      }
    });

    return results;
  }

  const shellUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      }
    : null;

  const config: AppShellConfig = {
    branding: {
      appName: 'ManageByOpz',
      appSubtitle: 'HR Management',
      primaryColor: '#5D69F4',
    },
    nav: buildNav(),
    user: shellUser,
    onLogout: () => {
      dispatch(logout());
      navigate('/login');
    },
    onNavigate: navigate,
    onSearch,
    darkMode: theme === 'dark',
    onToggleDarkMode: toggleTheme,
    inactivityTimeoutMs: 15 * 60 * 1000,
  };

  return (
    <AppShell
      config={config}
      renderNavExtra={({ path }) =>
        path === '/recruitment' ? <RecruitmentSubMenu /> : null
      }
    />
  );
}
