/**
 * TicketingShell — Ticketing-specific AppShell adapter.
 *
 * This component is the bridge between @managemyopz/platform-shell
 * and the Ticketing application. It:
 *   1. Reads ticketing auth state (profile, user) from AuthContext
 *   2. Reads live branding (company name, logo) from BrandingContext
 *   3. Reads live ticket badge counts from TicketsContext
 *   4. Builds the role-based navigation tree
 *   5. Passes everything to <AppShell> as a typed config object
 *
 * The platform-shell package handles ALL layout rendering.
 * This file is ONLY responsible for app-specific configuration.
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  CheckSquare,
  BarChart3,
  History,
  Clock,
  ChevronRight,
  PlusCircle,
  UserCheck,
  FolderOpen,
  UserMinus,
  CheckCircle2,
  List,
  Map,
  Settings2,
  ShoppingCart,
  Database,
  AlertOctagon,
  GitPullRequest,
  BookOpen,
  HelpCircle,
  BarChart2,
  ClipboardList,
  CalendarDays,
  Trophy,
  Building2,
  KeyRound,
  Monitor,
  Palette,
  Tag,
  PhoneCall,
  BrainCircuit,
  MessageCircle,
} from 'lucide-react';

import { AppShell } from '@managemyopz/platform-shell';
import type { NavEntry, AppShellConfig, SearchResult } from '@managemyopz/platform-shell';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useBranding } from '../contexts/BrandingContext';
import { useTickets } from '../contexts/TicketsContext';
import api from '../lib/api';
import { ROLE_HIERARCHY, type Role } from '../lib/roles';

// ─── Role helper ─────────────────────────────────────────────────────────────

function meetsRole(profileRole: string | undefined, minRole: Role): boolean {
  if (!profileRole) return false;
  return (ROLE_HIERARCHY[profileRole as Role] || 0) >= ROLE_HIERARCHY[minRole];
}

function isAdmin(role?: string) {
  return meetsRole(role, 'admin');
}
function isAgentOrAbove(role?: string) {
  return meetsRole(role, 'agent');
}
function isSuperAdmin(role?: string) {
  return meetsRole(role, 'super_admin');
}
function isUltraSuperAdmin(role?: string) {
  return role === 'ultra_super_admin';
}

// ─── Build nav from profile + live badge counts ───────────────────────────────

function buildTicketingNav(
  role: string | undefined,
  openTicketsCount: number,
  assignedToMeCount: number,
  restrictedModules: string[] = []
): NavEntry[] {
  const nav: NavEntry[] = [];

  // Helper: filter by moduleKey restrictions
  function allowed(moduleKey?: string) {
    if (!moduleKey) return true;
    return !restrictedModules.includes(moduleKey);
  }

  // ── Favorites ──
  const favoritesItems = [
    { id: 'fav-dashboard', name: role === 'user' ? 'Personal Dashboard' : 'Dashboard', icon: LayoutDashboard, path: role === 'user' ? '/my-dashboard' : '/dashboard' },
    { id: 'fav-leaderboard', name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { id: 'fav-calendar', name: 'Calendar', icon: CalendarDays, path: '/calendar' },
    allowed('timesheet') && { id: 'fav-timesheet', name: 'My Timesheets', icon: Clock, path: '/timesheet' },
    allowed('timesheet_reports') && { id: 'fav-ts-reports', name: 'Timesheet Reports', icon: BarChart2, path: '/timesheet/reports' },
    { id: 'fav-activity', name: 'AI Activity Tracker', icon: Monitor, path: '/activity-tracker' },
  ].filter(Boolean) as any[];

  nav.push({ id: 'favorites', section: 'FAVORITES', items: favoritesItems });

  // ── Ultra super admin only ──
  if (isUltraSuperAdmin(role)) {
    nav.push({ id: 'email-integration', section: 'ADMINISTRATION', items: [
      { id: 'email-integrations', name: 'Email Integration', icon: Settings, path: '/email-integrations' },
      { id: 'companies', name: 'Companies', icon: Building2, path: '/companies' },
    ]});
  }

  // ── Service Desk ──
  const serviceDeskItems = [
    { id: 'self-service', name: 'Self-Service Portal', icon: HelpCircle, path: '/service-portal' },
    allowed('catalog') && { id: 'catalog', name: 'Service Catalog', icon: ShoppingCart, path: '/catalog' },
    allowed('kb') && { id: 'kb', name: 'Knowledge Base', icon: BookOpen, path: '/kb' },
    allowed('sla') && { id: 'sla', name: 'SLA Policies', icon: Clock, path: '/sla' },
    allowed('history') && { id: 'history', name: 'System Activity Log', icon: History, path: '/history' },
  ].filter(Boolean) as any[];
  nav.push({ id: 'service-desk', section: 'SERVICE DESK', items: serviceDeskItems });

  // ── Incidents ──
  const incidentItems = [
    allowed('tickets') && { id: 'new-incident', name: 'Create New Incident', icon: PlusCircle, path: '/tickets?action=new' },
    allowed('tickets') && { id: 'assigned-me', name: 'Assigned to Me', icon: UserCheck, path: '/tickets?filter=assigned_to_me', badge: assignedToMeCount || undefined },
    allowed('tickets') && { id: 'open-incidents', name: 'Open Incidents', icon: FolderOpen, path: '/tickets?filter=open', badge: openTicketsCount || undefined },
    allowed('tickets') && { id: 'unassigned', name: 'Open – Unassigned', icon: UserMinus, path: '/tickets?filter=unassigned' },
    allowed('tickets') && { id: 'resolved', name: 'Resolved Incidents', icon: CheckCircle2, path: '/tickets?filter=resolved' },
    allowed('tickets') && { id: 'all-incidents', name: 'All Incidents', icon: List, path: '/tickets' },
    allowed('reports') && { id: 'critical-map', name: 'Critical Incidents Map', icon: Map, path: '/reports' },
  ].filter(Boolean) as any[];
  nav.push({ id: 'incident', section: 'INCIDENT', items: incidentItems });

  // ── Problem & Change ──
  nav.push({ id: 'problem-change', section: 'PROBLEM & CHANGE', items: [
    allowed('problem') && { id: 'problem', name: 'Problem Management', icon: AlertOctagon, path: '/problem' },
    allowed('change') && { id: 'change', name: 'Change Management', icon: GitPullRequest, path: '/change' },
  ].filter(Boolean) as any[] });

  // ── Meetings ──
  nav.push({ id: 'meetings', section: 'MEETINGS', items: [
    { id: 'meetings-mgmt', name: 'Meeting Management', icon: CalendarDays, path: '/meetings' },
    { id: 'create-meeting', name: 'Create Meeting', icon: PlusCircle, path: '/create-meeting' },
  ]});

  // ── Call Management (agent+) ──
  if (isAgentOrAbove(role)) {
    nav.push({ id: 'calls', section: 'CALL MANAGEMENT', items: [
      { id: 'call-logs', name: 'Call Logs', icon: PhoneCall, path: '/calls' },
      { id: 'log-call', name: 'Log New Call', icon: PlusCircle, path: '/calls/new' },
    ]});

    nav.push({ id: 'ai-assistant', section: 'AI TOOLS', items: [
      { id: 'ai', name: 'AI Assistant', icon: BrainCircuit, path: '/ai-assistant' },
    ]});
  }

  // ── Groups ──
  nav.push({ id: 'groups', section: 'GROUPS & TEAMS', items: [
    { id: 'group-dashboard', name: 'Group Dashboard', icon: LayoutDashboard, path: '/groups?tab=dashboard' },
    { id: 'group-calendar', name: 'Smart Calendar', icon: CalendarDays, path: '/groups?tab=calendar' },
    { id: 'group-planning', name: 'Planning Center', icon: Map, path: '/groups?tab=planning' },
    { id: 'group-timesheets', name: 'Timesheets', icon: Clock, path: '/groups?tab=timesheets' },
    { id: 'group-tasks', name: 'Tasks', icon: CheckSquare, path: '/groups?tab=tasks' },
    { id: 'group-sprint', name: 'Sprint Board', icon: GitPullRequest, path: '/groups?tab=sprint_board' },
    { id: 'group-perf', name: 'Performance', icon: Trophy, path: '/groups?tab=performance' },
    { id: 'group-discuss', name: 'Discussions', icon: MessageCircle, path: '/groups?tab=discussions' },
    { id: 'group-analytics', name: 'Analytics & Health', icon: BarChart3, path: '/groups?tab=analytics' },
  ]});

  // ── Admin-only sections ──
  if (isAdmin(role)) {
    // Data Analytics
    nav.push({ id: 'data-analytics', section: 'DATA ANALYTICS', items: [
      allowed('reports') && { id: 'analytics', name: 'Data Analytics', icon: BarChart3, path: '/data-analytics' },
      allowed('reports') && { id: 'forecasting', name: 'Forecasting & Targets', icon: BarChart2, path: '/forecasting-planning' },
    ].filter(Boolean) as any[] });

    // SLA Management
    nav.push({ id: 'sla-management', section: 'SLA MANAGEMENT', items: [
      { id: 'sla-dashboard', name: 'SLA Dashboard', icon: LayoutDashboard, path: '/sla-management?tab=dashboard' },
      { id: 'sla-policies', name: 'SLA Policies', icon: Clock, path: '/sla-management?tab=policies' },
      { id: 'sla-hours', name: 'Business Hours', icon: Clock, path: '/sla-management?tab=business-hours' },
      { id: 'sla-holidays', name: 'Holiday Calendar', icon: CalendarDays, path: '/sla-management?tab=holidays' },
      { id: 'sla-escalations', name: 'Escalation Rules', icon: AlertOctagon, path: '/sla-management?tab=escalations' },
      { id: 'sla-reports', name: 'SLA Reports', icon: BarChart3, path: '/sla-management?tab=reports' },
    ]});

    // System Administration
    const sysAdminItems = [
      allowed('users') && { id: 'users', name: 'User Management', icon: Users, path: '/users' },
      allowed('access_control') && { id: 'access', name: 'Access Control', icon: KeyRound, path: '/access-control' },
      { id: 'group-mgmt', name: 'Group Management', icon: Users, path: '/groups?tab=teams' },
      allowed('settings') && { id: 'sys-settings', name: 'System Settings', icon: Settings2, path: '/settings' },
      { id: 'approved-tickets', name: 'Approved Tickets', icon: CheckCircle2, path: '/approved-tickets' },
      allowed('timesheet_approvals') && { id: 'ts-approvals', name: 'Ticket Approvals', icon: ClipboardList, path: '/timesheet-approvals' },
      isSuperAdmin(role) && allowed('settings') && { id: 'branding', name: 'Branding', icon: Palette, path: '/branding' },
      allowed('settings') && { id: 'incident-cats', name: 'Incident Categories', icon: Tag, path: '/incident-categories' },
    ].filter(Boolean) as any[];
    nav.push({ id: 'sys-admin', section: 'SYSTEM ADMINISTRATION', items: sysAdminItems });
  }

  return nav;
}

// ─── Main TicketingShell component ────────────────────────────────────────────

export function TicketingShell() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { branding } = useBranding();
  const { openTicketsCount, assignedToMeCount } = useTickets();

  const isDark = resolvedTheme === 'dark';

  // Search handler using the ticketing REST API
  const onSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    try {
      const res = await api.get(`/api/search/global?q=${encodeURIComponent(query)}&limit=20`);
      const data: any[] = res.data || [];
      return data.map((item: any) => ({
        id: String(item.id || item.ticketNumber || Math.random()),
        label: item.title || item.name || item.label || String(item.id),
        description: item.status || item.type || item.email || undefined,
        category: item.type === 'ticket' ? 'Tickets'
          : item.type === 'user' ? 'Users'
          : item.type === 'kb' ? 'Knowledge Base'
          : 'Results',
        categoryColor: item.type === 'ticket' ? '#6366F1'
          : item.type === 'user' ? '#10B981'
          : item.type === 'kb' ? '#F59E0B'
          : '#64748B',
        path: item.type === 'ticket'
          ? `/tickets/${item.id}`
          : item.type === 'user'
          ? `/users`
          : item.type === 'kb'
          ? `/kb`
          : '/',
      }));
    } catch {
      // If global search API doesn't exist yet, return empty (non-fatal)
      return [];
    }
  }, []);

  const shellUser = user
    ? {
        id: user.uid,
        name: profile?.name || user.displayName || user.email?.split('@')[0],
        email: profile?.email || user.email,
        role: profile?.role,
        tenantId: profile?.tenantId,
      }
    : null;

  const config: AppShellConfig = {
    branding: {
      appName: branding.companyName || 'ManageByOpz',
      appSubtitle: 'IT Service Management',
      logoUrl: branding.logoBase64 || undefined,
      primaryColor: '#5D69F4',
    },
    nav: buildTicketingNav(
      profile?.role,
      openTicketsCount,
      assignedToMeCount,
      profile?.restrictedModules || []
    ),
    user: shellUser,
    onLogout: async () => {
      await signOut();
      navigate('/login');
    },
    onNavigate: (path: string) => navigate(path),
    onSearch,
    darkMode: isDark,
    onToggleDarkMode: () => setTheme(isDark ? 'light' : 'dark'),
    inactivityTimeoutMs: 15 * 60 * 1000,
  };

  return <AppShell config={config} />;
}
