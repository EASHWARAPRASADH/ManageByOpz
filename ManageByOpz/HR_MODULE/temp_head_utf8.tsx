import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, Lock, Unlock, RefreshCw, UserPlus, KeyRound } from 'lucide-react';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useAssignRoleMutation,
  useRevokeRoleMutation,
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGenerateTokenMutation,
  useLockUserMutation,
  useUnlockUserMutation,
  useResendActivationMutation,
  useAdminResetPasswordMutation,
} from './securityApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from '../auth/authSlice';

export function SecurityScreen() {
  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'masking' | 'tokenGen'>('users');
  const dispatch = useAppDispatch();

  // Queries
  const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } = useGetUsersQuery();
  const { data: roles = [] } = useGetRolesQuery();
  const { data: permissions = [] } = useGetPermissionsQuery();

  // Mutations
  const [createUser] = useCreateUserMutation();
  const [assignRole] = useAssignRoleMutation();
  const [revokeRole] = useRevokeRoleMutation();
  const [generateToken, { isLoading: generatingToken }] = useGenerateTokenMutation();
  const [lockUser] = useLockUserMutation();
  const [unlockUser] = useUnlockUserMutation();
  const [resendActivation] = useResendActivationMutation();
  const [adminResetPassword] = useAdminResetPasswordMutation();

  // Form States
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    employeeId: '',
    roleCodes: [] as string[],
  });

  const [tokenParams, setTokenParams] = useState({
    username: 'admin-test',
    tenantId: 'default',
    role: 'ROLE_ADMIN',
    employeeId: '',
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dynamic Masking state
  const [maskingRules, setMaskingRules] = useState([
    { field: 'National ID (Aadhaar)', resource: 'EmployeeTwin', rule: 'Mask first 8 digits (e.g. ••••-••••-1234)', roleAffected: 'All roles except payroll', enabled: true },
    { field: 'Tax ID (PAN)', resource: 'EmployeeTwin', rule: 'Mask first 6 characters (e.g. ••••••1234F)', roleAffected: 'All roles except payroll', enabled: true },
    { field: 'Bank Account Number', resource: 'EmployeeTwin', rule: 'Mask all except last 4 digits', roleAffected: 'All roles except payroll', enabled: true }
  ]);

  const toggleMaskingRule = (idx: number) => {
    setMaskingRules(prev => prev.map((rule, i) => i === idx ? { ...rule, enabled: !rule.enabled } : rule));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email) return;
    try {
      await createUser(newUser).unwrap();
      setMessage({ text: 'User created successfully!', type: 'success' });
      setNewUser({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        employeeId: '',
        roleCodes: [],
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to create user', type: 'error' });
    }
  };

  const handleAssignRole = async (userId: string, roleCode: string) => {
    try {
      await assignRole({ userId, roleCode }).unwrap();
      setMessage({ text: `Role ${roleCode} assigned successfully!`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to assign role', type: 'error' });
    }
  };

  const handleRevokeRole = async (userId: string, roleId: string) => {
    try {
      await revokeRole({ userId, roleId }).unwrap();
      setMessage({ text: 'Role revoked successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to revoke role', type: 'error' });
    }
  };

  const handleLockUser = async (userId: string) => {
    try {
      await lockUser(userId).unwrap();
      setMessage({ text: 'User locked successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to lock user', type: 'error' });
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await unlockUser(userId).unwrap();
      setMessage({ text: 'User unlocked successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to unlock user', type: 'error' });
    }
  };

  const handleResendActivation = async (userId: string) => {
    try {
      await resendActivation(userId).unwrap();
      setMessage({ text: 'Activation email sent successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to send activation email', type: 'error' });
    }
  };

  const handleForceResetPassword = async (userId: string) => {
    const password = prompt('Enter new password for the user (must satisfy complexity policies):');
    if (!password) return;
    try {
      await adminResetPassword({ userId, password }).unwrap();
      setMessage({ text: 'Password reset forced successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to reset password', type: 'error' });
    }
  };

  const handleGenerateToken = async () => {
    try {
      const response = await generateToken(tokenParams).unwrap();
      dispatch(setCredentials({
        accessToken: response.token,
        refreshToken: '',
        user: {
          id: 'temp-id',
          name: response.username,
          email: `${response.username}@managemyopz.com`,
          role: response.role,
          tenantId: response.tenantId,
          permissions: []
        }
      }));
      setMessage({ text: `Token generated and session updated to ${response.role}!`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to generate token', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-surface-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Security & RBAC Management</h1>
          <p className="text-sm text-surface-500 dark:text-surface-450 mt-1">
            Configure tenant security boundaries, user roles, permission mappings, and simulate authorization context.
          </p>
        </div>
        <button
          onClick={() => refetchUsers()}
          className="flex items-center gap-2 bg-surface-150 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-750 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm border font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
              : 'bg-danger-50 text-danger-800 border-danger-200 dark:bg-danger-950/20 dark:text-danger-450 dark:border-danger-900/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-700 flex flex-wrap gap-2">
        {[
          { id: 'users', label: 'Platform Users', icon: Shield },
          { id: 'matrix', label: 'Roles & Permissions', icon: Key },
          { id: 'masking', label: 'Field Masking', icon: EyeOff },
          { id: 'tokenGen', label: 'RBAC Playgrounds (Auth Switcher)', icon: KeyRound }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all outline-none ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 font-semibold'
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-white hover:border-surface-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 min-h-[400px] shadow-sm">
        
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* List Users */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-lg">Active Platform Users</h3>
                {loadingUsers ? (
                  <p className="text-sm text-surface-500">Loading users...</p>
                ) : (
                  <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-surface-200 dark:border-surface-800 text-xs text-surface-400 uppercase bg-surface-50/50 dark:bg-surface-850/50">
                          <th className="p-3 font-semibold">User info</th>
                          <th className="p-3 font-semibold">Status</th>
                          <th className="p-3 font-semibold">Assigned Roles</th>
                          <th className="p-3 font-semibold">Manage Roles</th>
                          <th className="p-3 font-semibold">Account Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-150 dark:divide-surface-800 text-sm">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/10">
                            <td className="p-3">
                              <div className="font-bold">{u.username}</div>
                              <div className="text-xs text-surface-500">{u.email}</div>
                              {u.employeeId && (
                                <div className="text-[10px] text-primary-600 bg-primary-50 dark:bg-primary-950/20 dark:text-primary-400 px-1.5 py-0.5 rounded mt-1 inline-block">
                                  Twin ID: {u.employeeId.slice(0, 8)}...
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {(() => {
                                const status = u.status || (u.active ? 'ACTIVE' : 'DISABLED');
                                if (u.locked || status === 'LOCKED') {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30">
                                      <Lock size={12} /> Locked
                                    </span>
                                  );
                                }
                                if (status === 'PENDING_ACTIVATION') {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                                      Pending Activation
                                    </span>
                                  );
                                }
                                if (status === 'ACTIVE') {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                      Active
                                    </span>
                                  );
                                }
                                return (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400 border border-slate-100 dark:border-slate-900/30">
                                    Disabled
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {u.roles.map((r) => (
                                  <span
                                    key={r.id}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-450 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-900/30"
                                  >
                                    {r.name}
                                    <button
                                      onClick={() => handleRevokeRole(u.id, r.id)}
                                      title="Revoke Role"
                                      className="text-primary-600 hover:text-danger-600 font-bold ml-1"
                                    >
                                      &times;
                                    </button>
                                  </span>
                                ))}
                                {u.roles.length === 0 && (
                                  <span className="text-xs text-surface-400 italic">No roles assigned</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignRole(u.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="bg-surface-100 dark:bg-surface-800 text-xs px-2.5 py-1.5 rounded-lg border-none outline-none focus:ring-1 focus:ring-primary-500 font-medium"
                              >
                                <option value="">+ Assign Role</option>
                                {roles
                                  .filter((r) => !u.roles.some((ur) => ur.code === r.code))
                                  .map((r) => (
                                    <option key={r.id} value={r.code}>
                                      {r.name}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {u.locked || u.status === 'LOCKED' ? (
                                  <button
                                    onClick={() => handleUnlockUser(u.id)}
                                    title="Unlock User Account"
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-lg transition-colors"
                                  >
                                    <Unlock size={14} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleLockUser(u.id)}
                                    title="Lock User Account"
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 rounded-lg transition-colors"
                                  >
                                    <Lock size={14} />
                                  </button>
                                )}

                                {u.status === 'PENDING_ACTIVATION' && (
                                  <button
                                    onClick={() => handleResendActivation(u.id)}
                                    title="Resend Welcome & Activation Email"
                                    className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-400 rounded-lg transition-colors font-semibold"
                                  >
                                    Resend Invite
                                  </button>
                                )}

                                <button
                                  onClick={() => handleForceResetPassword(u.id)}
                                  title="Force Reset Password (Admin)"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:text-slate-350 rounded-lg transition-colors"
                                >
                                  <KeyRound size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add User */}
              <div className="border border-surface-200 dark:border-surface-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-base">Register Platform User</h3>
                </div>
                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div>
                    <label className="text-xs text-surface-500 font-semibold block mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sarah_j"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/25 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 font-semibold block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sarah@technosprint.net"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/25 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-surface-500 font-semibold block mb-1">First Name</label>
                      <input
                        type="text"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/25 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-surface-500 font-semibold block mb-1">Last Name</label>
                      <input
                        type="text"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/25 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 font-semibold block mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Defaults to Password123!"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/25 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 font-semibold block mb-1">Initial Role</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setNewUser({ ...newUser, roleCodes: [e.target.value] });
                        }
                      }}
                      className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none"
                    >
                      <option value="">Select Role</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.code}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-sm transition-all mt-2"
                  >
                    Create User Twin Account
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ROLES & PERMISSIONS TAB */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Roles Hierarchy */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Defined Administrative Roles</h3>
                <div className="space-y-3">
                  {roles.map((r) => (
                    <div
                      key={r.id}
                      className="border border-surface-200 dark:border-surface-800 rounded-xl p-4 flex items-center justify-between bg-surface-50/20 dark:bg-surface-900/10"
                    >
                      <div>
                        <h4 className="font-bold">{r.name}</h4>
                        <p className="text-xs font-mono text-surface-500 mt-0.5">{r.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-550 dark:text-surface-400 font-semibold">Priority Level:</span>
                        <span className="text-sm font-bold bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded font-mono">
                          {r.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions list */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Granular Platform Permissions</h3>
                <div className="overflow-y-auto max-h-[400px] border border-surface-200 dark:border-surface-800 rounded-xl divide-y divide-surface-150 dark:divide-surface-800">
                  {permissions.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-sm hover:bg-surface-50/50 dark:hover:bg-surface-800/10">
                      <div>
                        <span className="font-bold">{p.name}</span>
                        <span className="text-[10px] bg-surface-100 dark:bg-surface-800 text-surface-500 px-1.5 py-0.5 rounded font-mono ml-2">
                          {p.module}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-primary-600 dark:text-primary-400 font-semibold">
                        {p.permissionKey}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* FIELD MASKING TAB */}
        {activeTab === 'masking' && (
          <div className="space-y-6">
            <div className="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-150 dark:border-surface-800 flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
              <Lock className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-surface-800 dark:text-white">Dynamic Field Masking Engine</p>
                <p className="mt-0.5 text-xs text-surface-500">
                  Configure fields that are dynamically masked when queried by endpoints. The masking rule is evaluated at the service boundary using role clearances before serialization.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {maskingRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="border border-surface-200 dark:border-surface-800 rounded-xl p-5 hover:bg-surface-50/50 dark:hover:bg-surface-800/10 transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-surface-800 dark:text-white">{rule.field}</h4>
                    <p className="text-xs text-surface-500 mt-1">
                      Resource:{' '}
                      <span className="font-mono bg-surface-100 dark:bg-surface-800 px-1 py-0.5 rounded">
                        {rule.resource}
                      </span>
                    </p>
                    <p className="text-xs text-surface-450 mt-1 font-medium">
                      Rule: {rule.rule} • Affected: {rule.roleAffected}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleMaskingRule(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      rule.enabled
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20'
                        : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400 border border-surface-200 dark:border-surface-800'
                    }`}
                  >
                    {rule.enabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {rule.enabled ? 'Masking Enabled' : 'Masking Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOKEN GENERATOR (AUTH SWITICHER) TAB */}
        {activeTab === 'tokenGen' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary-500/10 to-cyan-500/10 dark:from-primary-950/20 dark:to-cyan-950/20 p-5 rounded-xl border border-primary-100 dark:border-primary-900/30 space-y-3">
              <div className="flex items-center gap-3">
                <Unlock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h3 className="font-bold text-base">Enterprise RBAC Authorization Playgrounds</h3>
              </div>
              <p className="text-sm text-surface-650 dark:text-surface-300">
                Instantly simulate different administrative contexts in the application. Select a security clearance level, tenant boundary, and username below to generate a valid stateless JWT token and apply it to the active browser session.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Token Parameters */}
              <div className="border border-surface-200 dark:border-surface-800 p-5 rounded-xl space-y-4">
                <h4 className="font-bold text-base">Simulated Identity Matrix</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-surface-500 font-semibold block mb-1">Simulated Username</label>
                    <input
                      type="text"
                      value={tokenParams.username}
                      onChange={(e) => setTokenParams({ ...tokenParams, username: e.target.value })}
                      className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 font-semibold block mb-1">Tenant isolation ID</label>
                    <input
                      type="text"
                      value={tokenParams.tenantId}
                      onChange={(e) => setTokenParams({ ...tokenParams, tenantId: e.target.value })}
                      className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 font-semibold block mb-1">Assigned Role (Hierarchy level)</label>
                    <select
                      value={tokenParams.role}
                      onChange={(e) => setTokenParams({ ...tokenParams, role: e.target.value })}
                      className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none"
                    >
                      <option value="ROLE_ULTRA_SUPER_ADMIN">Ultra Super Admin (ROLE_ULTRA_SUPER_ADMIN)</option>
                      <option value="ROLE_SUPER_ADMIN">Super Admin (ROLE_SUPER_ADMIN)</option>
                      <option value="ROLE_ADMIN">Admin (ROLE_ADMIN)</option>
                      <option value="ROLE_EMPLOYEE">Employee (ROLE_EMPLOYEE)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-surface-500 font-semibold block mb-1">Employee Twin ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. UUID (link to employee digital twin)"
                      value={tokenParams.employeeId}
                      onChange={(e) => setTokenParams({ ...tokenParams, employeeId: e.target.value })}
                      className="w-full bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 px-3 py-2 rounded-lg text-sm outline-none"
                    />
                  </div>
                  <button
                    onClick={handleGenerateToken}
                    disabled={generatingToken}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-sm transition-all mt-2 flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    {generatingToken ? 'Generating Authorization...' : 'Switch Active Identity Context'}
                  </button>
                </div>
              </div>

              {/* Instructions and Explanations */}
              <div className="bg-surface-50/55 dark:bg-surface-850/20 p-5 rounded-xl border border-surface-200 dark:border-surface-800/80 space-y-3 text-sm">
                <h4 className="font-bold text-base">Access Rules Verification Guide</h4>
                <div className="space-y-2 text-xs text-surface-550 dark:text-surface-400">
                  <p>
                    <span className="font-bold text-surface-800 dark:text-white">1. Ultra Super Admin:</span> Full global capabilities across organizations. Able to view settings, delete, and onboard anywhere.
                  </p>
                  <p>
                    <span className="font-bold text-surface-800 dark:text-white">2. Super Admin:</span> Authorized to perform Employee Terminations and Organization adjustments within the isolated tenant.
                  </p>
                  <p>
                    <span className="font-bold text-surface-800 dark:text-white">3. Admin:</span> Authorized to view directory, create twins, and update twin data, but forbidden from performing termination or permanent profile deletions.
                  </p>
                  <p>
                    <span className="font-bold text-surface-800 dark:text-white">4. Employee:</span> Read-only context. Trying to perform any modifications or accessing the Security/Org DNA screens will fail with authorization errors.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
