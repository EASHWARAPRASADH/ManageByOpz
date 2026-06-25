import React, { useEffect, useState, useRef, useCallback } from 'react';
import { type AppShellConfig } from './types';

interface SessionWatcherProps {
  config: AppShellConfig;
}

/**
 * Watches for user inactivity and shows a countdown warning before auto-logout.
 * Renders a modal overlay; the actual logout is delegated to config.onLogout.
 */
export function SessionWatcher({ config }: SessionWatcherProps) {
  const { user, onLogout, inactivityTimeoutMs = 15 * 60 * 1000 } = config;
  const WARNING_BEFORE_MS = 2 * 60 * 1000; // warn 2 min before timeout
  const warningStartMs = inactivityTimeoutMs - WARNING_BEFORE_MS;

  const [showWarning, setShowWarning] = useState(false);
  const [remaining, setRemaining] = useState(120);
  const lastActivityRef = useRef(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setRemaining(Math.ceil(WARNING_BEFORE_MS / 1000));
  }, [WARNING_BEFORE_MS]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'mousedown', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));

    const interval = setInterval(() => {
      const inactive = Date.now() - lastActivityRef.current;

      if (inactive >= inactivityTimeoutMs) {
        resetTimer();
        onLogout();
      } else if (inactive >= warningStartMs) {
        setShowWarning(true);
        setRemaining(Math.max(0, Math.ceil((inactivityTimeoutMs - inactive) / 1000)));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
      clearInterval(interval);
    };
  }, [user, inactivityTimeoutMs, warningStartMs, onLogout, resetTimer]);

  if (!showWarning) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = minutes > 0
    ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
    : `${seconds}s`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        {/* Warning icon */}
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
          Session Expiring Soon
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Due to inactivity, you will be logged out in
        </p>
        <div className="text-3xl font-black text-amber-500 mb-6 font-mono">
          {timeStr}
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetTimer}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
