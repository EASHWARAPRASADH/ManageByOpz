import { User, Mail, Building, Award, Calendar, CheckCircle, Flame } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';

export function MyProfileScreen() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="space-y-6 animate-fade-in p-6 w-full max-w-none">
      {/* Profile Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar representation */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-2 border-white dark:border-slate-800">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
            </span>
          </div>

          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{user?.name || 'Employee Profile'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
              <Mail size={14} />
              {user?.email}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              <span className="px-2.5 py-0.5 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 rounded-full text-xs font-semibold border border-primary-100 dark:border-primary-900/40">
                {user?.role}
              </span>
              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
                ID: {user?.id?.substring(0, 8) || 'EMP004'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-center px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
            <span className="text-xs text-slate-400 block font-medium">Leave Balance</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">18.5 Days</span>
          </div>
          <div className="text-center px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
            <span className="text-xs text-slate-400 block font-medium">Recognitions</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">12 Received</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Employee Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <User size={18} className="text-emerald-500" />
            Digital Twin Core DNA
          </h2>
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Engineering</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Designation</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Senior React Engineer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Organization Tenant</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Building size={13} />
                {user?.tenantId || 'ACME'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reporting Manager</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Sarah Jenkins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date of Joining</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Calendar size={13} />
                Jan 15, 2024
              </span>
            </div>
          </div>
        </div>

        {/* Skills inventory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Flame size={18} className="text-emerald-500 animate-pulse" />
            Verified Skill Sets
          </h2>
          <div className="space-y-4">
            {[
              { skill: 'React / Redux / TypeScript', rating: 92 },
              { skill: 'Spring Boot Framework', rating: 80 },
              { skill: 'Database Isolation (MySQL)', rating: 75 },
              { skill: 'System Design & Auth', rating: 88 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{item.skill}</span>
                  <span className="text-emerald-500">{item.rating}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                    style={{ width: `${item.rating}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recognitions Received */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Award size={18} className="text-emerald-500" />
            Recent Recognitions
          </h2>
          <div className="space-y-3">
            {[
              { title: 'Technical Excellence', desc: 'Designed & delivered the zero-trust auth modules.', by: 'Sarah Jenkins', pts: 100 },
              { title: 'Colleague Hero', desc: 'Assisted in resolving critical dashboard load times.', by: 'David Miller', pts: 50 },
            ].map((reward, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg flex items-start gap-3">
                <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                <div className="text-xs space-y-0.5">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{reward.title}</h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                      +{reward.pts} pts
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">{reward.desc}</p>
                  <p className="text-[10px] text-slate-400 italic">By: {reward.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
