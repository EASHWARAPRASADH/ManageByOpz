import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Command,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { type AppShellConfig, type SearchResult } from './types';

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─────────────────────────────────────────────
// Command Palette (Ctrl+K)
// ─────────────────────────────────────────────

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (q: string) => Promise<SearchResult[]> | SearchResult[];
  onNavigate: (path: string) => void;
  primaryColor: string;
}

function CommandPalette({ isOpen, onClose, onSearch, onNavigate, primaryColor }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!onSearch || !query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await onSearch(query.trim());
        setResults(res);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, onSearch]);

  if (!isOpen) return null;

  // Group by category
  const grouped: Record<string, SearchResult[]> = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});


  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full mx-4 overflow-hidden z-50 flex flex-col max-h-[520px]">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search anything..."
            className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full font-medium"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono shrink-0">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: items[0].categoryColor || primaryColor }}>
                {category}
              </h4>
              <div className="space-y-1">
                {items.map(r => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => { onClose(); setQuery(''); onNavigate(r.path); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center gap-3 group"
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />}
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block">
                          {r.label}
                        </span>
                        {r.description && (
                          <span className="text-[10px] text-slate-400 truncate block">{r.description}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {query.trim() && results.length === 0 && !loading && (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-400 font-medium">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {/* Default state */}
          {!query.trim() && (
            <div className="py-8 text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-300 dark:text-slate-600 mb-3">
                <Command className="w-8 h-8" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Start typing to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AppTopbar Component
// ─────────────────────────────────────────────

interface AppTopbarProps {
  config: AppShellConfig;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function AppTopbar({ config, sidebarCollapsed, onToggleSidebar }: AppTopbarProps) {
  const { user, onLogout, onNavigate, onSearch, darkMode, onToggleDarkMode } = config;
  const primary = config.branding.primaryColor || '#5D69F4';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // User info
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
    <>
      <header className="w-full h-16 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors mr-1 shrink-0"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>

          {onSearch && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-full px-4 py-1.5 flex-1 group hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer select-none text-left"
            >
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex-1">
                Search everything...
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 rounded text-[9px] font-mono text-slate-400">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-4">
          {/* Notifications (placeholder, host app can extend) */}
          <button
            id="shell-notifications-btn"
            className="relative p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/40 dark:border-transparent rounded-lg transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B0F19]" />
          </button>

          {/* Dark mode toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/40 dark:border-transparent rounded-lg transition-colors"
              title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
          )}

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              id="shell-profile-btn"
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2.5 p-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/40 dark:border-transparent rounded-xl transition-all"
            >
              <div
                className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366F1, #14B8A6)' }}
              >
                {initials}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <p className="text-[11px] font-extrabold text-slate-800 dark:text-white leading-none">
                  {config.branding.appName}
                </p>
                <p className="text-[9px] text-slate-400 font-bold mt-1">Enterprise Plan</p>
              </div>
              <ChevronDown size={12} className="text-slate-400 hidden md:block" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                    <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-100 dark:border-indigo-900/40 uppercase">
                        {displayRole}
                      </span>
                      {user?.tenantId && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded border border-slate-200/50 dark:border-slate-700">
                          {user.tenantId}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => { setProfileOpen(false); onNavigate('/my-profile'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2"
                  >
                    <User size={14} className="text-slate-400" />
                    My Profile
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); onNavigate('/settings'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2"
                  >
                    <Settings size={14} className="text-slate-400" />
                    Settings
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2"
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

      {/* Command Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={onSearch}
        onNavigate={onNavigate}
        primaryColor={primary}
      />
    </>
  );
}
