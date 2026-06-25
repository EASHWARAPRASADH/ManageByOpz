import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, Shield, Calendar, ArrowUpRight,
  MapPin, Clock, Briefcase, ChevronRight, Activity, AlertCircle,
  LayoutGrid, Check, X, GripHorizontal, Plus, RotateCcw, Save, Heart, Award, Sparkles, RefreshCw
} from 'lucide-react';
import { useGetEmployeesQuery } from '../employees/employeesApi';
import { useGetOrganizationsQuery, useGetDnaAnalyticsQuery } from '../org-dna/orgDnaApi';
import { useGetUsersQuery } from '../security/securityApi';
import { useAppSelector } from '../../app/hooks';
import {
  useGetMyLayoutQuery,
  useSaveMyLayoutMutation
} from './dashboardApi';
import type { DashboardWidgetPreference } from './dashboardApi';
import {
  useGetLeaveBalancesQuery,
  useGetRiskHeatmapQuery
} from '../leave/leaveApi';
import {
  useGetFeedQuery
} from '../recognition/recognitionApi';
import {
  useGetApprovalTasksQuery,
  useProcessTaskActionMutation
} from '../workflow/workflowApi';

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [time, setTime] = useState(new Date());
  
  // Drag & drop / edit state
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidgetPreference[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // RTK Query endpoints
  const { data: rawEmployees, isLoading: loadingEmployees } = useGetEmployeesQuery();
  const { data: organizations, isLoading: loadingOrgs } = useGetOrganizationsQuery();
  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();
  const { data: dnaAnalytics, isLoading: loadingDna } = useGetDnaAnalyticsQuery();
  
  // Dashboard Layout endpoints
  const { data: layoutData, isLoading: loadingLayout } = useGetMyLayoutQuery();
  const [saveLayout, { isLoading: isSaving }] = useSaveMyLayoutMutation();

  // Resolve current employee ID for user email
  const currentUserEmployee = (rawEmployees || []).find((e: any) => e.workEmail === user?.email || e.personalEmail === user?.email);
  const currentEmployeeId = currentUserEmployee?.id || '';

  // Widget APIs
  const { data: leaveBalances } = useGetLeaveBalancesQuery(
    { employeeId: currentEmployeeId, year: new Date().getFullYear() },
    { skip: !currentEmployeeId }
  );
  const { data: recognitionFeed } = useGetFeedQuery();
  const { data: approvalTasks } = useGetApprovalTasksQuery({ status: 'PENDING' });
  const [processTaskAction] = useProcessTaskActionMutation();

  // Sync widgets state with database layout
  useEffect(() => {
    if (layoutData?.widgets) {
      setWidgets(layoutData.widgets);
    }
  }, [layoutData]);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getGreeting = () => {
    const hrs = time.getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return time.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = () => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Base Data Processing
  const employees = (rawEmployees || []).map((emp: any) => {
    let deptName = emp.department;
    if (dnaAnalytics?.departmentNames && emp.departmentId) {
      deptName = dnaAnalytics.departmentNames[emp.departmentId] || `Unknown Department (${emp.departmentId})`;
    }
    let locName = emp.location;
    if (dnaAnalytics?.locationNames && emp.locationId) {
      locName = dnaAnalytics.locationNames[emp.locationId] || `Unknown Location (${emp.locationId})`;
    }
    let desigName = emp.designation;
    if (dnaAnalytics?.designationNames && emp.designationId) {
      desigName = dnaAnalytics.designationNames[emp.designationId] || `Unknown Designation (${emp.designationId})`;
    }
    return {
      ...emp,
      displayName: emp.displayName || `${emp.firstName} ${emp.lastName}`,
      department: deptName || 'Unassigned',
      location: locName || 'Remote',
      designation: desigName || 'Senior Staff Engineer'
    };
  });

  const totalEmployeesCount = dnaAnalytics?.totalEmployees ?? (employees?.length || 0);
  const activeTwinsCount = employees?.filter(e => e.employmentStatus === 'ACTIVE').length || 0;
  const totalOrgsCount = dnaAnalytics?.totalDnaNodes ?? (organizations?.length || 0);
  const totalUsersCount = users?.length || 0;

  const departmentStats = dnaAnalytics?.departmentBreakdown
    ? dnaAnalytics.departmentBreakdown.map((dept: any) => ({
        name: dept.departmentName,
        count: dept.employeeCount,
        percentage: dept.percentage
      }))
    : Object.entries(
        (employees || []).reduce((acc: Record<string, number>, emp: any) => {
          const dept = emp.department || 'Unassigned';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, count]) => ({
        name,
        count,
        percentage: totalEmployeesCount > 0 ? Math.round((count / totalEmployeesCount) * 100) : 0
      })).sort((a: any, b: any) => b.count - a.count);

  // Quick action for workflow approval
  const handleApproveTask = async (taskId: string) => {
    try {
      await processTaskAction({ taskId, body: { action: 'APPROVE', comments: 'Approved via Quick Action' } }).unwrap();
      triggerToast('Workflow request approved successfully.', 'success');
    } catch (err) {
      triggerToast('Failed to approve request.', 'error');
    }
  };

  const handleRejectTask = async (taskId: string) => {
    try {
      await processTaskAction({ taskId, body: { action: 'REJECT', comments: 'Rejected via Quick Action' } }).unwrap();
      triggerToast('Workflow request rejected.', 'error');
    } catch (err) {
      triggerToast('Failed to reject request.', 'error');
    }
  };

  // Drag Pointer Events
  const handleDragStart = (e: React.PointerEvent, key: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    const widget = widgets.find(w => w.widgetKey === key);
    if (!widget) return;
    
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startGridX = widget.x;
    const startGridY = widget.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer) return;
      const rect = gridContainer.getBoundingClientRect();
      const colWidth = rect.width / 8; // 8 columns
      const rowHeight = 126; // 110px height + 16px gap (h-28 is 112px, gap-4 is 16px)

      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;

      const gridDeltaX = Math.round(deltaX / colWidth);
      const gridDeltaY = Math.round(deltaY / rowHeight);

      const newX = Math.max(0, Math.min(8 - widget.w, startGridX + gridDeltaX));
      const newY = Math.max(0, startGridY + gridDeltaY);

      setWidgets(prev => prev.map(w => w.widgetKey === key ? { ...w, x: newX, y: newY } : w));
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Resize Pointer Events
  const handleResizeStart = (e: React.PointerEvent, key: string) => {
    if (!isEditMode) return;
    e.stopPropagation();
    e.preventDefault();
    const widget = widgets.find(w => w.widgetKey === key);
    if (!widget) return;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startW = widget.w;
    const startH = widget.h;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer) return;
      const rect = gridContainer.getBoundingClientRect();
      const colWidth = rect.width / 8;
      const rowHeight = 126;

      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;

      const gridDeltaW = Math.round(deltaX / colWidth);
      const gridDeltaH = Math.round(deltaY / rowHeight);

      const minW = 2;
      const minH = 1;

      const newW = Math.max(minW, Math.min(8 - widget.x, startW + gridDeltaW));
      const newH = Math.max(minH, startH + gridDeltaH);

      setWidgets(prev => prev.map(w => w.widgetKey === key ? { ...w, w: newW, h: newH } : w));
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleSaveLayout = async () => {
    try {
      await saveLayout({
        layoutName: layoutData?.layoutName || 'Custom Layout',
        widgets
      }).unwrap();
      setIsEditMode(false);
      triggerToast('Dashboard layout saved successfully!', 'success');
    } catch (err) {
      triggerToast('Failed to save layout preferences.', 'error');
    }
  };

  const handleCancelEdit = () => {
    if (layoutData?.widgets) {
      setWidgets(layoutData.widgets);
    }
    setIsEditMode(false);
  };

  const handleResetLayout = () => {
    if (layoutData?.widgets) {
      const reset = layoutData.widgets.map((w, idx) => ({
        ...w,
        x: (idx % 2) * 4,
        y: Math.floor(idx / 2) * 2,
        w: 4,
        h: w.widgetKey === 'headcount' || w.widgetKey === 'recognition' ? 3 : 2,
        visible: true,
        title: w.title
      }));
      setWidgets(reset);
      triggerToast('Reset to default positions grid.', 'success');
    }
  };

  const toggleWidgetVisibility = (key: string) => {
    setWidgets(prev => prev.map(w => {
      if (w.widgetKey === key) {
        const nextVisible = !w.visible;
        // If turning visible, find a spot at the bottom
        let nextY = w.y;
        if (nextVisible) {
          const maxY = prev.reduce((max, cur) => cur.visible ? Math.max(max, cur.y + cur.h) : max, 0);
          nextY = maxY;
        }
        return { ...w, visible: nextVisible, y: nextY, x: 0 };
      }
      return w;
    }));
  };

  const handleRenameWidget = (key: string, nextTitle: string) => {
    setWidgets(prev => prev.map(w => w.widgetKey === key ? { ...w, title: nextTitle } : w));
  };

  // Interactive attendance clock state
  const [isCheckedIn, setIsCheckedIn] = useState(() => localStorage.getItem('isClockedIn') === 'true');
  const [clockInTime, setClockInTime] = useState(() => localStorage.getItem('clockInTime') || '');

  const handleClockToggle = () => {
    if (isCheckedIn) {
      setIsCheckedIn(false);
      setClockInTime('');
      localStorage.removeItem('isClockedIn');
      localStorage.removeItem('clockInTime');
      triggerToast('Successfully clocked out.', 'error');
    } else {
      const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setIsCheckedIn(true);
      setClockInTime(nowStr);
      localStorage.setItem('isClockedIn', 'true');
      localStorage.setItem('clockInTime', nowStr);
      triggerToast('Successfully clocked in. Have a great day!', 'success');
    }
  };

  return (
    <div className="space-y-6 p-6 w-full max-w-none animate-fade-in relative min-h-screen">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-xl border text-xs font-bold shadow-lg z-50 animate-fade-in flex items-center gap-2 ${
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-250 dark:border-emerald-900/60'
            : 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-250 dark:border-red-900/60'
        }`}>
          {toast.type === 'success' ? <Check size={14} /> : <X size={14} />}
          {toast.message}
        </div>
      )}

      {/* Upper Dashboard Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {getGreeting()}, {user?.name || 'Administrator'}! 👋
          </h1>
          <p className="text-xs text-slate-450 mt-1 font-medium">
            Here is a platform-wide operational overview of the HR Operating System.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <LayoutGrid size={14} />
                Customize Layout
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveLayout}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Layout
                </button>
                <button
                  onClick={handleResetLayout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset Grid
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-right border-l border-slate-100 dark:border-slate-800 pl-4">
            <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatDate()}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{formatTime()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Customizer Draw Bar */}
      {isEditMode && (
        <div className="bg-indigo-500/5 dark:bg-indigo-550/5 border border-dashed border-indigo-500/30 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5">
            <Sparkles size={14} className="animate-pulse" />
            Workspace Widgets Builder
          </h3>
          <p className="text-[11px] text-slate-450 leading-relaxed">
            Drag the widget headers to reposition widgets. Drag the bottom-right corner handles to resize. Click titles to rename them. Toggle visibility of any widget below:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {widgets.map(w => (
              <button
                key={w.widgetKey}
                onClick={() => toggleWidgetVisibility(w.widgetKey)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  w.visible
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 line-through'
                }`}
              >
                {w.visible ? <Check size={10} /> : <Plus size={10} />}
                {w.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Drag-and-Drop Workspace Grid */}
      <div className="relative min-h-[500px]">
        {/* Dotted Grid Backdrop for design guidelines */}
        {isEditMode && (
          <div className="absolute inset-0 grid grid-cols-8 grid-auto-rows-[110px] gap-4 pointer-events-none opacity-[0.03] dark:opacity-[0.07] z-0">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-dashed border-indigo-500 rounded-xl h-[110px]" />
            ))}
          </div>
        )}

        <div
          id="dashboard-grid-container"
          className="grid grid-cols-8 gap-4 relative z-10"
          style={{ gridAutoRows: '110px' }}
        >
          {widgets
            .filter(w => w.visible)
            .map((w) => {
              // Decide which icon matches
              const getIcon = () => {
                switch (w.widgetKey) {
                  case 'headcount': return <Users size={16} />;
                  case 'leave_balance': return <Calendar size={16} />;
                  case 'attendance': return <Clock size={16} />;
                  case 'recognition': return <Heart size={16} />;
                  case 'pending_approvals': return <Shield size={16} />;
                  default: return <Activity size={16} />;
                }
              };

              // Widget Component Renderer
              const renderWidgetContent = () => {
                switch (w.widgetKey) {
                  case 'headcount':
                    return (
                      <div className="space-y-3.5 h-full overflow-y-auto pr-1">
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                            <span className="text-[10px] text-slate-450 block font-semibold uppercase">Total Headcount</span>
                            <span className="text-lg font-extrabold text-slate-850 dark:text-white">{totalEmployeesCount}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                            <span className="text-[10px] text-slate-450 block font-semibold uppercase">Active Twins</span>
                            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-450">{activeTwinsCount}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Department breakdown</span>
                          <div className="space-y-2">
                            {departmentStats.slice(0, 3).map((dept, idx) => (
                              <div key={idx} className="space-y-0.5 text-[10px]">
                                <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-350">
                                  <span>{dept.name}</span>
                                  <span>{dept.count} ({dept.percentage}%)</span>
                                </div>
                                <div className="h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dept.percentage}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );

                  case 'leave_balance':
                    const displayBalances = leaveBalances?.length ? leaveBalances.slice(0, 3) : [
                      { id: '1', leaveTypeName: 'Paid Leave', balance: 14, totalAllocated: 20 },
                      { id: '2', leaveTypeName: 'Sick Leave', balance: 8, totalAllocated: 10 },
                      { id: '3', leaveTypeName: 'Casual Leave', balance: 5, totalAllocated: 7 },
                    ];
                    return (
                      <div className="flex flex-col justify-between h-full space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          {displayBalances.map((bal: any, idx: number) => {
                            const pct = bal.totalAllocated > 0 ? Math.round((bal.balance / bal.totalAllocated) * 100) : 0;
                            return (
                              <div key={bal.id || idx} className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-850 text-center">
                                <span className="text-[9px] text-slate-450 block truncate font-bold uppercase">{bal.leaveTypeName || 'Leave'}</span>
                                <span className="text-base font-extrabold text-indigo-650 dark:text-indigo-400 block mt-0.5">{bal.balance}</span>
                                <span className="text-[8px] text-slate-400 font-semibold uppercase block mt-0.5">{pct}% left</span>
                              </div>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => navigate('/leave')}
                          className="w-full text-center py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-[10px] font-bold text-indigo-650 dark:text-indigo-400 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/40 mt-auto"
                        >
                          Request Time Off
                        </button>
                      </div>
                    );

                  case 'attendance':
                    return (
                      <div className="flex flex-col justify-between h-full space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Today shift schedule</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">09:00 AM - 06:00 PM (Regular)</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isCheckedIn
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                          }`}>
                            {isCheckedIn ? `CHECKED IN (${clockInTime})` : 'NOT CLOCKED IN'}
                          </span>
                        </div>
                        <button
                          onClick={handleClockToggle}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                            isCheckedIn
                              ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/25 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
                          }`}
                        >
                          {isCheckedIn ? 'Clock Out' : 'Clock In Now'}
                        </button>
                      </div>
                    );

                  case 'recognition':
                    const displayFeed = recognitionFeed?.length ? recognitionFeed.slice(0, 2) : [
                      { id: '1', giverEmployeeId: '1', title: 'Spot Award', message: 'Outstanding contribution to project scaling. Well done!', points: 150 },
                      { id: '2', giverEmployeeId: '2', title: 'Customer Champion', message: 'Resolved critical production incidents swiftly.', points: 100 },
                    ];
                    return (
                      <div className="flex flex-col justify-between h-full space-y-2 overflow-hidden">
                        <div className="space-y-2 overflow-y-auto pr-1">
                          {displayFeed.map((rec: any) => (
                            <div key={rec.id} className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-850 flex items-start gap-2 text-[10px]">
                              <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                <Award className="w-3.5 h-3.5 text-indigo-500" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                                  <span>{rec.title}</span>
                                  <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950 px-1 py-0.2 rounded text-indigo-600 dark:text-indigo-400">+{rec.points} pts</span>
                                </div>
                                <p className="text-slate-450 truncate mt-0.5 font-medium leading-relaxed">{rec.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => navigate('/recognition')}
                          className="w-full text-center py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded transition-colors border border-slate-150 dark:border-slate-800 mt-auto"
                        >
                          View Recognition Feed
                        </button>
                      </div>
                    );

                  case 'pending_approvals':
                    const activeTasks = approvalTasks?.filter(t => t.actionStatus === 'PENDING') || [];
                    return (
                      <div className="flex flex-col justify-between h-full space-y-2 overflow-hidden">
                        {activeTasks.length === 0 ? (
                          <div className="py-4 text-center flex flex-col items-center justify-center h-full gap-1">
                            <Check className="w-6 h-6 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-1 rounded-full border border-emerald-100 dark:border-emerald-900/30" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">All caught up!</span>
                          </div>
                        ) : (
                          <div className="space-y-2 overflow-y-auto pr-1">
                            {activeTasks.map(task => (
                              <div key={task.id} className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-105 dark:border-slate-850 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <span className="text-[9px] px-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 font-bold rounded uppercase">
                                    {task.moduleType}
                                  </span>
                                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate mt-1">
                                    Workflow Request ID: {task.requestId.substring(0, 8)}...
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleApproveTask(task.id)}
                                    className="p-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-100 dark:border-emerald-900/50"
                                    title="Approve"
                                  >
                                    <Check size={10} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectTask(task.id)}
                                    className="p-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-450 rounded border border-rose-100 dark:border-rose-900/50"
                                    title="Reject"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => navigate('/approvals')}
                          className="w-full text-center py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-[10px] font-bold text-indigo-650 dark:text-indigo-400 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/40 mt-auto"
                        >
                          View Approval Cockpit
                        </button>
                      </div>
                    );

                  case 'workforce_health':
                    return (
                      <div className="space-y-3 h-full overflow-y-auto pr-1">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-850">
                            <span className="text-[9px] text-slate-450 block font-bold uppercase">Engagement Score</span>
                            <span className="text-sm font-extrabold text-slate-800 dark:text-white">88%</span>
                          </div>
                          <div className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-850">
                            <span className="text-[9px] text-slate-450 block font-bold uppercase">DNA Integrity</span>
                            <span className="text-sm font-extrabold text-indigo-650 dark:text-indigo-400">{dnaAnalytics?.dnaIntegrityPercentage ?? 99}%</span>
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px]">
                          <span className="text-slate-455 font-bold uppercase">Absence Rate (Last 30d)</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">1.8% (Healthy)</span>
                        </div>
                      </div>
                    );

                  case 'burnout_risk':
                    return (
                      <div className="flex flex-col justify-between h-full space-y-2 text-[10px]">
                        <div className="p-2.5 bg-rose-50/10 dark:bg-rose-950/10 border border-rose-200/40 dark:border-rose-900/30 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-rose-700 dark:text-rose-400 uppercase block text-[9px]">Burnout risk warnings</span>
                            <span className="text-slate-650 dark:text-slate-400 leading-normal block mt-0.5">2 employees flagged due to accumulated leave balance and overtime trends.</span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/leave')}
                          className="w-full text-center py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded transition-colors border border-slate-150 dark:border-slate-800 mt-auto"
                        >
                          View Analytics Panel
                        </button>
                      </div>
                    );

                  default:
                    return <div className="text-slate-450 text-[11px]">Widget Content</div>;
                }
              };

              return (
                <div
                  key={w.widgetKey}
                  className={`bg-white dark:bg-[#0B0F19] border rounded-2xl shadow-sm transition-all group flex flex-col overflow-hidden ${
                    isEditMode
                      ? 'border-dashed border-indigo-400 ring-2 ring-indigo-500/10 dark:ring-indigo-400/10 bg-indigo-50/5 dark:bg-[#0C1222]'
                      : 'border-slate-200/80 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700'
                  }`}
                  style={{
                    gridColumn: `${w.x + 1} / span ${w.w}`,
                    gridRow: `${w.y + 1} / span ${w.h}`,
                  }}
                >
                  {/* Widget Header */}
                  <div
                    onPointerDown={(e) => handleDragStart(e, w.widgetKey)}
                    className={`px-4 py-3 border-b flex items-center justify-between shrink-0 select-none ${
                      isEditMode
                        ? 'border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/10 dark:bg-indigo-950/10 cursor-grab active:cursor-grabbing'
                        : 'border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isEditMode ? (
                        <GripHorizontal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      ) : (
                        <span className="text-slate-450 dark:text-slate-500 shrink-0">{getIcon()}</span>
                      )}
                      
                      {isEditMode ? (
                        <input
                          type="text"
                          value={w.title}
                          onChange={(e) => handleRenameWidget(w.widgetKey, e.target.value)}
                          onPointerDown={(e) => e.stopPropagation()} // Prevent drag on typing
                          className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 border-b border-transparent w-full p-0"
                          title="Click to rename"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider truncate">{w.title}</span>
                      )}
                    </div>

                    {isEditMode && (
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => toggleWidgetVisibility(w.widgetKey)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-rose-500 rounded transition-colors"
                        title="Hide Widget"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Widget Body */}
                  <div className="p-4 flex-1 overflow-hidden relative">
                    {renderWidgetContent()}
                  </div>

                  {/* Resize Handle */}
                  {isEditMode && (
                    <div
                      onPointerDown={(e) => handleResizeStart(e, w.widgetKey)}
                      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 text-indigo-400 hover:text-indigo-650"
                      title="Drag to resize"
                    >
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                        <path d="M6,0 L0,6 L6,6 Z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* DNA Integrity Diagnostics (Show only if orphans exist) */}
      {!isEditMode && dnaAnalytics && (
        (dnaAnalytics.orphanBusinessUnitEmployees && dnaAnalytics.orphanBusinessUnitEmployees.length > 0) ||
        (dnaAnalytics.orphanDepartmentEmployees && dnaAnalytics.orphanDepartmentEmployees.length > 0) ||
        (dnaAnalytics.orphanTeamEmployees && dnaAnalytics.orphanTeamEmployees.length > 0) ||
        (dnaAnalytics.orphanOrganizationEmployees && dnaAnalytics.orphanOrganizationEmployees.length > 0)
      ) && (
        <div className="bg-red-50/20 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-650 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-xs font-bold uppercase tracking-wider">DNA Data Integrity Diagnostics</h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            The following digital twins reference soft-deleted or non-existent DNA nodes. Remediate their profiles in the directory.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dnaAnalytics.orphanDepartmentEmployees && dnaAnalytics.orphanDepartmentEmployees.length > 0 && (
              <div className="bg-white dark:bg-[#0B0F19] p-4 rounded-xl border border-slate-200/60 dark:border-slate-850">
                <h4 className="text-xs font-bold text-red-500 dark:text-red-400 mb-2 flex justify-between">
                  <span>Orphan Departments</span>
                  <span className="bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded text-[10px]">{dnaAnalytics.orphanDepartmentEmployees.length}</span>
                </h4>
                <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 max-h-[120px] overflow-y-auto pr-1">
                  {dnaAnalytics.orphanDepartmentEmployees.map((emp, i) => (
                    <li key={i} className="font-mono bg-slate-50 dark:bg-slate-900/40 p-1.5 rounded">{emp}</li>
                  ))}
                </ul>
              </div>
            )}
            {dnaAnalytics.orphanBusinessUnitEmployees && dnaAnalytics.orphanBusinessUnitEmployees.length > 0 && (
              <div className="bg-white dark:bg-[#0B0F19] p-4 rounded-xl border border-slate-200/60 dark:border-slate-850">
                <h4 className="text-xs font-bold text-red-500 dark:text-red-400 mb-2 flex justify-between">
                  <span>Orphan Business Units</span>
                  <span className="bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded text-[10px]">{dnaAnalytics.orphanBusinessUnitEmployees.length}</span>
                </h4>
                <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 max-h-[120px] overflow-y-auto pr-1">
                  {dnaAnalytics.orphanBusinessUnitEmployees.map((emp, i) => (
                    <li key={i} className="font-mono bg-slate-50 dark:bg-slate-900/40 p-1.5 rounded">{emp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onboarded Twins preview */}
      {!isEditMode && (
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Onboarded Employee Twins</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Previewing the latest onboarding records from the registry.</p>
            </div>
            <button
              onClick={() => navigate('/employees')}
              className="flex items-center gap-1.5 text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline self-start sm:self-auto"
            >
              Manage Directory <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-slate-800/80 text-slate-450 font-bold">
                  <th className="pb-3 pr-4 font-semibold">Twin Code</th>
                  <th className="pb-3 px-4 font-semibold">Full Name</th>
                  <th className="pb-3 px-4 font-semibold">Department</th>
                  <th className="pb-3 px-4 font-semibold">Location</th>
                  <th className="pb-3 px-4 font-semibold">Status</th>
                  <th className="pb-3 pl-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loadingEmployees ? (
                  [1, 2, 3].map(i => (
                    <tr key={i}>
                      <td colSpan={6} className="py-4">
                        <div className="h-5 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : !employees || employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center font-medium text-slate-450">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-slate-350" />
                        <span>No Employee Digital Twins registered in the directory.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.slice(0, 5).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-bold text-indigo-650 dark:text-indigo-400">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {emp.displayName || `${emp.firstName} ${emp.lastName}`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-355 font-medium">
                        {emp.department || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-450">
                        {emp.location || 'Remote'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          emp.employmentStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {emp.employmentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          onClick={() => navigate('/employees')}
                          className="text-indigo-600 dark:text-indigo-455 font-bold hover:underline"
                        >
                          View Twin
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
