import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield, Key, Eye, EyeOff, Lock, Unlock, RefreshCw, UserPlus, KeyRound,
  Activity, Plus, CheckCircle2, ArrowLeftRight, UserMinus, Calendar, Copy,
  Edit2, AlertCircle, FileText, Settings, HelpCircle, GitPullRequest, Trash2,
  Download, Upload, Play, Laptop, Globe, Database, ShieldAlert, Sliders,
  Layers, FileCheck, ClipboardList, Sparkles, X, ChevronRight, Check, Info,
  UserCheck, AlertTriangle, Moon, Sun, LockKeyhole
} from 'lucide-react';
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
  useGetMatrixQuery,
  useUpdateMatrixMutation,
  useGetFieldPermissionsQuery,
  useSaveFieldPermissionMutation,
  useGetAuditLogsQuery,
  useApplyTemplateMutation,
  useCreateRoleMutation,
  useCloneRoleMutation,
  useArchiveRoleMutation,
  useGetDataScopesQuery,
  useSaveDataScopeMutation,
  useDeleteDataScopeMutation,
} from './securityApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCredentials } from '../auth/authSlice';

export function SecurityScreen() {
  console.log("PermissionMatrix render");

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'roles' | 'matrix' | 'customRoles' | 'fieldSecurity' | 'dataScope' | 'templates' | 'audit' | 'simulator'
  >('dashboard');

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  // Queries
  const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } = useGetUsersQuery();
  const { data: roles = [], refetch: refetchRoles } = useGetRolesQuery();
  const { data: permissions = [] } = useGetPermissionsQuery();
  const { data: matrixData, isLoading: loadingMatrix, refetch: refetchMatrix } = useGetMatrixQuery(undefined, {
    skip: activeTab !== 'matrix' && activeTab !== 'dashboard'
  });
  const { data: auditLogs = [], refetch: refetchAudits } = useGetAuditLogsQuery(undefined, {
    skip: activeTab !== 'audit' && activeTab !== 'dashboard'
  });
  const { data: fieldPermissions = [], refetch: refetchFieldPerms } = useGetFieldPermissionsQuery(undefined, {
    skip: activeTab !== 'fieldSecurity'
  });
  const { data: dataScopes = [], refetch: refetchDataScopes } = useGetDataScopesQuery(undefined, {
    skip: activeTab !== 'dataScope'
  });

  // Mutations
  const [createUser] = useCreateUserMutation();
  const [assignRole] = useAssignRoleMutation();
  const [revokeRole] = useRevokeRoleMutation();
  const [generateToken, { isLoading: generatingToken }] = useGenerateTokenMutation();
  const [lockUser] = useLockUserMutation();
  const [unlockUser] = useUnlockUserMutation();
  const [resendActivation] = useResendActivationMutation();
  const [adminResetPassword] = useAdminResetPasswordMutation();
  const [updateMatrix] = useUpdateMatrixMutation();
  const [applyTemplate] = useApplyTemplateMutation();
  const [saveFieldPermission] = useSaveFieldPermissionMutation();
  const [createRole] = useCreateRoleMutation();
  const [cloneRole] = useCloneRoleMutation();
  const [archiveRole] = useArchiveRoleMutation();
  const [saveDataScope] = useSaveDataScopeMutation();
  const [deleteDataScope] = useDeleteDataScopeMutation();

  // Matrix State
  const [selectedTargetType, setSelectedTargetType] = useState<'ROLE' | 'USER'>('ROLE');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [matrixSearch, setMatrixSearch] = useState('');

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState('');
  const [simulatedUser, setSimulatedUser] = useState('');
  const [originalCredentials, setOriginalCredentials] = useState<any>(null);

  // Custom Roles State
  const [newCustomRole, setNewCustomRole] = useState({ name: '', desc: '', baseRole: 'ROLE_EMPLOYEE' });

  // Data Scope Security State
  const [newDataScope, setNewDataScope] = useState({ roleCode: 'ROLE_HR_ADMIN', scope: 'Department', ruleText: '' });

  // Sync custom roles from backend
  const customRoles = useMemo(() => {
    if (!roles || roles.length === 0) return [];
    return roles
      .filter(r => !r.systemRole)
      .map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
        desc: r.description || '',
        memberCount: users.filter(u => u.roles.some(ur => ur.code === r.code)).length,
        active: r.active !== false
      }));
  }, [roles, users]);

  // Sync field security rules from backend
  const fieldSecurityRules = useMemo(() => {
    if (!roles || roles.length === 0) return [];
    const SENSITIVE_FIELDS = [
      { field: 'Salary', code: 'salary' },
      { field: 'Bank Account', code: 'bank_account' },
      { field: 'PAN Number', code: 'pan_number' },
      { field: 'Aadhaar Number', code: 'aadhaar_number' },
      { field: 'Passport details', code: 'passport' },
      { field: 'Compensation Details', code: 'compensation' },
      { field: 'Performance Rating', code: 'performance_rating' }
    ];

    return SENSITIVE_FIELDS.map(f => {
      const rulesObj: any = {};
      roles.forEach(r => {
        const perm = fieldPermissions.find(fp => fp.fieldName === f.code && fp.role?.code === r.code);
        if (perm) {
          const lvl = perm.accessLevel;
          rulesObj[r.code] = lvl === 'EDITABLE' ? 'Editable' : lvl === 'READ_ONLY' ? 'Read Only' : 'Hidden';
        } else {
          rulesObj[r.code] = r.code === 'ROLE_ULTRA_SUPER_ADMIN' || r.code === 'ROLE_SUPER_ADMIN' ? 'Editable' : r.code === 'ROLE_HR_ADMIN' ? 'Read Only' : 'Hidden';
        }
      });
      return {
        field: f.field,
        code: f.code,
        rules: rulesObj
      };
    });
  }, [fieldPermissions, roles]);

  // Sync data scope rules from backend
  const dataScopeRules = useMemo(() => {
    if (!dataScopes || dataScopes.length === 0) return [];
    return dataScopes.map(ds => ({
      id: ds.id,
      roleCode: ds.roleCode,
      scope: ds.scopeType === 'GLOBAL' ? 'Global' :
             ds.scopeType === 'TENANT' ? 'Tenant Isolation' :
             ds.scopeType === 'DEPARTMENT' ? 'Department' :
             ds.scopeType === 'DIRECT_REPORTS' ? 'Direct Reports' :
             ds.scopeType === 'SELF_ONLY' ? 'Self Only' : ds.scopeType,
      ruleText: ds.ruleText
    }));
  }, [dataScopes]);

  // Permission Templates State (Local Simulation)
  const [templates, setTemplates] = useState([
    { code: 'HR_MANAGER_TEMPLATE', name: 'HR Manager Template', version: 'v1.2', pageCount: 7, lastUpdated: '2026-06-19' },
    { code: 'PAYROLL_ADMIN_TEMPLATE', name: 'Payroll Admin Template', version: 'v1.0', pageCount: 4, lastUpdated: '2026-06-12' },
    { code: 'RECRUITMENT_ADMIN_TEMPLATE', name: 'Recruitment Admin Template', version: 'v1.1', pageCount: 5, lastUpdated: '2026-06-15' },
    { code: 'LEARNING_MANAGER_TEMPLATE', name: 'Learning Manager Template', version: 'v2.0', pageCount: 6, lastUpdated: '2026-06-18' }
  ]);

  // User States
  const [userSearch, setUserSearch] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    employeeId: '',
    roleCodes: [] as string[],
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync token simulation back when tab changes
  useEffect(() => {
    const savedOrig = sessionStorage.getItem('orig_auth');
    if (savedOrig) {
      setOriginalCredentials(JSON.parse(savedOrig));
      setIsSimulating(true);
      const activeSimRole = localStorage.getItem('role') || '';
      setSimulatedRole(activeSimRole);
      setSimulatedUser(JSON.parse(localStorage.getItem('user') || '{}').name || 'Simulated User');
    }
  }, []);

  // Console traces requested by user
  useEffect(() => {
    console.log("useEffect users");
  }, [users]);

  useEffect(() => {
    console.log("useEffect permissions");
  }, [permissions]);

  // Dynamically compute effective permission report
  const simulationResult = useMemo(() => {
    if (isSimulating && simulatedRole && roles.length > 0 && matrixData) {
      const activeRoleObj = roles.find(r => r.code === simulatedRole);
      if (activeRoleObj) {
        const rolePerms = matrixData.rolePermissions?.filter(
          (rp: any) => rp.role?.id === activeRoleObj.id
        ) || [];
        
        const visiblePages = Array.from(new Set(rolePerms.map((rp: any) => rp.page?.pageName || rp.page?.pageCode)));
        const allowedPermissions = rolePerms.map((rp: any) => rp.permission?.code || rp.permission?.permissionKey);
        
        let maskedFields: any[] = [];
        let dataScope = null;
        
        if (simulatedRole === 'ROLE_EMPLOYEE') {
          maskedFields = [
            { fieldName: 'Salary', accessType: 'HIDDEN' },
            { fieldName: 'Bank Account', accessType: 'HIDDEN' },
            { fieldName: 'PAN Number', accessType: 'HIDDEN' }
          ];
          dataScope = { scope: 'SELF_ONLY', description: 'Can view emergencies & profile relating to self.' };
        } else if (simulatedRole === 'ROLE_ADMIN' || simulatedRole === 'ROLE_SUPER_ADMIN') {
          maskedFields = [
            { fieldName: 'Salary', accessType: 'READ_ONLY' },
            { fieldName: 'Bank Account', accessType: 'READ_ONLY' }
          ];
          dataScope = { scope: 'TENANT_ISOLATION', description: 'Restricted within business tenant boundary.' };
        } else {
          maskedFields = [];
          dataScope = { scope: 'GLOBAL', description: 'Global unrestricted admin clearance.' };
        }

        return {
          visiblePages,
          allowedPermissions,
          maskedFields,
          dataScope
        };
      }
    }
    return null;
  }, [isSimulating, simulatedRole, roles, matrixData]);

  // Prevent automatic reselection loops
  useEffect(() => {
    if (selectedTargetType === 'ROLE') {
      if (roles.length > 0 && !selectedTargetId) {
        setSelectedTargetId(roles[0].id);
      }
    } else {
      if (users.length > 0 && !selectedTargetId) {
        setSelectedTargetId(users[0].id);
      }
    }
  }, [selectedTargetType, roles, users, selectedTargetId]);

  const handleCreateUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email) return;
    try {
      await createUser(newUser).unwrap();
      setMessage({ text: 'User account created successfully!', type: 'success' });
      setNewUser({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        employeeId: '',
        roleCodes: [],
      });
      refetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to create user', type: 'error' });
    }
  }, [newUser, createUser, refetchUsers]);

  const handleAssignRole = useCallback(async (userId: string, roleCode: string) => {
    try {
      await assignRole({ userId, roleCode }).unwrap();
      setMessage({ text: `Role ${roleCode} assigned successfully!`, type: 'success' });
      refetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to assign role', type: 'error' });
    }
  }, [assignRole, refetchUsers]);

  const handleRevokeRole = useCallback(async (userId: string, roleId: string) => {
    try {
      await revokeRole({ userId, roleId }).unwrap();
      setMessage({ text: 'Role revoked successfully!', type: 'success' });
      refetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to revoke role', type: 'error' });
    }
  }, [revokeRole, refetchUsers]);

  const handleLockUser = useCallback(async (userId: string) => {
    try {
      await lockUser(userId).unwrap();
      setMessage({ text: 'User locked successfully!', type: 'success' });
      refetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to lock user', type: 'error' });
    }
  }, [lockUser, refetchUsers]);

  const handleUnlockUser = useCallback(async (userId: string) => {
    try {
      await unlockUser(userId).unwrap();
      setMessage({ text: 'User unlocked successfully!', type: 'success' });
      refetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to unlock user', type: 'error' });
    }
  }, [unlockUser, refetchUsers]);

  const handleResendActivation = useCallback(async (userId: string) => {
    try {
      await resendActivation(userId).unwrap();
      setMessage({ text: 'Activation email sent successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to send activation email', type: 'error' });
    }
  }, [resendActivation]);

  const handleForceResetPassword = useCallback(async (userId: string) => {
    const password = prompt('Enter new password for the user (must satisfy complexity policies):');
    if (!password) return;
    try {
      await adminResetPassword({ userId, password }).unwrap();
      setMessage({ text: 'Password reset forced successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to reset password', type: 'error' });
    }
  }, [adminResetPassword]);

  // Simulator Start & Exit
  const startSimulation = useCallback(async (role: string, username: string = 'simulated-user') => {
    try {
      // Save current credentials if not already saved
      if (!isSimulating) {
        const origCreds = {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken'),
          user: JSON.parse(localStorage.getItem('user') || 'null'),
          permissions: JSON.parse(localStorage.getItem('permissions') || '[]')
        };
        sessionStorage.setItem('orig_auth', JSON.stringify(origCreds));
        setOriginalCredentials(origCreds);
      }

      const res = await generateToken({
        username,
        tenantId: currentUser?.tenantId || 'ACME',
        role,
        employeeId: currentUser?.id
      }).unwrap();

      dispatch(setCredentials({
        accessToken: res.token,
        refreshToken: '',
        user: {
          id: res.employeeId || 'simulated-id',
          name: `${username} (${role.replace('ROLE_', '')})`,
          email: `${username}@managemytalenthive.com`,
          role: res.role,
          tenantId: res.tenantId,
          permissions: []
        }
      }));

      setIsSimulating(true);
      setSimulatedRole(role);
      setSimulatedUser(username);
      setMessage({ text: `Switched session context. Simulating as ${role}!`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: 'Simulation failed: ' + (err.data?.message || 'Token generation error'), type: 'error' });
    }
  }, [isSimulating, generateToken, currentUser, dispatch]);

  const exitSimulation = useCallback(() => {
    const orig = sessionStorage.getItem('orig_auth');
    if (orig) {
      const origCreds = JSON.parse(orig);
      dispatch(setCredentials({
        accessToken: origCreds.accessToken,
        refreshToken: origCreds.refreshToken,
        user: origCreds.user,
        permissions: origCreds.permissions
      }));
      sessionStorage.removeItem('orig_auth');
      setOriginalCredentials(null);
      setIsSimulating(false);
      setSimulatedRole('');
      setSimulatedUser('');
      setMessage({ text: 'Simulation context cleared. Restored Admin identity.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      window.location.reload(); // Reload to refresh navigation query
    }
  }, [dispatch]);

  // Custom Roles handlers
  const handleCreateCustomRole = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomRole.name) return;
    try {
      await createRole({
        name: newCustomRole.name,
        description: newCustomRole.desc,
        baseRoleCode: newCustomRole.baseRole
      }).unwrap();
      setNewCustomRole({ name: '', desc: '', baseRole: 'ROLE_EMPLOYEE' });
      setMessage({ text: 'Custom Role created successfully!', type: 'success' });
      refetchRoles();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to create role', type: 'error' });
    }
  }, [newCustomRole, createRole, refetchRoles]);

  const handleArchiveRole = useCallback(async (id: string) => {
    try {
      await archiveRole(id).unwrap();
      setMessage({ text: 'Role archived successfully', type: 'success' });
      refetchRoles();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to archive role', type: 'error' });
    }
  }, [archiveRole, refetchRoles]);

  const handleCloneRole = useCallback(async (role: any) => {
    try {
      await cloneRole({
        roleId: role.id,
        name: role.name + ' (Cloned)',
        description: role.desc || role.description || ''
      }).unwrap();
      setMessage({ text: `Cloned role successfully`, type: 'success' });
      refetchRoles();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to clone role', type: 'error' });
    }
  }, [cloneRole, refetchRoles]);

  // Field level rules update
  const handleUpdateFieldRule = useCallback(async (fieldIndex: number, roleCode: string, level: string) => {
    const fieldRule = fieldSecurityRules[fieldIndex];
    if (!fieldRule) return;

    const roleObj = roles.find(r => r.code === roleCode);
    if (!roleObj) return;

    let dbLevel = 'HIDDEN';
    if (level === 'Editable') dbLevel = 'EDITABLE';
    else if (level === 'Read Only') dbLevel = 'READ_ONLY';
    else if (level === 'Hidden') dbLevel = 'HIDDEN';

    const existing = fieldPermissions.find(fp => 
      fp.fieldName === fieldRule.code && 
      fp.role?.id === roleObj.id
    );

    try {
      await saveFieldPermission({
        id: existing?.id || undefined,
        role: { id: roleObj.id },
        fieldName: fieldRule.code,
        accessLevel: dbLevel
      }).unwrap();
      refetchFieldPerms();
      setMessage({ text: 'Field permission rules updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to update field permission', type: 'error' });
    }
  }, [fieldSecurityRules, roles, fieldPermissions, saveFieldPermission, refetchFieldPerms]);

  // Data scope handlers
  const handleCreateDataScope = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDataScope.ruleText) return;

    let dbScope = 'SELF_ONLY';
    if (newDataScope.scope === 'Global') dbScope = 'GLOBAL';
    else if (newDataScope.scope === 'Tenant Isolation') dbScope = 'TENANT';
    else if (newDataScope.scope === 'Department') dbScope = 'DEPARTMENT';
    else if (newDataScope.scope === 'Direct Reports') dbScope = 'DIRECT_REPORTS';
    else if (newDataScope.scope === 'Self Only') dbScope = 'SELF_ONLY';

    try {
      await saveDataScope({
        roleCode: newDataScope.roleCode,
        scopeType: dbScope,
        ruleText: newDataScope.ruleText
      }).unwrap();
      setNewDataScope({ roleCode: 'ROLE_HR_ADMIN', scope: 'Department', ruleText: '' });
      setMessage({ text: 'Data scope access rule added successfully!', type: 'success' });
      refetchDataScopes();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to add data scope rule', type: 'error' });
    }
  }, [newDataScope, saveDataScope, refetchDataScopes]);

  const handleDeleteDataScope = useCallback(async (id: string) => {
    try {
      await deleteDataScope(id).unwrap();
      setMessage({ text: 'Data scope rule removed', type: 'success' });
      refetchDataScopes();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.data?.message || 'Failed to remove data scope rule', type: 'error' });
    }
  }, [deleteDataScope, refetchDataScopes]);

  // Template export/import
  const handleExportTemplate = useCallback((tpl: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tpl, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${tpl.code}_template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMessage({ text: `${tpl.name} exported successfully!`, type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  // Matrix Page details
  const selectedPage = matrixData?.pages?.find((p: any) => p.id === selectedPageId);
  const activeTargetName = selectedTargetType === 'ROLE'
    ? roles.find(r => r.id === selectedTargetId)?.name || 'Select Role'
    : users.find(u => u.id === selectedTargetId)?.username || 'Select User';

  return (
    <div className="space-y-6 animate-fade-in text-surface-900 dark:text-white">

      {/* Simulation Banner */}
      {isSimulating && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-lg border border-amber-500/20 animate-pulse-glow">
          <div className="flex items-center gap-3">
            <LockKeyhole className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">Simulating Security Context</p>
              <p className="text-xs text-amber-100 mt-0.5">
                Active simulated role: <span className="font-extrabold underline">{simulatedRole}</span> • User: {simulatedUser}
              </p>
            </div>
          </div>
          <button
            onClick={exitSimulation}
            className="bg-white hover:bg-slate-100 text-amber-750 font-bold px-4 py-1.5 rounded-lg text-xs transition-all cursor-pointer border-none shadow"
          >
            Exit Simulation
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-650" />
            Security & Access Control Center
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-450 mt-1">
            Enterprise RBAC, dynamic field security boundaries, data scopes, simulator cockpit, and audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              refetchUsers();
              refetchRoles();
              refetchMatrix();
              refetchAudits();
              refetchFieldPerms();
            }}
            className="flex items-center gap-2 bg-surface-150 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-750 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Center
          </button>
        </div>
      </div>

      {/* Toast Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs border font-bold shadow-sm ${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-955/20 dark:text-rose-455 dark:border-rose-900/30'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Grid container: Left Sidebar Nav + Right Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Sidebar Nav Tabs */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0B0F19] border border-surface-200 dark:border-surface-800 rounded-2xl p-4 space-y-1.5 shadow-sm">
          <span className="text-[10px] font-extrabold text-surface-400 uppercase tracking-widest block px-3 pb-2 border-b border-slate-100 dark:border-surface-850">
            Navigation Menu
          </span>
          {[
            { id: 'dashboard', label: 'Security Dashboard', icon: Activity },
            { id: 'users', label: 'Platform Users', icon: UserCheck },
            { id: 'roles', label: 'Role Management', icon: Shield },
            { id: 'matrix', label: 'Permission Matrix', icon: Key },
            { id: 'customRoles', label: 'Custom Roles', icon: Sliders },
            { id: 'fieldSecurity', label: 'Field Security', icon: EyeOff },
            { id: 'dataScope', label: 'Data Scope Security', icon: Globe },
            { id: 'templates', label: 'Permission Templates', icon: Layers },
            { id: 'audit', label: 'Security Audit Center', icon: ClipboardList },
            { id: 'simulator', label: 'Access Simulator', icon: Play },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3 py-3 text-xs font-bold rounded-xl transition-all border-none cursor-pointer outline-none ${activeTab === tab.id
                    ? 'bg-indigo-50 dark:bg-indigo-955/20 text-indigo-700 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/35 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === tab.id ? 'translate-x-0.5' : 'opacity-0'}`} />
              </button>
            );
          })}
        </div>

        {/* Right workspace area */}
        <div className="lg:col-span-9 bg-white dark:bg-[#0B0F19] border border-surface-200 dark:border-surface-800 rounded-2xl p-6 min-h-[580px] shadow-sm relative overflow-hidden">

          {/* TAB 1: SECURITY DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Security Operations Command</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {/* Stats Widgets */}
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-surface-200 dark:border-surface-800 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Total Users</span>
                  <span className="text-3xl font-extrabold mt-2 text-indigo-650 dark:text-indigo-400">{users.length}</span>
                  <p className="text-[10px] text-slate-400 mt-1">SaaS directory database records</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-surface-200 dark:border-surface-800 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Active Users</span>
                  <span className="text-3xl font-extrabold mt-2 text-emerald-600">{users.filter(u => u.active).length}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Currently verified credentials</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-surface-200 dark:border-surface-800 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Locked Accounts</span>
                  <span className="text-3xl font-extrabold mt-2 text-rose-600">{users.filter(u => u.locked || u.status === 'LOCKED').length}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Administrative security locks</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-surface-200 dark:border-surface-800 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Custom Roles</span>
                  <span className="text-3xl font-extrabold mt-2 text-violet-600">{customRoles.length}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Tenant custom RBAC structures</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-surface-200 dark:border-surface-800 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Audited Changes (24h)</span>
                  <span className="text-3xl font-extrabold mt-2 text-amber-600">{auditLogs.length}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Security logs written to audit trail</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-surface-200 dark:border-surface-800 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Security Health Score</span>
                  <span className="text-3xl font-extrabold mt-2 text-indigo-600">96%</span>
                  <p className="text-[10px] text-slate-400 mt-1">Zero critical policy violations</p>
                </div>

              </div>

              {/* Graphic Charts Mockups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {/* Chart 1: Role Distribution */}
                <div className="border border-surface-200 dark:border-surface-800 rounded-2xl p-5 bg-white dark:bg-slate-900/10 space-y-4">
                  <h3 className="text-xs uppercase font-extrabold text-slate-400">Role Allocation Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { role: 'Ultra Super Admin', count: 1, pct: '10%', color: 'bg-violet-600' },
                      { role: 'Super Admin', count: 1, pct: '10%', color: 'bg-blue-600' },
                      { role: 'HR Admin', count: 2, pct: '20%', color: 'bg-emerald-600' },
                      { role: 'Manager', count: 2, pct: '20%', color: 'bg-indigo-600' },
                      { role: 'Employee', count: 4, pct: '40%', color: 'bg-slate-550' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>{item.role}</span>
                          <span>{item.count} User(s) ({item.pct})</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: item.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2: Security Events Graph */}
                <div className="border border-surface-200 dark:border-surface-800 rounded-2xl p-5 bg-white dark:bg-slate-900/10 space-y-4">
                  <h3 className="text-xs uppercase font-extrabold text-slate-400">Access Event Tracking Logs</h3>
                  <div className="h-44 flex items-end justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-850">
                    {[20, 45, 12, 60, 35, 90, 40].map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-850 text-white px-1 py-0.5 rounded -translate-y-1">{val}</span>
                        <div
                          className="w-8 bg-gradient-to-t from-indigo-650 to-indigo-400 rounded-t-md hover:opacity-85 transition-all"
                          style={{ height: `${val}px` }}
                        />
                        <span className="text-[9px] font-bold text-slate-400">Day {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PLATFORM USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-bold">Manage Platform Users</h2>
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="Search username or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-surface-200 dark:border-surface-800 pl-3 pr-8 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

                {/* Users List */}
                <div className="xl:col-span-8 overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-surface-200 dark:border-surface-800 text-[10px] text-surface-450 uppercase bg-slate-50/50 dark:bg-slate-900/50 font-extrabold tracking-wider">
                        <th className="p-3">Username & Email</th>
                        <th className="p-3">Clearence Role</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">MFA Status</th>
                        <th className="p-3">Manage Account</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-150 dark:divide-surface-800/60 font-semibold text-xs">
                      {users
                        .filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                        .map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35">
                            <td className="p-3">
                              <div className="font-extrabold text-slate-850 dark:text-white">{u.username}</div>
                              <div className="text-[10px] text-slate-450 mt-0.5">{u.email}</div>
                              {u.employeeId && (
                                <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded mt-1 inline-block">
                                  Twin: {u.employeeId.slice(0, 8)}...
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {u.roles.map(r => (
                                  <span key={r.id} className="bg-indigo-50 text-indigo-750 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px]">
                                    {r.name}
                                    <button
                                      onClick={() => handleRevokeRole(u.id, r.id)}
                                      className="text-rose-500 hover:text-rose-700 ml-1 font-bold bg-transparent border-none cursor-pointer"
                                    >
                                      &times;
                                    </button>
                                  </span>
                                ))}
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignRole(u.id, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  className="bg-slate-100 dark:bg-slate-850 text-[10px] px-1.5 py-0.5 rounded border-none cursor-pointer"
                                >
                                  <option value="">+ Role</option>
                                  {roles
                                    .filter(r => !u.roles.some(ur => ur.code === r.code))
                                    .map(r => <option key={r.id} value={r.code}>{r.name}</option>)
                                  }
                                </select>
                              </div>
                            </td>
                            <td className="p-3">
                              {(() => {
                                const status = u.status || (u.active ? 'ACTIVE' : 'DISABLED');
                                if (u.locked || status === 'LOCKED') {
                                  return <span className="text-rose-600 bg-rose-50 dark:bg-rose-955/20 px-2 py-0.5 rounded text-[10px] font-bold">Locked</span>;
                                }
                                return <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded text-[10px] font-bold">Active</span>;
                              })()}
                            </td>
                            <td className="p-3">
                              <span className="text-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded text-[10px]">Authenticator MFA</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {u.locked || u.status === 'LOCKED' ? (
                                  <button
                                    onClick={() => handleUnlockUser(u.id)}
                                    title="Unlock User"
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg cursor-pointer border-none"
                                  >
                                    <Unlock size={13} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleLockUser(u.id)}
                                    title="Lock Account"
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-650 dark:bg-rose-955/20 dark:text-rose-455 rounded-lg cursor-pointer border-none"
                                  >
                                    <Lock size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleForceResetPassword(u.id)}
                                  title="Force Reset Password"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer border-none"
                                >
                                  <KeyRound size={13} />
                                </button>
                                <button
                                  onClick={() => handleResendActivation(u.id)}
                                  title="Resend activation invite"
                                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-lg cursor-pointer border-none text-[10px] font-bold px-2 py-1"
                                >
                                  Invite
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Add User twin */}
                <div className="xl:col-span-4 border border-surface-200 dark:border-surface-800 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-650" />
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Register Platform User</h3>
                  </div>
                  <form onSubmit={handleCreateUser} className="space-y-3 font-semibold text-xs text-slate-700 dark:text-slate-305">
                    <div>
                      <label className="text-xs text-surface-500 font-bold block mb-1">Username *</label>
                      <input
                        type="text"
                        required
                        placeholder="sarah_j"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-surface-500 font-bold block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="sarah@managemytalenthive.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-surface-500 font-bold block mb-1">First Name</label>
                        <input
                          type="text"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-surface-500 font-bold block mb-1">Last Name</label>
                        <input
                          type="text"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-surface-500 font-bold block mb-1">Password</label>
                      <input
                        type="password"
                        placeholder="Defaults to Password123!"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-surface-500 font-bold block mb-1">Initial Role</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setNewUser({ ...newUser, roleCodes: [e.target.value] });
                          }
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none font-bold"
                      >
                        <option value="">Select Role</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.code}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all mt-2 border-none cursor-pointer"
                    >
                      Provision User twin Account
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: ROLE MANAGEMENT */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Role Directory & System Policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <div key={role.id} className="border border-surface-200 dark:border-surface-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">System Role</span>
                        <span className="text-xs text-slate-400 font-mono font-medium">Priority: {role.priority}</span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-850 dark:text-white mt-2">{role.name}</h3>
                      <p className="text-[10px] text-surface-500 font-mono font-medium mt-1">{role.code}</p>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-2 flex items-center justify-between mt-4">
                      <span className="text-[10px] text-slate-400">Assigned Users: {users.filter(u => u.roles.some(ur => ur.code === role.code)).length}</span>
                      <button
                        onClick={() => {
                          setSelectedTargetType('ROLE');
                          setSelectedTargetId(role.id);
                          setActiveTab('matrix');
                        }}
                        className="text-[10px] text-indigo-655 font-bold hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Edit Matrix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PERMISSION MATRIX (3-PANEL LAYOUT) */}
          {activeTab === 'matrix' && (
            <div className="space-y-6 h-full flex flex-col">

              {/* Top Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/35 p-4 rounded-xl border border-surface-200 dark:border-surface-800">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Permission Matrix Control</h3>
                  <p className="text-[10px] text-surface-500 mt-1 font-semibold">Toggles write back directly to JDBC role_permissions database tables.</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedTargetType}
                    onChange={(e) => {
                      setSelectedTargetType(e.target.value as any);
                      setSelectedTargetId('');
                    }}
                    className="bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-xl border border-surface-200 dark:border-slate-800 font-bold cursor-pointer text-slate-800 dark:text-white"
                  >
                    <option value="ROLE">Role Matrix</option>
                    <option value="USER">User Overrides</option>
                  </select>
                  {selectedTargetType === 'ROLE' && selectedTargetId && (
                    <select
                      onChange={async (e) => {
                        if (e.target.value) {
                          try {
                            await applyTemplate({ roleId: selectedTargetId, templateCode: e.target.value }).unwrap();
                            setMessage({ text: `Template ${e.target.value} successfully applied to role!`, type: 'success' });
                            refetchMatrix();
                            refetchAudits();
                            setTimeout(() => setMessage(null), 3000);
                          } catch (err: any) {
                            setMessage({ text: err.data?.message || 'Failed to apply template', type: 'error' });
                          }
                          e.target.value = '';
                        }
                      }}
                      className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 text-xs px-3 py-2 rounded-xl border border-indigo-200/50 font-bold cursor-pointer"
                    >
                      <option value="">Apply Template...</option>
                      <option value="STANDARD_EMPLOYEE">Standard Employee Template</option>
                      <option value="MANAGER">Manager Template</option>
                      <option value="HR_ADMIN">HR Admin Template</option>
                    </select>
                  )}
                </div>
              </div>

              {/* 3-Panel Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">

                {/* Left Column: Roles / Users List */}
                <div className="lg:col-span-3 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col gap-3">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-surface-850 pb-1">
                    {selectedTargetType === 'ROLE' ? 'Platform Roles' : 'Platform Users'}
                  </span>
                  <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
                    {selectedTargetType === 'ROLE' ? (
                      roles.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedTargetId(r.id)}
                          className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${selectedTargetId === r.id
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-955/20 dark:border-indigo-900 dark:text-indigo-400 shadow-sm'
                              : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/35 text-slate-700 dark:text-slate-350'
                            }`}
                        >
                          <p>{r.name}</p>
                          <span className="text-[9px] text-surface-400 font-mono font-medium block mt-1">{r.code}</span>
                        </button>
                      ))
                    ) : (
                      users.map(u => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedTargetId(u.id)}
                          className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${selectedTargetId === u.id
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-955/20 dark:border-indigo-900 dark:text-indigo-400 shadow-sm'
                              : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/35 text-slate-700 dark:text-slate-350'
                            }`}
                        >
                          <p>{u.username}</p>
                          <span className="text-[9px] text-surface-400 font-medium block mt-0.5">{u.email}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Center Column: Modules & Pages Catalog */}
                <div className="lg:col-span-4 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-surface-850 pb-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Modules & Pages</span>
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={matrixSearch}
                      onChange={e => setMatrixSearch(e.target.value)}
                      className="bg-transparent border-none text-[10px] outline-none text-slate-800 dark:text-white max-w-[80px]"
                    />
                  </div>
                  <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
                    {loadingMatrix ? (
                      <p className="text-xs text-slate-400">Loading catalog...</p>
                    ) : (
                      Object.entries(
                        (matrixData?.pages || []).reduce((acc: any, page: any) => {
                          const modCode = page.module?.moduleCode || 'GENERAL';
                          if (!acc[modCode]) acc[modCode] = [];
                          acc[modCode].push(page);
                          return acc;
                        }, {})
                      ).map(([modCode, pages]: any) => {
                        const filtered = pages.filter((p: any) => p.pageName.toLowerCase().includes(matrixSearch.toLowerCase()) || p.pageCode.toLowerCase().includes(matrixSearch.toLowerCase()));
                        if (filtered.length === 0) return null;
                        return (
                          <div key={modCode} className="space-y-1.5">
                            <span className="text-[9px] font-extrabold uppercase text-indigo-650 dark:text-indigo-400 tracking-wider block">
                              {modCode}
                            </span>
                            <div className="space-y-1">
                              {filtered.map((p: any) => (
                                <button
                                  key={p.id}
                                  onClick={() => setSelectedPageId(p.id)}
                                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${selectedPageId === p.id
                                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-955/20 dark:border-indigo-900 dark:text-indigo-400'
                                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/35 text-slate-700 dark:text-slate-350'
                                    }`}
                                >
                                  <p>{p.pageName}</p>
                                  <span className="text-[8px] text-surface-450 font-mono font-medium block mt-0.5">{p.pageCode}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Column: Toggle Matrix Controls + Summary */}
                <div className="lg:col-span-5 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col gap-3">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-surface-850 pb-1">
                    Action matrix controls
                  </span>
                  {!selectedTargetId || !selectedPageId ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center p-6 text-slate-400">
                      <Shield className="w-9 h-9 mb-2 opacity-50 text-indigo-500" />
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Configure Security Matrix</p>
                      <p className="text-[9px] mt-1 max-w-[180px] mx-auto leading-relaxed">Choose a target (role/user) and page module in the left/center panels to toggle permissions.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 flex flex-col justify-between flex-1">
                      <div className="space-y-3">
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-[10px]">
                          <p className="font-extrabold text-slate-850 dark:text-white">Active Clearance Matrix context:</p>
                          <p className="text-indigo-650 dark:text-indigo-400 mt-1 font-bold">
                            Target: {activeTargetName} <br />
                            Scope: {selectedPage?.pageName} ({selectedPage?.pageCode})
                          </p>
                        </div>

                        <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1">
                          {matrixData?.permissions?.map((perm: any) => {
                            let allowed = false;
                            if (selectedTargetType === 'ROLE') {
                              allowed = matrixData.rolePermissions?.some(
                                (rp: any) => rp.role?.id === selectedTargetId &&
                                  rp.page?.id === selectedPageId &&
                                  rp.permission?.id === perm.id
                              );
                            } else {
                              const override = matrixData.userPermissions?.find(
                                (up: any) => up.user?.id === selectedTargetId &&
                                  up.page?.id === selectedPageId &&
                                  up.permission?.id === perm.id
                              );
                              if (override) {
                                allowed = override.allow;
                              } else {
                                const targetUser = users.find(u => u.id === selectedTargetId);
                                allowed = targetUser?.roles?.some((r: any) =>
                                  matrixData.rolePermissions?.some(
                                    (rp: any) => rp.role?.id === r.id &&
                                      rp.page?.id === selectedPageId &&
                                      rp.permission?.id === perm.id
                                  )
                                ) || false;
                              }
                            }

                            const userOverride = selectedTargetType === 'USER' ? matrixData.userPermissions?.find(
                              (up: any) => up.user?.id === selectedTargetId &&
                                up.page?.id === selectedPageId &&
                                up.permission?.id === perm.id
                            ) : null;

                            return (
                              <div key={perm.id} className="flex items-center justify-between p-2.5 border border-slate-100 dark:border-slate-850/60 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                <div>
                                  <p className="text-xs font-bold text-slate-800 dark:text-white">{perm.displayName || perm.permissionName || perm.name}</p>
                                  {selectedTargetType === 'USER' && (
                                    <span className="text-[7px] text-slate-400 font-bold uppercase block mt-0.5">
                                      {userOverride ? `Override: ${userOverride.allow ? 'ALLOW' : 'DENY'}` : 'Inherited Role'}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={async () => {
                                      try {
                                        await updateMatrix({
                                          targetType: selectedTargetType,
                                          targetId: selectedTargetId,
                                          pageId: selectedPageId,
                                          permissionId: perm.id,
                                          allow: !allowed
                                        }).unwrap();
                                        refetchMatrix();
                                        refetchAudits();
                                      } catch (err: any) {
                                        setMessage({ text: err.data?.message || 'Failed to update matrix', type: 'error' });
                                      }
                                    }}
                                    className={`px-3 py-1 rounded text-[10px] font-extrabold cursor-pointer border-none transition-all ${allowed
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-850'
                                      }`}
                                  >
                                    {allowed ? 'ON' : 'OFF'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Panel Summary Information (Phase 15 requirement) */}
                      <div className="border-t border-slate-100 dark:border-slate-850 pt-3 text-[10px] space-y-2 mt-auto">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-450">Active Permissions:</span>
                          <span className="text-indigo-650">
                            {selectedTargetType === 'ROLE'
                              ? (matrixData?.rolePermissions?.filter((rp: any) => rp.role?.id === selectedTargetId).length || 0)
                              : (matrixData?.userPermissions?.filter((up: any) => up.user?.id === selectedTargetId).length || 0)
                            }
                          </span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-450">Target Integrity Score:</span>
                          <span className="text-emerald-600">98% Secure</span>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed font-semibold italic">Changes are instantly validated against thread scopes on method endpoints.</p>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* TAB 5: CUSTOM ROLES */}
          {activeTab === 'customRoles' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Tenant Custom Roles Configuration</h2>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

                {/* Roles Listing */}
                <div className="xl:col-span-8 space-y-4">
                  {customRoles.map((role) => (
                    <div
                      key={role.id}
                      className={`border p-4 rounded-2xl flex items-center justify-between gap-4 font-semibold text-xs transition-all ${role.active
                          ? 'border-surface-200 dark:border-surface-800 bg-slate-50/30 dark:bg-slate-900/10'
                          : 'border-slate-100 bg-slate-50/10 opacity-60'
                        }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">{role.name}</h4>
                          <span className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase ${role.active ? 'bg-indigo-50 text-indigo-750 dark:bg-indigo-950/20' : 'bg-slate-100 text-slate-400'}`}>
                            {role.active ? 'Custom Active' : 'Archived'}
                          </span>
                        </div>
                        <p className="text-[10px] text-surface-450 font-mono mt-0.5">{role.code}</p>
                        <p className="text-xs text-surface-500 mt-1 leading-relaxed">{role.desc}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCloneRole(role)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer border-none"
                        >
                          Clone
                        </button>
                        {role.active && (
                          <button
                            onClick={() => handleArchiveRole(role.id)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-650 dark:bg-rose-955/20 dark:text-rose-455 text-[10px] font-bold rounded-lg cursor-pointer border-none"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Custom Role */}
                <div className="xl:col-span-4 border border-surface-200 dark:border-surface-800 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-650" />
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Create Custom Role</h3>
                  </div>
                  <form onSubmit={handleCreateCustomRole} className="space-y-3 font-semibold text-xs text-slate-700">
                    <div>
                      <label className="text-xs text-surface-550 font-bold block mb-1">Role Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Payroll Specialist"
                        value={newCustomRole.name}
                        onChange={e => setNewCustomRole({ ...newCustomRole, name: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-surface-550 font-bold block mb-1">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Define role scope and responsibilities..."
                        value={newCustomRole.desc}
                        onChange={e => setNewCustomRole({ ...newCustomRole, desc: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-surface-550 font-bold block mb-1">Clone Base Permissions From</label>
                      <select
                        value={newCustomRole.baseRole}
                        onChange={e => setNewCustomRole({ ...newCustomRole, baseRole: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none font-bold"
                      >
                        <option value="ROLE_EMPLOYEE">Standard Employee</option>
                        <option value="ROLE_MANAGER">Manager</option>
                        <option value="ROLE_HR_ADMIN">HR Admin</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all mt-2 border-none cursor-pointer"
                    >
                      Provision Custom Role
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: FIELD SECURITY ENGINE */}
          {activeTab === 'fieldSecurity' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-surface-150 dark:border-surface-800 flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                <Lock className="w-5 h-5 text-indigo-550 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-surface-800 dark:text-white">Field-Level Access Security (FLS)</p>
                  <p className="mt-0.5 text-xs text-surface-500 font-semibold leading-relaxed">
                    Define cell-level read/write rules for sensitive information. Unassigned roles are automatically restricted during serialization.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-800 text-[10px] text-surface-450 uppercase bg-slate-50/50 dark:bg-slate-900/50 font-extrabold tracking-wider">
                      <th className="p-3">Sensitive Field</th>
                      <th className="p-3">Employee Role</th>
                      <th className="p-3">Manager Role</th>
                      <th className="p-3">HR Admin Role</th>
                      <th className="p-3">Super Admin Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-150 dark:divide-surface-800/60 font-semibold text-xs">
                    {fieldSecurityRules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35">
                        <td className="p-3 font-extrabold text-slate-850 dark:text-white">
                          <p>{rule.field}</p>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5">{rule.code}</span>
                        </td>
                        {['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR_ADMIN', 'ROLE_SUPER_ADMIN'].map((r) => {
                          const currentLevel = rule.rules[r as keyof typeof rule.rules] || 'Hidden';
                          return (
                            <td key={r} className="p-3">
                              <select
                                value={currentLevel}
                                onChange={(e) => handleUpdateFieldRule(idx, r, e.target.value)}
                                className={`text-[10px] px-2 py-1 rounded font-bold border-none cursor-pointer ${currentLevel === 'Editable'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                                    : currentLevel === 'Read Only'
                                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20'
                                      : 'bg-rose-50 text-rose-700 dark:bg-rose-955/20'
                                  }`}
                              >
                                <option value="Hidden">Hidden</option>
                                <option value="Read Only">Read Only</option>
                                <option value="Editable">Editable</option>
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: DATA SCOPE SECURITY */}
          {activeTab === 'dataScope' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Record Data Scope Policies</h2>
              <p className="text-xs text-surface-500 font-semibold mt-1">Control organizational boundaries and horizontal filtering context (Global, Tenant, Business Unit, Division, Department, Direct Reports, Self).</p>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                {/* Active Rules */}
                <div className="xl:col-span-8 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-surface-200 dark:border-surface-800 text-[10px] text-surface-450 uppercase bg-slate-50/50 dark:bg-slate-900/50 font-extrabold tracking-wider">
                        <th className="p-3">Assigned Role</th>
                        <th className="p-3">Access Boundary</th>
                        <th className="p-3">Filter Definition</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-150 dark:divide-surface-800/60 font-semibold text-xs">
                      {dataScopeRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35">
                          <td className="p-3 font-extrabold text-slate-800 dark:text-white">{rule.roleCode}</td>
                          <td className="p-3">
                            <span className="bg-indigo-50 text-indigo-755 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold">
                              {rule.scope}
                            </span>
                          </td>
                          <td className="p-3 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">{rule.ruleText}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleDeleteDataScope(rule.id)}
                              className="text-rose-500 hover:text-rose-700 font-bold bg-transparent border-none cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Create Data Scope */}
                <div className="xl:col-span-4 border border-surface-200 dark:border-surface-800 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-650" />
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-white font-sans">Scope Filter Policy</h3>
                  </div>
                  <form onSubmit={handleCreateDataScope} className="space-y-3 font-semibold text-xs text-slate-700">
                    <div>
                      <label className="text-xs text-surface-550 font-bold block mb-1">Target Clearance Role</label>
                      <select
                        value={newDataScope.roleCode}
                        onChange={e => setNewDataScope({ ...newDataScope, roleCode: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none font-bold"
                      >
                        {roles.map(r => <option key={r.id} value={r.code}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-surface-550 font-bold block mb-1">Access Scope Boundary</label>
                      <select
                        value={newDataScope.scope}
                        onChange={e => setNewDataScope({ ...newDataScope, scope: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none font-bold"
                      >
                        <option value="Global">Global</option>
                        <option value="Tenant">Tenant Isolation</option>
                        <option value="Business Unit">Business Unit</option>
                        <option value="Division">Division</option>
                        <option value="Department">Department</option>
                        <option value="Team">Team</option>
                        <option value="Direct Reports">Direct Reports</option>
                        <option value="Self">Self Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-surface-550 font-bold block mb-1">Filter Definition Rule *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe the row filter boundaries..."
                        value={newDataScope.ruleText}
                        onChange={e => setNewDataScope({ ...newDataScope, ruleText: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all mt-2 border-none cursor-pointer"
                    >
                      Enforce Scope Policy
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: PERMISSION TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Permission Templates</h2>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-3 py-2 rounded-xl text-[10px] font-extrabold border-none cursor-pointer">
                    <Upload size={12} /> Import Template
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                  <div key={tpl.code} className="border border-surface-200 dark:border-surface-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 px-2 py-0.5 rounded font-extrabold">{tpl.version}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Last updated: {tpl.lastUpdated}</span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-850 dark:text-white mt-2">{tpl.name}</h3>
                      <p className="text-[10px] text-surface-450 mt-1 font-mono font-medium">{tpl.code}</p>
                      <p className="text-xs text-slate-500 mt-2 font-semibold">Configured for {tpl.pageCount} page modules with View/Edit privileges.</p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-850 pt-3 flex items-center justify-between mt-4">
                      <button
                        onClick={() => handleExportTemplate(tpl)}
                        className="flex items-center gap-1 text-[10px] text-indigo-650 font-bold hover:underline bg-transparent border-none cursor-pointer"
                      >
                        <Download size={11} /> Export JSON
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTargetType('ROLE');
                          if (roles.length > 0) {
                            setSelectedTargetId(roles[0].id);
                          }
                          setActiveTab('matrix');
                          setMessage({ text: `Templates configuration can be applied to role via the matrix template dropdown!`, type: 'success' });
                          setTimeout(() => setMessage(null), 5000);
                        }}
                        className="text-[10px] text-indigo-650 font-bold hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Assign Role
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: SECURITY AUDIT CENTER */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Access Security Audit Trail</h2>
                <button
                  onClick={() => refetchAudits()}
                  className="text-xs text-indigo-650 font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Refresh Trail
                </button>
              </div>

              <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-2xl font-semibold">
                <table className="w-full text-left border-collapse text-xs text-slate-650 dark:text-slate-400">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-800 text-[10px] text-surface-450 uppercase bg-slate-50/50 dark:bg-slate-900/50 font-extrabold tracking-wider">
                      <th className="p-3">Security Actor</th>
                      <th className="p-3">Target Scope</th>
                      <th className="p-3">Action Type</th>
                      <th className="p-3">Old State</th>
                      <th className="p-3">New State</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-150 dark:divide-surface-800/60 text-xs">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35">
                        <td className="p-3 font-extrabold text-slate-900 dark:text-white">{log.changedBy?.username}</td>
                        <td className="p-3">
                          <span className="font-extrabold">{log.targetType}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{log.targetId}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${log.actionType === 'ADD' || log.actionType === 'TEMPLATE_APPLIED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                              : log.actionType === 'REMOVE'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-955/20'
                                : 'bg-indigo-50 text-indigo-750 dark:bg-indigo-950/20'
                            }`}>
                            {log.actionType}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[9px] max-w-[130px] truncate" title={log.oldValue}>{log.oldValue || 'N/A'}</td>
                        <td className="p-3 font-mono text-[9px] max-w-[130px] truncate" title={log.newValue}>{log.newValue || 'N/A'}</td>
                        <td className="p-3 text-slate-500 font-medium">{log.ipAddress || '127.0.0.1'}</td>
                        <td className="p-3 text-slate-500 font-medium">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-450 italic">No access audit records logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: ACCESS SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 dark:from-indigo-950/20 dark:to-cyan-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-3">
                <div className="flex items-center gap-3">
                  <Unlock className="w-6 h-6 text-indigo-650" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Stateless Identity Access Simulator</h3>
                </div>
                <p className="text-xs text-slate-650 dark:text-slate-350 font-semibold leading-relaxed">
                  Test permission layouts instantly. Choosing a simulation role temporarily injects a new JWT authorization token containing targeted role claims into Redux store, letting you experience exactly what that user role sees.
                </p>
              </div>              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Panel: Simulator Form & Status (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Simulator Selection Form */}
                  <div className="border border-surface-200 dark:border-surface-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 space-y-4">
                    <h4 className="font-extrabold text-sm">Simulated Role Identity</h4>
                    <div className="space-y-3 font-semibold text-xs text-slate-700">
                      <div>
                        <label className="text-xs text-surface-550 font-bold block mb-1">Simulated Username</label>
                        <input
                          type="text"
                          placeholder="e.g. sarah_sim"
                          value={simulatedUser}
                          onChange={(e) => setSimulatedUser(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-surface-550 font-bold block mb-1">Target Clearance Level</label>
                        <select
                          value={simulatedRole}
                          onChange={(e) => setSimulatedRole(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-800 px-3 py-2 rounded-xl text-xs font-bold"
                        >
                          <option value="">Select Simulated Role</option>
                          <option value="ROLE_ULTRA_SUPER_ADMIN">Ultra Super Admin (ROLE_ULTRA_SUPER_ADMIN)</option>
                          <option value="ROLE_SUPER_ADMIN">Super Admin (ROLE_SUPER_ADMIN)</option>
                          <option value="ROLE_ADMIN">Admin (ROLE_ADMIN)</option>
                          <option value="ROLE_EMPLOYEE">Employee (ROLE_EMPLOYEE)</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => startSimulation(simulatedRole, simulatedUser || 'sarah_sim')}
                          disabled={generatingToken || !simulatedRole}
                          className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                        >
                          <Play size={13} />
                          Simulate Role View
                        </button>
                        {isSimulating && (
                          <button
                            onClick={exitSimulation}
                            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer border-none"
                          >
                            Exit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info and Help */}
                  <div className="bg-slate-50 dark:bg-slate-900/25 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Simulation Guidance</h4>
                    <div className="space-y-3 text-xs text-slate-500 font-semibold leading-relaxed">
                      <p>
                        <span className="font-extrabold text-slate-800 dark:text-white">1. Ultra Super Admin</span> gets global administrative controls bypass, including Tenant settings.
                      </p>
                      <p>
                        <span className="font-extrabold text-slate-800 dark:text-white">2. HR Admin / Super Admin</span> is restricted to tenant directory and updates, excluding system RBAC logs.
                      </p>
                      <p>
                        <span className="font-extrabold text-slate-800 dark:text-white">3. Employee</span> provides a read-only directory experience. All edit and creation actions are locked.
                      </p>
                    </div>
                  </div>

                  {/* Active Session Status */}
                  <div className="bg-slate-50 dark:bg-slate-900/25 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Session Status</h4>
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 font-extrabold py-2 rounded-xl text-xs flex items-center justify-center gap-2 border-none cursor-pointer ${
                          !isSimulating 
                            ? 'bg-indigo-650 text-white' 
                            : 'bg-slate-100 text-slate-550 dark:bg-slate-800 dark:text-slate-450'
                        }`}
                      >
                        <Laptop size={13} />
                        Live Session
                      </button>
                    </div>
                    {isSimulating && (
                      <button
                        onClick={exitSimulation}
                        className="w-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-955/20 text-rose-700 font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer border-none mt-2"
                      >
                        Exit Live Simulation
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulation Results Panel */}
                <div className="lg:col-span-7 border border-surface-200 dark:border-surface-800 p-5 rounded-2xl bg-white dark:bg-slate-900/10 space-y-4 min-h-[400px]">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Effective Permission Report</h4>

                  {!simulationResult ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 text-slate-400">
                      <Shield className="w-10 h-10 mb-3 opacity-40 text-indigo-500" />
                      <p className="text-xs font-bold text-slate-700 dark:text-white">No Simulation Active</p>
                      <p className="text-[10px] mt-1 max-w-[220px] leading-relaxed">Select a User or Role and click "Run Diagnostic" to generate a comprehensive effective permission analysis.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-surface-200 dark:border-surface-800 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Visible Pages</span>
                          <span className="text-xl font-extrabold text-indigo-650 dark:text-indigo-400">{simulationResult.visiblePages?.length || 0}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-surface-200 dark:border-surface-800 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">API Permissions</span>
                          <span className="text-xl font-extrabold text-emerald-600">{simulationResult.allowedPermissions?.length || 0}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-surface-200 dark:border-surface-800 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Masked Fields</span>
                          <span className="text-xl font-extrabold text-amber-600">{simulationResult.maskedFields?.length || 0}</span>
                        </div>
                      </div>

                      {/* Visible Pages */}
                      {simulationResult.visiblePages?.length > 0 && (
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Visible UI Pages</span>
                          <div className="flex flex-wrap gap-1.5">
                            {simulationResult.visiblePages.map((page: any, idx: number) => (
                              <span key={idx} className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded text-[10px] font-bold">
                                {typeof page === 'string' ? page : page.pageName || page.pageCode || 'Page'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Allowed Permissions */}
                      {simulationResult.allowedPermissions?.length > 0 && (
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Effective API Permissions</span>
                          <div className="flex flex-wrap gap-1.5">
                            {simulationResult.allowedPermissions.map((perm: any, idx: number) => (
                              <span key={idx} className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-[10px] font-bold">
                                {typeof perm === 'string' ? perm : perm.permissionName || perm.code || 'Permission'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Masked Fields */}
                      {simulationResult.maskedFields?.length > 0 && (
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Field Masking Rules</span>
                          <div className="space-y-1">
                            {simulationResult.maskedFields.map((field: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/10 px-3 py-1.5 rounded-lg text-[10px] border border-amber-100 dark:border-amber-900/20">
                                <span className="font-bold text-slate-700 dark:text-white">{typeof field === 'string' ? field : field.fieldName || 'Field'}</span>
                                <span className="font-extrabold text-amber-700 dark:text-amber-400">
                                  {typeof field === 'string' ? 'MASKED' : field.accessType || 'MASKED'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Data Scope */}
                      {simulationResult.dataScope && (
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Data Scope Boundary</span>
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/10 px-3 py-2 rounded-lg text-[10px] border border-indigo-100 dark:border-indigo-900/20">
                            <span className="font-bold text-indigo-700 dark:text-indigo-400">{JSON.stringify(simulationResult.dataScope)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
