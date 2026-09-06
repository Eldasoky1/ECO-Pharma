import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pill, Archive, AlertTriangle, Activity, Settings, BookOpen, ShieldAlert, Moon, Sun, LogOut } from 'lucide-react';
import { cn } from './StatusBadge';

const navItems = [
  { group: 'Overview' },
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { group: 'Catalogue & Inventory' },
  { name: 'Drug Catalogue', path: '/drugs', icon: Pill },
  { name: 'OTC Inventory', path: '/inventory', icon: Archive },
  { group: 'Safety' },
  { name: 'Interaction Checker', path: '/checker', icon: AlertTriangle },
  { name: 'AI Analysis', path: '/ai-analyzer', icon: Activity },
  { name: 'Interaction KB', path: '/knowledge-base', icon: BookOpen },
  { group: 'Monitoring' },
  { name: 'Live Sensors', path: '/sensors', icon: Activity },
  { name: 'Alerts', path: '/alerts', icon: ShieldAlert },
  { group: 'System' },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function AppShell() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [profile, setProfile] = useState({ initials: 'AD', name: 'Ahmed El-Dasouky' });

  useEffect(() => {
    // Basic auth check
    if (!localStorage.getItem('supabase.auth.token')) {
      navigate('/login');
    }
    
    // Load profile
    const loadProfile = () => {
      const saved = localStorage.getItem('user.profile');
      if (saved) setProfile(JSON.parse(saved));
    };
    loadProfile();
    window.addEventListener('profileUpdated', loadProfile);
    return () => window.removeEventListener('profileUpdated', loadProfile);
  }, [navigate]);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    root.classList.toggle('dark');
    setIsDark(root.classList.contains('dark'));
  };

  const handleLogout = () => {
    localStorage.removeItem('supabase.auth.token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-y-0 border-l-0 rounded-none flex flex-col z-20 shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-teal-700 dark:text-teal-400 tracking-tight">Smart Eco-Pharma</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Hub v0.1.0</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            if (item.group) {
              return (
                <div key={idx} className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {item.group}
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all',
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 shadow-sm border border-teal-100 dark:border-teal-800/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  )
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Topbar */}
        <header className="h-16 glass-panel rounded-none border-t-0 border-x-0 border-b flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" title="Toggle Dark Mode">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Connected</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold" title={profile.name}>
              {profile.initials}
            </div>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 relative text-slate-800 dark:text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
