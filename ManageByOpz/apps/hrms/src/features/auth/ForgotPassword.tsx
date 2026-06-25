import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgotPasswordMutation } from './authApi';
import { Mail, ArrowLeft, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Please enter your corporate email address.');
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      // For security reasons, we might still show success or a friendly error
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans antialiased">
      {/* LEFT SIDE: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-16 flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

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

      <div className="my-auto relative z-10 max-w-lg space-y-6">
        <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
          Recover Your Account
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Enter your registered corporate email address and we will send you a password reset link to get you back into the portal securely.
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 relative z-10 border-t border-slate-800 pt-6">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-slate-400" />
          Zero-Trust Isolation Secured
        </span>
        <span>© 2026 ManageMyTalenthive Inc.</span>
        </div>
      </div>

      {/* RIGHT SIDE: Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Forgot Password</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Recover access to your enterprise profile.</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            {!isSuccess ? (
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
                      type="email"
                      required
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 text-slate-900 dark:text-white transition-all"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    'Send Password Reset Link'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Mail size={24} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Check Your Inbox</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  We have dispatched a password recovery link to <strong>{email}</strong> if it is registered in our platform directory.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors pt-2 border-t border-slate-100 dark:border-slate-800/80"
            >
              <ArrowLeft size={14} />
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
