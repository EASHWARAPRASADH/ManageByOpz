import { type LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────
// Navigation item types
// ─────────────────────────────────────────────

/** A leaf-level navigation link. */
export interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  path: string;
  badge?: number | string;
  minRole?: string;
}

/** A group of nav items with a section label. */
export interface NavSection {
  id: string;
  section: string;
  items: NavItem[];
}

/** Either a top-level nav link or a grouped section. */
export type NavEntry = NavItem | NavSection;

/** Type guard: is this a NavSection? */
export function isNavSection(entry: NavEntry): entry is NavSection {
  return 'section' in entry;
}

// ─────────────────────────────────────────────
// Shell user context
// ─────────────────────────────────────────────

export interface ShellUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  tenantId?: string;
  avatarUrl?: string;
}

// ─────────────────────────────────────────────
// Branding / theme
// ─────────────────────────────────────────────

export interface ShellBranding {
  /** Application display name shown in the sidebar header. */
  appName: string;
  /** Subtitle shown below the app name (e.g. "HR Management"). */
  appSubtitle?: string;
  /** URL / data-uri of the app logo image. Falls back to default SVG mark. */
  logoUrl?: string;
  /** Primary brand color (hex). Defaults to #5D69F4 (indigo). */
  primaryColor?: string;
}

// ─────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────

export interface SearchResult {
  id: string;
  label: string;
  description?: string;
  category: string;
  categoryColor?: string;
  path: string;
  icon?: LucideIcon;
}

// ─────────────────────────────────────────────
// Shell configuration (passed from host app)
// ─────────────────────────────────────────────

export interface AppShellConfig {
  branding: ShellBranding;
  nav: NavEntry[];
  user: ShellUser | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  /** Async function that returns search results for a given query string. */
  onSearch?: (query: string) => Promise<SearchResult[]> | SearchResult[];
  /** Inactivity timeout in milliseconds. Default: 15 minutes. */
  inactivityTimeoutMs?: number;
  /** Dark mode on/off. Default: system preference. */
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}
