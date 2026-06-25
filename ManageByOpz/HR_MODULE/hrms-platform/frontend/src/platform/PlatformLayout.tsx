import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import {
  LayoutDashboard, Users, Calendar, Award, Building2, Shield, FileText,
  Bell, Settings, ChevronLeft, ChevronRight, ChevronDown, Search, Moon, Sun,
  BarChart3, LogOut, Command,
  GitPullRequest, User, AlertCircle, ClipboardCheck, Briefcase, Menu
} from 'lucide-react';
import { useTheme } from '../app/ThemeContext';
import clsx from 'clsx';
import { useGetMyNavigationQuery } from '../features/security/securityApi';
import {
  useGetCandidatesQuery,
  useGetJobPostingsQuery,
  useGetRequisitionsQuery,
  useGetInterviewsQuery,
  useGetOffersQuery
} from '../features/recruitment/recruitmentApi';
import { useGetEmployeesQuery } from '../features/employees/employeesApi';

const iconMap: Record<string, any> = {
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
  Briefcase
};

interface NavItem {
  name: string;
  icon: any;
  path: string;
  minRole?: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

type NavEntry = NavItem | NavSection;

const getNavigationForRole = (role: string): NavEntry[] => {
  switch (role) {
    case 'ROLE_ULTRA_SUPER_ADMIN':
      return [
        { name: 'Platform Dashboard', icon: LayoutDashboard, path: '/platform/dashboard' },
        {
          section: 'PLATFORM MANAGEMENT',
          items: [
            { name: 'Organizations', icon: Building2, path: '/org-dna' },
            { name: 'Global Analytics', icon: BarChart3, path: '/analytics' },
            { name: 'Settings', icon: Settings, path: '/settings' },
          ]
        }
      ];
    case 'ROLE_SUPER_ADMIN':
      return [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        {
          section: 'EMPLOYEE MANAGEMENT',
          items: [
            { name: 'Employee Directory', icon: Users, path: '/employees' },
            { name: 'Organization DNA', icon: Building2, path: '/org-dna' },
            { name: 'Onboarding', icon: GitPullRequest, path: '/onboarding' },
          ]
        },
        {
          section: 'WORKFORCE OPS',
          items: [
            { name: 'Leave Management', icon: Calendar, path: '/leave' },
            { name: 'My Approvals', icon: ClipboardCheck, path: '/approvals' },
            { name: 'Recognition', icon: Award, path: '/recognition' },
            { name: 'Analytics', icon: BarChart3, path: '/analytics' },
          ]
        }
      ];
    case 'ROLE_ADMIN':
      return [
        {
          section: 'EMPLOYEE MANAGEMENT',
          items: [
            { name: 'Employee Directory', icon: Users, path: '/employees' },
            { name: 'Onboarding', icon: GitPullRequest, path: '/onboarding' },
          ]
        },
        {
          section: 'WORKFORCE OPS',
          items: [
            { name: 'Leave Management', icon: Calendar, path: '/leave' },
            { name: 'My Approvals', icon: ClipboardCheck, path: '/approvals' },
            { name: 'Recognition', icon: Award, path: '/recognition' },
            { name: 'Documents', icon: FileText, path: '/documents' },
          ]
        }
      ];
    case 'ROLE_EMPLOYEE':
    default:
      return [
        { name: 'My Profile', icon: User, path: '/my-profile' },
        {
          section: 'MY WORKSPACE',
          items: [
            { name: 'My Leave', icon: Calendar, path: '/leave' },
            { name: 'My Documents', icon: FileText, path: '/documents' },
            { name: 'Recognition', icon: Award, path: '/recognition' },
          ]
        }
      ];
  }
};

export function PlatformLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('ats_sidebar_state');
    return saved === 'true';
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isApprovals = location.pathname.includes('/approvals');
  const darkMode = theme === 'dark' && !isApprovals;
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const renderAtsSubmenu = () => {
    if (collapsed || !location.pathname.startsWith('/recruitment')) return null;

    const atsSubItems = [
      { id: 'dashboard', name: 'Dashboard Reports', icon: BarChart3 },
      { id: 'requisitions', name: 'Requisitions', icon: FileText },
      { id: 'positions', name: 'Positions', icon: Building2 },
      { id: 'postings', name: 'Jobs', icon: Briefcase },
      { id: 'candidates', name: 'Candidates', icon: Users },
      { id: 'pipeline', name: 'Pipeline', icon: GitPullRequest },
      { id: 'interviews', name: 'Interviews', icon: Calendar },
      { id: 'offers', name: 'Offers', icon: ClipboardCheck },
      { id: 'preboarding', name: 'Preboarding', icon: ClipboardCheck },
      { id: 'ats-config', name: 'Settings', icon: Settings }
    ];

    const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

    return (
      <div className="pl-6 mt-1 space-y-0.5 border-l border-slate-150 dark:border-slate-800 ml-5 animate-fade-in">
        {atsSubItems.map(sub => {
          const SubIcon = sub.icon;
          const isSubActive = currentTab === sub.id;
          return (
            <NavLink
              key={sub.id}
              to={`/recruitment?tab=${sub.id}`}
              className={clsx(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150',
                isSubActive
                  ? 'bg-[#5D69F4]/10 text-[#5D69F4] dark:bg-[#5D69F4]/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-850/60'
              )}
            >
              <SubIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{sub.name}</span>
            </NavLink>
          );
        })}
      </div>
    );
  };

  // Inactivity Timer State
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 mins
  const WARNING_LIMIT = 13 * 60 * 1000;    // 13 mins
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(120); // 2 mins in seconds

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    localStorage.setItem('ats_sidebar_state', collapsed.toString());
  }, [collapsed]);

  useEffect(() => {
    const handleCollapse = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCollapsed(customEvent.detail);
    };
    window.addEventListener('collapse-sidebar', handleCollapse);
    return () => window.removeEventListener('collapse-sidebar', handleCollapse);
  }, []);

  // Fetch search data conditionally only when Search Modal is open
  const { data: searchCandidates } = useGetCandidatesQuery(undefined, { skip: !isSearchOpen });
  const { data: searchJobs } = useGetJobPostingsQuery(undefined, { skip: !isSearchOpen });
  const { data: searchRequisitions } = useGetRequisitionsQuery(undefined, { skip: !isSearchOpen });
  const { data: searchInterviews } = useGetInterviewsQuery(undefined, { skip: !isSearchOpen });
  const { data: searchOffers } = useGetOffersQuery(undefined, { skip: !isSearchOpen });
  const { data: searchEmployees } = useGetEmployeesQuery(undefined, { skip: !isSearchOpen });

  const q = searchQuery.toLowerCase().trim();
  const filteredCandidates = q
    ? (searchCandidates || []).filter((c: any) => c.fullName?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
    : [];
  const filteredJobs = q
    ? (searchJobs || []).filter((j: any) => j.jobTitle?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q))
    : [];
  const filteredRequisitions = q
    ? (searchRequisitions || []).filter((r: any) => r.title?.toLowerCase().includes(q) || r.status?.toLowerCase().includes(q))
    : [];
  const filteredEmployees = q
    ? (searchEmployees || []).filter((e: any) => `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) || e.workEmail?.toLowerCase().includes(q))
    : [];

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fallback default details if not fully set
  let displayName = 'Guest User';
  let initials = 'GU';
  let displayRoleName = 'Guest';

  if (user) {
    if (user.role) {
      displayRoleName = user.role.replace('ROLE_', '').replace(/_/g, ' ');
    }
    displayName = user.name || user.email || 'User';

    // Initials calc
    const parts = displayName.split(' ');
    let calcInitials = '';
    if (parts[0]) calcInitials += parts[0][0];
    if (parts[1]) calcInitials += parts[1][0];
    initials = (calcInitials || displayName.slice(0, 2) || 'US').toUpperCase();
  }

  // Session activity listeners
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      setLastActivity(Date.now());
      setShowSessionWarning(false);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'mousedown', 'touchstart'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveDuration = now - lastActivity;

      if (inactiveDuration >= INACTIVITY_LIMIT) {
        dispatch(logout());
        resetTimer();
        navigate('/login');
      } else if (inactiveDuration >= WARNING_LIMIT) {
        setShowSessionWarning(true);
        const secLeft = Math.max(0, Math.floor((INACTIVITY_LIMIT - inactiveDuration) / 1000));
        setRemainingTime(secLeft);
      } else {
        setShowSessionWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(interval);
    };
  }, [lastActivity, user, dispatch, navigate]);




  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Load dynamic navigation from backend
  const { data: dynamicNavData } = useGetMyNavigationQuery(undefined, {
    skip: !user
  });

  const getDynamicNavItems = (): NavEntry[] => {
    if (!dynamicNavData || !dynamicNavData.modules || dynamicNavData.modules.length === 0) {
      // Fallback to static mapping if database / API not populated
      return getNavigationForRole(user?.role || 'ROLE_EMPLOYEE');
    }

    const items: NavEntry[] = [];
    dynamicNavData.modules.forEach((mod: any) => {
      const visiblePages = mod.pages.filter((p: any) => p.menuVisible);
      if (visiblePages.length === 0) return;

      if (visiblePages.length === 1 && (mod.moduleCode === 'DASHBOARD' || mod.moduleCode === 'PAYROLL' || mod.moduleCode === 'LMS')) {
        const page = visiblePages[0];
        items.push({
          name: page.pageName,
          icon: iconMap[mod.icon] || FileText,
          path: page.routePath
        });
      } else {
        items.push({
          section: mod.moduleName.toUpperCase(),
          items: visiblePages.map((page: any) => ({
            name: page.pageName,
            icon: iconMap[mod.icon] || FileText,
            path: page.routePath
          }))
        });
      }
    });

    return items;
  };

  // Build the list of navigation items
  const dynamicNav = getDynamicNavItems();
  let navItems = [...dynamicNav];

  // Append recruitment control statically for admin/recruiter convenience
  if (user && ['ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN'].includes(user.role)) {
    const hasRecruitmentItem = navItems.some(item => 
      ('path' in item && item.path === '/recruitment') || 
      ('section' in item && item.items.some(sub => sub.path === '/recruitment'))
    );
    if (!hasRecruitmentItem) {
      let added = false;
      for (let entry of navItems) {
        if ('section' in entry && entry.section === 'WORKFORCE OPS') {
          entry.items.push({ name: 'Recruitment (ATS)', icon: Briefcase, path: '/recruitment' });
          added = true;
          break;
        }
      }
      if (!added) {
        navItems.push({
          section: 'RECRUITMENT PLATFORM',
          items: [
            { name: 'Recruitment (ATS)', icon: Briefcase, path: '/recruitment' }
          ]
        });
      }
    }
  }

  // Filter out any security-related items or empty sections
  navItems = navItems.map(entry => {
    if ('section' in entry) {
      return {
        ...entry,
        items: entry.items.filter(item => item.path !== '/security' && item.path !== '/rbac')
      };
    }
    return entry;
  }).filter(entry => {
    if ('path' in entry) {
      return entry.path !== '/security' && entry.path !== '/rbac';
    }
    if ('section' in entry) {
      return entry.items.length > 0;
    }
    return true;
  });

  return (
    <div className={clsx('flex h-screen overflow-hidden font-sans antialiased selection:bg-indigo-500/10 selection:text-indigo-650', darkMode && 'dark')}>
      {/* ── Sidebar ─────────────────── */}
      <aside
        className={clsx(
          'flex flex-col bg-white dark:bg-[#0B0F19] text-slate-700 dark:text-slate-300 transition-all duration-300 ease-in-out relative border-r border-slate-200 dark:border-slate-800 shrink-0',
          collapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C6.477 2 2 6.023 2 11c0 2.279 1.026 4.35 2.766 5.86L3.13 20.91A1 1 0 004.1 22c.168 0 .335-.042.489-.126l4.246-2.324A10.873 10.873 0 0012 20c5.523 0 10-4.023 10-9s-4.477-9-10-9z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="ml-3 animate-fade-in">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5 leading-none">
                ManageMyTalenthive
              </h1>
              <p className="text-[10px] text-slate-400 font-bold mt-1.5">HR Management</p>
            </div>
          )}
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-850 scrollbar-track-transparent">
          {navItems.map((entry, idx) => {
            if ('path' in entry) {
              const item = entry as NavItem;
              const Icon = item.icon;
              return (
                <div key={idx}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative',
                        isActive
                          ? 'bg-[#5D69F4] text-white shadow-[0_4px_12px_rgba(93,105,244,0.25)]'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                      )
                    }
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105" />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                    {collapsed && (
                      <div className="absolute left-16 bg-[#0B0F19] text-white text-xs px-2.5 py-1 rounded shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                  {item.path === '/recruitment' && renderAtsSubmenu()}
                </div>
              );
            }

            const section = entry as NavSection;
            return (
              <div key={idx} className="pt-3 first:pt-0">
                {!collapsed ? (
                  <p className="px-3 pb-2 text-[10px] font-extrabold tracking-wider text-slate-450 dark:text-slate-550 uppercase">
                    {section.section}
                  </p>
                ) : (
                  <div className="border-t border-slate-200 dark:border-slate-800 my-2 mx-2" />
                )}
                <div className="space-y-1">
                  {section.items.map((subItem, subIdx) => {
                    const SubIcon = subItem.icon;
                    return (
                      <div key={subIdx}>
                        <NavLink
                          to={subItem.path}
                          className={({ isActive }) =>
                            clsx(
                              'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group relative',
                              isActive
                                ? 'bg-[#5D69F4] text-white shadow-[0_4px_12px_rgba(93,105,244,0.25)]'
                                : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                            )
                          }
                        >
                          <SubIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                          {!collapsed && <span className="truncate">{subItem.name}</span>}
                          {collapsed && (
                            <div className="absolute left-16 bg-[#0B0F19] text-white text-xs px-2.5 py-1 rounded shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                              {subItem.name}
                            </div>
                          )}
                        </NavLink>
                        {subItem.path === '/recruitment' && renderAtsSubmenu()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="fixed w-6 h-6 bg-white dark:bg-[#1E293B] border border-slate-250 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:bg-[#5D69F4] hover:text-white transition-all duration-200 z-[9999] shadow-md hover:scale-110 active:scale-95 cursor-pointer"
          style={{ 
            left: collapsed ? '60px' : '268px', 
            top: '110px', 
            transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms, transform 200ms'
          }}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-[#0E1321]/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-200">{displayName}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider mt-0.5">{displayRoleName}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Log Out"
                className="text-slate-405 hover:text-rose-500 transition-colors p-1.5 rounded hover:bg-slate-200/40 dark:hover:bg-slate-850"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Workspace ─────────────────── */}
      <div className="flex-1 min-w-0 w-full overflow-hidden bg-[#F3F7FA] dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col">

        {/* Global Search Header */}
        <header className="w-full max-w-none h-16 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-850 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          {/* Global Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850/60 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 rounded-lg transition-colors mr-1 shrink-0"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-full px-4 py-1.5 flex-1 group hover:border-slate-350 dark:hover:border-slate-700 transition-all cursor-pointer select-none"
            >
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-550" />
              <span className="text-xs text-slate-405 dark:text-slate-550 font-medium">Search everything...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 rounded text-[9px] font-mono text-slate-400 ml-auto">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-4">

            <button className="relative p-1.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/60 border border-slate-200/40 dark:border-transparent rounded-lg transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-[#0B0F19]" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/60 border border-slate-200/40 dark:border-transparent rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 hover:bg-slate-50 dark:hover:bg-slate-850/60 border border-slate-200/45 dark:border-transparent rounded-xl transition-all"
              >
                <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-[11px] font-extrabold text-slate-800 dark:text-white leading-none">
                    {user?.role === 'ROLE_ULTRA_SUPER_ADMIN' ? 'System Console' : 'Acme Corp'}
                  </p>
                  {user?.role !== 'ROLE_ULTRA_SUPER_ADMIN' && (
                    <p className="text-[9px] text-slate-400 font-bold mt-1">Enterprise Plan</p>
                  )}
                </div>
                <ChevronDown size={12} className="text-slate-400 hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in text-xs text-slate-700 dark:text-slate-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                      <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
                      <p className="text-[10px] text-slate-455 truncate mt-0.5">{user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded border border-indigo-100 dark:border-indigo-900/40 uppercase">
                          {displayRoleName}
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded border border-slate-200/50 dark:border-slate-700">
                          {user?.tenantId || 'SYSTEM'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/my-profile');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors flex items-center gap-2"
                    >
                      <User size={14} className="text-slate-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors flex items-center gap-2"
                    >
                      <Settings size={14} className="text-slate-400" />
                      Settings
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors text-rose-650 dark:text-rose-400 font-bold flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>



        {/* Page Content */}
        <main className="flex-1 min-w-0 w-full overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Command Palette (CTRL + K) ─────────────────── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full mx-4 overflow-hidden z-50 flex flex-col max-h-[500px]">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates, jobs, requisitions, employees..."
                className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-450 w-full font-medium"
              />
              <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">ESC</span>
            </div>

            {/* Results Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Category: Candidates */}
              {filteredCandidates.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider mb-2">Candidates</h4>
                  <div className="space-y-1">
                    {filteredCandidates.map((cand) => (
                      <button
                        key={cand.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigate(`/recruitment?tab=candidates&candidateId=${cand.id}`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between group"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-205">{cand.fullName}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">{cand.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Jobs */}
              {filteredJobs.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase text-emerald-500 tracking-wider mb-2">Job Postings</h4>
                  <div className="space-y-1">
                    {filteredJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigate(`/recruitment?tab=postings`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between group"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-205">{job.jobTitle}</span>
                        <span className="text-[10px] text-slate-400">{job.location}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Requisitions */}
              {filteredRequisitions.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider mb-2">Requisitions</h4>
                  <div className="space-y-1">
                    {filteredRequisitions.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigate(`/recruitment?tab=requisitions`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between group"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-205">{req.title}</span>
                        <span className="text-[10px] text-slate-400">{req.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Employees */}
              {filteredEmployees.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase text-blue-500 tracking-wider mb-2">Employees</h4>
                  <div className="space-y-1">
                    {filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigate(`/employees`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between group"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-205">{emp.firstName} {emp.lastName}</span>
                        <span className="text-[10px] text-slate-400">{emp.employmentStatus}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results state */}
              {searchQuery.trim() !== '' &&
                filteredCandidates.length === 0 &&
                filteredJobs.length === 0 &&
                filteredRequisitions.length === 0 &&
                filteredEmployees.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No matching records found.</p>
                )}

              {searchQuery.trim() === '' && (
                <div className="text-center py-6 text-slate-400 text-[10px] font-medium">
                  Type search query to search across the platform.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showSessionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-amber-500">
              <span className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/50">
                <AlertCircle size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Session Expiring Soon</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Security Compliance</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your session has been inactive. To protect corporate multi-tenant data, you will be logged out automatically in{' '}
              <span className="font-mono font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
              </span>.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setLastActivity(Date.now());
                  setShowSessionWarning(false);
                }}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95"
              >
                Keep Logged In
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 px-3 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-lg transition-all active:scale-95"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
