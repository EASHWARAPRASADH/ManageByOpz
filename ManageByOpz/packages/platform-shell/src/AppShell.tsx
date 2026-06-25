import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { type AppShellConfig } from './types';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { SessionWatcher } from './SessionWatcher';

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

const SIDEBAR_STATE_KEY = 'platform_shell_sidebar_collapsed';

interface AppShellProps {
  config: AppShellConfig;
  /**
   * Optional: render extra content inside the nav area after a specific item.
   * Receives the item's id and path; return null to render nothing.
   */
  renderNavExtra?: (item: { id: string; path: string }) => React.ReactNode;
  /**
   * Optional: slot to render below the main content (e.g. floating chatbot).
   */
  children?: React.ReactNode;
}

/**
 * AppShell — the Enterprise Application Shell.
 *
 * Renders the two-column layout: collapsible sidebar + top bar + page outlet.
 * This is the single source of truth for the shell UI, shared across ALL
 * ManageByOpz applications (HRMS, Ticketing, Billing, CRM, etc.).
 *
 * Usage in a host app:
 *
 * ```tsx
 * <Route element={
 *   <AppShell config={{
 *     branding: { appName: 'ManageByOpz HRMS', appSubtitle: 'HR Management' },
 *     nav: buildNavItems(user),
 *     user,
 *     onLogout: handleLogout,
 *     onNavigate: navigate,
 *     onSearch: searchEverything,
 *     darkMode: theme === 'dark',
 *     onToggleDarkMode: toggleTheme,
 *   }} />
 * }>
 *   <Route path="/dashboard" element={<Dashboard />} />
 *   ...
 * </Route>
 * ```
 */
export function AppShell({ config, renderNavExtra, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STATE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, collapsed.toString());
    } catch { /* ignore */ }
  }, [collapsed]);

  // Expose a custom event so host apps can programmatically collapse the sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<boolean>;
      setCollapsed(ev.detail);
    };
    window.addEventListener('platform-shell:collapse-sidebar', handler);
    return () => window.removeEventListener('platform-shell:collapse-sidebar', handler);
  }, []);

  const { darkMode } = config;

  return (
    <div
      className={cn(
        'flex h-screen overflow-hidden font-sans antialiased',
        'selection:bg-indigo-500/10 selection:text-indigo-600',
        darkMode && 'dark'
      )}
    >
      {/* Sidebar */}
      <AppSidebar
        config={config}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        renderNavExtra={renderNavExtra}
      />

      {/* Main workspace */}
      <div className="flex-1 min-w-0 overflow-hidden bg-[#F3F7FA] dark:bg-[#07090E] text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Top bar */}
        <AppTopbar
          config={config}
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed(v => !v)}
        />

        {/* Page content */}
        <main
          id="platform-main-content"
          className="flex-1 min-w-0 w-full overflow-x-hidden overflow-y-auto"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>

      {/* Session timeout watcher */}
      <SessionWatcher config={config} />

      {/* Floating overlays (chatbot, toasts, etc.) */}
      {children}
    </div>
  );
}
