/**
 * @managemyopz/platform-shell
 *
 * The Enterprise Application Shell — shared layout infrastructure for all
 * ManageByOpz applications. This package provides:
 *
 * - AppShell        The two-column layout (sidebar + topbar + outlet)
 * - AppSidebar      The collapsible sidebar with role-based nav
 * - AppTopbar       The top bar with search, notifications, and profile
 * - SessionWatcher  Inactivity timeout with warning modal
 *
 * All types for configuring the shell from a host app are also exported.
 */

// Main shell component
export { AppShell } from './AppShell';

// Sub-components (for apps that need to customize individual parts)
export { AppSidebar } from './AppSidebar';
export { AppTopbar } from './AppTopbar';
export { SessionWatcher } from './SessionWatcher';

// Types
export type {
  NavItem,
  NavSection,
  NavEntry,
  ShellUser,
  ShellBranding,
  SearchResult,
  AppShellConfig,
} from './types';

// Type guards
export { isNavSection } from './types';