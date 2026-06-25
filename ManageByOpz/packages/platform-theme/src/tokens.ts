/**
 * @managemyopz/platform-theme
 * Design Token System — Enterprise Design System
 *
 * All apps import this package to get consistent tokens.
 * Usage in CSS: var(--color-primary), var(--radius-card), etc.
 * Usage in JS: import tokens from '@managemyopz/platform-theme';
 */

export const tokens = {
  // Brand colors
  colors: {
    primary: '#5D69F4',
    primaryHover: '#4C58E3',
    primaryLight: 'rgba(93,105,244,0.10)',

    success: '#10B981',
    warning: '#F59E0B',
    danger: '#F43F5E',
    info: '#3B82F6',

    // Neutral palette
    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate200: '#E2E8F0',
    slate300: '#CBD5E1',
    slate400: '#94A3B8',
    slate500: '#64748B',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1E293B',
    slate850: '#0F172A',
    slate900: '#0B0F19',
    slate950: '#07090E',
  },

  // Typography
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Fira Code", "JetBrains Mono", Consolas, monospace',
  },

  fontSize: {
    '2xs': '0.625rem',    // 10px
    xs: '0.75rem',         // 12px
    sm: '0.875rem',        // 14px
    base: '1rem',          // 16px
    lg: '1.125rem',        // 18px
    xl: '1.25rem',         // 20px
    '2xl': '1.5rem',       // 24px
    '3xl': '1.875rem',     // 30px
  },

  // Spacing
  spacing: {
    sidebar: '280px',
    sidebarCollapsed: '72px',
    headerHeight: '64px',
  },

  // Border radius
  radius: {
    sm: '6px',
    md: '10px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 2px 8px rgba(0,0,0,0.08)',
    lg: '0 4px 20px rgba(0,0,0,0.10)',
    xl: '0 8px 40px rgba(0,0,0,0.12)',
    primary: '0 4px 12px rgba(93,105,244,0.25)',
  },

  // Animation durations
  animation: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },

  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    overlay: 1040,
    modal: 1050,
    toast: 1060,
    tooltip: 1070,
  },
} as const;

export type Tokens = typeof tokens;
export default tokens;
