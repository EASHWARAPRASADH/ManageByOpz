import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCredentials } from './authSlice';
import { useLoginMutation } from './authApi';
import { 
  CheckCircle2, Mail, Lock, ArrowRight, ShieldCheck, 
  ChevronDown, UserCheck, Sparkles, Eye, EyeOff, Loader2 
} from 'lucide-react';

const getRoleRedirectPath = (role: string): string => {
  switch (role) {
    case 'ROLE_ULTRA_SUPER_ADMIN':
      return '/platform/dashboard';
    case 'ROLE_SUPER_ADMIN':
      return '/dashboard';
    case 'ROLE_ADMIN':
      return '/employees';
    case 'ROLE_EMPLOYEE':
    default:
      return '/my-profile';
  }
};

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccordion, setShowDemoAccordion] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userRole = useAppSelector((state) => state.auth.role);

  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      const redirectPath = getRoleRedirectPath(userRole);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      if (result.success) {
        dispatch(setCredentials(result));
        const path = getRoleRedirectPath(result.user.role);
        navigate(path, { replace: true });
      } else {
        setErrorMessage('Authentication failed.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.data && err.data.message) {
        setErrorMessage(err.data.message);
      } else {
        setErrorMessage('Invalid email or password. Please try again.');
      }
    }
  };

  const handleSelectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Admin@123');
    setErrorMessage('');
  };

  const demoUsers = [
    {
      role: 'Ultra Super Admin',
      email: 'ultra.admin@managemyopz.com',
      badge: 'Platform Owner',
      desc: 'Access global cross-tenant control panel, analytics, and RBAC settings.',
      color: 'from-violet-600 to-fuchsia-600'
    },
    {
      role: 'Super Admin',
      email: 'super.admin@managemyopz.com',
      badge: 'ACME Corp Owner',
      desc: 'Manage ACME tenant hierarchy, leaf rules, directory, and analytics.',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      role: 'Admin',
      email: 'admin@managemyopz.com',
      badge: 'ACME HR Admin',
      desc: 'Orchestrate onboarding, view employee files, leaves, and documents.',
      color: 'from-emerald-600 to-teal-600'
    },
    {
      role: 'Employee',
      email: 'employee@managemyopz.com',
      badge: 'ACME Staff',
      desc: 'Submit leaves, receive awards, view own profile & documents.',
      color: 'from-slate-600 to-slate-800'
    }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans antialiased">
      {/* LEFT SIDE: Branding / Features Preview */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-16 flex-col justify-between relative overflow-hidden select-none">
        {/* Glow & Grid Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center shadow-lg border border-primary-400/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              ManageMyTalenthive
            </h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Enterprise HR OS</p>
          </div>
        </div>

        {/* Center Features */}
        <div className="my-auto relative z-10 max-w-lg space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
              Introducing Version 2.0
            </span>
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              A Unified Operating System for <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">Workforce DNA</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Design organizations, verify credentials, coordinate leave requests, and reward top performances under a zero-trust multi-tenant architecture.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Employee Digital Twin', desc: 'Single source of truth tracking lifecycle, skill registry, and files.' },
              { title: 'Organization DNA', desc: 'Visual representation of divisions, departments, and reporting nodes.' },
              { title: 'Leave Management', desc: 'Rule-driven requests, auto-approved workflows, and balance tracking.' },
              { title: 'Recognition Platform', desc: 'Peer-to-peer awards, points system, and accomplishment timelines.' },
              { title: 'Workflow Orchestration', desc: 'Event-driven automation triggered by key business events.' }
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-1 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{feature.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 relative z-10 border-t border-slate-800 pt-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-slate-400" />
            Zero-Trust Isolation Secured
          </span>
          <span>© 2026 ManageMyTalenthive Inc.</span>
        </div>
      </div>

      {/* RIGHT SIDE: Card Container / Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          
          {/* Logo representation on mobile */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">ManageMyTalenthive</span>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Access HR Portal</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Log in with your corporate credentials.</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium animate-shake">
              {errorMessage}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" htmlFor="email">
                  Corporate Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="text"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 text-slate-900 dark:text-white transition-all disabled:opacity-50"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs font-semibold text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 text-slate-900 dark:text-white transition-all disabled:opacity-50"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* DEMO ACCOUNTS ACCORDION */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <button
                type="button"
                className="w-full flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors uppercase tracking-wider pb-2"
                onClick={() => setShowDemoAccordion(!showDemoAccordion)}
              >
                <span className="flex items-center gap-1.5">
                  <UserCheck size={14} className="text-primary-500" />
                  Quick Demo Accounts
                </span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 ${showDemoAccordion ? 'rotate-180' : ''}`} 
                />
              </button>

              {showDemoAccordion && (
                <div className="mt-3 grid grid-cols-1 gap-2.5 animate-slide-down">
                  {demoUsers.map((user, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDemoUser(user.email)}
                      className={`text-left p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all flex items-center gap-3 group`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${user.color} flex items-center justify-center text-white text-[10px] font-bold shadow-sm group-hover:scale-105 transition-transform`}>
                        {user.role.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.role}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                            {user.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
