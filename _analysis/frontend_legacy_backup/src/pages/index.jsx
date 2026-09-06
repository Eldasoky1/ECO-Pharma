import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('supabase.auth.token', 'dummy-token');
    // Save a dummy user profile
    localStorage.setItem('user.profile', JSON.stringify({ name: 'Ahmed El-Dasouky', initials: 'AD', role: 'Architecture Lead' }));
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors">
      <div className="glass-panel w-full max-w-md p-8 shadow-2xl relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400">Smart Eco-Pharma</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Operations Dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="relative z-10 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">Email Address</label>
            <input type="email" required placeholder="manager@pharmacy.com" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">Password</label>
            <input type="password" required placeholder="••••••••" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white" />
          </div>
          <button type="submit" className="w-full btn-primary py-2.5 text-lg shadow-teal-500/30">
            Sign in
          </button>
        </form>
        
        <div className="relative z-10 mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          v0.1.0 • Secure Login
        </div>
      </div>
    </div>
  );
};

export const Settings = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('user.profile');
    return saved ? JSON.parse(saved) : { name: 'Ahmed El-Dasouky', initials: 'AD', role: 'Architecture Lead' };
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('user.profile', JSON.stringify(profile));
    // Dispatch event to update AppShell avatar immediately
    window.dispatchEvent(new Event('profileUpdated'));
    alert('Profile updated successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings & Profile</h2>
      
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Edit Profile</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white" />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initials</label>
              <input type="text" maxLength={2} value={profile.initials} onChange={e => setProfile({...profile, initials: e.target.value.toUpperCase()})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white uppercase" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <input type="text" value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white" />
          </div>
          <div className="pt-4">
            <button type="submit" className="btn-primary">Save Profile Changes</button>
          </div>
        </form>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">System Status</h3>
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          <span>Backend API Connected (http://localhost:8000)</span>
        </div>
      </div>
    </div>
  );
};

const PagePlaceholder = ({ title }) => (
  <div className="glass-panel p-8 min-h-[60vh] flex flex-col items-center justify-center text-center">
    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h2>
    <p className="text-slate-500 dark:text-slate-400 max-w-lg">
      This page is a placeholder for the {title} screen. It will be implemented according to the REST API endpoints and user feedback.
    </p>
  </div>
);

export { default as Dashboard } from './Dashboard';
export { default as DrugCatalogue } from './DrugCatalogue';
export { default as LiveSensors } from './LiveSensors';
export const DrugDetail = () => <PagePlaceholder title="Drug Detail" />;
export const OTCInventory = () => <PagePlaceholder title="OTC Inventory" />;
export const InventoryEdit = () => <PagePlaceholder title="Inventory Record Edit" />;
export const InventoryNew = () => <PagePlaceholder title="New Inventory Record" />;
export const InteractionKB = () => <PagePlaceholder title="Interaction Knowledge Base" />;
export const InteractionChecker = () => <PagePlaceholder title="Interaction Checker" />;
export const AIAnalyzer = () => <PagePlaceholder title="AI Pharmacovigilance Analyzer" />;
export const PVReports = () => <PagePlaceholder title="PV Reports" />;
export const Alerts = () => <PagePlaceholder title="Alerts" />;
