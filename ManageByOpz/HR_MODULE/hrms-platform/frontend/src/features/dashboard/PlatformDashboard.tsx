import { Building2, Users, ShieldCheck, BarChart3, Activity } from 'lucide-react';
import { useGetOrganizationsQuery } from '../org-dna/orgDnaApi';
import { useGetUsersQuery } from '../security/securityApi';
import { useGetEmployeesQuery } from '../employees/employeesApi';

export function PlatformDashboard() {
  // RTK Queries
  const { data: organizations, isLoading: loadingOrgs } = useGetOrganizationsQuery();
  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();
  const { data: employees, isLoading: loadingEmployees } = useGetEmployeesQuery();

  const totalTenants = organizations?.length || 0;
  const totalUsers = users?.length || 0;
  const totalEmployees = employees?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in p-6 w-full max-w-none">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Decorative Grid / Blur */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 border border-indigo-500/25 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
            Global Platform Owner Session
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome to SaaS Control Center</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            As a Platform Owner, you have complete cross-tenant visibility. Monitor system uptime, manage tenant configurations, adjust global RBAC schemas, and review security audits.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm hover:border-slate-350 dark:hover:border-slate-700 transition-all group relative overflow-hidden">
          <div className="absolute top-4 right-4 text-indigo-500/10 group-hover:text-indigo-550/20 transition-colors">
            <Building2 size={36} />
          </div>
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Total Tenants</span>
          {loadingOrgs ? (
            <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{totalTenants}</p>
          )}
          <div className="text-[10px] text-indigo-650 dark:text-indigo-400 font-semibold mt-3 flex items-center gap-1">
            <span>Active multi-tenant isolation</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm hover:border-slate-350 dark:hover:border-slate-700 transition-all group relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
            <Users size={36} />
          </div>
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Global Twins</span>
          {loadingEmployees ? (
            <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{totalEmployees}</p>
          )}
          <div className="text-[10px] text-emerald-600 dark:text-emerald-450 font-semibold mt-3">
            Onboarded employee twin aggregates
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm hover:border-slate-350 dark:hover:border-slate-700 transition-all group relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-500/10 group-hover:text-amber-550/20 transition-colors">
            <Users size={36} />
          </div>
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Global Users</span>
          {loadingUsers ? (
            <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{totalUsers}</p>
          )}
          <div className="text-[10px] text-amber-650 dark:text-amber-450 font-semibold mt-3">
            User security accounts registered
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm hover:border-slate-350 dark:hover:border-slate-700 transition-all group relative overflow-hidden">
          <div className="absolute top-4 right-4 text-rose-500/10 group-hover:text-rose-500/20 transition-colors">
            <ShieldCheck size={36} />
          </div>
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Platform Security</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">0 Incidents</p>
          <div className="text-[10px] text-rose-600 dark:text-rose-450 font-semibold mt-3 flex items-center gap-1">
            <span>Uptime: 99.998%</span>
          </div>
        </div>
      </div>

      {/* Main Content Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tenant Activity Table list */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-2">
              <Activity className="text-indigo-500" size={16} />
              Platform tenant organizations
            </h2>
            <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40">
              Live
            </span>
          </div>

          <div className="overflow-x-auto">
            {loadingOrgs ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />
                ))}
              </div>
            ) : !organizations || organizations.length === 0 ? (
              <div className="py-12 text-center text-xs font-medium text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No organizations recorded on the platform. Create one in Organization DNA.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800/80 text-slate-405 font-bold">
                    <th className="pb-2.5 pr-4">Tenant Code</th>
                    <th className="pb-2.5 px-4">Organization Name</th>
                    <th className="pb-2.5 px-4">Industry / Domain</th>
                    <th className="pb-2.5 px-4">Country</th>
                    <th className="pb-2.5 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="py-3 pr-4 font-mono font-bold text-indigo-650 dark:text-indigo-400">{org.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{org.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-355 font-medium">{org.industry || 'General SaaS'}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-450">{org.country || 'Global'}</td>
                      <td className="py-3 pl-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold ${
                          org.active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {org.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Global Module Licensing breakdown */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="text-indigo-500" size={16} />
              Module licensing adoption
            </h2>
          </div>
          <div className="space-y-4 text-xs">
            {[
              { name: 'Employee Digital Twin', value: 100 },
              { name: 'Organization DNA Layer', value: 100 },
              { name: 'Leave & Attendance Portal', value: 85 },
              { name: 'Audit & Compliance Engine', value: 75 },
            ].map((mod, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-650 dark:text-slate-350">{mod.name}</span>
                  <span className="text-indigo-650 dark:text-indigo-400">{mod.value}% adoption</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" 
                    style={{ width: `${mod.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
