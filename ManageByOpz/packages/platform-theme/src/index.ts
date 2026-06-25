/**
 * @managemyopz/platform-theme
 *
 * The Enterprise Design Token System for ManageByOpz.
 * Import tokens for use in JavaScript/TypeScript code.
 * Import variables.css for CSS custom properties.
 */

export { tokens, type Tokens } from './tokens';
export { default } from './tokens';

// Legacy color exports (for backwards compatibility)
export const colors = {
  primary: '#5D69F4',
  primaryHover: '#4C58E3',
  success: '#10B981',
  danger: '#F43F5E',
  warning: '#F59E0B',
  info: '#3B82F6',
  dark: '#0B0F19',
  green: '#10B981',
};
