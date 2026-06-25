import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import {
  Search,
  Bell,
  Settings,
  LogOut,
  Star,
  PlusCircle,
  HelpCircle,
  FolderOpen,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText,
  Users,
  CheckSquare,
  DollarSign,
  ShoppingCart,
  PieChart,
  Grid,
  Shield,
  Briefcase,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  desc: string;
  route: string;
  favorite: boolean;
  badge?: number;
  badgeText?: string;
  lastOpened?: string;
}

interface Activity {
  id: string;
  app: string;
  action: string;
  time: string;
  user: string;
}

interface WorkItem {
  id: string;
  module: string;
  type: string;
  title: string;
  due: string;
  status?: string;
}

// ─── AUTHENTICATION STATE & CONTEXT ──────────────────────────────────────────

const DEMO_USER = {
  uid: 'usr-999',
  name: 'Eashwar',
  email: 'eashwar@technosprint.net',
  role: 'ultra_super_admin',
  tenantId: 'ABC Technologies',
  permissions: ['ALL'],
};

// ─── INITIAL APP DATA ────────────────────────────────────────────────────────

const INITIAL_APPS: Application[] = [
  {
    id: 'HRMS',
    name: 'HRMS',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    desc: 'Employee directory, attendance, leave, performance, and recruitment.',
    route: 'http://localhost:3001',
    favorite: true,
    badge: 5,
    badgeText: 'Approvals',
    lastOpened: '10 minutes ago',
  },
  {
    id: 'Ticketing',
    name: 'Ticketing',
    icon: Briefcase,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    desc: 'ITSM Service Desk, tickets, SLA policies, and problem management.',
    route: 'http://localhost:3002',
    favorite: true,
    badge: 15,
    badgeText: 'Pending',
    lastOpened: '1 hour ago',
  },
  {
    id: 'Billing',
    name: 'Billing',
    icon: DollarSign,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    desc: 'Invoice generation, online payments, balance tracking, and client logs.',
    route: '#',
    favorite: false,
    badge: 2,
    badgeText: 'Unpaid',
  },
  {
    id: 'Inventory',
    name: 'Inventory',
    icon: FolderOpen,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    desc: 'Real-time stock levels, multi-warehouse logs, and procurement limits.',
    route: '#',
    favorite: false,
  },
  {
    id: 'CRM',
    name: 'CRM',
    icon: Star,
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    desc: 'Sales pipelines, customer relations, lead logs, and meetings.',
    route: '#',
    favorite: false,
  },
  {
    id: 'Payroll',
    name: 'Payroll',
    icon: DollarSign,
    color: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    desc: 'Salary disbursement, taxes, allowances, and audit sheets.',
    route: '#',
    favorite: false,
  },
  {
    id: 'Procurement',
    name: 'Procurement',
    icon: ShoppingCart,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    desc: 'Vendor registration, purchase approvals, and orders.',
    route: '#',
    favorite: false,
  },
  {
    id: 'Analytics',
    name: 'Analytics',
    icon: PieChart,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    desc: 'Cross-module business dashboards and reporting logs.',
    route: '#',
    favorite: false,
  },
];

// ─── LOGIN COMPONENT ──────────────────────────────────────────────────────────

function LoginPortal({ onLogin }: { onLogin: (user: any) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('eashwar@technosprint.net');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);

  const handleDemo = (role: string) => {
    setLoading(true);
    setTimeout(() => {
      const user = {
        ...DEMO_USER,
        role: role,
        name: role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      };
      localStorage.setItem('demo_user', JSON.stringify(user));
      localStorage.setItem('token', 'mock-sso-jwt-token-999');
      onLogin(user);
      setLoading(false);
      navigate('/');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = { ...DEMO_USER, email };
      localStorage.setItem('demo_user', JSON.stringify(user));
      localStorage.setItem('token', 'mock-sso-jwt-token-999');
      onLogin(user);
      setLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700/50 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 mb-2">
            <Grid className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ManageByOpz</h1>
          <p className="text-slate-400 text-sm">Enterprise Workspace Gateway</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Enterprise Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase font-bold tracking-wider">Demo Access Profiles</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleDemo('ultra_super_admin')}
            className="h-9 px-3 bg-slate-900 border border-slate-700/60 rounded-lg hover:bg-indigo-500/10 hover:border-indigo-500/30 text-left font-semibold"
          >
            👑 Ultra Admin
          </button>
          <button
            onClick={() => handleDemo('super_admin')}
            className="h-9 px-3 bg-slate-900 border border-slate-700/60 rounded-lg hover:bg-indigo-500/10 hover:border-indigo-500/30 text-left font-semibold"
          >
            🛡️ Super Admin
          </button>
          <button
            onClick={() => handleDemo('admin')}
            className="h-9 px-3 bg-slate-900 border border-slate-700/60 rounded-lg hover:bg-indigo-500/10 hover:border-indigo-500/30 text-left font-semibold"
          >
            👤 Module Admin
          </button>
          <button
            onClick={() => handleDemo('agent')}
            className="h-9 px-3 bg-slate-900 border border-slate-700/60 rounded-lg hover:bg-indigo-500/10 hover:border-indigo-500/30 text-left font-semibold"
          >
            🎫 Service Agent
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PORTAL MAIN SCREEN ──────────────────────────────────────────────────────

function WorkspacePortal({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [apps, setApps] = useState<Application[]>(INITIAL_APPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [time, setTime] = useState(new Date());

  // AI Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your ManageByOpz Assistant. Ask me to find tickets, approve leave, or open modules.' },
  ]);

  const paletteInputRef = useRef<HTMLInputElement>(null);

  // Sync clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Cmd+K toggle handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (paletteOpen && paletteInputRef.current) {
      setTimeout(() => paletteInputRef.current?.focus(), 80);
    }
  }, [paletteOpen]);

  // Greeting helper
  const getGreeting = () => {
    const hr = time.getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setApps(prev =>
      prev.map(app => (app.id === id ? { ...app, favorite: !app.favorite } : app))
    );
  };

  const launchApp = (app: Application) => {
    if (app.route === '#') return;
    const token = localStorage.getItem('token') || '';
    const ssoUrl = `${app.route}/?sso_user=${encodeURIComponent(JSON.stringify(user))}&sso_token=${token}`;
    window.open(ssoUrl, '_blank');
  };

  // Mock Work Items (approvals, tasks)
  const [workItems] = useState<WorkItem[]>([
    { id: 'wi-1', module: 'HRMS', type: 'Leave Approval', title: 'Aditi Sharma — Annual Leave (3 days)', due: 'Today' },
    { id: 'wi-2', module: 'Ticketing', type: 'High Incident', title: 'INC-7092: DB Connection timeout in app-bootstrap', due: '1 hour' },
    { id: 'wi-3', module: 'Billing', type: 'Invoice Review', title: 'INV-4091: Technosprint renewal pending review', due: 'Tomorrow' },
    { id: 'wi-4', module: 'HRMS', type: 'Recruitment', title: 'Review candidates for Senior Backend Engineer', due: '2 days' },
  ]);

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: 'n1', app: 'HRMS', text: 'Leave Request Approved: Aditi Sharma', time: '5m ago' },
    { id: 'n2', app: 'Ticketing', text: 'New critical ticket assigned to you: INC-7092', time: '12m ago' },
    { id: 'n3', app: 'Billing', text: 'Invoice INV-4029 paid by ABC Tech', time: '1h ago' },
    { id: 'n4', app: 'Inventory', text: 'Stock warning: Laptop Core i7 in London warehouse low', time: '4h ago' },
  ]);

  // AI Assistant command parser
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userText = chatQuery.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatQuery('');

    // Simulate response
    setTimeout(() => {
      let reply = "I couldn't recognize that command directly. Try asking 'Open HRMS', 'Show pending tickets', or 'Find invoices'.";
      const q = userText.toLowerCase();

      if (q.includes('open hrms') || q.includes('launch hrms')) {
        reply = 'Opening the HRMS portal for you right now...';
        launchApp(apps.find(a => a.id === 'HRMS')!);
      } else if (q.includes('open ticketing') || q.includes('launch ticketing')) {
        reply = 'Opening the IT Service Desk and Ticketing platform...';
        launchApp(apps.find(a => a.id === 'Ticketing')!);
      } else if (q.includes('ticket') || q.includes('incidents')) {
        reply = 'Found 15 open incidents. The most critical is INC-7092: DB Connection timeout in app-bootstrap.';
      } else if (q.includes('invoice') || q.includes('billing')) {
        reply = 'Opening Billing and displaying invoice logs. Found 2 unpaid invoices.';
      } else if (q.includes('create ticket')) {
        reply = 'Opening Ticketing module in Create Incident mode...';
        window.open('http://localhost:3002/?action=new', '_blank');
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  // Command palette filter
  const getFilteredCommands = () => {
    const list = [
      { type: 'Navigate', label: 'Open HRMS', desc: 'Go to HR Portal dashboard', action: () => launchApp(apps.find(a => a.id === 'HRMS')!) },
      { type: 'Navigate', label: 'Open Ticketing', desc: 'Go to ITSM Service Desk', action: () => launchApp(apps.find(a => a.id === 'Ticketing')!) },
      { type: 'Navigate', label: 'Open Billing', desc: 'View payments and invoices', action: () => {} },
      { type: 'Action', label: 'Create Incident Ticket', desc: 'Log a new incident', action: () => window.open('http://localhost:3002/?action=new', '_blank') },
      { type: 'Action', label: 'Add Employee', desc: 'Onboard a new employee twin', action: () => window.open('http://localhost:3001/employees/onboard', '_blank') },
      { type: 'Action', label: 'Log Call', desc: 'Create call entry log', action: () => window.open('http://localhost:3002/calls/new', '_blank') },
      { type: 'Theme', label: 'Toggle Dark Theme', desc: 'Switch system colors', action: () => {} },
    ];
    if (!paletteQuery) return list;
    return list.filter(c =>
      c.label.toLowerCase().includes(paletteQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(paletteQuery.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ─── TOPBAR ──────────────────────────────────────────────────────────── */}
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold tracking-wider">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg">ManageByOpz</span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 bg-slate-800 text-indigo-400 rounded-full border border-slate-700/50 font-semibold uppercase tracking-wider">
              Portal
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search employees, tickets, invoices, settings... (Ctrl+K)"
            onClick={() => setPaletteOpen(true)}
            className="w-full h-10 pl-9 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-300"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 space-y-3 z-50">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-sm">Notifications</span>
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="text-xs flex flex-col gap-1 border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between font-semibold text-slate-300">
                          <span>{n.app}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{n.time}</span>
                        </div>
                        <p className="text-slate-400 leading-normal">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
              {user.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                {user.role.replace(/_/g, ' ')}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── CONTAINER ───────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* ─── WELCOME AREA ───────────────────────────────────────────────────── */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {getGreeting()}, {user.name} 👋
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Org: <strong className="text-slate-300">{user.tenantId}</strong></span>
                </div>
                <span>•</span>
                <span>Role: <strong className="text-slate-300">Ultra Super Admin</strong></span>
                <span>•</span>
                <span>Active Shift: <strong className="text-slate-300">Day Operations</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 px-4 py-2.5 rounded-xl self-start sm:self-auto shadow-inner">
              <Clock className="w-4 h-4 text-indigo-400" />
              <div className="text-sm font-semibold tracking-wider">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <span className="text-slate-600">|</span>
              <div className="text-xs text-slate-400">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </section>

        {/* ─── WIDGETS GRID ───────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* My Work & Approvals */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span className="font-bold">Pending Action Items</span>
              </div>
              <span className="text-[10px] px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full font-bold border border-indigo-500/20 uppercase tracking-wider">
                {workItems.length} tasks
              </span>
            </div>
            
            <div className="divide-y divide-slate-800">
              {workItems.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between group hover:bg-slate-800/25 px-2 rounded-lg transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.module === 'HRMS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {item.module}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">{item.type}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{item.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Due {item.due}</span>
                    <button className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Quick Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4 justify-between h-[340px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="font-bold">AI Assistant Portal</span>
              </div>
            </div>

            {/* Chat History Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs py-2 scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl leading-relaxed max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white ml-auto'
                      : 'bg-slate-950 border border-slate-800 text-slate-300'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask AI... (e.g. 'Open HRMS')"
                value={chatQuery}
                onChange={e => setChatQuery(e.target.value)}
                className="flex-1 h-9 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
              />
              <button
                type="submit"
                className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition-colors text-white shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </section>

        {/* ─── ENTERPRISE APP LAUNCHER ────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Grid className="w-5 h-5 text-indigo-400" />
              <span>Enterprise Suite Applications</span>
            </h3>
            <span className="text-xs text-slate-400">Click card to launch workspace</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map(app => {
              const Icon = app.icon;
              const hasRoute = app.route !== '#';
              
              return (
                <div
                  key={app.id}
                  onClick={() => hasRoute && launchApp(app)}
                  className={`bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group relative ${
                    hasRoute ? 'cursor-pointer hover:bg-slate-900/50 hover:-translate-y-0.5' : 'opacity-65'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header: Icon + Fav Pin */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl border ${app.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <button
                        onClick={(e) => handleToggleFavorite(app.id, e)}
                        className={`p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition-colors ${
                          app.favorite ? 'text-amber-400' : ''
                        }`}
                      >
                        <Star className={`w-4 h-4 ${app.favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* App Title & Description */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{app.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{app.desc}</p>
                    </div>
                  </div>

                  {/* Footer Stats & Launch */}
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px]">
                    <div>
                      {app.badge ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full font-bold border border-rose-500/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {app.badge} {app.badgeText}
                        </span>
                      ) : (
                        <span className="text-slate-500">Ready</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-indigo-400 font-bold group-hover:text-indigo-300">
                      <span>{hasRoute ? 'Launch →' : 'Soon'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── FAVORITES ──────────────────────────────────────────────────────── */}
        {apps.some(a => a.favorite) && (
          <section className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span>Pinned Applications</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {apps
                .filter(a => a.favorite)
                .map(app => {
                  const Icon = app.icon;
                  const hasRoute = app.route !== '#';
                  
                  return (
                    <div
                      key={app.id}
                      onClick={() => hasRoute && launchApp(app)}
                      className={`p-4 bg-slate-900 border border-slate-800/60 rounded-xl hover:border-slate-700 hover:bg-slate-800/30 transition-all flex flex-col items-center text-center gap-2 group ${
                        hasRoute ? 'cursor-pointer' : 'opacity-60'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg border ${app.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white">{app.name}</span>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </main>

      {/* ─── COMMAND PALETTE MODAL ───────────────────────────────────────────── */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={() => setPaletteOpen(false)} />
          
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4 relative z-10 flex flex-col max-h-[460px]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                ref={paletteInputRef}
                type="text"
                placeholder="Search commands, navigate, ask AI..."
                value={paletteQuery}
                onChange={e => setPaletteQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>

            {/* Command Listing */}
            <div className="flex-1 overflow-y-auto space-y-1.5 divide-y divide-slate-800/40 pr-1 scrollbar-thin">
              {getFilteredCommands().length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No matching commands found.</div>
              ) : (
                getFilteredCommands().map((cmd, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      cmd.action();
                      setPaletteOpen(false);
                    }}
                    className="py-2.5 px-3 flex items-center justify-between hover:bg-indigo-600/10 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400">{cmd.label}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{cmd.desc}</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded font-semibold uppercase">
                      {cmd.type}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-3">
              <span>Use ↑↓ to navigate, Enter to launch</span>
              <span>ESC to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ROUTER ─────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('demo_user');
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch {
        localStorage.removeItem('demo_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (authenticatedUser: any) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('demo_user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPortal onLogin={handleLogin} />}
        />
        <Route
          path="/"
          element={user ? <WorkspacePortal user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
