import type { ReactNode } from 'react';
import { useAppSelector } from '../../app/hooks';

interface MockScreenProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children?: ReactNode;
}

export function MockScreen({ title, description, icon, children }: MockScreenProps) {
  const user = useAppSelector((state) => state.auth.user);
  
  return (
    <div className="space-y-6 animate-fade-in p-6 w-full max-w-none">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-primary-50 dark:bg-primary-950/30 rounded-xl text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 shadow-inner">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
          </div>
        </div>

        {user && (
          <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 relative z-10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Tenant: {user.tenantId || 'SYSTEM'}
          </div>
        )}
      </div>

      {children ? children : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-indigo-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Active Queue</h3>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">12</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-emerald-500 font-medium">↑ 18%</span> vs last month
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-pink-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">SLA Compliance</h3>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">99.4%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-emerald-500 font-medium">↑ 0.5%</span> target 98.0%
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">System Status</h3>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">Optimal</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-ping" />
              All micro-services active
            </p>
          </div>

          {/* Table / List Area */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Recent Module Operations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Operation</th>
                    <th className="pb-3 font-medium">Initiated By</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  <tr className="text-slate-600 dark:text-slate-300">
                    <td className="py-3.5 font-medium text-slate-900 dark:text-white">Sync Org Tree</td>
                    <td className="py-3.5">{user?.email || 'system'}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded-md text-xs font-medium">
                        Completed
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">Just now</td>
                  </tr>
                  <tr className="text-slate-600 dark:text-slate-300">
                    <td className="py-3.5 font-medium text-slate-900 dark:text-white">Reload Tenant Config</td>
                    <td className="py-3.5">system</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded-md text-xs font-medium">
                        Completed
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">10 mins ago</td>
                  </tr>
                  <tr className="text-slate-600 dark:text-slate-300">
                    <td className="py-3.5 font-medium text-slate-900 dark:text-white">Generate Leave Report</td>
                    <td className="py-3.5">{user?.email || 'system'}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 rounded-md text-xs font-medium">
                        Processing
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">24 mins ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
