import React, { useState } from 'react';
import { 
  Shield, ShieldCheck, ShieldAlert, Key, Mail, Lock, Unlock, 
  UserMinus, UserCheck, RefreshCw, AlertCircle, Clock, Eye, Copy, 
  Check, Terminal, Server
} from 'lucide-react';
import { 
  useGetEmployeeAccountQuery,
  useUpdateEmployeeAccountMutation,
  useResendActivationMutation,
  useResetPasswordMutation,
  useUnlockAccountMutation,
  useDisableAccountMutation,
  useEnableAccountMutation,
  useForcePasswordChangeMutation,
  useGenerateTempPasswordMutation
} from './employeesApi';

interface UserAccountTabProps {
  employeeId: string;
  readOnly: boolean;
}

export function UserAccountTab({ employeeId, readOnly }: UserAccountTabProps) {
  const { data: account, isLoading, error, refetch } = useGetEmployeeAccountQuery(employeeId);
  const [updateAccount, { isLoading: isUpdating }] = useUpdateEmployeeAccountMutation();
  const [resendActivation] = useResendActivationMutation();
  const [resetPassword] = useResetPasswordMutation();
  const [unlockAccount] = useUnlockAccountMutation();
  const [disableAccount] = useDisableAccountMutation();
  const [enableAccount] = useEnableAccountMutation();
  const [forcePasswordChange] = useForcePasswordChangeMutation();
  const [generateTempPassword] = useGenerateTempPasswordMutation();

  // Edit fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [showCustomPasswordModal, setShowCustomPasswordModal] = useState(false);
  
  // Notification states
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  React.useEffect(() => {
    if (account) {
      setUsername(account.username || '');
      setEmail(account.email || '');
    }
  }, [account]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold">Loading security account details...</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-100 dark:border-red-900/30 p-6">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <p className="text-red-700 dark:text-red-400 text-xs font-bold">No Active Login Account Provisioned</p>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] text-center max-w-sm">
          This employee currently does not have a user credentials record in the system. Credentials are automatically provisioned during onboarding.
        </p>
      </div>
    );
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAccount({ employeeId, body: { username, email } }).unwrap();
      setIsEditing(false);
      showToast("Account details updated successfully", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to update account", "error");
    }
  };

  const handleResendActivation = async () => {
    try {
      await resendActivation(employeeId).unwrap();
      showToast("Activation email resent successfully", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to resend activation email", "error");
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockAccount(employeeId).unwrap();
      showToast("Account unlocked successfully", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to unlock account", "error");
    }
  };

  const handleDisable = async () => {
    try {
      await disableAccount(employeeId).unwrap();
      showToast("Account disabled successfully", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to disable account", "error");
    }
  };

  const handleEnable = async () => {
    try {
      await enableAccount(employeeId).unwrap();
      showToast("Account activated successfully", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to enable account", "error");
    }
  };

  const handleForcePasswordChange = async () => {
    try {
      await forcePasswordChange(employeeId).unwrap();
      showToast("Forced password change requirement flag enabled", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to enable flag", "error");
    }
  };

  const handleGenerateTempPassword = async () => {
    try {
      const res = await generateTempPassword(employeeId).unwrap();
      setTempPassword(res.tempPassword);
      showToast("Temporary password generated successfully", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to generate temporary password", "error");
    }
  };

  const handleCustomPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword({ employeeId, body: { password: customPassword } }).unwrap();
      setCustomPassword('');
      setShowCustomPasswordModal(false);
      showToast("Password updated successfully", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to update password", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Determine security health risk
  const isMfaDisabled = !account.mfaEnabled;
  const isPwdChangeReq = account.passwordChangeRequired;
  const isAccountLocked = account.status === 'LOCKED' || account.locked;
  const isPending = account.status === 'PENDING_ACTIVATION';
  const isDisabled = account.status === 'DISABLED';
  
  let riskLevel: 'SECURE' | 'WARN' | 'DANGER' = 'SECURE';
  const riskReasons: string[] = [];

  if (isMfaDisabled) riskReasons.push("MFA is not enabled on this profile");
  if (isPwdChangeReq) riskReasons.push("User must change temporary password");
  if (isAccountLocked) {
    riskLevel = 'DANGER';
    riskReasons.push("Account is locked due to security policy violations");
  } else if (isDisabled) {
    riskLevel = 'WARN';
    riskReasons.push("Account is disabled by administration");
  } else if (isPending) {
    riskLevel = 'WARN';
    riskReasons.push("Account is pending initial activation");
  } else if (isMfaDisabled || isPwdChangeReq) {
    riskLevel = 'WARN';
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl border text-xs z-50 animate-bounce flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }`}>
          {notification.type === 'success' ? <ShieldCheck className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Security Health Ribbon */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
        riskLevel === 'SECURE' 
          ? 'bg-emerald-50/40 dark:bg-emerald-950/5 border-emerald-250/30' 
          : riskLevel === 'DANGER' 
            ? 'bg-rose-50/40 dark:bg-rose-950/5 border-rose-250/30'
            : 'bg-amber-50/40 dark:bg-amber-950/5 border-amber-250/30'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg shrink-0 ${
            riskLevel === 'SECURE' 
              ? 'bg-emerald-500/10 text-emerald-600' 
              : riskLevel === 'DANGER' 
                ? 'bg-rose-500/10 text-rose-600'
                : 'bg-amber-500/10 text-amber-600'
          }`}>
            {riskLevel === 'SECURE' ? <ShieldCheck className="w-5 h-5" /> : riskLevel === 'DANGER' ? <ShieldAlert className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Security Status: {riskLevel === 'SECURE' ? 'Fully Compliant' : riskLevel === 'DANGER' ? 'Critical Action Required' : 'Vulnerable Profile'}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {riskReasons.length > 0 ? riskReasons.join(" • ") : "No security vulnerabilities detected. Profile aligns with enterprise security blueprints."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
            account.status === 'ACTIVE' 
              ? 'bg-emerald-500/10 text-emerald-600' 
              : account.status === 'LOCKED' 
                ? 'bg-rose-500/10 text-rose-600' 
                : account.status === 'PENDING_ACTIVATION'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-slate-500/15 text-slate-450'
          }`}>
            {account.status}
          </span>
        </div>
      </div>

      {/* Grid Layout: Account details & security policies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card & Parameters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity & Account Parameters */}
          <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Account Credentials</h3>
              {!readOnly && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-[#4F46E5] hover:underline text-[11px] font-bold"
                >
                  Edit Profile Identity
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Username</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Primary Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(account.username || '');
                      setEmail(account.email || '');
                    }} 
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-650"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-[#4F46E5] text-white rounded-lg text-[11px] font-bold shadow-sm"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Username</span>
                  <span className="text-slate-800 dark:text-slate-200 block mt-0.5">{account.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Primary Email</span>
                  <span className="text-slate-800 dark:text-slate-200 block mt-0.5">{account.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Tenant Reference</span>
                  <span className="text-slate-800 dark:text-slate-200 block mt-0.5 font-mono">{account.tenantId || 'ACME'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Assigned Security Roles</span>
                  <span className="text-slate-850 dark:text-slate-250 block mt-0.5">
                    {account.roles && account.roles.length > 0 ? account.roles.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Administrative Lifecycle Controls */}
          {!readOnly && (
            <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/85 pb-3">
                Security Lifecycle Cockpit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isPending && (
                  <button 
                    onClick={handleResendActivation}
                    className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/30 rounded-lg text-left"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-extrabold text-[10px]">Resend Activation Link</div>
                      <div className="text-[9px] text-slate-400 font-medium">Reset initial onboarding code</div>
                    </div>
                  </button>
                )}

                {isAccountLocked && (
                  <button 
                    onClick={handleUnlock}
                    className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 rounded-lg text-left"
                  >
                    <Unlock className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-extrabold text-[10px]">Unlock User Account</div>
                      <div className="text-[9px] text-slate-400 font-medium">Clear locks and reset failed login attempts</div>
                    </div>
                  </button>
                )}

                {account.status !== 'DISABLED' ? (
                  <button 
                    onClick={handleDisable}
                    className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 hover:bg-rose-100 dark:hover:bg-rose-950/30 rounded-lg text-left"
                  >
                    <UserMinus className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-extrabold text-[10px]">Deactivate Login Identity</div>
                      <div className="text-[9px] text-slate-400 font-medium">Prevent authorization and block api access</div>
                    </div>
                  </button>
                ) : (
                  <button 
                    onClick={handleEnable}
                    className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-750 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 rounded-lg text-left"
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-extrabold text-[10px]">Reactivate Account</div>
                      <div className="text-[9px] text-slate-400 font-medium">Re-enable profile login access</div>
                    </div>
                  </button>
                )}

                <button 
                  onClick={handleForcePasswordChange}
                  className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 hover:bg-amber-100 dark:hover:bg-amber-950/30 rounded-lg text-left"
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-extrabold text-[10px]">Require Password Reset</div>
                    <div className="text-[9px] text-slate-400 font-medium">Force password change on next session</div>
                  </div>
                </button>

                <button 
                  onClick={handleGenerateTempPassword}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-lg text-left"
                >
                  <Key className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-extrabold text-[10px]">Generate Temp Password</div>
                    <div className="text-[9px] text-slate-400 font-medium">Create a randomized temporary credential</div>
                  </div>
                </button>

                <button 
                  onClick={() => setShowCustomPasswordModal(true)}
                  className="flex items-center gap-2 px-3 py-2.5 bg-indigo-500/10 text-indigo-650 hover:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/15 rounded-lg text-left"
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-extrabold text-[10px]">Set Specific Password</div>
                    <div className="text-[9px] text-slate-400 font-medium">Manually overwrite profile credentials</div>
                  </div>
                </button>
              </div>

              {/* Temp password block */}
              {tempPassword && (
                <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Temporary Credential Created
                    </span>
                    <button 
                      onClick={() => copyToClipboard(tempPassword)}
                      className="hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-300 font-bold select-all">{tempPassword}</span>
                    <span className="text-[9px] text-slate-550 italic">Single-use, expires on login</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login Activity Logs */}
          <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/85 pb-3">
              Login Activity Log
            </h3>
            
            <div className="overflow-hidden border border-slate-200/80 dark:border-slate-850 rounded-xl">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200/85 dark:border-slate-800 text-slate-400 uppercase text-[9px] font-bold">
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">IP Address</th>
                    <th className="p-2.5">Type / Trigger</th>
                    <th className="p-2.5">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-650 dark:text-slate-350">
                  {account.auditLogs && account.auditLogs.filter((l: any) => l.action.includes('LOGIN')).length > 0 ? (
                    account.auditLogs
                      .filter((l: any) => l.action.includes('LOGIN'))
                      .map((log: any) => (
                        <tr key={log.id}>
                          <td className="p-2.5 font-mono text-[10px]">{new Date(log.performedAt).toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-[10px]">{log.ipAddress || '127.0.0.1'}</td>
                          <td className="p-2.5">{log.action === 'LOGIN_SUCCESS' ? 'User Authentication' : 'Failed Login Event'}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                              log.action === 'LOGIN_SUCCESS' 
                                ? 'bg-emerald-500/10 text-emerald-600' 
                                : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {log.action === 'LOGIN_SUCCESS' ? 'SUCCESS' : 'FAILED'}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-450">No recent authentication logs available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Security Summary Right Bar */}
        <div className="space-y-6">
          
          {/* Security Metrics Widget */}
          <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/85 pb-3">
              Authentication Dashboard
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-450">Multi-Factor Authentication (MFA)</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  account.mfaEnabled 
                    ? 'bg-emerald-500/10 text-emerald-600' 
                    : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {account.mfaEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-450">Password Expiry Tracking</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                  {account.passwordExpiryAt ? new Date(account.passwordExpiryAt).toLocaleDateString() : 'Never Expiry'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-450">Force Reset Next Login</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {account.passwordChangeRequired ? 'Required' : 'No'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-450">Failed On-Chain Logins</span>
                <span className={`font-bold ${account.failedLoginAttempts > 2 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                  {account.failedLoginAttempts || 0} / 5
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-450">Account Lockout Timestamp</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                  {account.accountLockedAt ? new Date(account.accountLockedAt).toLocaleString() : 'Unlocked'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-450">Password Last Changed</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                  {account.lastPasswordChangeAt ? new Date(account.lastPasswordChangeAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Chronological Audit Timeline */}
          <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/85 pb-3">
              Authentication Timeline
            </h3>

            <div className="space-y-4 pl-3 relative border-l border-slate-200 dark:border-slate-800 ml-1.5">
              {account.auditLogs && account.auditLogs.length > 0 ? (
                account.auditLogs.map((evt: any) => (
                  <div key={evt.id} className="relative">
                    <span className="absolute -left-[19.5px] top-1 bg-white dark:bg-slate-950 p-0.5 rounded-full border border-slate-300 dark:border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[9px] text-slate-450">
                        <span className="font-mono">{new Date(evt.performedAt).toLocaleString()}</span>
                        <span className="font-bold flex items-center gap-0.5">
                          <Server className="w-2.5 h-2.5" /> {evt.ipAddress || '127.0.0.1'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-750 dark:text-slate-250 font-extrabold">
                        {evt.action.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                        By {evt.performedBy} {evt.changeSummary ? `• ${evt.changeSummary}` : ''}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-450 text-[10px] py-4">No audit logs found.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Manual Password Set Modal */}
      {showCustomPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0C101B] border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in text-xs font-semibold text-slate-750 dark:text-slate-205">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
              <span className="font-extrabold text-[#4F46E5] uppercase">Manually Set Password</span>
            </div>
            <form onSubmit={handleCustomPasswordSubmit} className="space-y-4">
              <div className="space-y-2 text-[10px]">
                <label className="text-[10px] text-slate-450 uppercase block font-bold">New Security Password</label>
                <input 
                  type="password"
                  placeholder="Min 8 characters, Upper, Lower, Special"
                  value={customPassword}
                  onChange={e => setCustomPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none font-sans"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCustomPasswordModal(false)}
                  className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg font-bold"
                >
                  Confirm Password Set
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
