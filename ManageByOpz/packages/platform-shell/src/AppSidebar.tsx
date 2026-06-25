import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  LucideIcon,
} from 'lucide-react';
import { type NavEntry, type AppShellConfig, isNavSection } from './types';

// ─── Inline cn utility (avoids adding a dep just for classnames) ───────────
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─────────────────────────────────────────────
// AppSidebar Component
// ─────────────────────────────────────────────

interface AppSidebarProps {
  config: AppShellConfig;
  collapsed: boolean;
  onToggle: () => void;
  /** Optional: extra content rendered below the nav (e.g. ATS sub-menu). */
  renderNavExtra?: (item: { id: string; path: string }) => React.ReactNode;
}

export function AppSidebar({ config, collapsed, onToggle, renderNavExtra }: AppSidebarProps) {
  const { branding, nav, user, onLogout } = config;
  const primary = branding.primaryColor || '#5D69F4';

  // Derive user display info
  let displayName = 'Guest User';
  let initials = 'GU';
  let displayRole = 'Guest';

  if (user) {
    displayName = user.name || user.email || 'User';
    displayRole = user.role
      ? user.role.replace('ROLE_', '').replace(/_/g, ' ')
      : 'User';
    const parts = displayName.trim().split(' ');
    let calc = '';
    if (parts[0]) calc += parts[0][0];
    if (parts[1]) calc += parts[1][0];
    initials = (calc || displayName.slice(0, 2) || 'US').toUpperCase();
  }

  return (
    <aside
      className={cn(
        'flex flex-col bg-white dark:bg-[#0B0F19] text-slate-700 dark:text-slate-300',
        'transition-all duration-300 ease-in-out relative border-r border-slate-200 dark:border-slate-800 shrink-0',
        collapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      {/* ── Brand Header ─── */}
      <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] shrink-0">
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={branding.appName}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-[0_2px_8px_rgba(99,102,241,0.25)]"
            style={{ background: `linear-gradient(135deg, ${primary}, #818CF8)` }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C6.477 2 2 6.023 2 11c0 2.279 1.026 4.35 2.766 5.86L3.13 20.91A1 1 0 004.1 22c.168 0 .335-.042.489-.126l4.246-2.324A10.873 10.873 0 0012 20c5.523 0 10-4.023 10-9s-4.477-9-10-9z" />
            </svg>
          </div>
        )}

        {!collapsed && (
          <div className="ml-3 animate-[fadeIn_.15s_ease]">
            <h2 className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white leading-none">
              {branding.appName}
            </h2>
            {branding.appSubtitle && (
              <p className="text-[10px] text-slate-400 font-bold mt-1.5">
                {branding.appSubtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ─── */}
      <nav
        className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent"
        aria-label="Main navigation"
      >
        {nav.map((entry, idx) => {
          if (!isNavSection(entry)) {
            // Flat nav item
            const Icon = entry.icon as LucideIcon;
            return (
              <div key={entry.id || idx}>
                <NavLink
                  to={entry.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative',
                      isActive
                        ? 'text-white shadow-[0_4px_12px_rgba(93,105,244,0.25)]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                    )
                  }
                  style={({ isActive }) =>
                    isActive ? { backgroundColor: primary } : undefined
                  }
                >
                  <Icon className="w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-105" />
                  {!collapsed && <span className="truncate">{entry.name}</span>}
                  {entry.badge != null && !collapsed && (
                    <span className="ml-auto text-[9px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {entry.badge}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-16 bg-[#0B0F19] text-white text-xs px-2.5 py-1 rounded shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                      {entry.name}
                    </div>
                  )}
                </NavLink>
                {renderNavExtra?.({ id: entry.id, path: entry.path })}
              </div>
            );
          }

          // Section group
          return (
            <div key={entry.id || idx} className="pt-3 first:pt-0">
              {!collapsed ? (
                <p className="px-3 pb-2 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {entry.section}
                </p>
              ) : (
                <div className="border-t border-slate-200 dark:border-slate-800 my-2 mx-2" />
              )}
              <div className="space-y-1">
                {entry.items.map((sub, subIdx) => {
                  const SubIcon = sub.icon as LucideIcon;
                  return (
                    <div key={sub.id || subIdx}>
                      <NavLink
                        to={sub.path}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group relative',
                            isActive
                              ? 'text-white shadow-[0_4px_12px_rgba(93,105,244,0.25)]'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                          )
                        }
                        style={({ isActive }) =>
                          isActive ? { backgroundColor: primary } : undefined
                        }
                      >
                        <SubIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                        {!collapsed && <span className="truncate">{sub.name}</span>}
                        {sub.badge != null && !collapsed && (
                          <span className="ml-auto text-[9px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {sub.badge}
                          </span>
                        )}
                        {collapsed && (
                          <div className="absolute left-16 bg-[#0B0F19] text-white text-xs px-2.5 py-1 rounded shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                            {sub.name}
                          </div>
                        )}
                      </NavLink>
                      {renderNavExtra?.({ id: sub.id, path: sub.path })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Collapse Toggle ─── */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'fixed w-6 h-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700',
          'rounded-full flex items-center justify-center text-slate-500',
          'hover:text-white transition-all duration-200 z-[9999] shadow-md hover:scale-110 active:scale-95 cursor-pointer'
        )}
        style={{
          left: collapsed ? '60px' : '268px',
          top: '110px',
          transition: 'left 300ms cubic-bezier(0.4,0,0.2,1), background-color 200ms, transform 200ms',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = primary)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* ── User Footer ─── */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E1321]/50 shrink-0">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #6366F1, #14B8A6)' }}
            >
              {initials}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-200">
                {displayName}
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                {displayRole}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              title="Log Out"
              className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded hover:bg-slate-200/40 dark:hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
