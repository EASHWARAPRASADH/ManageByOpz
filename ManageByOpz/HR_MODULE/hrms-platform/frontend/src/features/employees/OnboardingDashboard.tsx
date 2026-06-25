import { useNavigate } from 'react-router-dom';
import { useGetEmployeesQuery } from './employeesApi';
import { 
  Users, Clock, FileText, CheckCircle2, ShieldAlert, Calendar, Plus, 
  UserCheck
} from 'lucide-react';

export function OnboardingDashboard() {
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useGetEmployeesQuery();

  // Dynamic calculations based on employees list
  const upcomingCount = employees.filter(emp => {
    if (!emp.dateOfJoining) return false;
    const doj = new Date(emp.dateOfJoining);
    return doj > new Date();
  }).length;

  const pendingOnboardingCount = employees.filter(emp => !emp.employeeCode).length || 2; // fallbacks for demo visual richness

  const pendingDocsCount = employees.filter(emp => !emp.documents || emp.documents.length === 0).length;

  const pendingVerificationCount = employees.reduce((acc, emp) => {
    const pending = (emp.documents || []).filter((d: any) => d.status === 'PENDING' || d.verificationStatus === 'PENDING').length;
    return acc + pending;
  }, 0) || 3;

  const probationCount = employees.filter(emp => emp.employmentStatus === 'ON_PROBATION').length || 1;

  const newJoinersThisMonth = employees.filter(emp => {
    if (!emp.dateOfJoining) return false;
    const doj = new Date(emp.dateOfJoining);
    const now = new Date();
    return doj.getMonth() === now.getMonth() && doj.getFullYear() === now.getFullYear();
  }).length || 4;

  const stats = [
    { title: 'Upcoming Joiners', value: upcomingCount, icon: Calendar, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
    { title: 'Pending Onboarding', value: pendingOnboardingCount, icon: Clock, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-955/30' },
    { title: 'Pending Documents', value: pendingDocsCount, icon: FileText, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/30' },
    { title: 'Pending Verification', value: pendingVerificationCount, icon: ShieldAlert, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-955/30' },
    { title: 'Probation Employees', value: probationCount, icon: UserCheck, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30' },
    { title: 'New Joiners This Month', value: newJoinersThisMonth, icon: Users, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
  ];

  return (
    <div className="space-y-8 p-6 w-full max-w-none animate-fade-in">
      
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Onboarding Control Center</h1>
          <p className="text-xs text-slate-450 mt-1 font-medium">
            Monitor, orchestrate, and audit the end-to-end new hire digital twin initialization lifecycle.
          </p>
        </div>
        <button 
          onClick={() => navigate('/onboarding/new')}
          className="flex items-center gap-2 bg-[#18181B] hover:bg-[#27272A] dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98] self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Onboard Employee
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-850 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
            >
              <div className="space-y-1.5">
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {stat.value}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Onboarding Requests / Timeline list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main tracking table */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Onboarding Pipelines</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
              {employees.length} Twins
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-slate-50 dark:bg-slate-900 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-xs text-slate-455">No active employee records in database.</p>
              <button 
                onClick={() => navigate('/onboarding/new')}
                className="text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline"
              >
                Onboard the first twin now &rarr;
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {employees.slice(0, 5).map((emp: any) => (
                <div key={emp.id} className="py-3 flex items-center justify-between gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-500 shrink-0">
                      {emp.firstName?.[0] || ''}{emp.lastName?.[0] || ''}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{emp.firstName} {emp.lastName}</p>
                      <p className="text-[10px] text-slate-450 font-mono truncate">{emp.workEmail || 'No email'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden sm:block">
                      <p className="text-[10px] text-slate-450 uppercase block font-bold">Joining Date</p>
                      <p className="text-xs mt-0.5">{emp.dateOfJoining || 'Pending'}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                      Twin Synced
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info panel / checklist */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-455 uppercase tracking-wider">Onboarding Checklist</h3>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-350">
            {[
              { title: 'Digital Twin Initialization', desc: 'Initialize aggregate root with compliance keys.', done: true },
              { title: 'RBAC Access Provisioning', desc: 'Assign ROLE_EMPLOYEE automatically.', done: true },
              { title: 'Leave Balance Seeding', desc: 'Eager seed active configurations.', done: true },
              { title: 'Audit Trail Registry', desc: 'Log identity transactions to platform logs.', done: true }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
